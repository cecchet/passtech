import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { EquipmentCategory } from "@/data/types";
import { describeGeminiError } from "@/lib/geminiErrors";
import { NOT_LISTED, standardsFor } from "@/data/standards";

// Reads GEMINI_API_KEY from the environment server-side — never sent to the client.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// Covers every photographable category except fire extinguishers (their rating/weight/date data
// doesn't fit this endpoint's standardId-based certification schema at all — see
// ExtinguisherPhotoScan/analyze-extinguisher instead, which the client calls as a follow-up once
// this endpoint classifies a photo as "fire_extinguisher").
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
  "seat",
  "belts_harness",
  "window_net",
  "fuel_cell",
  "fire_extinguisher",
  "fire_suppression",
  "kill_switch",
  "tow_hook",
  "emergency_triangle",
  "window_breaker",
  "spill_kit",
  "hood_pins",
  "parachute",
  "rollover_protection",
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
  seat: "a racing seat installed in a car (bucket-style shell, often with a certification label on the back or shell), not a stock/OEM seat",
  belts_harness: "a multi-point racing harness — shoulder straps, lap belts, sometimes a sub/crotch strap, meeting at a central buckle — installed in a car or laid out",
  window_net: "a net (mesh webbing) mounted across a car's window opening",
  fuel_cell: "a fuel cell/tank — a metal or composite canister mounted in the trunk or rear of a car, distinct from the car's stock fuel tank",
  fire_extinguisher: "a handheld fire extinguisher cylinder, its label and/or a manufacture-date stamp visible",
  fire_suppression: "an onboard fire suppression SYSTEM — a fixed cylinder plumbed to nozzles around the engine/cockpit, mounted in the car (not a handheld extinguisher you'd carry)",
  kill_switch: "a master electrical kill switch / battery cutoff — a rotary or pull switch, often red, mounted on the car's exterior or dash",
  tow_hook: "a tow hook, eye, ring, or loop mounted at the front or rear of a car for towing/recovery",
  emergency_triangle: "a reflective roadside warning triangle",
  window_breaker: "a window-breaker tool or seatbelt cutter — a small handheld tool with a pointed tip and/or blade",
  spill_kit: "a kit of absorbent material (pads, granules, or a bag/box labeled for oil/fuel/coolant absorption) for containing a fluid spill",
  hood_pins: "a pair of hood pins — metal pins with a spring clip, mounted through a car's hood and fender/bumper to secure it",
  parachute: "a drag-racing parachute mounted at the rear of a car, folded/packed or deployed",
  rollover_protection: "a roll cage or roll bar installed inside a car — welded or bolted tubing forming a protective structure around the driver",
};

// Every standard registered for ANY of the classifiable categories, each annotated with which
// category (or categories) it applies to — since this endpoint determines the category itself,
// it can't scope the allowed-standards list the way /api/analyze-tag does (which already knows
// the category up front). Cross-checked against the actually-detected category server-side below.
const ALL_STANDARDS = (() => {
  const byId = new Map<string, { label: string; categories: Set<string> }>();
  for (const category of CLASSIFIABLE_CATEGORIES) {
    for (const s of standardsFor(category)) {
      const entry = byId.get(s.id) ?? { label: s.label, categories: new Set<string>() };
      entry.categories.add(category);
      byId.set(s.id, entry);
    }
  }
  return [...byId.entries()].map(([id, { label, categories }]) => `- ${id} (${[...categories].join("/")}): ${label}`).join("\n");
})();

interface CertCandidate {
  standardId: string;
  rawText: string;
  homologationNumber: string;
  labelDate: string;
  tagExpirationDate: string;
  confidence: "high" | "medium" | "low";
}

interface AnalyzeGearPhoto {
  isGearPhoto: boolean;
  category: string;
  pieceType: "one_piece" | "jacket" | "pants" | "";
  towHookSide: "front" | "rear" | "";
  categoryConfidence: "high" | "medium" | "low";
  notes: string;
  certifications: CertCandidate[];
  helmetType: "open_face" | "full_face" | "unclear" | "";
  hasVisor: boolean;
  visorNote: string;
  isCloseupOnly: boolean;
}

