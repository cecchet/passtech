#!/usr/bin/env node
// Exports PassTech's gear catalog for the Digital logbooks app's tech sheet editor
// (../logbook-app/tech-sheets/): every equipment category (label, group, icon, the standards that
// exist for it) and every ruleset's accepted standards per category and class, so a technical
// director building a sheet can pick categories like PassTech's Equipment summary and pre-fill
// what's accepted from the body's known rules.
//
// Usage: npm run export-gear-catalog [-- path/to/logbook-app/tech-sheets]
// Writes gear-catalog.json and gear-icons/<category>.jpg (96 px squares) there.

import { createJiti } from "jiti";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEST = path.resolve(process.argv[2] ?? path.join(ROOT, "..", "logbook-app", "tech-sheets"));
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(ROOT, "src") } });

const { ALL_RULESETS } = await jiti.import(path.join(ROOT, "src/data/index.ts"));
const { CATEGORY_ORDER, CATEGORY_META, GROUP_LABELS, PER_OCCUPANT_CATEGORIES } = await jiti.import(path.join(ROOT, "src/data/categoryMeta.ts"));
const { standardsFor } = await jiti.import(path.join(ROOT, "src/data/standards.ts"));

// Icon files: read from CategoryIcons.tsx (a .tsx with JSX -- parsed, not imported).
const iconSource = readFileSync(path.join(ROOT, "src/components/icons/CategoryIcons.tsx"), "utf8");
const icons = {};
for (const m of iconSource.matchAll(/^\s+(\w+): \{ src: "([^"]+)"[^}]*?(fit: "contain")?[^}]*\}/gm)) icons[m[1]] = { src: m[2], contain: !!m[3] };

mkdirSync(path.join(DEST, "gear-icons"), { recursive: true });
const categories = [];
for (const id of CATEGORY_ORDER) {
  const meta = CATEGORY_META[id];
  const icon = icons[id];
  let iconFile = null;
  if (icon) {
    iconFile = `gear-icons/${id}.jpg`;
    await sharp(path.join(ROOT, "public", icon.src))
      .resize(96, 96, { fit: icon.contain ? "contain" : "cover", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80 })
      .toFile(path.join(DEST, iconFile));
  }
  categories.push({
    id,
    label: meta.label,
    group: meta.group,
    groupLabel: GROUP_LABELS[meta.group],
    perOccupant: PER_OCCUPANT_CATEGORIES.includes(id),
    // Hybrid categories can be met without a certification: what that choice is called on a sheet.
    noCertLabel: meta.hybrid ? meta.materialOnlyLabel ?? "Fire-resistant material (no certification)" : undefined,
    icon: iconFile,
    standards: standardsFor(id).map((s) => ({ id: s.id, label: s.label })),
  });
}

const rule = (r) => {
  if (!r) return undefined;
  const out = { requirement: r.requirement };
  // The rule it comes from: the rulebook's section (e.g. "1.3.9.1-1.3.9.6"), for a sheet's Rule #.
  if (r.citation?.section) out.section = r.citation.section;
  if (r.condition) out.condition = r.condition;
  if (r.materialOnlyAccepted) out.materialOnly = true;
  if (r.materialNote) out.materialNote = r.materialNote;
  if (r.acceptedStandards?.length) {
    out.accepted = r.acceptedStandards.map((a) => {
      const x = { id: a.standardId };
      if (a.expiresOn) x.expiresOn = a.expiresOn;
      if (a.validityYearsFromLabel) x.yearsFromLabel = a.validityYearsFromLabel;
      if (a.note) x.note = a.note;
      return x;
    });
  }
  return out;
};
const rulesets = ALL_RULESETS.map((rs) => ({
  id: rs.id,
  bodyId: rs.bodyId,
  bodyName: rs.bodyName,
  disciplineName: rs.disciplineName,
  categories: Object.fromEntries(Object.entries(rs.categories).map(([k, r]) => [k, rule(r)])),
  classes: (rs.classes ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    overrides: Object.fromEntries(Object.entries(rs.classOverrides?.[c.id] ?? {}).map(([k, r]) => [k, rule(r)])),
  })),
}));

writeFileSync(
  path.join(DEST, "gear-catalog.json"),
  JSON.stringify({ generated: "by PassTech scripts/export-gear-catalog.mjs -- do not edit", categories, rulesets }) + "\n"
);
console.log(`Wrote ${categories.length} categories, ${rulesets.length} rulesets and ${Object.keys(icons).length} icons to ${DEST}`);
