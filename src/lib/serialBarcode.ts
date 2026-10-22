import { standardFamily } from "@/data/standards";

/**
 * FIA labels often print the product serial only as a barcode next to "Serial N°" (seat belts,
 * some helmets) -- the AI tag reader can't read bars, so this decodes the barcode in the browser
 * (in a worker, see serialBarcode.worker.ts) and fills the serial in. Pass the original photo file
 * when there is one: small barcodes may only decode above the 1600px the app sends for reading.
 * Resolves to null when nothing decodes, on any error, or after `timeoutMs`.
 */
export async function readSerialBarcode(source: Blob | string, timeoutMs = 10000): Promise<string | null> {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return null;
  let worker: Worker | undefined;
  try {
    const blob = typeof source === "string" ? await (await fetch(source)).blob() : source;
    const bitmap = await createImageBitmap(blob);
    worker = new Worker(new URL("./serialBarcode.worker.ts", import.meta.url), { type: "module" });
    const w = worker;
    const text = await new Promise<string | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs);
      w.onmessage = (e: MessageEvent<string | null>) => {
        clearTimeout(timer);
        resolve(e.data);
      };
      w.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      w.postMessage(bitmap, [bitmap]);
    });
    return text && /^[A-Za-z0-9][A-Za-z0-9 ./-]{3,23}$/.test(text.trim()) ? text.trim() : null;
  } catch {
    return null;
  } finally {
    worker?.terminate();
  }
}

const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/**
 * Puts a decoded barcode serial on the one FIA certification read from the same photo that has
 * no serial yet. Left alone when the AI already read that serial, when the barcode is really the
 * homologation number, or when it's unclear which certification it belongs to (two or more FIA
 * certifications without one).
 */
export function fillSerialFromBarcode<T extends { standardId: string; homologationNumber: string; serialNumber?: string }>(
  candidates: T[],
  barcode: string | null,
): T[] {
  if (!barcode) return candidates;
  const code = normalize(barcode);
  if (candidates.some((c) => c.serialNumber && normalize(c.serialNumber) === code)) return candidates;
  const open = candidates.filter((c) => standardFamily(c.standardId) === "fia" && !c.serialNumber && normalize(c.homologationNumber) !== code);
  if (open.length !== 1) return candidates;
  return candidates.map((c) => (c === open[0] ? { ...c, serialNumber: barcode } : c));
}
