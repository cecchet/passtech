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
    numberPattern: /^\.?(CS\.\d{3}\.\d{2})\s*(?:⁽³⁾|³)?\s*\b/,
    // Hand-transcribed (see LIST_12_MANUAL_ENTRIES below), not run through the generic
    // pdftotext-based row parser — see that constant's own comment for why.
    manualEntries: () => LIST_12_MANUAL_ENTRIES,
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

// List 12's table (unlike every other list here) drifts the MODEL and DATE columns out of
// sync with the NUMBER/BRAND columns as pdftotext -layout reads down each page — not a clean,
// reversible offset (it varies row to row, and resets at each page break), so a generic parser
// silently attributed one product's model/dates to a different, nearby number throughout this
// list (e.g. the text read .CS.900.98  MOMO  Touring CC, but the real .CS.900.98 is MOMO
// Mirage S — Touring CC belongs to .CS.832.98). Confirmed and fixed by cross-checking every
// entry against the rendered PDF pages (pdftoppm, same approach as list 91). All 599 entries
// below are a complete, accurate transcription; the 17 revocations are still detected
// automatically by parseWarningSection from the list's own free-text WARNING section below,
// which was unaffected by this bug (it's prose, not a table).
const LIST_12_MANUAL_ENTRIES = [
  { number: "CS.826.97", manufacturer: "OMP", model: "GRIP / CHAMP", homologationStart: "12.1997", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.828.97", manufacturer: "OMP", model: "Record", homologationStart: "12.1997", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.830.97", manufacturer: "SPARCO", model: "ATLAS VTR", homologationStart: "12.1997", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.831.97", manufacturer: "SPARCO", model: "EVO 2 VTR", homologationStart: "12.1997", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.832.98", manufacturer: "SPARCO", model: "Touring CC", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.900.98", manufacturer: "MOMO", model: "Mirage S", homologationStart: "04.1998", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.904.98", manufacturer: "OMP", model: "ARS", homologationStart: "01.1998", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.905.98", manufacturer: "SPARCO", model: "Touring VTR", homologationStart: "01.1998", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.909.98", manufacturer: "EKTOR", model: "ektor ho", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.911.98", manufacturer: "OMP", model: "Grip Carbon", homologationStart: "04.1998", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.912.98", manufacturer: "KINGDRAGON", model: "Master VTR", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.913.98", manufacturer: "MOMO", model: "Rooky", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.914.98", manufacturer: "MOMO", model: "Nascar", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.915.98", manufacturer: "SPARCO", model: "Rev", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.916.98", manufacturer: "SPARCO", model: "Ultra", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.917.98", manufacturer: "SPARCO", model: "Pro 2000", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.918.98", manufacturer: "SPARCO", model: "EVO", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.919.98", manufacturer: "MOMO", model: "Mirage", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.922.98", manufacturer: "EKTOR", model: "Start EVO", homologationStart: "06.1998", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.924.98", manufacturer: "OMP", model: "ARS", homologationStart: "07.1998", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.925.98", manufacturer: "OMP", model: "Pista HA/684", homologationStart: "07.1998", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.927.98", manufacturer: "KINGDRAGON", model: "Master K/C", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.928.98", manufacturer: "KINGDRAGON", model: "Polaris K/C", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.929.98", manufacturer: "MOMO", model: "Mille Laghi Evo VTR", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.930.98", manufacturer: "MOMO", model: "Top Nascar K/C", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.931.98", manufacturer: "MOMO", model: "Mille Laghi Evo K/C", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.932.98", manufacturer: "KINGDRAGON", model: "Polaris VTR", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.933.98", manufacturer: "MOMO", model: "Montecarlo VTR", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.934.98", manufacturer: "MOMO", model: "Extreme K/C", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.935.98", manufacturer: "MOMO", model: "Acropolis VTR", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.936.98", manufacturer: "MOMO", model: "Top Nascar VTR", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.937.98", manufacturer: "SPARCO", model: "Corsa", homologationStart: "08.1998", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.938.98", manufacturer: "SPARCO", model: "CHALLENGE VTR", homologationStart: "07.1998", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.940.98", manufacturer: "OMP", model: "Pista HA/686", homologationStart: "10.1998", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.941.98", manufacturer: "OMP", model: "RS HA/633", homologationStart: "10.1998", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.942.98", manufacturer: "OMP", model: "ECO HA/644", homologationStart: "10.1998", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.943.98", manufacturer: "EKTOR", model: "ektor start", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.944.98", manufacturer: "EKTOR", model: "ektor winner", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.945.98", manufacturer: "EKTOR", model: "ektor rush kevlar/carbone", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.946.98", manufacturer: "MOMO", model: "Tframe", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.947.99", manufacturer: "OMP", model: "GRIP K/C or HA/636", homologationStart: "01.1999", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.948.99", manufacturer: "OMP", model: "EXTRA HA 634 or ECO XL", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.949.99", manufacturer: "SPARCO", model: "PRO WRC", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.950.99", manufacturer: "SPARCO", model: "Atlas", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.951.99", manufacturer: "SPARCO", model: "Pro 2000", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.952.99", manufacturer: "SPARCO", model: "CORSA", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.953.99", manufacturer: "SPARCO", model: "TECNO", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.954.99", manufacturer: "SPARCO", model: "Junior", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.955.99", manufacturer: "SPARCO", model: "INDY", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.956.99", manufacturer: "EKTOR", model: "EkTOR RUSH fibre", homologationStart: "12.1998", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.957.99", manufacturer: "SPARCO", model: "EVO", homologationStart: "02.1999", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.958.99", manufacturer: "RACETECH", model: "4009", homologationStart: "03.1999", homologationEnd: "03.2022", validUntil: "2027" },
  { number: "CS.959.99", manufacturer: "TWR", model: "Super touring 1999", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.960.99", manufacturer: "NORFOLK", model: "GTP seat", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.961.99", manufacturer: "MOMO", model: "Nascar KC", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.962.99", manufacturer: "MOMO", model: "Extreme VTR", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.963.99", manufacturer: "MOMO", model: "Acropolis or EVO KC", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.964.99", manufacturer: "RECARO", model: "Pro Racer 99 SPA", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.965.99", manufacturer: "ISOMAX", model: "ISOMAX SHR", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.966.99", manufacturer: "SPARCO", model: "TTE", homologationStart: "04.1999", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.967.99", manufacturer: "SPARCO", model: "Driver", homologationStart: "05.1999", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.968.99", manufacturer: "GA RACING", model: "CHAMP", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.969.99", manufacturer: "GA RACING", model: "SPEEDY", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.970.99", manufacturer: "GA RACING", model: "ECO", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.971.99", manufacturer: "GA RACING", model: "JET", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.972.99", manufacturer: "EKTOR", model: "Runner 2000", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.973.99", manufacturer: "COBRA", model: "Imola", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.974.99", manufacturer: "COBRA", model: "Evolution", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.975.99", manufacturer: "COBRA", model: "Imola GT", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.976.99", manufacturer: "COBRA", model: "Evolution GT", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.977.99", manufacturer: "COBRA", model: "Sportline", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.978.99", manufacturer: "COBRA", model: "Sportline GT", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.979.99", manufacturer: "COBRA", model: "Suzuka", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.980.99", manufacturer: "COBRA", model: "Monaco", homologationStart: "06.1999", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.981.99", manufacturer: "GA RACING", model: "JUMBO", homologationStart: "07.1999", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.982.99", manufacturer: "GA RACING", model: "RACE", homologationStart: "07.1999", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.983.99", manufacturer: "RECARO", model: "porsche pro racer 99 SPG", homologationStart: "07.1999", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.984.99", manufacturer: "SPARCO", model: "PRO WRC", homologationStart: "08.1999", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.985.99", manufacturer: "GIOCAR", model: "Skill", homologationStart: "08.1999", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.986.99", manufacturer: "GA RACING", model: "SAFARI KC", homologationStart: "10.1999", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.987.99", manufacturer: "GA RACING", model: "RACE KC", homologationStart: "10.1999", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.988.99", manufacturer: "GA RACING", model: "SPEEDY KC", homologationStart: "10.1999", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.989.99", manufacturer: "OMP", model: "WRC HA/640", homologationStart: "12.1999", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.990.00", manufacturer: "KONIG", model: "komfort or RSL3000", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.991.00", manufacturer: "KONIG", model: "komfort or RSL2000", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.992.00", manufacturer: "CORBEAU", model: "Forza", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.993.00", manufacturer: "CORBEAU", model: "Pro series", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.994.00", manufacturer: "CORBEAU", model: "Revolution", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.995.00", manufacturer: "RECARO", model: "Pro racer 99 SPG", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.996.00", manufacturer: "RECARO", model: "RACER SPG", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.997.00", manufacturer: "RECARO", model: "Pole position", homologationStart: "01.2000", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.998.00", manufacturer: "MOMO", model: "CUP", homologationStart: "02.2000", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.999.00", manufacturer: "SABELT", model: "Montecarlo VTR", homologationStart: "05.2000", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.003.00", manufacturer: "SABELT", model: "Montecarlo CARB", homologationStart: "05.2000", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.004.00", manufacturer: "SABELT", model: "CRONO", homologationStart: "05.2000", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.005.00", manufacturer: "SABELT", model: "GT", homologationStart: "05.2000", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.006.00", manufacturer: "KONIG", model: "RE01", homologationStart: "06.2000", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.007.00", manufacturer: "MOMO", model: "CUP VTR", homologationStart: "07.2000", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.008.00", manufacturer: "RACETECH", model: "4000W", homologationStart: "07.2000", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.009.00", manufacturer: "RACETECH", model: "9009", homologationStart: "07.2000", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.010.00", manufacturer: "RACETECH", model: "9009HR", homologationStart: "07.2000", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.011.00", manufacturer: "RECARO", model: "Profi SPG", homologationStart: "08.2000", homologationEnd: "08.2027", validUntil: "2032" },
  { number: "CS.012.00", manufacturer: "RECARO", model: "SPG.N", homologationStart: "08.2000", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.013.00", manufacturer: "C-ONE CORPORATION", model: "Interget", homologationStart: "09.2000", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.014.00", manufacturer: "RECARO", model: "Profi SPA", homologationStart: "09.2000", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.015.00", manufacturer: "EKTOR", model: "ISO 2000", homologationStart: "12.2000", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.016.00", manufacturer: "RECARO", model: "pro racer SPA 80mm verbreitert", homologationStart: "12.2000", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.017.00", manufacturer: "TOYOTA BOSHOKU", model: "AAR RAcing-2 303", homologationStart: "01.2001", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.018.00", manufacturer: "TOYOTA BOSHOKU", model: "AAR Racing-2 302", homologationStart: "01.2001", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.019.00", manufacturer: "TOYOTA BOSHOKU", model: "AAR RAcing-2 301", homologationStart: "01.2001", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.020.00", manufacturer: "TOYOTA BOSHOKU", model: "AAR RAcing-2 300", homologationStart: "01.2001", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.021.01", manufacturer: "ISOMAX", model: "RMS", homologationStart: "01.2001", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.022.01", manufacturer: "MOMO", model: "Start", homologationStart: "03.2001", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.023.01", manufacturer: "CARBOSYSTEMS", model: "Safetycell", homologationStart: "04.2001", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.024.01", manufacturer: "MOONCRAFT", model: "Mooncraft S/No:2", homologationStart: "04.2001", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.025.01", manufacturer: "OMP", model: "BIG HA/703 or WRC XL", homologationStart: "03.2001", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.026.01", manufacturer: "KINGDRAGON", model: "Vega2", homologationStart: "04.2001", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.027.01", manufacturer: "SHIN NAGOYA", model: "Bride thrown FG603", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.028.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FM302", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.029.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FM303", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.030.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FS301", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.031.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FL301", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.032.01", manufacturer: "SHIN NAGOYA", model: "Bride thrown FG601", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.033.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FM301", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.034.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FM304", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.035.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FM305", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.036.01", manufacturer: "SHIN NAGOYA", model: "Bride Divine FL303", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.037.01", manufacturer: "MOMO", model: "MONTE CARLO", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.038.01", manufacturer: "SHIN NAGOYA", model: "bride MArvel FG607", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.039.01", manufacturer: "SHIN NAGOYA", model: "BRIDE FAME FM307", homologationStart: "06.2001", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.040.01", manufacturer: "MOMO", model: "CUP HI-TECH", homologationStart: "08.2001", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.041.01", manufacturer: "MOMO", model: "Nascar GT diablo", homologationStart: "08.2001", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.042.01", manufacturer: "OMP", model: "WRC HA/705", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.043.01", manufacturer: "OMP", model: "SPORT HA/649", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.044.01", manufacturer: "OMP", model: "RS HA/633", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.045.01", manufacturer: "OMP", model: "ECO HA/644", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.046.01", manufacturer: "MOMO", model: "Monte Carlo 1 VTR", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.047.02", manufacturer: "KONIG", model: "RS 1000 GFK", homologationStart: "01.2002", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.048.01", manufacturer: "MOMO", model: "CUP 1", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.050.01", manufacturer: "MOMO", model: "Acropolis 1 KC", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.051.01", manufacturer: "MOMO", model: "Start 1 VTR", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.052.01", manufacturer: "MOMO", model: "CUP 2", homologationStart: "12.2001", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.053.02", manufacturer: "CORBEAU", model: "Sprint", homologationStart: "01.2002", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.054.02", manufacturer: "KONIG", model: "RE-02", homologationStart: "04.2002", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.055.02", manufacturer: "SABELT", model: "Racer", homologationStart: "05.2002", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.056.02", manufacturer: "TOORA", model: "RACE", homologationStart: "06.2002", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.057.02", manufacturer: "BIMARCO", model: "EXPERT", homologationStart: "07.2002", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.058.02", manufacturer: "BIMARCO", model: "DAKAR", homologationStart: "07.2002", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.059.02", manufacturer: "TOORA", model: "BASIC", homologationStart: "07.2002", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.060.02", manufacturer: "TOORA", model: "CONCEPT", homologationStart: "07.2002", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.061.02", manufacturer: "SABELT", model: "ST", homologationStart: "09.2002", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.062.02", manufacturer: "RACETECH", model: "4009W", homologationStart: "10.2002", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.063.02", manufacturer: "RACETECH", model: "4009HR", homologationStart: "10.2002", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.064.02", manufacturer: "RACETECH", model: "4009WHRV", homologationStart: "10.2002", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.065.02", manufacturer: "RACETECH", model: "4009HRV", homologationStart: "10.2002", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.066.02", manufacturer: "TOORA", model: "PROJECT CARBON", homologationStart: "12.2002", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.067.02", manufacturer: "TOORA", model: "PROJECT VTR", homologationStart: "12.2002", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.068.02", manufacturer: "RECARO", model: "PROFI SPG", homologationStart: "12.2002", homologationEnd: "12.2022", validUntil: "2027" },
  { number: "CS.069.03", manufacturer: "LICO", model: "HURRICANE", homologationStart: "02.2003", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.070.03", manufacturer: "COBRA", model: "MONACO S", homologationStart: "02.2003", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.071.03", manufacturer: "DOME", model: "DCM CS01", homologationStart: "02.2003", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.072.03", manufacturer: "TOORA", model: "PROTEC", homologationStart: "04.2003", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.073.03", manufacturer: "TEE'S CORPORATION", model: "BRIDE F38A", homologationStart: "06.2003", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.074.03", manufacturer: "OMP", model: "RECORD 2", homologationStart: "07.2003", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.075.03", manufacturer: "RECARO", model: "PRO RACER SPG XL", homologationStart: "08.2003", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.076.03", manufacturer: "RECARO", model: "PRO RACER SPG VARIO", homologationStart: "08.2003", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.077.03", manufacturer: "MOTORDRIVE", model: "PRO GRP/COMPOSITE", homologationStart: "09.2003", homologationEnd: "09.2027", validUntil: "2032" },
  { number: "CS.078.03", manufacturer: "MOTORDRIVE", model: "Pro WC2", homologationStart: "09.2003", homologationEnd: "09.2027", validUntil: "2032" },
  { number: "CS.079.03", manufacturer: "MOTORDRIVE", model: "PRO HYBRID/CARBON", homologationStart: "09.2003", homologationEnd: "09.2027", validUntil: "2032" },
  { number: "CS.080.03", manufacturer: "ISOMAX", model: "18PD", homologationStart: "10.2003", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.081.03", manufacturer: "RECARO", model: "POLE POSITION JAPAN", homologationStart: "11.2003", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.082.03", manufacturer: "OMP", model: "RS P.T.", homologationStart: "12.2003", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.083.03", manufacturer: "SPARCO", model: "CIRCUIT VTR", homologationStart: "12.2003", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.084.03", manufacturer: "SPARCO", model: "EVO XL", homologationStart: "12.2003", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.085.04", manufacturer: "MOONCRAFT", model: "GT COMPETITION II", homologationStart: "01.2004", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.086.04", manufacturer: "RECARO", model: "Profi SPG XL", homologationStart: "01.2004", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.087.04", manufacturer: "VROOM", model: "SPORT", homologationStart: "01.2004", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.088.04", manufacturer: "VROOM", model: "TOURING", homologationStart: "01.2004", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.089.04", manufacturer: "OMP", model: "HTS", homologationStart: "01.2004", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.090.04", manufacturer: "RECARO", model: "porsche PRo racer SPG VARIO", homologationStart: "01.2004", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.091.04", manufacturer: "SABELT", model: "INDIANAPOLIS", homologationStart: "02.2004", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.092.04", manufacturer: "TEE'S CORPORATION", model: "BRIDE F31A", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.093.04", manufacturer: "TOORA", model: "RUNNER", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.094.04", manufacturer: "SPARCO", model: "S-LIGHT", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.095.04", manufacturer: "RACETECH", model: "9109HR", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.096.04", manufacturer: "RACETECH", model: "4009WHR", homologationStart: "03.2004", homologationEnd: "03.2022", validUntil: "2027" },
  { number: "CS.097.04", manufacturer: "RACETECH", model: "4000WX", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.098.04", manufacturer: "TOORA", model: "GARA", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.099.04", manufacturer: "SPARCO", model: "CIRCUIT S-LIGHT", homologationStart: "03.2004", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.100.04", manufacturer: "VELO RACING", model: "APEX", homologationStart: "03.2004", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.101.04", manufacturer: "VELO RACING", model: "GPT 3", homologationStart: "04.2004", homologationEnd: "04.2027", validUntil: "2032" },
  { number: "CS.102.04", manufacturer: "VELO RACING", model: "GPT 2", homologationStart: "04.2004", homologationEnd: "04.2027", validUntil: "2032" },
  { number: "CS.103.04", manufacturer: "VELO RACING", model: "GPT 1", homologationStart: "04.2004", homologationEnd: "04.2027", validUntil: "2032" },
  { number: "CS.104.04", manufacturer: "REITER", model: "RE.002", homologationStart: "04.2004", homologationEnd: "04.2022", validUntil: "2027" },
  { number: "CS.105.04", manufacturer: "TEE'S CORPORATION", model: "BRIDE F77A", homologationStart: "05.2004", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.106.04", manufacturer: "MOTORQUALITY", model: "VTS 2", homologationStart: "05.2004", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.107.04", manufacturer: "MOTORQUALITY", model: "VTS 1", homologationStart: "05.2004", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.108.04", manufacturer: "COBRA", model: "IMO 4R", homologationStart: "05.2004", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.109.04", manufacturer: "VELO RACING", model: "VRP1 or PODIUM II", homologationStart: "05.2004", homologationEnd: "05.2027", validUntil: "2032" },
  { number: "CS.110.04", manufacturer: "SABELT", model: "TITAN", homologationStart: "06.2004", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.111.04", manufacturer: "VELO RACING", model: "APEX Carbon/K", homologationStart: "06.2004", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.112.04", manufacturer: "VELO RACING", model: "APEX -XL Carbon/K", homologationStart: "06.2004", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.113.04", manufacturer: "VELO RACING", model: "VRP1 Carbon/K or Podium II K/C", homologationStart: "06.2004", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.114.04", manufacturer: "VELO RACING", model: "APEX XL", homologationStart: "06.2004", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.115.04", manufacturer: "TEE'S CORPORATION", model: "BRIDE FZ380", homologationStart: "07.2004", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.116.04", manufacturer: "TEE'S CORPORATION", model: "BRIDE FZ310", homologationStart: "07.2004", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.117.04", manufacturer: "OMP", model: "RONCO 2 / TURINI / T-CLUB", homologationStart: "07.2004", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.118.04", manufacturer: "TOORA", model: "PROJECT 2", homologationStart: "07.2004", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.119.04", manufacturer: "OMP", model: "MCC / PROTOTIPO", homologationStart: "08.2004", homologationEnd: "08.2027", validUntil: "2032" },
  { number: "CS.120.04", manufacturer: "OMP", model: "HTS Fiberglass", homologationStart: "08.2004", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.121.04", manufacturer: "TOORA", model: "CONCEPT LIGHT", homologationStart: "09.2004", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.122.04", manufacturer: "RECARO", model: "POLE POSITION USA", homologationStart: "09.2004", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.123.04", manufacturer: "SPARCO", model: "PRO WRC", homologationStart: "09.2004", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.124.04", manufacturer: "CORBEAU", model: "Revolution 2K", homologationStart: "10.2004", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.125.04", manufacturer: "CORBEAU", model: "Forza 2K", homologationStart: "10.2004", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.126.04", manufacturer: "CORBEAU", model: "Sprint 2K", homologationStart: "10.2004", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.127.04", manufacturer: "SPARCO", model: "REV PLUS", homologationStart: "12.2004", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.128.04", manufacturer: "MOMO", model: "T-FRAME EVO", homologationStart: "12.2004", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.129.04", manufacturer: "RECARO", model: "PRO RACER SPA HANS", homologationStart: "12.2004", homologationEnd: "12.2022", validUntil: "2027" },
  { number: "CS.130.04", manufacturer: "CORBEAU", model: "Pro Series 2K", homologationStart: "12.2004", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.131.04", manufacturer: "GA RACING", model: "SEP", homologationStart: "12.2004", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.132.05", manufacturer: "CORBEAU", model: "Revenge", homologationStart: "01.2005", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.133.05", manufacturer: "ROSSI SPORTS", model: "Professional II", homologationStart: "01.2005", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.134.05", manufacturer: "MOONCRAFT", model: "GT Competition III", homologationStart: "03.2005", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.135.05", manufacturer: "RECARO", model: "PRO RACER SPG XL HANS", homologationStart: "05.2005", homologationEnd: "05.2027", validUntil: "2032" },
  { number: "CS.136.05", manufacturer: "GM RACING", model: "PM00117 (for C5R and C6R only)", homologationStart: "05.2005", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.137.05", manufacturer: "SPARCO", model: "CIRCUIT PRO", homologationStart: "06.2005", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.138.05", manufacturer: "NICK COMPETICION", model: "CAVALLINO", homologationStart: "08.2005", homologationEnd: "08.2027", validUntil: "2032" },
  { number: "CS.139.05", manufacturer: "NICK COMPETICION", model: "INDY", homologationStart: "08.2005", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.140.05", manufacturer: "REVERIE", model: "XRC WIDE", homologationStart: "08.2005", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.141.05", manufacturer: "GM RACING", model: "PM00117 ventilated (for C5R and C6R only)", homologationStart: "08.2005", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.142.05", manufacturer: "ROSSI SPORTS", model: "Professional III", homologationStart: "09.2005", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.143.05", manufacturer: "OMP", model: "Big Carbon", homologationStart: "10.2005", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.144.05", manufacturer: "STS", model: "RACE I", homologationStart: "10.2005", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.145.05", manufacturer: "SABELT", model: "RACER DUO", homologationStart: "10.2005", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.146.05", manufacturer: "OMP", model: "HTE CARBON", homologationStart: "11.2005", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.147.05", manufacturer: "SABELT", model: "CH-F", homologationStart: "11.2005", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.148.05", manufacturer: "SABELT", model: "TITAN CARBONIO", homologationStart: "11.2005", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.149.05", manufacturer: "SABELT", model: "TITAN CARBONIO XL", homologationStart: "12.2005", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.150.05", manufacturer: "SABELT", model: "TITAN XL", homologationStart: "12.2005", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.151.06", manufacturer: "RECARO", model: "TOURING SPORT - GFRP", homologationStart: "01.2006", homologationEnd: "01.2022", validUntil: "2027" },
  { number: "CS.152.06", manufacturer: "RECARO", model: "Rally sport - GFRP", homologationStart: "01.2006", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.153.06", manufacturer: "RECARO", model: "Rally sport - WET CARBON", homologationStart: "01.2006", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.154.06", manufacturer: "RECARO", model: "TOURING SPORT- WET CARBON", homologationStart: "01.2006", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.155.06", manufacturer: "SABELT", model: "TAURUS XL", homologationStart: "02.2006", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.156.06", manufacturer: "SPARCO", model: "CIRCUIT PRO VTR", homologationStart: "02.2006", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.157.06", manufacturer: "SABELT", model: "TAURUS", homologationStart: "02.2006", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.158.06", manufacturer: "MOTORQUALITY", model: "VTS 0 CARBON", homologationStart: "03.2006", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.159.06", manufacturer: "GP RACE", model: "TOP RALLY", homologationStart: "03.2006", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.160.06", manufacturer: "NISMO", model: "GT PRO", homologationStart: "04.2006", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.161.06", manufacturer: "COBRA", model: "Evolution HANS", homologationStart: "04.2006", homologationEnd: "04.2022", validUntil: "2027" },
  { number: "CS.162.06", manufacturer: "COBRA", model: "Imola HANS", homologationStart: "04.2006", homologationEnd: "04.2022", validUntil: "2027" },
  { number: "CS.163.06", manufacturer: "COBRA", model: "Suzuka HANS", homologationStart: "04.2006", homologationEnd: "04.2022", validUntil: "2027" },
  { number: "CS.164.06", manufacturer: "SABELT", model: "TAURUS CARBONIO", homologationStart: "04.2006", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.165.06", manufacturer: "TANIDA", model: "JURAN GTR500", homologationStart: "04.2006", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.166.06", manufacturer: "RACETECH", model: "1000", homologationStart: "05.2006", homologationEnd: "05.2027", validUntil: "2032" },
  { number: "CS.167.06", manufacturer: "RACETECH", model: "9119HR", homologationStart: "05.2006", homologationEnd: "05.2022", validUntil: "2027" },
  { number: "CS.168.06", manufacturer: "RACETECH", model: "9119WHR", homologationStart: "05.2006", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.169.06", manufacturer: "OMP", model: "T-RS", homologationStart: "06.2006", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.170.06", manufacturer: "RECARO", model: "PRO RACER SPA XL HANS", homologationStart: "07.2006", homologationEnd: "07.2022", validUntil: "2027" },
  { number: "CS.171.06", manufacturer: "COBRA", model: "Sebring", homologationStart: "07.2006", homologationEnd: "07.2022", validUntil: "2027" },
  { number: "CS.172.06", manufacturer: "RECARO", model: "PRO RACER SPA HANS PLUS", homologationStart: "10.2006", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.173.06", manufacturer: "TANIDA", model: "JURAN GTX100", homologationStart: "10.2006", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.174.06", manufacturer: "TANIDA", model: "JURAN GTR500C", homologationStart: "10.2006", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.175.06", manufacturer: "TANIDA", model: "JURAN GTX600", homologationStart: "10.2006", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.176.06", manufacturer: "TANIDA", model: "JURAN GTX600C", homologationStart: "10.2006", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.177.06", manufacturer: "OMP", model: "WRC CARBON", homologationStart: "10.2006", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.178.06", manufacturer: "OMP", model: "BIG CARBON 2", homologationStart: "10.2006", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.179.06", manufacturer: "OMP", model: "ARS CARBON", homologationStart: "10.2006", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.180.06", manufacturer: "SPARCO", model: "SPRINT V", homologationStart: "11.2006", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.181.06", manufacturer: "SPARCO", model: "EVO PLUS", homologationStart: "11.2006", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.182.06", manufacturer: "OMP", model: "HTE CARBON XL", homologationStart: "12.2006", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.183.06", manufacturer: "OMP", model: "WRC FIBERGLASS or WRE / FIRST-R", homologationStart: "12.2006", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.184.06", manufacturer: "OMP", model: "HTE FIBERGLASS", homologationStart: "12.2006", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.185.06", manufacturer: "MOMO", model: "T-CLUB", homologationStart: "12.2006", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.186.07", manufacturer: "SABELT", model: "GT3", homologationStart: "01.2007", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.187.07", manufacturer: "SABELT", model: "TAURUS L", homologationStart: "01.2007", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.188.07", manufacturer: "MOMO", model: "DAYTONA SAFARI", homologationStart: "01.2007", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.189.07", manufacturer: "MOMO", model: "START 2007", homologationStart: "01.2007", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.190.07", manufacturer: "MOMO", model: "SUPER CUP", homologationStart: "01.2007", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.191.07", manufacturer: "TURINI", model: "HT107", homologationStart: "01.2007", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.192.07", manufacturer: "TURINI", model: "TURINI", homologationStart: "01.2007", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.193.07", manufacturer: "SPARCO", model: "TECNO GT", homologationStart: "02.2007", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.194.07", manufacturer: "GA RACING", model: "EXPERT", homologationStart: "02.2007", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.195.07", manufacturer: "NICK COMPETICION", model: "EFE - UNO", homologationStart: "04.2007", homologationEnd: "04.2022", validUntil: "2027" },
  { number: "CS.196.07", manufacturer: "SPARCO", model: "AIR", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.197.07", manufacturer: "SPARCO", model: "PRO ADV", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.198.07", manufacturer: "RACEPRO", model: "TARMAC", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.199.07", manufacturer: "RACEPRO", model: "ARROW", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.200.07", manufacturer: "RACEPRO", model: "RP", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.201.07", manufacturer: "STATUS RACING", model: "LAGUNA", homologationStart: "05.2007", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.202.07", manufacturer: "TREBEN", model: "516 VTR", homologationStart: "06.2007", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.203.07", manufacturer: "VROOM", model: "ZERO", homologationStart: "09.2007", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.204.07", manufacturer: "MOMO", model: "SAFARI / DAYTONA XL", homologationStart: "09.2007", homologationEnd: "09.2027", validUntil: "2032" },
  { number: "CS.205.07", manufacturer: "MOMO", model: "SUPER CUP XL", homologationStart: "09.2007", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.206.08", manufacturer: "SABELT", model: "CH-L", homologationStart: "03.2008", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.207.08", manufacturer: "GP RACE", model: "TOP CIRCUIT", homologationStart: "03.2008", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.208.08", manufacturer: "GP RACE", model: "TOP RALLY LIGHT", homologationStart: "03.2008", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.209.08", manufacturer: "COBRA", model: "MONACO PRO", homologationStart: "04.2008", homologationEnd: "04.2027", validUntil: "2032" },
  { number: "CS.210.08", manufacturer: "COBRA", model: "SEBRING PRO", homologationStart: "06.2008", homologationEnd: "06.2022", validUntil: "2027" },
  { number: "CS.211.08", manufacturer: "D RACING", model: "GT", homologationStart: "05.2008", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.212.08", manufacturer: "BIMARCO", model: "FUTURA", homologationStart: "05.2008", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.213.08", manufacturer: "BORDER MOTORSEATS", model: "SP-4C", homologationStart: "05.2008", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.214.08", manufacturer: "REITER", model: "RE.003", homologationStart: "07.2008", homologationEnd: "07.2022", validUntil: "2027" },
  { number: "CS.215.08", manufacturer: "SANDTLER", model: "DAKAR", homologationStart: "09.2008", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.216.08", manufacturer: "SANDTLER", model: "INDY", homologationStart: "09.2008", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.217.08", manufacturer: "SANDTLER", model: "MONZA", homologationStart: "09.2008", homologationEnd: "09.2017", validUntil: "2022" },
  { number: "CS.218.08", manufacturer: "RACETECH", model: "9129HR", homologationStart: "10.2008", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.219.08", manufacturer: "COBRA", model: "AERORACE", homologationStart: "10.2008", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.220.08", manufacturer: "MOONCRAFT", model: "GT Competition - V", homologationStart: "10.2008", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.221.08", manufacturer: "SPARCO", model: "SUPERCARBON", homologationStart: "10.2008", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.222.08", manufacturer: "ATECH", model: "ETS", homologationStart: "11.2008", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.223.08", manufacturer: "ATECH", model: "PERFORMANCE", homologationStart: "11.2008", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.224.08", manufacturer: "SANDTLER", model: "Roadster", homologationStart: "11.2008", homologationEnd: "11.2017", validUntil: "2022" },
  { number: "CS.225.09", manufacturer: "LOTUS CARS", model: "LOTUS SPORT GT CARBON", homologationStart: "02.2009", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.226.09", manufacturer: "ATECH", model: "EXTREME S2", homologationStart: "05.2009", homologationEnd: "05.2027", validUntil: "2032" },
  { number: "CS.227.09", manufacturer: "STATUS RACING", model: "RING", homologationStart: "05.2009", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.228.09", manufacturer: "NISMO", model: "GT PRO II", homologationStart: "06.2009", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.229.09", manufacturer: "OMP", model: "RS - P.T.", homologationStart: "06.2009", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.230.09", manufacturer: "OMP", model: "HTE FIBERGLASS XL", homologationStart: "06.2009", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.231.09", manufacturer: "LOTUS CARS", model: "LOTUS SPORT GT", homologationStart: "06.2009", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.232.09", manufacturer: "LOTUS CARS", model: "LOTUS SPORT CARBON GT2", homologationStart: "06.2009", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.233.10", manufacturer: "SPARCO", model: "PRO ADV CARBON", homologationStart: "01.2010", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.234.10", manufacturer: "SABELT", model: "GT-100", homologationStart: "01.2010", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.235.10", manufacturer: "MOONCRAFT", model: "GT COMPETITION-V+", homologationStart: "02.2010", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.236.10", manufacturer: "SPARCO", model: "CIRCUIT PLUS", homologationStart: "02.2010", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.237.10", manufacturer: "SABELT", model: "TITAN CARBONIO XXL", homologationStart: "05.2010", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.238.10", manufacturer: "COBRA", model: "SEBRING PRO ULTRA LIGHT", homologationStart: "05.2010", homologationEnd: "05.2027", validUntil: "2032" },
  { number: "CS.239.10", manufacturer: "SPARCO", model: "PRO 2000 PLUS", homologationStart: "05.2010", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.240.10", manufacturer: "R.C.C.", model: "VICTORY", homologationStart: "07.2010", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.241.10", manufacturer: "BMW", model: "SAFETY SEAT II (M3 E92 LMGT2 only)", homologationStart: "07.2010", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.242.10", manufacturer: "TOYOTA BOSHOKU", model: "TB RACING MSH001", homologationStart: "10.2010", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.243.10", manufacturer: "OMP", model: "T-RS", homologationStart: "10.2010", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.244.10", manufacturer: "SPARCO", model: "SPORT", homologationStart: "10.2010", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.245.10", manufacturer: "SPARCO", model: "SPORT CF", homologationStart: "10.2010", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.246.11", manufacturer: "MERCEDES-AMG", model: "gt3 safety seatshell (Mercedes SLS AMG GT3 only)", homologationStart: "03.2011", homologationEnd: "03.2022", validUntil: "2027" },
  { number: "CS.247.11", manufacturer: "ATECH", model: "NORTH", homologationStart: "03.2011", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.248.11", manufacturer: "NISMO", model: "GT PRO III", homologationStart: "05.2011", homologationEnd: "05.2017", validUntil: "2022" },
  { number: "CS.249.11", manufacturer: "TILLETT", model: "B6 F", homologationStart: "05.2011", homologationEnd: "05.2022", validUntil: "2027" },
  { number: "CS.250.11", manufacturer: "PRATT & MILLER", model: "PM-0221 (for ZR1 GT2,C6.R GT1, Camaro GT and CTS-V only)", homologationStart: "06.2011", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.251.11", manufacturer: "BRIDE", model: "FZ670", homologationStart: "06.2011", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.252.11", manufacturer: "BRIDE", model: "FZ910", homologationStart: "06.2011", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.253.11", manufacturer: "SPARCO", model: "ERGO L VTR (homologated with and without head support)", homologationStart: "06.2011", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.254.11", manufacturer: "SPARCO", model: "ERGO M VTR (homologated with and without head support)", homologationStart: "06.2011", homologationEnd: "06.2017", validUntil: "2022" },
  { number: "CS.255.11", manufacturer: "BRIDE", model: "FZ210", homologationStart: "07.2011", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.256.11", manufacturer: "BRIDE", model: "FZ420", homologationStart: "07.2011", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.257.11", manufacturer: "KONIG", model: "RS 4000", homologationStart: "07.2011", homologationEnd: "07.2017", validUntil: "2022" },
  { number: "CS.258.11", manufacturer: "SPARCO", model: "ERGO S VTR (homologated with and without head support)", homologationStart: "10.2011", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.259.11", manufacturer: "BRIDE", model: "FZ410", homologationStart: "10.2011", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.260.11", manufacturer: "BRIDE", model: "FZ770", homologationStart: "10.2011", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.261.11", manufacturer: "BIMARCO", model: "GRIP", homologationStart: "12.2011", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.262.11", manufacturer: "RACETECH", model: "4119HRW", homologationStart: "12.2011", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.263.12", manufacturer: "OMP", model: "HTE 400", homologationStart: "01.2012", homologationEnd: "01.2027", validUntil: "2032" },
  { number: "CS.264.12", manufacturer: "SABELT", model: "GT-200", homologationStart: "01.2012", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.265.12", manufacturer: "SABELT", model: "GT-300", homologationStart: "01.2012", homologationEnd: "01.2017", validUntil: "2022" },
  { number: "CS.266.12", manufacturer: "TILLETT", model: "B7-40", homologationStart: "02.2012", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.267.12", manufacturer: "TILLETT", model: "B7-44", homologationStart: "02.2012", homologationEnd: "02.2017", validUntil: "2022" },
  { number: "CS.268.12", manufacturer: "PLANET KART CROSS", model: "NO LIMIT MX1", homologationStart: "03.2012", homologationEnd: "03.2017", validUntil: "2022" },
  { number: "CS.269.12", manufacturer: "RACETECH", model: "4119thr", homologationStart: "03.2012", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.270.12", manufacturer: "RACETECH", model: "4119wthr", homologationStart: "03.2012", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.271.12", manufacturer: "OMP", model: "TRS XL", homologationStart: "04.2012", homologationEnd: "04.2027", validUntil: "2032" },
  { number: "CS.272.12", manufacturer: "PRAGA", model: "PRAGA SEAT ULTRA LIGHT", homologationStart: "04.2012", homologationEnd: "04.2017", validUntil: "2022" },
  { number: "CS.273.12", manufacturer: "RACETECH", model: "9119thr", homologationStart: "06.2012", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.274.12", manufacturer: "MIRCO", model: "MIRCO GT", homologationStart: "07.2012", homologationEnd: "07.2027", validUntil: "2032" },
  { number: "CS.275.12", manufacturer: "SPARCO", model: "PRIMO TGS", homologationStart: "08.2012", homologationEnd: "08.2017", validUntil: "2022" },
  { number: "CS.276.12", manufacturer: "MIRCO", model: "MIRCO RS2", homologationStart: "08.2012", homologationEnd: "08.2027", validUntil: "2032" },
  { number: "CS.277.12", manufacturer: "MOMO", model: "LESMO ONE", homologationStart: "09.2012", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.278.12", manufacturer: "RACETECH", model: "9119Wthr", homologationStart: "10.2012", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.279.12", manufacturer: "VROOM", model: "PROFESSIONAL", homologationStart: "10.2012", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.280.12", manufacturer: "MOMO", model: "LESMO ONE XL", homologationStart: "10.2012", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.281.12", manufacturer: "TRP CO., LTD.", model: "RST-100", homologationStart: "11.2012", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.282.12", manufacturer: "SABELT", model: "GT-200 XXL", homologationStart: "12.2012", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.283.12", manufacturer: "SABELT", model: "GT-300 XXL", homologationStart: "12.2012", homologationEnd: "12.2017", validUntil: "2022" },
  { number: "CS.284.12", manufacturer: "HRX", model: "HR-V0", homologationStart: "12.2012", homologationEnd: "12.2022", validUntil: "2027" },
  { number: "CS.285.13", manufacturer: "BPS RALLYE", model: "HIGH TECH 01", homologationStart: "01.2013", homologationEnd: "01.2018", validUntil: "2023" },
  { number: "CS.286.13", manufacturer: "TILLETT", model: "B6 F XL", homologationStart: "02.2013", homologationEnd: "02.2018", validUntil: "2023" },
  { number: "CS.287.13", manufacturer: "OMP", model: "HGT", homologationStart: "02.2013", homologationEnd: "02.2028", validUntil: "2033" },
  { number: "CS.288.13", manufacturer: "BRIDE", model: "FZ390", homologationStart: "05.2013", homologationEnd: "05.2018", validUntil: "2023" },
  { number: "CS.289.13", manufacturer: "BRIDE", model: "F39A", homologationStart: "05.2013", homologationEnd: "05.2018", validUntil: "2023" },
  { number: "CS.290.13", manufacturer: "STATUS RACING", model: "RING GT-X", homologationStart: "05.2013", homologationEnd: "05.2018", validUntil: "2023" },
  { number: "CS.291.13", manufacturer: "TOYOTA BOSHOKU", model: "TB RACING MSH002", homologationStart: "05.2013", homologationEnd: "05.2023", validUntil: "2028" },
  { number: "CS.292.13", manufacturer: "OMP", model: "TRS-XS", homologationStart: "05.2013", homologationEnd: "05.2023", validUntil: "2028" },
  { number: "CS.293.13", manufacturer: "OMP", model: "HRC or HRC-R Air", homologationStart: "06.2013", homologationEnd: "06.2028", validUntil: "2033" },
  { number: "CS.294.13", manufacturer: "MIRCO", model: "MIRCO RS1", homologationStart: "07.2013", homologationEnd: "07.2028", validUntil: "2033" },
  { number: "CS.295.13", manufacturer: "SPARCO", model: "NEO", homologationStart: "09.2013", homologationEnd: "09.2018", validUntil: "2023" },
  { number: "CS.296.13", manufacturer: "OMP", model: "HRC-D", homologationStart: "11.2013", homologationEnd: "11.2023", validUntil: "2028" },
  { number: "CS.297.13", manufacturer: "MIRCO", model: "MIRCO RTS", homologationStart: "12.2013", homologationEnd: "12.2023", validUntil: "2028" },
  { number: "CS.298.13", manufacturer: "SPARCO", model: "pro adv ts", homologationStart: "12.2013", homologationEnd: "12.2023", validUntil: "2028" },
  { number: "CS.299.14", manufacturer: "GP-RACE", model: "PRO RALLY", homologationStart: "01.2014", homologationEnd: "01.2019", validUntil: "2024" },
  { number: "CS.300.14", manufacturer: "GP-RACE", model: "PRO LIGHT", homologationStart: "01.2014", homologationEnd: "01.2019", validUntil: "2024" },
  { number: "CS.301.14", manufacturer: "GP-RACE", model: "PRO CIRCUIT", homologationStart: "01.2014", homologationEnd: "01.2019", validUntil: "2024" },
  { number: "CS.302.14", manufacturer: "SCHUURMAN FRANCE", model: "CROSSRACE/ ROSCROSS", homologationStart: "02.2014", homologationEnd: "02.2019", validUntil: "2024" },
  { number: "CS.303.14", manufacturer: "SPARCO", model: "CIRCUIT II", homologationStart: "05.2014", homologationEnd: "05.2019", validUntil: "2024" },
  { number: "CS.304.14", manufacturer: "SPARCO", model: "PRO2000 II", homologationStart: "06.2014", homologationEnd: "06.2019", validUntil: "2024" },
  { number: "CS.305.14", manufacturer: "RECARO", model: "PRO RACER SPG", homologationStart: "07.2014", homologationEnd: "07.2029", validUntil: "2034" },
  { number: "CS.306.14", manufacturer: "TRP CO., LTD.", model: "RST-200", homologationStart: "08.2014", homologationEnd: "08.2019", validUntil: "2024" },
  { number: "CS.307.14", manufacturer: "OMP", model: "HRC FIBERGLASS AIR", homologationStart: "08.2014", homologationEnd: "08.2024", validUntil: "2029" },
  { number: "CS.308.14", manufacturer: "SPARCO", model: "DRIFTING", homologationStart: "08.2014", homologationEnd: "08.2019", validUntil: "2024" },
  { number: "CS.309.14", manufacturer: "STATUS RACING", model: "GT-X WIDE", homologationStart: "09.2014", homologationEnd: "09.2019", validUntil: "2024" },
  { number: "CS.310.14", manufacturer: "STATUS RACING", model: "GT MID", homologationStart: "09.2014", homologationEnd: "09.2019", validUntil: "2024" },
  { number: "CS.311.14", manufacturer: "VROOM", model: "ANTISHOCK", homologationStart: "10.2014", homologationEnd: "10.2019", validUntil: "2024" },
  { number: "CS.312.14", manufacturer: "TRP CO., LTD.", model: "RST-300", homologationStart: "11.2014", homologationEnd: "11.2029", validUntil: "2034" },
  { number: "CS.313.14", manufacturer: "OMP", model: "HRC FIBERGLASS AIR XL", homologationStart: "11.2014", homologationEnd: "11.2029", validUntil: "2034" },
  { number: "CS.314.14", manufacturer: "SPARCO", model: "SPRINT L", homologationStart: "11.2014", homologationEnd: "11.2029", validUntil: "2034" },
  { number: "CS.315.14", manufacturer: "MOTORDRIVE", model: "ENDURANCE COMPOSITE", homologationStart: "12.2014", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.316.14", manufacturer: "MOTORDRIVE", model: "ENDURANCE HYBRID/CARBON", homologationStart: "12.2014", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.317.14", manufacturer: "MOTORDRIVE", model: "RACE COMPOSITE", homologationStart: "12.2014", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.318.14", manufacturer: "MOTORDRIVE", model: "RACE HYBRID/CARBON", homologationStart: "12.2014", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.319.14", manufacturer: "RECARO", model: "POLE POSITION N.G. / FURIOUS N.G.", homologationStart: "12.2014", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.320.15", manufacturer: "TRP CO., LTD.", model: "RST-400", homologationStart: "01.2015", homologationEnd: "01.2020", validUntil: "2025" },
  { number: "CS.321.15", manufacturer: "MOONCRAFT", model: "GT COMPETITION-VI", homologationStart: "01.2015", homologationEnd: "01.2020", validUntil: "2025" },
  { number: "CS.322.15", manufacturer: "SPARCO", model: "PRO 2000 LF", homologationStart: "03.2015", homologationEnd: "03.2020", validUntil: "2025" },
  { number: "CS.323.15", manufacturer: "SPARCO", model: "EVO LF", homologationStart: "03.2015", homologationEnd: "03.2020", validUntil: "2025" },
  { number: "CS.324.15", manufacturer: "BIMARCO", model: "EXPERT 2", homologationStart: "03.2015", homologationEnd: "03.2020", validUntil: "2025" },
  { number: "CS.325.15", manufacturer: "SPARCO", model: "CIRCUIT LF", homologationStart: "03.2015", homologationEnd: "03.2020", validUntil: "2025" },
  { number: "CS.326.15", manufacturer: "REVERIE", model: "SUPER SPORTS (homologated with and without head support)", homologationStart: "05.2015", homologationEnd: "05.2025", validUntil: "2030" },
  { number: "CS.327.15", manufacturer: "REVERIE", model: "SUPER SPORTS B SINGLE SKIN", homologationStart: "07.2015", homologationEnd: "07.2025", validUntil: "2030" },
  { number: "CS.328.15", manufacturer: "SPARCO", model: "DRIFTING II", homologationStart: "08.2015", homologationEnd: "08.2020", validUntil: "2025" },
  { number: "CS.329.15", manufacturer: "ORECA", model: "START FG EDITION", homologationStart: "11.2015", homologationEnd: "01.2020", validUntil: "2025" },
  { number: "CS.330.15", manufacturer: "ORECA", model: "PRO HEAD RESTRAINT", homologationStart: "11.2015", homologationEnd: "10.2017", validUntil: "2022" },
  { number: "CS.331.15", manufacturer: "TRP CO., LTD.", model: "RST-500", homologationStart: "11.2015", homologationEnd: "11.2030", validUntil: "2035" },
  { number: "CS.332.15", manufacturer: "SPARCO", model: "SPRINT", homologationStart: "12.2015", homologationEnd: "12.2035", validUntil: "2040" },
  { number: "CS.333.15", manufacturer: "BRIDE", model: "H 31 A", homologationStart: "12.2015", homologationEnd: "12.2020", validUntil: "2025" },
  { number: "CS.334.16", manufacturer: "ALFA RACING", model: "ACI 01", homologationStart: "02.2016", homologationEnd: "02.2026", validUntil: "2031" },
  { number: "CS.335.16", manufacturer: "CORBEAU", model: "PREDATOR", homologationStart: "02.2016", homologationEnd: "02.2021", validUntil: "2026" },
  { number: "CS.336.16", manufacturer: "GP-RACE", model: "R7", homologationStart: "03.2016", homologationEnd: "03.2026", validUntil: "2031" },
  { number: "CS.337.16", manufacturer: "BRIDE", model: "HZ310", homologationStart: "06.2016", homologationEnd: "06.2021", validUntil: "2026" },
  { number: "CS.338.16", manufacturer: "XTA SOLUTIONS", model: "ONIT PRO COMPOSITE", homologationStart: "07.2016", homologationEnd: "07.2021", validUntil: "2026" },
  { number: "CS.339.16", manufacturer: "SPARCO", model: "REV LF", homologationStart: "07.2016", homologationEnd: "07.2021", validUntil: "2026" },
  { number: "CS.340.16", manufacturer: "SPARCO", model: "REV II LF", homologationStart: "08.2016", homologationEnd: "08.2021", validUntil: "2026" },
  { number: "CS.341.16", manufacturer: "SPARCO", model: "EVO II US LF", homologationStart: "09.2016", homologationEnd: "09.2021", validUntil: "2026" },
  { number: "CS.342.16", manufacturer: "SPARCO", model: "EVO II LF", homologationStart: "10.2016", homologationEnd: "10.2021", validUntil: "2026" },
  { number: "CS.343.16", manufacturer: "SPARCO", model: "ERGO M LF (homologated with and without head support)", homologationStart: "11.2016", homologationEnd: "11.2021", validUntil: "2026" },
  { number: "CS.344.16", manufacturer: "SPARCO", model: "ERGO L LF (homologated with and without head support)", homologationStart: "11.2016", homologationEnd: "11.2021", validUntil: "2026" },
  { number: "CS.345.16", manufacturer: "SPARCO", model: "CIRCUIT II AIR CARBON", homologationStart: "11.2016", homologationEnd: "11.2021", validUntil: "2026" },
  { number: "CS.346.16", manufacturer: "SABELT", model: "TAURUS", homologationStart: "12.2016", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.347.16", manufacturer: "SABELT", model: "TAURUS MAX", homologationStart: "12.2016", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.348.16", manufacturer: "SABELT", model: "AB 124", homologationStart: "12.2016", homologationEnd: "12.2021", validUntil: "2026" },
  { number: "CS.349.16", manufacturer: "SABELT", model: "TITAN", homologationStart: "12.2016", homologationEnd: "12.2021", validUntil: "2026" },
  { number: "CS.350.16", manufacturer: "SABELT", model: "TITAN MAX", homologationStart: "12.2016", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.351.17", manufacturer: "SPARCO", model: "PRO ADV CF", homologationStart: "02.2017", homologationEnd: "02.2022", validUntil: "2027" },
  { number: "CS.352.17", manufacturer: "TILLETT", model: "B7-44-17", homologationStart: "02.2017", homologationEnd: "02.2022", validUntil: "2027" },
  { number: "CS.353.17", manufacturer: "SPARCO", model: "PRO ADV LF", homologationStart: "02.2017", homologationEnd: "02.2022", validUntil: "2027" },
  { number: "CS.354.17", manufacturer: "CORBEAU", model: "REVENGE X", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.355.17", manufacturer: "SABELT", model: "GT3", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.356.17", manufacturer: "TILLETT", model: "B7-40-17", homologationStart: "03.2017", homologationEnd: "03.2022", validUntil: "2027" },
  { number: "CS.357.17", manufacturer: "SPARCO", model: "ALPHA", homologationStart: "03.2017", homologationEnd: "03.2022", validUntil: "2027" },
  { number: "CS.358.17", manufacturer: "CORBEAU", model: "PRO SERIES X", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.359.17", manufacturer: "COBRA", model: "SUZUKA T GT", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.360.17", manufacturer: "COBRA", model: "SUZUKA T STD", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.361.17", manufacturer: "COBRA", model: "EVOLUTION T GT", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.362.17", manufacturer: "COBRA", model: "EVOLUTION T STD", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.363.17", manufacturer: "COBRA", model: "IMOLA T GT", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.364.17", manufacturer: "COBRA", model: "IMOLA T STD", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.365.17", manufacturer: "COBRA", model: "SEBRING T GT", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.366.17", manufacturer: "COBRA", model: "SEBRING T STD", homologationStart: "03.2017", homologationEnd: "03.2027", validUntil: "2032" },
  { number: "CS.367.17", manufacturer: "VROOM", model: "ROOKIE", homologationStart: "05.2017", homologationEnd: "05.2022", validUntil: "2027" },
  { number: "CS.368.17", manufacturer: "SABELT", model: "TAURUS TG M", homologationStart: "06.2017", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.369.17", manufacturer: "NICK COMPETICION", model: "PRO-NK", homologationStart: "06.2017", homologationEnd: "06.2027", validUntil: "2032" },
  { number: "CS.370.17", manufacturer: "SABELT", model: "TITAN MAX CARBON", homologationStart: "06.2017", homologationEnd: "06.2022", validUntil: "2027" },
  { number: "CS.371.17", manufacturer: "BIMARCO", model: "FUTURA 2", homologationStart: "07.2017", homologationEnd: "07.2022", validUntil: "2027" },
  { number: "CS.372.17", manufacturer: "HRX", model: "GORDON", homologationStart: "07.2017", homologationEnd: "07.2022", validUntil: "2027" },
  { number: "CS.373.17", manufacturer: "SPARCO", model: "EVO QRT", homologationStart: "07.2017", homologationEnd: "07.2027", validUntil: "2032" },
  { number: "CS.374.17", manufacturer: "TILLETT", model: "B6 XL SCREAMER", homologationStart: "09.2017", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.375.17", manufacturer: "TILLETT", model: "B6 XL 43 SCREAMER", homologationStart: "09.2017", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.376.17", manufacturer: "TILLETT", model: "B6 SCREAMER", homologationStart: "09.2017", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.377.17", manufacturer: "TILLETT", model: "B6 40 SCREAMER", homologationStart: "09.2017", homologationEnd: "09.2022", validUntil: "2027" },
  { number: "CS.378.17", manufacturer: "SPARCO", model: "QRT-V", homologationStart: "10.2017", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.379.17", manufacturer: "TRP CO., LTD.", model: "RST-600", homologationStart: "10.2017", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.380.17", manufacturer: "KOBRA", model: "GOLEM", homologationStart: "10.2017", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.381.17", manufacturer: "MOMO", model: "DAYTONA XXL", homologationStart: "10.2017", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.382.17", manufacturer: "MOMO", model: "LESMO ONE XXL", homologationStart: "10.2017", homologationEnd: "10.2022", validUntil: "2027" },
  { number: "CS.383.17", manufacturer: "CORBEAU", model: "SPRINT X", homologationStart: "11.2017", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.384.17", manufacturer: "CORBEAU", model: "RXC", homologationStart: "11.2017", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.385.17", manufacturer: "CORBEAU", model: "REVOLUTION X", homologationStart: "11.2017", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.386.17", manufacturer: "KOBRA", model: "ZORWAK", homologationStart: "11.2017", homologationEnd: "11.2022", validUntil: "2027" },
  { number: "CS.387.17", manufacturer: "SABELT", model: "RACER DUO", homologationStart: "11.2017", homologationEnd: "11.2022", validUntil: "2027" },
  { number: "CS.388.17", manufacturer: "BIMARCO", model: "DAKAR 2", homologationStart: "12.2017", homologationEnd: "12.2022", validUntil: "2027" },
  { number: "CS.389.17", manufacturer: "BIMARCO", model: "GRIP 2", homologationStart: "12.2017", homologationEnd: "12.2022", validUntil: "2027" },
  { number: "CS.390.18", manufacturer: "REVERIE", model: "9m RS", homologationStart: "01.2018", homologationEnd: "01.2023", validUntil: "2028" },
  { number: "CS.391.18", manufacturer: "SABELT", model: "GT-PAD", homologationStart: "01.2018", homologationEnd: "01.2028", validUntil: "2033" },
  { number: "CS.392.18", manufacturer: "RECARO", model: "RMS 2600A", homologationStart: "02.2018", homologationEnd: "02.2028", validUntil: "2033" },
  { number: "CS.393.18", manufacturer: "RECARO", model: "RMS 2700G", homologationStart: "02.2018", homologationEnd: "02.2023", validUntil: "2028" },
  { number: "CS.394.18", manufacturer: "HRX", model: "RACER XL", homologationStart: "03.2018", homologationEnd: "03.2023", validUntil: "2028" },
  { number: "CS.395.18", manufacturer: "TANIDA", model: "JURAN GTX100", homologationStart: "04.2018", homologationEnd: "04.2028", validUntil: "2033" },
  { number: "CS.396.18", manufacturer: "TANIDA", model: "JURAN GTX600", homologationStart: "04.2018", homologationEnd: "04.2023", validUntil: "2028" },
  { number: "CS.397.18", manufacturer: "SPARCO", model: "QRT-R", homologationStart: "04.2018", homologationEnd: "04.2028", validUntil: "2033" },
  { number: "CS.398.18", manufacturer: "TILLETT", model: "B7 XL", homologationStart: "05.2018", homologationEnd: "05.2023", validUntil: "2028" },
  { number: "CS.399.18", manufacturer: "KOBRA", model: "MT 003", homologationStart: "06.2018", homologationEnd: "06.2023", validUntil: "2028" },
  { number: "CS.400.18", manufacturer: "SABELT", model: "TAURUS M sl", homologationStart: "06.2018", homologationEnd: "06.2023", validUntil: "2028" },
  { number: "CS.401.18", manufacturer: "SABELT", model: "TAURUS L sl", homologationStart: "07.2018", homologationEnd: "07.2023", validUntil: "2028" },
  { number: "CS.402.18", manufacturer: "RACETECH", model: "RT4119WHR", homologationStart: "07.2018", homologationEnd: "07.2028", validUntil: "2033" },
  { number: "CS.403.18", manufacturer: "BRAUM", model: "FALCON X", homologationStart: "07.2018", homologationEnd: "07.2023", validUntil: "2028" },
  { number: "CS.404.18", manufacturer: "BRIDE", model: "FZ670", homologationStart: "10.2018", homologationEnd: "10.2023", validUntil: "2028" },
  { number: "CS.405.18", manufacturer: "BRIDE", model: "FZ910", homologationStart: "10.2018", homologationEnd: "10.2023", validUntil: "2028" },
  { number: "CS.406.18", manufacturer: "MIRCO", model: "RS7", homologationStart: "10.2018", homologationEnd: "10.2028", validUntil: "2033" },
  { number: "CS.407.18", manufacturer: "SPARCO", model: "GRID Q", homologationStart: "11.2018", homologationEnd: "11.2028", validUntil: "2033" },
  { number: "CS.408.18", manufacturer: "SPARCO", model: "Circuit ii qrt", homologationStart: "11.2018", homologationEnd: "11.2028", validUntil: "2033" },
  { number: "CS.409.18", manufacturer: "SPARCO", model: "CIRCUIT QRT", homologationStart: "11.2018", homologationEnd: "11.2023", validUntil: "2028" },
  { number: "CS.410.18", manufacturer: "OMP", model: "TRS X", homologationStart: "12.2018", homologationEnd: "12.2028", validUntil: "2033" },
  { number: "CS.411.18", manufacturer: "SPARCO", model: "EVO II QRT", homologationStart: "12.2018", homologationEnd: "12.2023", validUntil: "2028" },
  { number: "CS.412.19", manufacturer: "BRIDE", model: "H01A", homologationStart: "01.2019", homologationEnd: "01.2029", validUntil: "2034" },
  { number: "CS.413.19", manufacturer: "BRIDE", model: "H02A", homologationStart: "01.2019", homologationEnd: "01.2029", validUntil: "2034" },
  { number: "CS.414.19", manufacturer: "BRIDE", model: "HZ010", homologationStart: "01.2019", homologationEnd: "01.2029", validUntil: "2034" },
  { number: "CS.415.19", manufacturer: "BRIDE", model: "HZ020", homologationStart: "01.2019", homologationEnd: "01.2029", validUntil: "2034" },
  { number: "CS.416.19", manufacturer: "SPARCO", model: "QRT-C", homologationStart: "01.2019", homologationEnd: "01.2024", validUntil: "2029" },
  { number: "CS.417.19", manufacturer: "SABELT", model: "TAURUS XL sl", homologationStart: "02.2019", homologationEnd: "02.2024", validUntil: "2029" },
  { number: "CS.418.19", manufacturer: "SABELT", model: "X-PAD CARBON", homologationStart: "02.2019", homologationEnd: "02.2029", validUntil: "2034" },
  { number: "CS.419.19", manufacturer: "SABELT", model: "X-PAD", homologationStart: "03.2019", homologationEnd: "03.2029", validUntil: "2034" },
  { number: "CS.420.19", manufacturer: "TRP CO., LTD.", model: "RST-700", homologationStart: "04.2019", homologationEnd: "04.2029", validUntil: "2034" },
  { number: "CS.421.19", manufacturer: "RACETECH", model: "RT4100HR", homologationStart: "04.2019", homologationEnd: "04.2029", validUntil: "2034" },
  { number: "CS.422.19", manufacturer: "RACETECH", model: "RT4100WTHR", homologationStart: "04.2019", homologationEnd: "04.2029", validUntil: "2034" },
  { number: "CS.423.19", manufacturer: "SPARCO", model: "EVO S QRT or REV QRT", homologationStart: "06.2019", homologationEnd: "06.2029", validUntil: "2034" },
  { number: "CS.424.19", manufacturer: "SPARCO", model: "PRO 2000 QRT", homologationStart: "06.2019", homologationEnd: "06.2029", validUntil: "2034" },
  { number: "CS.425.19", manufacturer: "SPARCO", model: "PILOT QRT", homologationStart: "06.2019", homologationEnd: "06.2024", validUntil: "2029" },
  { number: "CS.426.19", manufacturer: "RACETECH", model: "RT4100", homologationStart: "07.2019", homologationEnd: "07.2029", validUntil: "2034" },
  { number: "CS.427.19", manufacturer: "BRIDE", model: "HZ030", homologationStart: "07.2019", homologationEnd: "07.2029", validUntil: "2034" },
  { number: "CS.428.19", manufacturer: "BRIDE", model: "H03A", homologationStart: "07.2019", homologationEnd: "07.2029", validUntil: "2034" },
  { number: "CS.429.19", manufacturer: "TRP CO., LTD.", model: "RST-800", homologationStart: "08.2019", homologationEnd: "08.2029", validUntil: "2034" },
  { number: "CS.430.19", manufacturer: "TRP CO., LTD.", model: "RST-900", homologationStart: "08.2019", homologationEnd: "08.2029", validUntil: "2034" },
  { number: "CS.431.19", manufacturer: "SPARCO", model: "CIRCUIT QRT 20", homologationStart: "08.2019", homologationEnd: "08.2029", validUntil: "2034" },
  { number: "CS.432.19", manufacturer: "SPARCO", model: "EVO L QRT", homologationStart: "08.2019", homologationEnd: "08.2029", validUntil: "2034" },
  { number: "CS.433.19", manufacturer: "SPARCO", model: "EVO XL QRT", homologationStart: "08.2019", homologationEnd: "08.2029", validUntil: "2034" },
  { number: "CS.434.19", manufacturer: "SPARCO", model: "PRO ADV QRT", homologationStart: "09.2019", homologationEnd: "09.2029", validUntil: "2034" },
  { number: "CS.435.19", manufacturer: "RACETECH", model: "RT9119HRW", homologationStart: "10.2019", homologationEnd: "10.2029", validUntil: "2034" },
  { number: "CS.436.19", manufacturer: "RACETECH", model: "RT4100WT", homologationStart: "10.2019", homologationEnd: "10.2029", validUntil: "2034" },
  { number: "CS.437.19", manufacturer: "SPARCO", model: "QRT C 20", homologationStart: "10.2019", homologationEnd: "10.2029", validUntil: "2034" },
  { number: "CS.438.19", manufacturer: "SPARCO", model: "PRO ADV GT", homologationStart: "11.2019", homologationEnd: "11.2024", validUntil: "2029" },
  { number: "CS.439.19", manufacturer: "GP-RACE", model: "R3", homologationStart: "12.2019", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.440.19", manufacturer: "OMP", model: "HTE EVO VTR", homologationStart: "12.2019", homologationEnd: "12.2029", validUntil: "2034" },
  { number: "CS.441.19", manufacturer: "COBRA", model: "SEBRING T LP STD", homologationStart: "12.2019", homologationEnd: "12.2024", validUntil: "2029" },
  { number: "CS.442.19", manufacturer: "COBRA", model: "SEBRING T LP GT", homologationStart: "12.2019", homologationEnd: "12.2024", validUntil: "2029" },
  { number: "CS.443.20", manufacturer: "BRIDE", model: "BRIDE HBZ10", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.444.20", manufacturer: "BRIDE", model: "BRIDE HB1A", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.445.20", manufacturer: "BRIDE", model: "BRIDE HCZ10", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.446.20", manufacturer: "BRIDE", model: "BRIDE HBZ20", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.447.20", manufacturer: "BRIDE", model: "BRIDE HB2A", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.448.20", manufacturer: "BRIDE", model: "BRIDE HC1A", homologationStart: "01.2020", homologationEnd: "01.2025", validUntil: "2030" },
  { number: "CS.449.20", manufacturer: "BRIDE", model: "BRIDE HA1A", homologationStart: "01.2020", homologationEnd: "01.2030", validUntil: "2035" },
  { number: "CS.450.20", manufacturer: "BRIDE", model: "BRIDE HAZ10", homologationStart: "01.2020", homologationEnd: "01.2030", validUntil: "2035" },
  { number: "CS.451.20", manufacturer: "ATECH", model: "TARGET XL", homologationStart: "01.2020", homologationEnd: "01.2030", validUntil: "2035" },
  { number: "CS.452.20", manufacturer: "GP-RACE", model: "S7", homologationStart: "02.2020", homologationEnd: "02.2030", validUntil: "2035" },
  { number: "CS.453.20", manufacturer: "GP-RACE", model: "S5", homologationStart: "02.2020", homologationEnd: "02.2030", validUntil: "2035" },
  { number: "CS.454.20", manufacturer: "VROOM", model: "ANTISHOCK III", homologationStart: "02.2020", homologationEnd: "02.2025", validUntil: "2030" },
  { number: "CS.455.20", manufacturer: "OMP", model: "HTE EVO carbon", homologationStart: "04.2020", homologationEnd: "04.2030", validUntil: "2035" },
  { number: "CS.456.20", manufacturer: "RECARO", model: "PODIUM CF", homologationStart: "08.2020", homologationEnd: "08.2025", validUntil: "2030" },
  { number: "CS.457.20", manufacturer: "TRP CO., LTD.", model: "RST-1100", homologationStart: "09.2020", homologationEnd: "09.2030", validUntil: "2035" },
  { number: "CS.458.20", manufacturer: "RECARO", model: "X2679X12001", homologationStart: "10.2020", homologationEnd: "10.2025", validUntil: "2030" },
  { number: "CS.459.20", manufacturer: "SPARCO", model: "LEGEND", homologationStart: "10.2020", homologationEnd: "10.2025", validUntil: "2030" },
  { number: "CS.460.20", manufacturer: "RECARO", model: "PRO RACER SPA", homologationStart: "10.2020", homologationEnd: "11.2025", validUntil: "2030" },
  { number: "CS.461.20", manufacturer: "RECARO", model: "PRO RACER SPA XL", homologationStart: "11.2020", homologationEnd: "11.2030", validUntil: "2035" },
  { number: "CS.462.20", manufacturer: "FLB", model: "RACE-02M", homologationStart: "11.2020", homologationEnd: "11.2030", validUntil: "2035" },
  { number: "CS.463.20", manufacturer: "FLB", model: "PRO-02m", homologationStart: "11.2020", homologationEnd: "11.2030", validUntil: "2035" },
  { number: "CS.464.20", manufacturer: "FLB", model: "CLUB EVO", homologationStart: "11.2020", homologationEnd: "11.2030", validUntil: "2035" },
  { number: "CS.465.20", manufacturer: "SPARCO", model: "QRT K", homologationStart: "12.2020", homologationEnd: "12.2030", validUntil: "2035" },
  { number: "CS.466.21", manufacturer: "FLB", model: "RACE-02L", homologationStart: "01.2021", homologationEnd: "01.2031", validUntil: "2036" },
  { number: "CS.467.21", manufacturer: "SPARCO", model: "CIRCUIT QRT m12", homologationStart: "01.2021", homologationEnd: "01.2026", validUntil: "2031" },
  { number: "CS.468.21", manufacturer: "RECARO", model: "PRO RACER XL-ORV", homologationStart: "01.2021", homologationEnd: "01.2026", validUntil: "2031" },
  { number: "CS.469.21", manufacturer: "THRASH RACING", model: "race spec nu", homologationStart: "06.2021", homologationEnd: "06.2026", validUntil: "2031" },
  { number: "CS.470.21", manufacturer: "INORIZA", model: "puma open", homologationStart: "10.2021", homologationEnd: "10.2026", validUntil: "2031" },
  { number: "CS.471.21", manufacturer: "INORIZA", model: "puma", homologationStart: "11.2021", homologationEnd: "11.2026", validUntil: "2031" },
  { number: "CS.472.21", manufacturer: "BIMARCO", model: "MATRIX", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.473.21", manufacturer: "BIMARCO", model: "HAMER PRO", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.474.21", manufacturer: "BIMARCO", model: "COBRA PRO", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.475.21", manufacturer: "TILLETT", model: "B6-SCREAMER-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.476.21", manufacturer: "TILLETT", model: "B6-40-SCREAMER-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.477.21", manufacturer: "TILLETT", model: "B6-XL-SCREAMER-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.478.21", manufacturer: "TILLETT", model: "B6-XL-43-SCREAMER-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.479.21", manufacturer: "TILLETT", model: "B7-40-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.480.21", manufacturer: "TILLETT", model: "B7-44-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.481.21", manufacturer: "TILLETT", model: "B7-XL-2021", homologationStart: "12.2021", homologationEnd: "12.2026", validUntil: "2031" },
  { number: "CS.482.22", manufacturer: "ATECH", model: "TARGET CARBON", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2032" },
  { number: "CS.483.22", manufacturer: "REITER", model: "RCS002", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2032" },
  { number: "CS.484.22", manufacturer: "REITER", model: "RCS003", homologationStart: "02.2022", homologationEnd: "02.2027", validUntil: "2032" },
  { number: "CS.485.22", manufacturer: "SPARCO", model: "EVO CARBON", homologationStart: "07.2022", homologationEnd: "07.2027", validUntil: "2032" },
  { number: "CS.486.22", manufacturer: "SPARCO", model: "EVO L CARBON", homologationStart: "07.2022", homologationEnd: "07.2027", validUntil: "2032" },
  { number: "CS.487.22", manufacturer: "SPARCO", model: "EVO XL CARBON", homologationStart: "09.2022", homologationEnd: "09.2027", validUntil: "2032" },
  { number: "CS.488.22", manufacturer: "MIRCO", model: "RTX-7", homologationStart: "10.2022", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.489.22", manufacturer: "BIMARCO", model: "PHANToM", homologationStart: "10.2022", homologationEnd: "10.2027", validUntil: "2032" },
  { number: "CS.490.22", manufacturer: "TILLETT", model: "C1-41", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.491.22", manufacturer: "TILLETT", model: "C1-44", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.492.22", manufacturer: "TILLETT", model: "C1 XL-44", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.493.22", manufacturer: "TILLETT", model: "C1 XL-47", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.494.22", manufacturer: "SPARCO", model: "CIRCUIT I CARBON", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.495.22", manufacturer: "SPARCO", model: "CIRCUIT II CARBON", homologationStart: "11.2022", homologationEnd: "11.2027", validUntil: "2032" },
  { number: "CS.496.22", manufacturer: "MIRCO", model: "RTS-2", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.497.22", manufacturer: "MIRCO", model: "CLASSIC", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.498.22", manufacturer: "RECARO", model: "PODIUM GF", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.499.22", manufacturer: "SPARCO", model: "ULTRA", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.500.22", manufacturer: "SPARCO", model: "ULTRA CARBON", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.501.22", manufacturer: "OMP", model: "CW0092", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.502.22", manufacturer: "SPEED", model: "LMT 10044", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.503.22", manufacturer: "RECARO", model: "POLE POSITION", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.504.22", manufacturer: "RECARO", model: "PROFI XL", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.505.22", manufacturer: "OMP", model: "CW0093", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.506.22", manufacturer: "MOTORDRIVE", model: "PRO III", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.507.22", manufacturer: "MOTORDRIVE", model: "PRO IV", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.508.22", manufacturer: "NICK COMPETICION", model: "EVOLUZIONE", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
  { number: "CS.509.22", manufacturer: "RECARO", model: "PRO RACER ORV ULTRA RCF INFUSION", homologationStart: "12.2022", homologationEnd: "12.2027", validUntil: "2032" },
];

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
