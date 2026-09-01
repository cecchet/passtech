/**
 * Maps a thrown error from a Gemini API call to an HTTP status + user-facing message for an API
 * route's catch block. Deliberately duck-types the status code (`statusCode` or `status`, whichever
 * is present) instead of checking `instanceof ApiError` from @google/genai — confirmed via a real
 * 429 in dev that the SDK throws distinctly-named error classes per status (e.g. `RateLimitError`
 * for 429), none of which are `ApiError` instances, so that check silently never matched and every
 * Gemini-side failure — including genuinely actionable ones like quota exhaustion — fell through to
 * a generic "unexpected error" message with no indication of what actually happened or whether
 * retrying could help.
 */
export function describeGeminiError(err: unknown, routeName: string): { status: number; error: string } {
  const statusCode = typeof (err as { statusCode?: unknown })?.statusCode === "number" ? (err as { statusCode: number }).statusCode : undefined;
  const message = err instanceof Error ? err.message : String(err);

  if (statusCode === 401 || statusCode === 403) {
    return { status: 500, error: "Server's API key was rejected (check GEMINI_API_KEY)." };
  }
  if (statusCode === 429) {
    return {
      status: 429,
      error:
        "Rate limited — the Gemini API quota was hit. The free tier caps both requests per minute and requests per day; a per-minute hit clears within a minute, but a per-day hit won't clear until the daily quota resets. Wait a bit before retrying.",
    };
  }
  if (statusCode) {
    return { status: 502, error: `Vision analysis failed: ${message}` };
  }
  console.error(`${routeName} unexpected error:`, err);
  return { status: 500, error: "Unexpected error analyzing the image — this is usually transient, worth retrying." };
}
