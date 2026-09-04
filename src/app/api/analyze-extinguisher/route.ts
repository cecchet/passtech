import { NextRequest, NextResponse } from "next/server";
import { describeGeminiError } from "@/lib/geminiErrors";
import { createGeminiInteraction, hasGeminiKeyConfigured } from "@/lib/geminiClient";

// Gemini's free tier can take well over Vercel's default function timeout to respond under load —
// raises the ceiling to match the client's own REQUEST_TIMEOUT_MS (fetchWithTimeout.ts) so a slow
// but eventually-successful call isn't killed server-side before it has a chance to finish. Capped
// by the Vercel plan's own maximum (Hobby: 60s) regardless of this value.
export const maxDuration = 120;

// New API keys are provisioned on the Interactions API — gemini-2.5-flash (classic generateContent)
// returns 404 "no longer available to new users" on those. gemini-3.5-flash-lite is the current
// choice: same vision/OCR task, but the free tier's daily quota is 500 RPD here vs. 20 RPD on
// gemini-3.6-flash (confirmed directly in the AI Studio console) — the full Flash tier's quota
// isn't viable beyond a single test session. Revisit if Flash-Lite's accuracy on small printed
// tag text turns out worse in practice.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Simple in-memory sliding-window limit, keyed by client IP. Not distributed — resets on cold
// start and isn't shared across serverless instances — but it's enough to stop a runaway loop
// or casual abuse from hammering this metered vision API without adding external infra.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

interface ExtinguisherAnalysis {
  classARating: number;
  bcRating: number;
  weightLbs: number;
  manufactureDate: string;
  certificationDate: string;
  certificationDueDate: string;
  hasMetalBracket: "yes" | "no" | "unclear";
  metalStrapCount: number;
  hasAntiTorpedoTabs: "yes" | "no" | "unclear";
  confidence: "high" | "medium" | "low";
  notes: string;
}

// Ratings/weight use 0 as the "not visible" sentinel rather than a nullable field — a real
// extinguisher's Class A/B:C rating and weight are never actually 0, so it's unambiguous, and
// keeps the schema (and the client's merge-only-what-was-found logic) simple.
const SCHEMA = {
  type: "object" as const,
  properties: {
    classARating: {
      type: "number" as const,
      description:
        "The Class A number from a combined UL rating like \"1-A:10-B:C\" (here, 1). 0 if the label shows no Class A rating (many automotive/racing extinguishers are B:C only) or none is legible.",
    },
    bcRating: {
      type: "number" as const,
      description: "The B:C number from a combined UL rating like \"1-A:10-B:C\" or a plain \"10-B:C\" (here, 10). 0 if not legible.",
    },
    weightLbs: {
      type: "number" as const,
      description: "The extinguisher's weight in pounds, if printed on the label (e.g. \"5 LB\", \"2.5 lbs\"). Convert if given in kg. 0 if not printed or not legible.",
    },
    manufactureDate: {
      type: "string" as const,
      description:
        "The manufacture date stamped on the cylinder (often on the neck, shoulder, or bottom, sometimes just a month/year), in YYYY-MM-DD format -- use the first of the month if only month/year is given. Empty string if not visible.",
    },
    certificationDate: {
      type: "string" as const,
      description: "A separate service/inspection/recharge date, if a distinct tag or stamp shows one apart from the manufacture date. YYYY-MM-DD format, empty string if none visible.",
    },
    certificationDueDate: {
      type: "string" as const,
      description: "A \"service by\", \"next inspection due\", or \"expires\" date, if printed. YYYY-MM-DD format, empty string if none visible.",
    },
    hasMetalBracket: {
      type: "string" as const,
      enum: ["yes", "no", "unclear"],
      description:
        "Whether the extinguisher is secured in a metal bracket (as opposed to a plastic clip, velcro strap, or zip ties) -- only answer \"yes\" or \"no\" if the mount itself is actually visible in the photo (not just the extinguisher's own label). \"unclear\" if the mount isn't shown or its material can't be told from the image.",
    },
    metalStrapCount: {
      type: "number" as const,
      description:
        "How many metal straps/fastenings visibly secure the extinguisher in its bracket, only if the mount is clearly visible and countable. 0 if the mount isn't shown, is obscured, or the count can't be determined.",
    },
    hasAntiTorpedoTabs: {
      type: "string" as const,
      enum: ["yes", "no", "unclear"],
      description:
        "Whether the bracket has anti-torpedo tabs -- small metal lips or flanges at the ends of the bracket that stop the cylinder from sliding forward out of its mount under hard deceleration. This is a subtle mechanical detail that often isn't identifiable from a typical photo -- default to \"unclear\" rather than guessing unless the tabs are clearly visible.",
    },
    confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
    notes: {
      type: "string" as const,
      description: "Any caveats worth surfacing: blurry/obscured photo, multiple dates that are hard to tell apart, anything uncertain. Empty string if none.",
    },
  },
  required: [
    "classARating",
    "bcRating",
    "weightLbs",
    "manufactureDate",
    "certificationDate",
    "certificationDueDate",
    "hasMetalBracket",
    "metalStrapCount",
    "hasAntiTorpedoTabs",
    "confidence",
    "notes",
  ],
};

const PROMPT = `This is a photo of a handheld fire extinguisher intended for use in a race car, including its label and/or a service/inspection tag if one is attached. Extinguisher labels print a UL rating as a combined code like "1-A:10-B:C" (Class A number, then B:C number) or just "10-B:C" for a B:C-only unit -- read both numbers if present. Also read the weight if printed (often near the rating, e.g. "5 LB"), and any dates: a manufacture date is usually stamped directly into the metal on the cylinder's neck or bottom (sometimes just month/year), while a service/inspection tag (if present) may show a separate service date and/or a "next due" date. Be conservative -- if a number or date isn't clearly legible, use the 0/empty-string sentinel for that field rather than guessing, and mention the ambiguity in "notes".

If the photo also shows how the extinguisher is mounted (not just its label), separately note: whether the bracket holding it is metal rather than plastic/velcro/zip-ties, how many metal straps or fastenings secure it, and whether the bracket has anti-torpedo tabs (small lips/flanges at the ends that stop the cylinder sliding forward under deceleration). These are secondary to the label reading above -- most photos won't show the mount clearly, or at all, and anti-torpedo tabs specifically are easy to miss even when the mount is visible. Default to "unclear"/0 rather than guessing.`;

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

  if (!hasGeminiKeyConfigured()) {
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
    const interaction = await createGeminiInteraction({
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

    const parsed = JSON.parse(text) as ExtinguisherAnalysis;
    return NextResponse.json(parsed);
  } catch (err) {
    const { status, error } = describeGeminiError(err, "analyze-extinguisher");
    return NextResponse.json({ error }, { status });
  }
}