const SCHEMA = {
  type: "object" as const,
  properties: {
    isGearPhoto: {
      type: "boolean" as const,
      description: "False if this photo clearly isn't racing safety equipment or a certification tag at all (e.g. a car, a random object, a person's face).",
    },
    category: {
      type: "string" as const,
      description: `Best-guess equipment category this photo shows, one of: ${CLASSIFIABLE_CATEGORIES.join(", ")}. Empty string if isGearPhoto is false or you truly can't tell which category.`,
    },
    pieceType: {
      type: "string" as const,
      enum: ["one_piece", "jacket", "pants", ""],
      description:
        "Only meaningful when category is \"firesuit\": whether the photo shows a one-piece coverall, just the jacket/top half of a two-piece suit, or just the pants/bottom half. Empty string otherwise, or if you can't tell (e.g. a tag close-up with no garment shape visible).",
    },
    towHookSide: {
      type: "string" as const,
      enum: ["front", "rear", ""],
      description:
        "Only meaningful when category is \"tow_hook\": whether the photo shows the front or rear tow point -- look for context clues (front bumper/grille/headlights vs rear bumper/taillights/trunk). Empty string if you genuinely can't tell.",
    },
    categoryConfidence: { type: "string" as const, enum: ["high", "medium", "low"] },
    notes: {
      type: "string" as const,
      description: "Any caveats worth surfacing: blurry photo, could plausibly be a different category, multiple items visible in one shot, etc. Empty string if none.",
    },
    certifications: {
      type: "array" as const,
      description:
        "Every distinct certification/homologation tag you can actually read in THIS photo, whether it's a dedicated close-up of the tag or just legible within a wider photo of the whole item. Empty array if no tag is legible anywhere in the photo — don't guess at a certification that isn't actually readable.",
      items: {
        type: "object" as const,
        properties: {
          standardId: {
            type: "string" as const,
            description: `The specific standard this tag matches, one of:\n${ALL_STANDARDS}\nIf it doesn't clearly match any of these, use "${NOT_LISTED}" instead (still fill in rawText with what you actually see).`,
          },
          rawText: { type: "string" as const, description: "The exact text you can read on the tag (brand, spec number, wording as printed)." },
          homologationNumber: {
            type: "string" as const,
            description:
              "A separate per-product homologation/approval number printed on the tag, if any -- e.g. \"DC.001.18-O\", \"RS.001.01\". Empty string if none visible.",
          },
          labelDate: { type: "string" as const, description: "Date printed on the tag (manufacture/conformance/homologation date) in YYYY-MM-DD format. Empty string if none visible or imprecise." },
          tagExpirationDate: { type: "string" as const, description: "An explicit expiration date printed on the tag itself, in YYYY-MM-DD format. Empty string if none." },
          confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
        },
        required: ["standardId", "rawText", "homologationNumber", "labelDate", "tagExpirationDate", "confidence"],
      },
    },
    helmetType: {
      type: "string" as const,
      enum: ["open_face", "full_face", "unclear", ""],
      description:
        "Only meaningful when category is \"helmet\" AND the photo shows the helmet's outer shape (not just an interior tag close-up, which is usually hidden under the liner and won't show the shell shape at all — leave this empty string for that case). \"full_face\" if there's an integrated chin bar; \"open_face\" if not; \"unclear\" only if the shell is visible but you genuinely can't tell.",
    },
    hasVisor: {
      type: "boolean" as const,
      description: "Only meaningful when helmetType is open_face or full_face: true if a visor/face shield is visible attached to the helmet.",
    },
    visorNote: {
      type: "string" as const,
      description: "Brief detail about the visor when hasVisor is true (position, condition). Empty string otherwise.",
    },
    isCloseupOnly: {
      type: "boolean" as const,
      description:
        "True if this photo is a tight close-up of just a tag/label (or a small part of the item) with too little of the item itself visible to serve as a general reference photo of it — e.g. filling the frame with just the certification tag. False if enough of the whole item is visible to recognize its overall shape/condition, even if a tag is also readable in the same shot.",
    },
  },
  required: ["isGearPhoto", "category", "pieceType", "towHookSide", "categoryConfidence", "notes", "certifications", "helmetType", "hasVisor", "visorNote", "isCloseupOnly"],
};

