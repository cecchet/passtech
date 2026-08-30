#!/usr/bin/env node
// Parses one cached FIA Technical List (fia-lists/list-<N>.txt, produced by `pdftotext -layout`
// on fia-lists/list-<N>.pdf) into src/data/fiaHomologation/list-<N>.json.
//
// Usage: node scripts/parse-fia-list.mjs <listNumber>
//
// Each list has its own homologation-number pattern and quirks — see LIST_CONFIG below. The
// parser is intentionally conservative: it anchors on a line matching the number pattern, then
// only trusts fields found ON that same line (brand/model/product/dates). Multi-line-wrapped
// continuation text for long names is not reconstructed — a missing brand/model is left blank
// rather than guessed, since the homologation number + validity dates (the fields the app's
// pass/fail check actually depends on) are what must be reliable, not the display text.

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const LIST_CONFIG = {
  74: {
    title: "Technical List n°74 — Protective Clothing for Automobile Drivers (FIA 8856-2018)",
    standardIds: ["fia-8856-2018"],
    sourceUrl: "https://www.fia.com/system/files/documents/tl_74_-_8856-2018.pdf",
    numberPattern: /^([A-Z]{2}\.\d{3}\.\d{2}-[A-Z])\b/,
  },
  57: {
    title: "Technical List n°57 — Harnesses (FIA 8853-2016)",
    standardIds: ["fia-8853-2016"],
    sourceUrl: "https://www.fia.com/system/files/documents/1301f872-57cd-40e2-b43c-ae9bd84aecd1.pdf",
    numberPattern: /^(SH\.\d{3}\.\d{2}-[A-Z]-\d+)\b/,
  },
  24: {
    title: "Technical List n°24 — Harnesses (FIA 8853/98)",
    standardIds: ["fia-8853-98"],
    sourceUrl: "https://www.fia.com/sites/default/files/documents/tl24.pdf",
    numberPattern: /^\.?(B-\d{3}\.[A-Z]\/\d{2})\s*³?\b/,
  },
  16: {
    title: "Technical List n°16 — Plumbed-in Fire Extinguisher Systems",
    standardIds: ["fia-8865-2015"],
    sourceUrl: "https://www.fia.com/sites/default/files/tl16_0.pdf",
    numberPattern: /^(Ex\.\d{3}\.\d{2})\s*³?\b/,
  },
  12: {
    title: "Technical List n°12 — Seats (FIA 8855-1999)",
    standardIds: ["fia-8855-1999"],
    sourceUrl: "https://www.fia.com/sites/default/files/8855.pdf",
    // Pre-2000 numbers print with a leading dot (".CS.912.98"); 2002+ numbers don't (a real FIA
    // formatting quirk, not a typo) — both forms are normalized to the no-dot form for storage,
    // since that's what appears on a physical seat's own homologation label.
    numberPattern: /^\.?(CS\.\d{3}\.\d{2})\s*(?:⁽³⁾|³)?\s*\b/,
  },
};

// A trailing MM.YYYY MM.YYYY YYYY-ish tail — 0-3 of these tokens, in order (start-of-homol,
// end-of-homol, valid-until). Some rows only have 1 or 2 filled in.
const DATE_TAIL = /(?:\s+(\d{2}\.\d{4}))?(?:\s+(\d{2}\.\d{4}))?(?:\s+(\d{4}))?\s*$/;

const KNOWN_PRODUCT_TYPES = [
  "Overalls",
  "Shoes",
  "Gloves",
  "Socks",
  "Balaclava",
  "Top underwear",
  "Bottom underwear",
  "Cooling Overalls",
  "Cooling",
];

