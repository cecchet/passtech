import { GoogleGenAI } from "@google/genai";

// Rate limits and billing status are per Google Cloud PROJECT, not per key — a key on a project
// with no billing account is genuinely free (capped RPM/RPD), a key on a billed project is Tier 1+
// and pays per request from the very first call, with no shared free allowance between them. Two
// separate keys on two separate projects, tried in order, is the only way to actually get "free
// until the limit, then paid" behavior — a single project can't do this on its own.
const freeKey = process.env.GEMINI_API_KEY_FREE;
const paidKey = process.env.GEMINI_API_KEY;

const freeClient = freeKey ? new GoogleGenAI({ apiKey: freeKey }) : undefined;
const paidClient = paidKey ? new GoogleGenAI({ apiKey: paidKey }) : undefined;

export function hasGeminiKeyConfigured(): boolean {
  return !!(freeClient || paidClient);
}

type InteractionsCreateParams = Parameters<GoogleGenAI["interactions"]["create"]>[0];
// None of the four callers ever pass `stream: true`, but the SDK's own overloads make
// `interactions.create`'s return type a union that includes a Stream — narrowed here to just the
// one field every caller actually reads, rather than reaching for @google/genai's internal (and
// unexported) non-streaming result type.
interface GeminiInteractionResult {
  output_text?: string | null;
}

/**
 * Runs one Gemini `interactions.create` call, preferring the free-tier key (GEMINI_API_KEY_FREE)
 * when configured and falling back to the paid key (GEMINI_API_KEY) on ANY failure from the free
 * one — not just a 429/quota error. A malformed request or a genuine outage fails identically on
 * either key, so this costs at most one extra (cheap, fast) round trip in those cases; a quota
 * exhaustion or transient hiccup on the free key is exactly the case this exists to route around.
 * The free attempt caps its own retries low (a persistent 429 from an exhausted daily quota won't
 * resolve within the SDK's own backoff window, so there's no point burning ~30s of retrying on a
 * key that's already known to be out for the day) — the paid attempt gets the SDK's normal retry
 * behavior, since by that point money's being spent either way and reliability is what matters.
 * Falls through to whichever single client is configured if only one of the two keys is set, and
 * throws NO_GEMINI_KEY_CONFIGURED if neither is (callers should check hasGeminiKeyConfigured()
 * first and return a clean error instead of reaching this).
 */
export async function createGeminiInteraction(params: InteractionsCreateParams): Promise<GeminiInteractionResult> {
  if (freeClient && paidClient) {
    try {
      return (await freeClient.interactions.create(params, { maxRetries: 2 })) as GeminiInteractionResult;
    } catch {
      return (await paidClient.interactions.create(params)) as GeminiInteractionResult;
    }
  }
  const client = freeClient ?? paidClient;
  if (!client) throw new Error("NO_GEMINI_KEY_CONFIGURED");
  return (await client.interactions.create(params)) as GeminiInteractionResult;
}
