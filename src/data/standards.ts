import { EquipmentCategory, StandardAcceptance, StandardDef } from "./types";

export const NOT_LISTED = "__not_listed__";

/**
 * Rollover protection only: bodies whose cage logbooks a sanctioning body might recognize. Shared
 * across rally and road racing rulesets — each ruleset's `rolloverProtectionAcceptedLogbookBodies`
 * lists which of these ids it actually accepts, the same way `StandardAcceptance` narrows this
 * registry's STANDARDS list per category. The UI always offers the full list plus "No logbook" and
 * "Not listed / other…" regardless of ruleset — narrowing happens at evaluation time, not display
 * time, consistent with how the certification dropdowns work.
 */
export interface RolloverLogbookBodyDef {
  id: string;
  label: string;
}

export const ROLLOVER_LOGBOOK_BODIES: RolloverLogbookBodyDef[] = [
  { id: "ara", label: "ARA (American Rally Association)" },
  { id: "cars", label: "CARS (Canadian Rally Championship)" },
  { id: "nasa-rallysport", label: "NASA RallySport" },
  { id: "scca-prorally", label: "SCCA ProRally" },
  { id: "rally-america", label: "Rally America (legacy)" },
  { id: "score", label: "SCORE" },
  { id: "scca", label: "SCCA" },
  { id: "nasa", label: "NASA" },
  { id: "fia", label: "FIA" },
];

export function logbookBodyLabel(id: string): string {
  if (id === NOT_LISTED) return "Not listed / other";
  return ROLLOVER_LOGBOOK_BODIES.find((b) => b.id === id)?.label ?? id;
}

const APPAREL: EquipmentCategory[] = ["gloves", "shoes", "socks", "undergarment", "arm_restraint", "balaclava"];

/**
 * Master registry of certification standards a user can select when entering equipment.
 * Acceptance and expiration per sanctioning body live in the body rule files, not here —
 * the same standard can be accepted by one body and rejected/expired by another.
 */