const categoryList = CLASSIFIABLE_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_HINTS[c]}`).join("\n");

const PROMPT = `This photo was uploaded as part of a batch of racing-safety-equipment photos for automatically building a driver's gear inventory. Analyze it in full — do all of the following from this one photo:

1. Classify which equipment category it shows, one of:
${categoryList}
Common mix-ups to watch for: gloves vs arm restraints (gloves cover all fingers; arm restraints are a wrist/forearm strap with a tether, no fingers); undergarment vs firesuit (undergarment is thin plain long underwear, firesuit is the thicker outer suit, often with brand logos/stripes); balaclava vs neck collar (balaclava is a full head/face hood, neck collar is just a padded ring around the neck); fire extinguisher vs fire suppression system (a handheld cylinder you'd carry vs a fixed cylinder plumbed to nozzles and mounted in the car); tow hook vs kill switch vs hood pins (all small hardware mounted on/in the car — a tow hook is a loop/ring for towing, a kill switch is an electrical rotary/pull switch, hood pins are a pair of pins with spring clips through the hood).

2. Separately, check whether any certification/homologation tag is legible ANYWHERE in the photo — whether this is a dedicated close-up of a tag, or the tag just happens to be readable in a wider shot of the whole item (e.g. an arm restraint photographed with its sewn-in SFI tag in frame). Extract every distinct certification you can actually read into "certifications" — it's fine for this to be an empty array if no tag is legible at all in this particular photo. If a tag's text matches a standard family used by multiple product types (e.g. "SFI SPEC 3.3" appears on gloves, shoes, socks, AND arm restraints), rely on the tag's own wording (e.g. "HOOD", "ARM RESTRAINT", "GLOVES") and the product visible around it, not just the bare standard number.

3. If (and only if) the category is "helmet" and the photo shows the helmet's outer shell shape, also assess helmetType (full-face vs open-face) and whether a visor/shield is attached.

3b. If (and only if) the category is "tow_hook", also assess towHookSide (front vs rear) from context clues in the shot (front bumper/grille vs rear bumper/trunk). Leave it empty if you can't tell.

4. Set isCloseupOnly to true if this shot is dominated by a tag/label close-up with too little of the item itself in frame to recognize its overall shape or condition — false if enough of the whole item is visible for that, even when a tag is also legible in the same shot. This decides which photo gets shown as the item's representative thumbnail when several are uploaded, so a wide/overall shot should read false and a tight tag-only crop should read true.

If the photo doesn't show any of the categories above, or isn't racing gear at all, set isGearPhoto to false. Be conservative — use "low" confidence and explain in "notes" rather than guessing when uncertain, and never invent a certification that isn't actually legible in the image.`;

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

    const parsed = JSON.parse(text) as AnalyzeGearPhoto;
    const validCategory = (CLASSIFIABLE_CATEGORIES as readonly string[]).includes(parsed.category);
    if (!validCategory) parsed.category = "";

    // Cross-check each certification against the DETECTED category's actual registered
    // standards — the model picked standardId from a list spanning all 10 categories at once
    // (its schema can't be scoped to "whichever category it decides on" ahead of time), so a
    // standard that's real but belongs to a different category than the one detected here needs
    // to fall back to NOT_LISTED rather than being reported as a false match.
    if (validCategory) {
      const allowedIds = new Set(standardsFor(parsed.category as EquipmentCategory).map((s) => s.id));
      for (const cert of parsed.certifications) {
        if (cert.standardId !== NOT_LISTED && !allowedIds.has(cert.standardId)) {
          cert.standardId = NOT_LISTED;
        }
      }
    } else {
      for (const cert of parsed.certifications) cert.standardId = NOT_LISTED;
    }

    if (parsed.category !== "helmet") {
      parsed.helmetType = "";
      parsed.hasVisor = false;
      parsed.visorNote = "";
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const { status, error } = describeGeminiError(err, "analyze-gear-photo");
    return NextResponse.json({ error }, { status });
  }
}
