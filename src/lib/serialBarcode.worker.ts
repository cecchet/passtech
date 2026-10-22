/// <reference lib="webworker" />
// Decodes the 1D barcode FIA labels print next to "Serial N°" (see serialBarcode.ts). Runs off the
// main thread: a full pass over a big photo can take a couple of seconds.
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  GlobalHistogramBinarizer,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from "@zxing/library";

// Serial barcodes seen on FIA labels are Code 39 (Schroth harness) and Code 128 (Stilo helmet).
// Product EAN/UPC codes on the same gear are not serials, so they're left out.
const FORMATS = [BarcodeFormat.CODE_39, BarcodeFormat.CODE_128];
// Long side, in pixels: the size the app already sends, then larger for small or distant labels.
const SIZES = [1600, 2800];

const reader = new MultiFormatReader();
reader.setHints(new Map<DecodeHintType, unknown>([[DecodeHintType.TRY_HARDER, true], [DecodeHintType.POSSIBLE_FORMATS, FORMATS]]));

function rotate90(src: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[x * h + (h - 1 - y)] = src[y * w + x];
  return out;
}

function tryDecode(lum: Uint8ClampedArray, w: number, h: number): string | null {
  for (const [data, dw, dh] of [[lum, w, h], [rotate90(lum, w, h), h, w]] as const) {
    for (const Binarizer of [HybridBinarizer, GlobalHistogramBinarizer]) {
      try {
        const result = reader.decode(new BinaryBitmap(new Binarizer(new RGBLuminanceSource(data, dw, dh))));
        if (FORMATS.includes(result.getBarcodeFormat())) return result.getText();
      } catch {
        // Nothing found this way.
      }
    }
  }
  return null;
}

function luminance(bitmap: ImageBitmap, maxDim: number): { lum: Uint8ClampedArray; width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = new OffscreenCanvas(width, height).getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const lum = new Uint8ClampedArray(width * height);
  for (let i = 0; i < lum.length; i++) lum[i] = (rgba[i * 4] * 299 + rgba[i * 4 + 1] * 587 + rgba[i * 4 + 2] * 114) / 1000;
  return { lum, width, height };
}

function decode(bitmap: ImageBitmap): string | null {
  const longSide = Math.max(bitmap.width, bitmap.height);
  for (const size of SIZES) {
    if (size !== SIZES[0] && longSide < size * 0.8) break;
    const { lum, width, height } = luminance(bitmap, size);
    const whole = tryDecode(lum, width, height);
    if (whole) return whole;
    // A 3x3 grid of half-size tiles overlapping by half: a small barcode fills more of a tile.
    const tw = Math.floor(width / 2), th = Math.floor(height / 2);
    for (let ty = 0; ty < 3; ty++) {
      for (let tx = 0; tx < 3; tx++) {
        const left = Math.floor((tx * (width - tw)) / 2), top = Math.floor((ty * (height - th)) / 2);
        const tile = new Uint8ClampedArray(tw * th);
        for (let y = 0; y < th; y++) tile.set(lum.subarray((top + y) * width + left, (top + y) * width + left + tw), y * tw);
        const found = tryDecode(tile, tw, th);
        if (found) return found;
      }
    }
  }
  return null;
}

self.onmessage = (e: MessageEvent<ImageBitmap>) => {
  let text: string | null = null;
  try {
    text = decode(e.data);
  } catch {
    text = null;
  } finally {
    e.data.close();
  }
  self.postMessage(text);
};
