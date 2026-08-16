export type EquipmentCategory =
  | "helmet"
  | "hnr"
  | "firesuit"
  | "gloves"
  | "shoes"
  | "undergarment"
  | "arm_restraint";

export type RequirementLevel =
  | "required"
  | "recommended"
  | "conditional"
  | "not_addressed";

export type Confidence = "high" | "medium" | "low";

/** One accepted certification standard for a category, with its own expiration rule. */
export interface StandardAcceptance {
  standardId: string;
  /** Absolute date (ISO) after which the sanctioning body stops accepting this standard generation. */
  expiresOn?: string;
  /** Relative validity window in years, measured from the date printed on the tag/label. */
  validityYearsFromLabel?: number;
  /** Explicitly stated to not expire, provided the item is undamaged/well maintained. */
  noExpiration?: boolean;
  note?: string;
}

export interface SourceDocument {
  title: string;
  version?: string;
  section?: string;
  url?: string;
}

export interface CategoryRule {
  requirement: RequirementLevel;
  /** Free-text condition, used when requirement is 'conditional' or has scope caveats. */
  condition?: string;
  acceptedStandards?: StandardAcceptance[];
  /** For categories (gloves/shoes/undergarment/arm_restraint) that can be satisfied by plain fire-resistant/non-flammable material with no certification. */
  materialOnlyAccepted?: boolean;
  /** Describes the material/condition requirement, shown regardless of whether materialOnlyAccepted or a standard is chosen. */
  materialNote?: string;
  /** Helmet only: whether a full-face (integrated chin bar) helmet specifically is required, separate from the base helmet requirement above. "required" blocks an open-face helmet outright; "conditional" only applies in some cars (see fullFaceCondition) and is shown as a caveat rather than a hard block. */
  fullFaceRequirement?: "required" | "conditional";
  fullFaceCondition?: string;
  citation: SourceDocument;
  confidence: Confidence;
  notes?: string;
}

/** Top-level grouping used to organize the sanctioning-body picker: discipline first, body within it. */
export type DisciplineGroup =
  | "Autocross"
  | "RallyCross"
  | "Rally"
  | "Road Racing"
  | "Hillclimb"
  | "Endurance Racing"
  | "HPDE / Track Day";

export interface Ruleset {
  id: string;
  bodyId: string;
  bodyName: string;
  disciplineName: string;
  /** Which top-level discipline this ruleset is grouped under in the picker (e.g. "Rally", "Hillclimb"). */
  disciplineGroup: DisciplineGroup;
  lastReviewed: string;
  sourceDocuments: SourceDocument[];
  categories: Partial<Record<EquipmentCategory, CategoryRule>>;
}

export interface StandardDef {
  id: string;
  label: string;
  family: "snell" | "sfi" | "fia" | "dot" | "ece" | "astm" | "bs";
  categories: EquipmentCategory[];
}
