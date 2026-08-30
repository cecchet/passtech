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
  27: {
    title: "Technical List n°27, Part 1 — Homologated Garments (FIA 8856-2000)",
    standardIds: ["fia-8856-2000"],
    // Only Part 1 (numbered overalls/suits) fits this app's number-lookup model. Part 2
    // (undergarment/balaclava/sock/shoe manufacturers) and Part 3 (gloves) are both "approved
    // manufacturer/model" lists with NO homologation number at all — there is nothing for a user
    // to type in or scan for those categories under this standard, so this list is scoped to
    // firesuit only even though fia-8856-2000 also backs gloves/shoes/socks/undergarment.
    categories: ["firesuit"],
    sourceUrl: "https://www.fia.com/system/files/documents/l27_approved_clothing_materials.pdf",
    numberPattern: /^(RS\.\d{3}\.\d{2})\b/,
    // Part 1 dates print as DD.MM.YY (e.g. "01.12.01"), not this app's usual MM.YYYY — two
    // columns only (start/end), no separate "valid until" year.
    dateTailPattern: /(?:\s+(\d{2}\.\d{2}\.\d{2}))?(?:\s+(\d{2}\.\d{2}\.\d{2}))?\s*$/,
  },
  29: {
    title: "Technical List n°29, Part 1 — FHR Systems (FIA 8858-2010)",
    standardIds: ["fia-8858-2010"],
    categories: ["hnr"],
    sourceUrl: "https://www.fia.com/system/files/documents/l29_approved_fhr_systems_1.pdf",
    numberPattern: /^(FHR\.\d{3}\.\d{2}-[A-Z])\b/,
    dateTailPattern: /(?:\s+(\d{2}\.\d{2}\.\d{2}))?(?:\s+(\d{2}\.\d{2}\.\d{2}))?\s*$/,
  },
  40: {
    title: "Technical List n°40 — Advanced Racing Seats (FIA 8862-2009)",
    standardIds: ["fia-8862-2009"],
    categories: ["seat"],
    sourceUrl: "https://www.fia.com/sites/default/files/tl40_04.08.2026.pdf",
    numberPattern: /^(AS\.\d{3}\.\d{2})\b/,
    // Model column is unrecoverable for this list: each row has three more columns after
    // brand/model (circuit-seat-floor bracket, circuit-seat-back bracket, rally-seat bracket
    // part numbers), and when brand/model are blank on a given physical line — extremely common,
    // since one homologation's full bracket-compatibility list often spans 10+ wrapped lines —
    // pdftotext -layout collapses a bracket part number (e.g. "RTB1006BW") into the same visual
    // position a real model name would occupy, and the two are not distinguishable by pattern
    // (compare bracket "RT4129WTHR"-style parts to real models like "RT4129WTHR" itself). Brand
    // is recoverable because every bracket part number in this list contains a digit or a slash,
    // while real brand names (RACETECH, OMP, SPARCO, CITROËN, ...) don't — see columnParser.
    columnParser: (cols) => {
      const brand = cols[0];
      return brand && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s&.,'-]*$/.test(brand) ? { manufacturer: brand } : {};
    },
  },
  91: {
    title: "Technical List n°91 — Competition Seats (FIA 8855-2021)",
    standardIds: ["fia-8855-2021"],
    categories: ["seat"],
    sourceUrl: "https://www.fia.com/system/files/documents/l91_approved_competition_seats_-_8855-2021.pdf",
    numberPattern: /^(CS\.\d{3}\.\d{2})\b/,
    // This list is hand-transcribed (see LIST_91_MANUAL_ENTRIES below), not run through the
    // generic pdftotext-based row parser — see that constant's own comment for why.
    manualEntries: () => LIST_91_MANUAL_ENTRIES,
  },
};

