export type EquipmentCategory =
  | "helmet"
  | "balaclava"
  | "hnr"
  | "firesuit"
  | "gloves"
  | "shoes"
  | "undergarment"
  | "arm_restraint"
  | "seat"
  | "belts_harness"
  | "window_net"
  | "fuel_cell"
  | "fire_extinguisher"
  | "fire_suppression"
  | "window_breaker"
  | "kill_switch"
  | "tow_hook"
  | "tow_rope"
  | "emergency_triangle"
  | "first_aid_kit";

/** Top-level section a category is displayed under. No categories are tagged "rollcage" yet — that's a future phase. */
export type CategoryGroup = "driver" | "car" | "rollcage";

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

/**
 * Fire extinguisher only: one acceptable (quantity, minimum rating) combination — e.g. "one
 * extinguisher rated at least 10 B:C" or "two extinguishers rated at least 5 B:C each". A unit
 * only needs to clear whichever of minBcRating/minClassARating/minWeightLbs are set (a body may
 * spec by UL rating, by weight, or both).
 */
export interface ExtinguisherOption {
  quantity: number;
  /** Minimum UL B:C rating per unit, e.g. 10 for "10-B:C". */
  minBcRating?: number;
  /** Minimum UL Class A rating per unit, e.g. 1 for "1-A:10-B:C". Omit when the body doesn't require Class A coverage. */
  minClassARating?: number;
  /** Minimum weight per unit in lbs, for bodies that spec by weight instead of/alongside a UL rating. */
  minWeightLbs?: number;
  /**
   * Some bodies require either a currently-in-date certification/service tag, or (failing that) a
   * manufacture date less than FRESH_EXTINGUISHER_YEARS old. Omit for bodies that only check the
   * rating, not the date.
   */
  requireCurrentDate?: boolean;
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
  /**
   * Undergarment only: firesuit standardIds that trigger this conditional requirement (typically
   * the minimum-tier suit spec, e.g. SFI 3.2A/1). If the driver's currently-valid firesuit
   * certification is entered and is NOT one of these, the condition doesn't apply — the matcher
   * resolves this to "not required" automatically instead of leaving it pending. Omit when the
   * trigger can't be expressed as specific standard IDs (e.g. it depends on suit layer count).
   */
  undergarmentTriggerStandards?: string[];
  /**
   * Fire extinguisher only: acceptable (quantity, minimum rating) combinations — satisfied if the
   * driver's entered units satisfy ANY one option (e.g. one 10-B:C, or two each 5-B:C). Omit for
   * bodies not yet researched to this level of detail; the category then falls back to a simple
   * presence check regardless of the ratings entered.
   */
  fireExtinguisherOptions?: ExtinguisherOption[];
  /**
   * This category's requirement can also be satisfied by having a valid, currently-accepted entry
   * for the named alternative category instead (e.g. many bodies accept EITHER arm restraints OR a
   * window net, not both — arm_restraint.satisfiedByAlternative = "window_net" and vice versa). Set
   * this symmetrically on both categories' rules when a body frames the two as interchangeable; the
   * matcher resolves whichever one the driver actually has and treats the other as not required.
   */
  satisfiedByAlternative?: EquipmentCategory;
  /**
   * Fire suppression system only: if the body requires the entered system's next-service date to
   * still be current (not passed). When unset, an expired next-service date is a caveat/warning
   * rather than an outright rejection, since most bodies don't check ongoing service currency.
   */
  fireSuppressionRequiresCurrentService?: boolean;
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
  | "Ice Racing"
  | "Endurance Racing"
  | "HPDE / Track Day";

/** One selectable car/competitor class within a ruleset whose rules differ enough from the ruleset's general picture to warrant refining by class (e.g. AMEC's Street Legal vs. Super Modified Closed). */
export interface RulesetClass {
  id: string;
  label: string;
}

export interface Ruleset {
  id: string;
  bodyId: string;
  bodyName: string;
  disciplineName: string;
  /** Which top-level discipline this ruleset is grouped under in the picker (e.g. "Rally", "Hillclimb"). */
  disciplineGroup: DisciplineGroup;
  lastReviewed: string;
  sourceDocuments: SourceDocument[];
  /** Base rules — used as-is when no class is selected, and as the fallback for any category a selected class doesn't override in `classOverrides`. For a ruleset with `classes`, this should still describe the general/multi-class picture (as free text is fine here), since a user who hasn't picked a class yet sees this. */
  categories: Partial<Record<EquipmentCategory, CategoryRule>>;
  /** Optional car/competitor classes within this ruleset. When present, the UI offers a "Class" dropdown after the ruleset itself is chosen, to refine results using `classOverrides`. Omit entirely for rulesets where driver/car equipment doesn't vary by class. */
  classes?: RulesetClass[];
  /** Per-class rule overrides, keyed by the matching `classes[].id`. For a selected class, any category present here replaces the base `categories` entry for both evaluation and the reference view; categories not listed fall back to the base rule. */
  classOverrides?: Partial<Record<string, Partial<Record<EquipmentCategory, CategoryRule>>>>;
}

export interface StandardDef {
  id: string;
  label: string;
  family: "snell" | "sfi" | "fia" | "dot" | "ece" | "astm" | "bs";
  categories: EquipmentCategory[];
}
