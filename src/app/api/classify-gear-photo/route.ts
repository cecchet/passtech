import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ApiError } from "@google/genai";
import { EquipmentCategory } from "@/data/types";

// Reads GEMINI_API_KEY from the environment server-side — never sent to the client.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// New API keys are provisioned on the Interactions API — gemini-2.5-flash (classic generateContent)
// returns 404 "no longer available to new users" on those. gemini-3.6-flash is the current flash model.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// Simple in-memory sliding-window limit, keyed by client IP. Not distributed — resets on cold
// start and isn't shared across serverless instances — but it's enough to stop a runaway loop
// or casual abuse from hammering this metered vision API without adding external infra.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// Automatic Mode v1 only classifies driver-worn personal protective equipment — the set of
// categories a person would actually photograph one item/tag at a time. Car-side categories
// (seat, harness, window net, fuel cell, etc.) aren't included: they're less commonly
// photographed this way, and this endpoint would need a much larger disambiguation prompt to
// tell e.g. a harness tag from an arm-restraint tag reliably.
const CLASSIFIABLE_CATEGORIES = [
  "helmet",
  "balaclava",
  "hnr",
  "neck_collar",
  "firesuit",
  "undergarment",
  "gloves",
  "arm_restraint",
  "shoes",
  "socks",
] as const satisfies readonly EquipmentCategory[];

const CATEGORY_HINTS: Record<(typeof CLASSIFIABLE_CATEGORIES)[number], string> = {
  helmet: "a full racing helmet, open- or full-face",
  balaclava: "a fire-retardant hood/balaclava covering the whole head and neck, worn under the helmet",
  hnr: "a head-and-neck restraint device (HANS-style yoke, rigid, sits on the shoulders around the neck)",
  neck_collar: "a padded soft neck collar/brace (not a rigid HANS-style yoke)",
  firesuit: "a racing driving suit — either a one-piece coverall, or a two-piece jacket top and/or pants bottom",
  undergarment: "fire-retardant long underwear worn beneath the suit (a long-sleeve top or long johns/bottoms, plain thin fabric, not the outer suit)",
  gloves: "a pair (or single) of racing gloves — handwear with individual fingers",
  arm_restraint: "an arm restraint — a short strap/cuff with a tether and clip, worn around the forearm/wrist, NOT a glove",
  shoes: "a pair (or single) of racing shoes/boots",
  socks: "fire-retardant socks — footwear-shaped thin fabric, not shoes",
};

interface Classification {
  isGearPhoto: boolean;
  photoType: "item" | "tag" | "unclear";
  category: string;
  pieceType: "one_piece" | "jacket" | "pants" | "";
  confidence: "high" | "medium" | "low";
  notes: string;
}

const SCHEMA = {
  type: "object" as const,
  properties: {
    isGearPhoto: {
      type: "boolean" as const,
      description: "False if this photo clearly isn't racing safety equipment or a certification tag at all (e.g. a car, a random object, a person's face).",
    },
    photoType: {
      type: "string" as const,
      enum: ["item", "tag", "unclear"],
      description:
        "\"tag\" if this is a close-up of a sewn-in certification/homologation label (mostly printed text, standard numbers, a small rectangular patch). \"item\" if this shows the actual physical gear itself (the whole garment, helmet, glove, etc.), even if a tag happens to be partially visible in the shot. \"unclear\" only if you genuinely can't tell.",
    },
    category: {
      type: "string" as const,
      description: `Best-guess equipment category this photo shows, one of: ${CLASSIFIABLE_CATEGORIES.join(", ")}. Empty string if isGearPhoto is false or you truly can't tell which category.`,
    },
    pieceType: {
      type: "string" as const,
      enum: ["one_piece", "jacket", "pants", ""],
      description:
        "Only meaningful when category is \"firesuit\" and photoType is \"item\": whether the photo shows a one-piece coverall, just the jacket/top half of a two-piece suit, or just the pants/bottom half. Empty string otherwise, or if you can't tell.",
    },
    confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
    notes: {
      type: "string" as const,
      description: "Any caveats worth surfacing: blurry photo, could plausibly be a different category, multiple items visible in one shot, etc. Empty string if none.",
    },
  },
  required: ["isGearPhoto", "photoType", "category", "pieceType", "confidence", "notes"],
};

const categoryList = CLASSIFIABLE_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_HINTS[c]}`).join("\n");

const PROMPT = `This photo was uploaded as part of a batch of racing-safety-equipment photos for automatically building a driver's gear inventory. Identify what this specific photo shows.

First decide if it's a "tag" (a certification/homologation label close-up) or an "item" (a photo of the actual gear). Then, if it's recognizable equipment, classify it into exactly one of these categories:
${categoryList}

Common mix-ups to watch for: gloves vs arm restraints (gloves cover all fingers; arm restraints are a wrist/forearm strap with a tether, no fingers); undergarment vs firesuit (undergarment is thin plain long underwear, firesuit is the thicker outer suit, often with brand logos/stripes); balaclava vs neck collar (balaclava is a full head/face hood, neck collar is just a padded ring around the neck). If a tag's text matches a standard used by multiple product types (e.g. "SFI SPEC 3.3" appears on gloves, shoes, socks, AND arm restraints), rely on the tag's own wording/shape (e.g. "HOOD", "ARM RESTRAINT", "GLOVES") and the product visible around/behind it, not just the standard number.

If the photo doesn't show any of these categories, or isn't racing gear at all, set isGearPhoto to false. Be conservative — use "low" confidence and explain in "notes" rather than guessing when uncertain.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many photo scans from this connection — please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: { imageDataUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server isn't configured with an API key yet. Add GEMINI_API_KEY to .env.local (see .env.local.example) and restart the dev server." },
      { status: 500 }
    );
  }

  const { imageDataUrl } = body;
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return NextResponse.json({ error: "Missing image." }, { status: 400 });
  }

  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(imageDataUrl);
  if (!match) {
    return NextResponse.json({ error: "Image must be a base64 data URL." }, { status: 400 });
  }
  const [, mediaType, base64Data] = match;
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) {
    return NextResponse.json({ error: `Unsupported image type: ${mediaType}` }, { status: 400 });
  }
  // Base64 blows up size ~4/3x; keep the request comfortably under Gemini's per-request limits.
  if (base64Data.length > 12_000_000) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  try {
    const interaction = await ai.interactions.create({
      model: MODEL,
      input: [
        { type: "image", mime_type: mediaType, data: base64Data },
        { type: "text", text: PROMPT },
      ],
      response_format: { type: "text", mime_type: "application/json", schema: SCHEMA },
    });

    const text = interaction.output_text;
    if (!text) {
      return NextResponse.json({ error: "No result returned — the model may have declined to analyze this image." }, { status: 502 });
    }

    const parsed = JSON.parse(text) as Classification;
    if (parsed.category && !(CLASSIFIABLE_CATEGORIES as readonly string[]).includes(parsed.category)) {
      parsed.category = "";
    }
    return NextResponse.json(parsed);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 403) {
        return NextResponse.json({ error: "Server's API key was rejected (check GEMINI_API_KEY)." }, { status: 500 });
      }
      if (err.status === 429) {
        return NextResponse.json({ error: "Rate limited (free tier quota) — try again in a moment." }, { status: 429 });
      }
      return NextResponse.json({ error: `Vision analysis failed: ${err.message}` }, { status: 502 });
    }
    return NextResponse.json({ error: "Unexpected error analyzing the image." }, { status: 500 });
  }
}
