import { EquipmentCategory, StandardAcceptance, StandardDef } from "./types";

export const NOT_LISTED = "__not_listed__";

const APPAREL: EquipmentCategory[] = ["gloves", "shoes", "undergarment", "arm_restraint"];

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

export function standardsFor(category: EquipmentCategory): StandardDef[] {
  return STANDARDS.filter((s) => s.categories.includes(category));
}

export function standardLabel(id: string): string {
  if (id === NOT_LISTED) return "Not listed / other";
  return STANDARDS.find((s) => s.id === id)?.label ?? id;
}
