async function drawResized(bitmap: ImageBitmap, maxDim: number, quality: number): Promise<string> {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

/** Resizes/compresses an image client-side before upload, to minimize data transfer on mobile connections. */
export async function resizeImageToDataUrl(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    return await drawResized(bitmap, maxDim, quality);
  } finally {
    bitmap.close();
  }
}

/** Re-encodes an already-stored photo (a data: URL) at a smaller size/quality — used to shrink a
 * gear-set export without touching what's actually stored (see handleExportProfile in
 * GarageManager.tsx, which offers "include high-resolution photos" as an export option). */
export async function downscaleDataUrl(dataUrl: string, maxDim: number, quality: number): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  try {
    return await drawResized(bitmap, maxDim, quality);
  } finally {
    bitmap.close();
  }
}