// List 91's table has multiple bracket sub-rows genuinely belonging to ONE homologation number
// (e.g. CS.001.21 alone has two: ATBRK21 and ATBRK21-L), and `pdftotext -layout` does not
// reliably keep a number in the same reading-order position as the product row it belongs to —
// confirmed by cross-checking the parser's output against the actual rendered PDF pages
// (fia-lists/list-91.pdf via `pdftoppm`): CS.002.21/CS.003.21 are NOT bracket variants of
// CS.001.21 as the text ordering suggested — they're two entirely different seat models (Atech
// AT-FS and AT-FM). The generic per-line, same-line-only parser used for every other list
// silently produced wrong or incomplete manufacturer/model/bracket data throughout this list, not
// just in the messier tail section — a heuristic fix could not be trusted here. This table was
// instead transcribed by hand from the rendered pages, cell by cell, and is a complete, accurate
// reproduction of every entry (no revocations exist — the list's own WARNING section says so).
const LIST_91_MANUAL_ENTRIES = [
  { number: "CS.001.21", manufacturer: "Atech", model: "AT-FH", homologationStart: "05.2021", homologationEnd: "05.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.002.21", manufacturer: "Atech", model: "AT-FS", homologationStart: "06.2021", homologationEnd: "06.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.003.21", manufacturer: "Atech", model: "AT-FM", homologationStart: "06.2021", homologationEnd: "06.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.004.21", manufacturer: "Sparco", model: "MASTER", homologationStart: "07.2021", homologationEnd: "07.2026", validUntil: "2036", approvedBrackets: ["004919", "004922V1", "004922V2", "004922V3"] },
  { number: "CS.005.21", manufacturer: "Atech", model: "AT-CH", homologationStart: "07.2021", homologationEnd: "07.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.006.21", manufacturer: "Atech", model: "AT-CS", homologationStart: "09.2021", homologationEnd: "09.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.007.21", manufacturer: "Atech", model: "AT-CM", homologationStart: "09.2021", homologationEnd: "09.2026", validUntil: "2036", approvedBrackets: ["ATBRK21", "ATBRK21-L"] },
  { number: "CS.008.21", manufacturer: "Sparco", model: "ADV XT", homologationStart: "11.2021", homologationEnd: "11.2026", validUntil: "2036", approvedBrackets: ["004932H", "004932L"] },
  { number: "CS.009.21", manufacturer: "OMP", model: "HTC EVO CARBON", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2036", approvedBrackets: ["HC/945"] },
  { number: "CS.010.22", manufacturer: "Corbeau", model: "ECS4", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2037", approvedBrackets: ["2167-A & 2168-A", "2185-A & 2186-A", "2206-A & 2207-A", "2187-B-A & 2188-B-A"] },
  { number: "CS.011.22", manufacturer: "Sabelt", model: "SPINE", homologationStart: "05.2022", homologationEnd: "05.2027", validUntil: "2037", approvedBrackets: ["RFST0051", "RFST0071", "RFST0095", "RFST0108"] },
  { number: "CS.012.22", manufacturer: "Sabelt", model: "GT-AM", homologationStart: "05.2022", homologationEnd: "05.2027", validUntil: "2037", approvedBrackets: ["RFST0051", "RFST0071"] },
  { number: "CS.013.23", manufacturer: "TRP", model: "RST-1200", homologationStart: "02.2023", homologationEnd: "02.2028", validUntil: "2038", approvedBrackets: ["SSM-04"] },
  { number: "CS.014.23", manufacturer: "Sabelt", model: "SPINE M", homologationStart: "02.2023", homologationEnd: "02.2028", validUntil: "2038", approvedBrackets: ["RFST0051", "RFST0071", "RFST0095", "RFST0108"] },
  { number: "CS.015.23", manufacturer: "OMP", model: "HTC EVO", homologationStart: "03.2023", homologationEnd: "03.2028", validUntil: "2038", approvedBrackets: ["HC0-0951"] },
  { number: "CS.016.23", manufacturer: "OMP", model: "HTE EVO 2 CARBON", homologationStart: "03.2023", homologationEnd: "03.2028", validUntil: "2038", approvedBrackets: ["HC0-0951"] },
  { number: "CS.017.23", manufacturer: "OMP", model: "HTE EVO", homologationStart: "03.2023", homologationEnd: "03.2028", validUntil: "2038", approvedBrackets: ["HC0-0951"] },
  { number: "CS.018.23", manufacturer: "Sparco", model: "MATRIX", homologationStart: "05.2023", homologationEnd: "05.2028", validUntil: "2038", approvedBrackets: ["004926", "004926V01", "004926V02"] },
  { number: "CS.019.24", manufacturer: "OMP", model: "HTE EVO 2 XL", homologationStart: "07.2024", homologationEnd: "07.2029", validUntil: "2039", approvedBrackets: ["HC0-0951"] },
  { number: "CS.020.24", manufacturer: "Sabelt", model: "RALLY RAID", homologationStart: "12.2024", homologationEnd: "12.2029", validUntil: "2039", approvedBrackets: ["41AR0-151", "41AR0-152", "41ARO-165"] },
  { number: "CS.021.24", manufacturer: "OMP", model: "HTE EVO2 S", homologationStart: "12.2024", homologationEnd: "12.2029", validUntil: "2039", approvedBrackets: ["HC0-0951"] },
  { number: "CS.022.25", manufacturer: "HRX", model: "TORNADO", homologationStart: "04.2025", homologationEnd: "04.2030", validUntil: "2040", approvedBrackets: ["S000034_0005_BRK_SEAT_8855-2021"] },
  { number: "CS.023.25", manufacturer: "SABELT", model: "TAURUS EVO", homologationStart: "07.2025", homologationEnd: "07.2030", validUntil: "2040", approvedBrackets: ["RFST0071", "RFST0107LH-RH", "RFST0111LH-RH"] },
  { number: "CS.024.25", manufacturer: "SPARCO", model: "MASTER ADVANCE", homologationStart: "07.2025", homologationEnd: "07.2030", validUntil: "2040", approvedBrackets: ["004926"] },
  { number: "CS.025.25", manufacturer: "CORBEAU", model: "ECS4 ST", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2037", approvedBrackets: ["2167-A & 2168-A", "2185-A & 2186-A", "2206-A & 2207-A", "2187-B-A & 2188-B-A"] },
  { number: "CS.026.25", manufacturer: "CORBEAU", model: "ECS4 SS", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2037", approvedBrackets: ["2167-A & 2168-A", "2185-A & 2186-A", "2206-A & 2207-A", "2187-B-A & 2188-B-A"] },
  { number: "CS.027.25", manufacturer: "CORBEAU", model: "ECS4SW", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2037", approvedBrackets: ["2167-A & 2168-A", "2185-A & 2186-A", "2206-A & 2207-A", "2187-B-A & 2188-B-A"] },
  { number: "CS.028.25", manufacturer: "OMP", model: "HGT EVO", homologationStart: "09.2025", homologationEnd: "09.2030", validUntil: "2040", approvedBrackets: ["HC0-0954", "HC0-0955"] },
  { number: "CS.029.25", manufacturer: "RRS", model: "ERGO", homologationStart: "11.2025", homologationEnd: "11.2030", validUntil: "2040", approvedBrackets: ["RRS-04 SUPPORT"] },
  { number: "CS.030.25", manufacturer: "BRIDE", model: "H11A", homologationStart: "12.2025", homologationEnd: "12.2030", validUntil: "2040", approvedBrackets: ["H11S"] },
  { number: "CS.031.25", manufacturer: "SABELT", model: "TAURUS EVO M", homologationStart: "12.2025", homologationEnd: "12.2030", validUntil: "2040", approvedBrackets: ["RFST0071", "RFST0107LH-RH", "RFST0111LH-RH"] },
  { number: "CS.032.25", manufacturer: "SABELT", model: "TAURUS EVO L", homologationStart: "12.2025", homologationEnd: "12.2030", validUntil: "2040", approvedBrackets: ["RFST0071", "RFST0107LH-RH", "RFST0111LH-RH"] },
  { number: "CS.033.26", manufacturer: "SPARCO", model: "ADV XT 2026", homologationStart: "04.2026", homologationEnd: "04.2031", validUntil: "2041", approvedBrackets: ["004932H & BAA0245B0"] },
];

// A trailing MM.YYYY MM.YYYY YYYY-ish tail — 0-3 of these tokens, in order (start-of-homol,
// end-of-homol, valid-until). Some rows only have 1 or 2 filled in. Lists whose dates print in a
// different format (see e.g. list 27's config) override this via LIST_CONFIG.dateTailPattern.
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

// Repeated column-header words ("beginning" / "end" / "end(1)" / "Homologation") occasionally
// bleed onto a data row when a page-break reprints the header a line too close to real data
// (see e.g. list 29's FHR.004.10-A). Filtered out as a whole-token match only, so a real
// manufacturer/model that merely contains one of these words as a substring is untouched.
const HEADER_LEAK_WORDS = new Set(["beginning", "end", "end(1)", "homologation"]);

function splitColumns(text) {
  return text
    .split(/\s{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !HEADER_LEAK_WORDS.has(s.toLowerCase()));
}

function defaultColumnParser(cols) {
  let productType;
  const lastColIdx = cols.length - 1;
  if (lastColIdx >= 0 && KNOWN_PRODUCT_TYPES.some((p) => cols[lastColIdx].toLowerCase() === p.toLowerCase())) {
    productType = cols.pop();
  }
  const [manufacturer, model] = cols;
  return { manufacturer, model, productType };
}

function parseGenericRow(line, numberPattern, dateTailPattern, columnParser = defaultColumnParser) {
  const m = numberPattern.exec(line);
  if (!m) return null;
  const number = m[1];
  let rest = line.slice(m[0].length);

  const dateMatch = dateTailPattern.exec(rest);
  const [, start, end, validUntil] = dateMatch ?? [];
  if (dateMatch) rest = rest.slice(0, dateMatch.index);

  const cols = splitColumns(rest);
  const { manufacturer, model, productType, approvedBrackets } = columnParser(cols);

  return {
    number,
    manufacturer: manufacturer || undefined,
    model: model || undefined,
    productType: productType || undefined,
    homologationStart: start || undefined,
    homologationEnd: end || undefined,
    validUntil: validUntil || undefined,
    approvedBrackets: approvedBrackets || undefined,
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
  const seenNumbers = new Set();
  // Split on "IMPORTANT" (the literal word every notice opens with), not blank lines — some
  // lists (27) put a blank line between EVERY field of a single notice (Fabricant / Modèle /
  // Homologation no, each its own paragraph), which would otherwise fragment one notice into
  // several blank-line blocks, none containing all three fields together.
  const blocks = tail.split(/\bIMPORTANT\b/i);
  for (const block of blocks) {
    // Requires the colon: real revocation notices read "Homologation n° : XYZ" / "Homologation
    // no: XYZ". Without anchoring on the colon, this also matches footnote prose that happens to
    // contain "...homologation number..." (e.g. list 27's embroidering-correction footnote),
    // which isn't a revocation at all and has no real number to extract.
    const numberLineMatch = /Homologation\s+n[°o]?\.?\s*:\s*([^\n]+)/i.exec(block);
    if (!numberLineMatch) continue;
    const candidateLine = numberLineMatch[1].trim();
    const numMatch = numberPattern.exec(candidateLine);
    if (!numMatch) {
      console.warn(`  WARNING SECTION: found a "Homologation n:" line but couldn't extract a number from it: "${candidateLine}"`);
      continue;
    }
    // The same notice can appear more than once in the source PDF (a short WARNING section
    // sometimes gets reprinted across a page break); keep only the first occurrence per number.
    if (seenNumbers.has(numMatch[1])) continue;
    seenNumbers.add(numMatch[1]);
    // Some notices (e.g. list 27's) are French-first: "Fabricant :" / "Modèle:" instead of
    // "Manufacturer:" / "Model:".
    const manufacturer = /(?:Manufacturer|Fabricant)\s*:\s*([^\n]+)/i.exec(block)?.[1]?.trim();
    const model = /(?:Model|Mod[eè]le)\s*:\s*([^\n]+)/i.exec(block)?.[1]?.trim();
    // Just the consequence sentence ("As this seat can no longer be considered as complying
    // with..." / French "Cette combinaison ne pouvant plus être considérée..."), not the
    // "For safety reasons... withdrawn with immediate effect" opener (redundant with `revoked:
    // true`) or the Manufacturer/Model/Homologation-number restatement in between (redundant
    // with the dedicated fields already on this entry).
    const reasonMatch = /((?:As this|Cette)[\s\S]*?(?:mandatory|impos[eé])\.)/i.exec(block.replace(/\s+/g, " "));
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
  const dateTailPattern = config.dateTailPattern ?? DATE_TAIL;

  // How many of a row's optional fields actually got populated — used below to pick the more
  // useful of two rows sharing a number, since "first occurrence wins" isn't always right: a
  // page-wrap can print a bare "continues on next page" marker for a number BEFORE its real,
  // fully-populated row appears at the top of the next page (see e.g. list 40's AS.015.10).
  const richness = (row) => ["manufacturer", "model", "homologationStart", "homologationEnd", "validUntil", "approvedBrackets"].filter((k) => row[k]).length;

  let entries = [];
  if (config.manualEntries) {
    entries = config.manualEntries().map((e) => ({ ...e }));
    console.log(`  using ${entries.length} hand-transcribed entries — skipping the generic row parser entirely`);
  } else {
    const byNumber = new Map();
    for (const rawLine of lines) {
      const line = rawLine.replace(/^\s+/, "");
      const row = parseGenericRow(line, config.numberPattern, dateTailPattern, config.columnParser);
      if (!row) continue;
      const existing = byNumber.get(row.number);
      if (existing) {
        if (richness(row) > richness(existing)) {
          console.warn(`  duplicate homologation number seen: ${row.number} — replacing with a more complete later occurrence`);
          Object.assign(existing, row);
        } else {
          console.warn(`  duplicate homologation number seen: ${row.number} — keeping first (more complete) occurrence`);
        }
        continue;
      }
      byNumber.set(row.number, row);
      entries.push(row);
    }
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
    ...(config.categories ? { categories: config.categories } : {}),
    sourceUrl: config.sourceUrl,
    lastFetched: new Date().toISOString().slice(0, 10),
    entries,
  };

  const outPath = path.join(ROOT, "src", "data", "fiaHomologation", `list-${listNumber}.json`);
  writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`List ${listNumber}: parsed ${entries.length} entries -> ${path.relative(ROOT, outPath)}`);
}

main();