function splitColumns(text) {
  return text
    .split(/\s{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseGenericRow(line, numberPattern) {
  const m = numberPattern.exec(line);
  if (!m) return null;
  const number = m[1];
  let rest = line.slice(m[0].length);

  const dateMatch = DATE_TAIL.exec(rest);
  const [, start, end, validUntil] = dateMatch ?? [];
  if (dateMatch) rest = rest.slice(0, dateMatch.index);

  const cols = splitColumns(rest);
  let productType;
  const lastColIdx = cols.length - 1;
  if (lastColIdx >= 0 && KNOWN_PRODUCT_TYPES.some((p) => cols[lastColIdx].toLowerCase() === p.toLowerCase())) {
    productType = cols.pop();
  }
  const [manufacturer, model] = cols;

  return {
    number,
    manufacturer: manufacturer || undefined,
    model: model || undefined,
    productType: productType || undefined,
    homologationStart: start || undefined,
    homologationEnd: end || undefined,
    validUntil: validUntil || undefined,
  };
}

// Revocation notices are free-form prose (not tabular) but consistently name the withdrawn
// product via "Manufacturer: X" / "Model: Y" / "Homologation n<o|°>[.]?[ :]? NUMBER" lines
// within one paragraph block. Blocks are separated by blank lines in the pdftotext output.
function parseWarningSection(lines, numberPattern) {
  const warningIdx = lines.findIndex((l) => /WARNING/i.test(l));
  if (warningIdx === -1) return [];
  const tail = lines.slice(warningIdx).join("\n");
  if (/no warnings? for this (list|product)/i.test(tail)) return [];

  const revocations = [];
  const blocks = tail.split(/\n\s*\n/);
  for (const block of blocks) {
    const numberLineMatch = /Homologation\s+n\S{0,2}\s*:?\s*([^\n]+)/i.exec(block);
    if (!numberLineMatch) continue;
    const candidateLine = numberLineMatch[1].trim();
    const numMatch = numberPattern.exec(candidateLine);
    if (!numMatch) {
      console.warn(`  WARNING SECTION: found a "Homologation n:" line but couldn't extract a number from it: "${candidateLine}"`);
      continue;
    }
    const manufacturer = /Manufacturer:\s*([^\n]+)/i.exec(block)?.[1]?.trim();
    const model = /Model:\s*([^\n]+)/i.exec(block)?.[1]?.trim();
    const reasonMatch = /(For (?:reliability|safety) reasons[\s\S]*?mandatory\.)/i.exec(block.replace(/\s+/g, " "));
    revocations.push({
      number: numMatch[1],
      manufacturer,
      model,
      note: reasonMatch ? reasonMatch[1] : "Homologation withdrawn — see the list's own WARNING section for details.",
    });
  }
  return revocations;
}

function main() {
  const listNumber = Number(process.argv[2]);
  const config = LIST_CONFIG[listNumber];
  if (!config) {
    console.error(`No LIST_CONFIG for list ${listNumber}. Known: ${Object.keys(LIST_CONFIG).join(", ")}`);
    process.exit(1);
  }

  const txtPath = path.join(ROOT, "fia-lists", `list-${listNumber}.txt`);
  if (!existsSync(txtPath)) {
    console.error(`Missing ${txtPath} — run pdftotext -layout on the cached PDF first.`);
    process.exit(1);
  }
  const lines = readFileSync(txtPath, "utf-8").split(/\r?\n/);

  const entries = [];
  const seen = new Set();
  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s+/, "");
    const row = parseGenericRow(line, config.numberPattern);
    if (!row) continue;
    if (seen.has(row.number)) {
      console.warn(`  duplicate homologation number seen: ${row.number} — keeping first occurrence`);
      continue;
    }
    seen.add(row.number);
    entries.push(row);
  }

  const revocations = parseWarningSection(lines, config.numberPattern);
  for (const rev of revocations) {
    const entry = entries.find((e) => e.number === rev.number);
    if (entry) {
      entry.revoked = true;
      entry.revokedNote = rev.note;
      // The revocation notice is clean prose ("Manufacturer: X" / "Model: Y"); the main table's
      // own columns for the same row are more prone to wrap/bleed corruption (see e.g. list 12's
      // CS.972.99, whose table row parses to model "ECO" when the real model, per its own
      // revocation notice, is "Runner 2000"). Prefer the notice's version whenever it states one.
      if (rev.manufacturer) entry.manufacturer = rev.manufacturer;
      if (rev.model) entry.model = rev.model;
    } else {
      console.warn(`  WARNING SECTION: revoked number ${rev.number} not found among parsed entries — adding standalone.`);
      entries.push({ number: rev.number, manufacturer: rev.manufacturer, model: rev.model, revoked: true, revokedNote: rev.note });
    }
  }
  if (revocations.length > 0) {
    console.log(`  Found ${revocations.length} revocation(s): ${revocations.map((r) => r.number).join(", ")}`);
  }

  const output = {
    listNumber,
    title: config.title,
    standardIds: config.standardIds,
    sourceUrl: config.sourceUrl,
    lastFetched: new Date().toISOString().slice(0, 10),
    entries,
  };

  const outPath = path.join(ROOT, "src", "data", "fiaHomologation", `list-${listNumber}.json`);
  writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`List ${listNumber}: parsed ${entries.length} entries -> ${path.relative(ROOT, outPath)}`);
}

main();
