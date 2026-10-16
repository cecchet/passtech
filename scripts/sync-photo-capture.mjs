#!/usr/bin/env node
// Copies the shared laptop photo capture (photo-capture.js: on a laptop, a photo picker offers
// "Use my phone" through a QR code, or the laptop camera) and its phone page (photo-drop.html)
// from the rollcage app (../rollcage-app/app) into public/, where the layout loads the script.
//
// Usage: npm run sync-photo-capture [-- path/to/rollcage-app/app]

import { copyFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.resolve(process.argv[2] ?? path.join(ROOT, "..", "rollcage-app", "app"));

for (const file of ["photo-capture.js", "photo-drop.html"]) {
  const from = path.join(SRC, file);
  if (!existsSync(from)) {
    console.error(`Not found: ${from}`);
    process.exit(1);
  }
  copyFileSync(from, path.join(ROOT, "public", file));
}
console.log(`Copied photo-capture.js and photo-drop.html from ${SRC}`);
