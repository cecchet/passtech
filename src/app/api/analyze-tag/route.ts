import { NextRequest, NextResponse } from "next/server";
import { EquipmentCategory } from "@/data/types";
import { NOT_LISTED, resolveStandardId, standardsFor } from "@/data/standards";
import { CATEGORY_META } from "@/data/categoryMeta";
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

const VALID_CATEGORIES: EquipmentCategory[] = [
  "helmet",
  "balaclava",
  "hnr",
  "neck_collar",
  "firesuit",
  "gloves",
  "shoes",
  "socks",
  "undergarment",
  "arm_restraint",
  "seat",
  "belts_harness",
  "window_net",
  "fuel_cell",
  "fire_suppression",
];

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

interface AnalyzeCandidate {
  standardId: string;
  rawText: string;
  homologationNumber: string;
  labelDate: string;
  tagExpirationDate: string;
  confidence: "high" | "medium" | "low";
  categoryMismatch: boolean;
  detectedCategory: string;
}

function buildSchema(allowedIds: string[]) {
  return {
    type: "object" as const,
    properties: {
      candidates: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            standardId: {
              type: "string" as const,
              enum: [...allowedIds, NOT_LISTED],
              description: `One of: ${allowedIds.join(", ")}. If the certification visible on the tag doesn't clearly match any of these, use "${NOT_LISTED}" instead.`,
            },
            rawText: {
              type: "string" as const,
              description: "The exact text you can read on the tag for this certification (brand, spec number, wording as printed).",
            },
            homologationNumber: {
              type: "string" as const,
              description:
                "The specific homologation/approval number printed on the tag for THIS product, if any -- e.g. \"DC.001.18-O\", \"RS.001.01\", \"AH.012.19-C-ABP\", \"CS.001.21\", \"FT3-4\". This is a per-product registration number (usually 2 letters, a 3-digit number, a 2-digit year, and sometimes a letter suffix), distinct from the certification standard number itself (e.g. \"FIA 8856-2018\") -- most tags with an FIA standard printed on them also carry one of these nearby. Empty string if no such number is visible or the tag only shows the standard/spec number with no separate per-product registration code.",
            },
            labelDate: {
              type: "string" as const,
              description: "Date printed on the tag (manufacture date, conformance date, homologation date) in YYYY-MM-DD format. Empty string if none visible or you can't determine it precisely.",
            },
            tagExpirationDate: {
              type: "string" as const,
              description: "An explicit expiration date printed on the tag itself, in YYYY-MM-DD format. Empty string if the tag doesn't print an expiration date.",
            },
            confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
            categoryMismatch: {
              type: "boolean" as const,
              description: "True if this tag clearly appears to be for a DIFFERENT piece of equipment than the category being scanned (e.g. a shoe or glove tag scanned while checking a firesuit). False if it's plausibly the right category, even if the exact standard isn't recognized.",
            },
            detectedCategory: {
              type: "string" as const,
              description: "Only meaningful when categoryMismatch is true: which kind of equipment this tag actually looks like it's for (e.g. 'gloves', 'shoes', 'helmet'). Empty string otherwise.",
            },
          },
          required: ["standardId", "rawText", "homologationNumber", "labelDate", "tagExpirationDate", "confidence", "categoryMismatch", "detectedCategory"],
        },
      },
      notes: {
        type: "string" as const,
        description: "Any caveats worth surfacing to the user: blurry/obscured photo, multiple tags visible, uncertainty, anything that looks damaged.",
      },
    },
    required: ["candidates", "notes"],
  };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many photo scans from this connection — please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: { category?: string; imageDataUrl?: string };
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

  const { category, imageDataUrl } = body;
  if (!category || !VALID_CATEGORIES.includes(category as EquipmentCategory)) {
    return NextResponse.json({ error: "Missing or invalid category." }, { status: 400 });
  }
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

  const standards = standardsFor(category as EquipmentCategory);
  const allowedIds = standards.map((s) => s.id);
  const standardList = standards.map((s) => `- ${s.id}: ${s.label}`).join("\n");
  const categoryLabel = CATEGORY_META[category as EquipmentCategory].label;

  const promptText = `This is a photo of a racing safety equipment certification/homologation tag. The user is currently checking their "${categoryLabel}" (category key "${category}") — they expect this tag to belong to that piece of equipment. It may carry more than one certification (e.g. both a Snell and an FIA sticker on the same helmet) — identify every distinct certification you can see, each as a separate entry in "candidates".

The certification standards we recognize for the "${categoryLabel}" category are:
${standardList}

IMPORTANT — check the equipment category first: look at the tag's shape, wording, and any pictograms to judge whether it's actually a "${categoryLabel}" tag at all, as opposed to a tag for a different item (e.g. a shoe or glove tag scanned while checking a firesuit, or vice versa). If it clearly looks like the wrong kind of tag, set "categoryMismatch": true and "detectedCategory" to what it actually looks like — do this even if the text also happens to resemble one of the standard IDs above, since standard families (like SFI 3.3) can appear on multiple different products. If it's plausibly the right category (even if you can't pin down the exact standard), set "categoryMismatch": false.

For each certification visible on the tag, match it to one of the IDs above if it clearly corresponds, or use "${NOT_LISTED}" if it doesn't match any of them (still fill in rawText with what you actually see). Extract any date(s) printed on the tag. Also look for a separate per-product homologation/approval number distinct from the standard number itself — see the "homologationNumber" field description for examples of the format. Be conservative — if you can't read something clearly, say so in "notes" and use "low" confidence rather than guessing.`;

  try {
    const interaction = await createGeminiInteraction({
      model: MODEL,
      input: [
        { type: "image", mime_type: mediaType, data: base64Data },
        { type: "text", text: promptText },
      ],
      response_format: { type: "text", mime_type: "application/json", schema: buildSchema(allowedIds) },
    });

    const text = interaction.output_text;
    if (!text) {
      return NextResponse.json({ error: "No result returned — the model may have declined to analyze this image." }, { status: 502 });
    }

    const parsed = JSON.parse(text) as { candidates: AnalyzeCandidate[]; notes: string };
    // Belt-and-suspenders: the schema's enum should already keep the model on our exact ids, but
    // recover a recognizable fragment (e.g. "SA2020" for "snell-sa2020") rather than let it fall
    // through to NOT_LISTED if it doesn't.
    parsed.candidates = parsed.candidates.map((c) => ({ ...c, standardId: resolveStandardId(c.standardId, category as EquipmentCategory) }));
    return NextResponse.json(parsed);
  } catch (err) {
    const { status, error } = describeGeminiError(err, "analyze-tag");
    return NextResponse.json({ error }, { status });
  }
}