export const STANDARDS: StandardDef[] = [
  // Helmet - Snell
  { id: "snell-sa2025", label: "Snell SA2025", family: "snell", categories: ["helmet"] },
  { id: "snell-sa2020", label: "Snell SA2020", family: "snell", categories: ["helmet"] },
  { id: "snell-sa2015", label: "Snell SA2015", family: "snell", categories: ["helmet"] },
  { id: "snell-sa2010", label: "Snell SA2010", family: "snell", categories: ["helmet"] },
  { id: "snell-sa2005", label: "Snell SA2005", family: "snell", categories: ["helmet"] },
  { id: "snell-sah2010", label: "Snell SAH2010", family: "snell", categories: ["helmet"] },
  { id: "snell-ea2016", label: "Snell EA2016", family: "snell", categories: ["helmet"] },
  { id: "snell-m2025d", label: "Snell M2025D", family: "snell", categories: ["helmet"] },
  { id: "snell-m2025r", label: "Snell M2025R", family: "snell", categories: ["helmet"] },
  { id: "snell-m2020d", label: "Snell M2020D", family: "snell", categories: ["helmet"] },
  { id: "snell-m2020r", label: "Snell M2020R", family: "snell", categories: ["helmet"] },
  { id: "snell-m2015", label: "Snell M2015", family: "snell", categories: ["helmet"] },
  { id: "snell-m2010", label: "Snell M2010", family: "snell", categories: ["helmet"] },
  { id: "snell-m2005", label: "Snell M2005", family: "snell", categories: ["helmet"] },
  { id: "snell-k2025", label: "Snell K2025 (kart)", family: "snell", categories: ["helmet"] },
  { id: "snell-k2020", label: "Snell K2020 (kart)", family: "snell", categories: ["helmet"] },
  { id: "snell-k2015", label: "Snell K2015 (kart)", family: "snell", categories: ["helmet"] },
  { id: "snell-k2010", label: "Snell K2010 (kart)", family: "snell", categories: ["helmet"] },

  // Helmet - SFI
  { id: "sfi-31.1-2020", label: "SFI 31.1/2020", family: "sfi", categories: ["helmet"] },
  { id: "sfi-31.1-2015", label: "SFI 31.1/2015", family: "sfi", categories: ["helmet"] },
  { id: "sfi-31.1-2010", label: "SFI 31.1/2010", family: "sfi", categories: ["helmet"] },
  { id: "sfi-41.1-2020", label: "SFI 41.1/2020", family: "sfi", categories: ["helmet"] },
  { id: "sfi-41.1-2015", label: "SFI 41.1/2015", family: "sfi", categories: ["helmet"] },
  { id: "sfi-41.1-2010", label: "SFI 41.1/2010", family: "sfi", categories: ["helmet"] },
  { id: "sfi-24.1-2020", label: "SFI 24.1/2020", family: "sfi", categories: ["helmet"] },
  { id: "sfi-24.1-2015", label: "SFI 24.1/2015", family: "sfi", categories: ["helmet"] },
  { id: "sfi-24.1-2010", label: "SFI 24.1/2010", family: "sfi", categories: ["helmet"] },
  { id: "sfi-31.1a", label: "SFI 31.1A", family: "sfi", categories: ["helmet"] },
  { id: "sfi-31.2", label: "SFI 31.2", family: "sfi", categories: ["helmet"] },
  { id: "sfi-31.2a", label: "SFI 31.2A", family: "sfi", categories: ["helmet"] },

  // Helmet - British Standard (cited by Pikes Peak)
  { id: "bs-6658-1985", label: "British Standard BS 6658:1985", family: "bs", categories: ["helmet"] },

  // Helmet - FIA
  { id: "fia-8859-2024", label: "FIA 8859-2024", family: "fia", categories: ["helmet"] },
  { id: "fia-8859-2024-abp", label: "FIA 8859-2024-ABP", family: "fia", categories: ["helmet"] },
  { id: "fia-8859-2020", label: "FIA 8859-2020", family: "fia", categories: ["helmet"] },
  { id: "fia-8859-2015", label: "FIA 8859-2015", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2024", label: "FIA 8860-2024", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2024-abp", label: "FIA 8860-2024-ABP", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2018", label: "FIA 8860-2018", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2018-abp", label: "FIA 8860-2018-ABP", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2010", label: "FIA 8860-2010", family: "fia", categories: ["helmet"] },
  { id: "fia-8860-2004", label: "FIA 8860-2004", family: "fia", categories: ["helmet"] },
  {
    id: "fia-8860-2000",
    label: "FIA 8860-2000",
    family: "fia",
    categories: ["helmet"],
  },

  // Helmet - other (CARS RallyCross / UTV allowances)
  { id: "dot-2010plus", label: "DOT (dated 2010 or newer)", family: "dot", categories: ["helmet"] },
  { id: "ece-22.05", label: "ECE 22.05", family: "ece", categories: ["helmet"] },
  { id: "ece-22.06", label: "ECE 22.06", family: "ece", categories: ["helmet"] },
  { id: "astm-f3103-2005plus", label: "ASTM F3103 (2005 or newer)", family: "astm", categories: ["helmet"] },

  // Head & neck restraint
  { id: "fia-8858-2002", label: "FIA 8858-2002", family: "fia", categories: ["hnr"] },
  { id: "fia-8858-2010", label: "FIA 8858-2010", family: "fia", categories: ["hnr"] },
  { id: "sfi-38.1", label: "SFI 38.1", family: "sfi", categories: ["hnr"] },

  // Firesuit
  { id: "fia-8856-2000", label: "FIA 8856-2000", family: "fia", categories: ["firesuit", ...APPAREL] },
  { id: "fia-8856-2018", label: "FIA 8856-2018", family: "fia", categories: ["firesuit", ...APPAREL] },
  { id: "fia-1986", label: "FIA 1986 Standard", family: "fia", categories: ["firesuit"] },
  { id: "sfi-3.2a-1", label: "SFI 3.2A/1 (single layer)", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.2a-3", label: "SFI 3.2A/3", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.2a-5", label: "SFI 3.2A/5", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.2a-10", label: "SFI 3.2A/10", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.2a-15", label: "SFI 3.2A/15", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.2a-20", label: "SFI 3.2A/20", family: "sfi", categories: ["firesuit"] },
  { id: "sfi-3.4-5", label: "SFI 3.4/5 (also seen as 3-4A/5)", family: "sfi", categories: ["firesuit"] },

  // Driver accessories (gloves, shoes, undergarments, arm restraints) - SFI 3.3, all Thermal Protection Performance tiers.
  // No sanctioning body researched cites a specific slash-level for this spec; all are offered so users can match their tag.
  { id: "sfi-3.3-1", label: "SFI 3.3/1", family: "sfi", categories: APPAREL },
  { id: "sfi-3.3-5", label: "SFI 3.3/5", family: "sfi", categories: APPAREL },
  { id: "sfi-3.3-10", label: "SFI 3.3/10", family: "sfi", categories: APPAREL },
  { id: "sfi-3.3-20", label: "SFI 3.3/20", family: "sfi", categories: APPAREL },

  // Seat
  { id: "sfi-39.1", label: "SFI 39.1", family: "sfi", categories: ["seat"] },
  { id: "sfi-39.2", label: "SFI 39.2", family: "sfi", categories: ["seat"] },
  { id: "fia-8855-1999", label: "FIA 8855-1999", family: "fia", categories: ["seat"] },
  { id: "fia-8855-2010", label: "FIA 8855-2010", family: "fia", categories: ["seat"] },
  { id: "fia-8855-2021", label: "FIA 8855-2021", family: "fia", categories: ["seat"] },
  { id: "fia-8862-2009", label: "FIA 8862-2009", family: "fia", categories: ["seat"] },

  // Belts / harnesses
  { id: "sfi-16.1", label: "SFI 16.1", family: "sfi", categories: ["belts_harness"] },
  { id: "sfi-16.5", label: "SFI 16.5", family: "sfi", categories: ["belts_harness"] },
  { id: "sfi-16.6", label: "SFI 16.6", family: "sfi", categories: ["belts_harness"] },
  { id: "fia-8853-2016", label: "FIA 8853-2016", family: "fia", categories: ["belts_harness"] },
  { id: "fia-8853-98", label: "FIA 8853/98", family: "fia", categories: ["belts_harness"] },
  { id: "fia-8854-98", label: "FIA 8854/98", family: "fia", categories: ["belts_harness"] },
  { id: "fia-8853-1985", label: "FIA 8853/1985 (incl. Amendment 1/92)", family: "fia", categories: ["belts_harness"] },

  // Window net
  { id: "sfi-27.1", label: "SFI 27.1", family: "sfi", categories: ["window_net"] },
  { id: "fia-8863-2013", label: "FIA 8863-2013", family: "fia", categories: ["window_net"] },
  { id: "fia-8863-2015", label: "FIA 8863-2015", family: "fia", categories: ["window_net"] },

  // Fuel cell
  { id: "sfi-28.1", label: "SFI 28.1", family: "sfi", categories: ["fuel_cell"] },
  { id: "sfi-28.3", label: "SFI 28.3", family: "sfi", categories: ["fuel_cell"] },
  { id: "fia-ft3-1999", label: "FIA FT3-1999", family: "fia", categories: ["fuel_cell"] },
  { id: "fia-ft3.5-1999", label: "FIA FT3.5-1999", family: "fia", categories: ["fuel_cell"] },
  { id: "fia-ft5-1999", label: "FIA FT5-1999", family: "fia", categories: ["fuel_cell"] },

  // Fire suppression system
  { id: "sfi-17.1", label: "SFI 17.1", family: "sfi", categories: ["fire_suppression"] },
  { id: "sfi-17.2", label: "SFI 17.2", family: "sfi", categories: ["fire_suppression"] },
  { id: "fia-8865-2015", label: "FIA 8865-2015", family: "fia", categories: ["fire_suppression"] },
  { id: "fia-technical-list-16", label: "FIA Technical List #16 (fire extinguishers)", family: "fia", categories: ["fire_suppression"] },
  { id: "fia-technical-list-52", label: "FIA Technical List #52 (fire extinguishing systems)", family: "fia", categories: ["fire_suppression"] },
];

/** Every SFI 3.3 tier — use when a body cites the spec generically without naming a minimum level. */
export const SFI_3_3_IDS = ["sfi-3.3-1", "sfi-3.3-5", "sfi-3.3-10", "sfi-3.3-20"];

/**
 * Standard accepted-list for gloves/shoes/undergarments/arm restraints when a body cites
 * certification generically ("SFI or FIA rated") without naming a specific spec/level.
 */
export const GENERIC_APPAREL_STANDARDS: StandardAcceptance[] = [
  ...SFI_3_3_IDS.map((standardId) => ({ standardId })),
  { standardId: "fia-8856-2000" },
  { standardId: "fia-8856-2018" },
];

/**
 * Standard accepted-list for seats when a body requires certification generically ("current FIA
 * or SFI rated seat") without naming a specific spec/level.
 */
export const GENERIC_SEAT_STANDARDS: StandardAcceptance[] = [
  { standardId: "sfi-39.1" },
  { standardId: "sfi-39.2" },
  { standardId: "fia-8855-1999" },
  { standardId: "fia-8855-2010" },
  { standardId: "fia-8855-2021" },
  { standardId: "fia-8862-2009" },
];

/**
 * Standard accepted-list for fuel cells when a body requires a certified/homologated cell but
 * doesn't name a specific spec/level ("an FIA- or SFI-approved fuel cell") — any registered
 * fuel-cell homologation is treated as acceptable in that case. Only offer this when the body is
 * genuinely non-specific; if it names a particular family or generation, list only those instead.
 */
export const GENERIC_FUEL_CELL_STANDARDS: StandardAcceptance[] = [
  { standardId: "sfi-28.1" },
  { standardId: "sfi-28.3" },
  { standardId: "fia-ft3-1999" },
  { standardId: "fia-ft3.5-1999" },
  { standardId: "fia-ft5-1999" },
];

export function standardsFor(category: EquipmentCategory): StandardDef[] {
  return STANDARDS.filter((s) => s.categories.includes(category));
}

export function standardLabel(id: string): string {
  if (id === NOT_LISTED) return "Not listed / other";
  return STANDARDS.find((s) => s.id === id)?.label ?? id;
}

export function standardFamily(id: string): StandardDef["family"] | undefined {
  return STANDARDS.find((s) => s.id === id)?.family;
}
