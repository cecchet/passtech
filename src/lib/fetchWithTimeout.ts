export const REQUEST_TIMEOUT_MS = 60_000;
export const REQUEST_TIMEOUT_LABEL = "a minute";

/** POSTs JSON with a client-side timeout, since a hung vision-API call would otherwise leave the caller waiting forever with no feedback. */
export async function fetchWithTimeout(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, status: 0, data: { error: `This is taking longer than ${REQUEST_TIMEOUT_LABEL} — the connection or the vision service may be having trouble.` } };
    }
    return { ok: false, status: 0, data: { error: "Couldn't reach the server." } };
  } finally {
    clearTimeout(timer);
  }
}
