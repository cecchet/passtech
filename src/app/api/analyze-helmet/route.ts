import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ApiError } from "@google/genai";

// Reads GEMINI_API_KEY from the environment server-side — never sent to the client.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// New API keys are provisioned on the Interactions API — gemini-2.5-flash (classic generateContent)
// returns 404 "no longer available to new users" on those. gemini-3.6-flash is the current flash model.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

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

interface HelmetAnalysis {
  helmetType: "open_face" | "full_face" | "unclear";
  hasVisor: boolean;
  visorNote: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

const SCHEMA = {
  type: "object" as const,
  properties: {
    helmetType: {
      type: "string" as const,
      enum: ["open_face", "full_face", "unclear"],
      description:
        "\"full_face\" if the helmet has an integrated chin bar covering the mouth/jaw (may be visible even with the visor up or removed — look for the chin bar structure itself, not the visor). \"open_face\" (jet-style) if there's no chin bar at all. \"unclear\" only if the photo genuinely doesn't show enough of the helmet to tell (e.g. only the back or top is visible).",
    },
    hasVisor: {
      type: "boolean" as const,
      description: "True if a visor/face shield (clear or tinted, up, down, or detached-but-present in the photo) is visible attached to the helmet. False if there's no visor/shield at all, or the mounting points are visible but empty.",
    },
    visorNote: {
      type: "string" as const,
      description: "Brief detail about the visor when hasVisor is true — e.g. its position (up/down/removed), whether it looks intact, tinted vs clear. Empty string if hasVisor is false or nothing more can be said.",
    },
    confidence: { type: "string" as const, enum: ["high", "medium", "low"] },
    notes: {
      type: "string" as const,
      description: "Any caveats worth surfacing: blurry/obscured photo, unusual angle, anything that made the assessment uncertain. Empty string if none.",
    },
  },
  required: ["helmetType", "hasVisor", "visorNote", "confidence", "notes"],
};

const PROMPT = `This is a photo of a full racing helmet — the whole helmet from the outside, NOT a close-up of a certification tag or label (that's a separate photo; the tag is usually hidden inside the helmet under the liner and isn't visible here). Assess two things from the helmet's physical shape and visible parts: (1) whether it's full-face (integrated chin bar) or open-face (jet-style, no chin bar); (2) whether it has a visor/face shield attached, and any relevant detail about it (position, condition). Be conservative — if the photo doesn't show enough to judge confidently, say so in "notes" and use "low" confidence or "unclear" rather than guessing.`;

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

    const parsed = JSON.parse(text) as HelmetAnalysis;
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
