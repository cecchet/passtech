export type EquipmentCategory =
  | "helmet"
  | "balaclava"
  | "hnr"
  | "firesuit"
  | "gloves"
  | "shoes"
  | "socks"
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
  | "first_aid_kit"
  | "rollover_protection";

/** Top-level section a category is displayed under. */
export type CategoryGroup = "driver" | "car" | "rollcage";

/** Rally only: a car has a driver and, when this occupant is added, a codriver, each with their own personal gear + seat/harness. */
export type Occupant = "driver" | "codriver";

/**
 * Rollover protection only: the four ways rulesets actually draw the line, per the cross-body
 * survey — a plain "convertible vs. not" split is too coarse (SCCA GCR alone distinguishes open
 * cars that retain the windshield frame from those that don't; rally/autocross bodies mostly
 * don't care about that distinction and just ask "removable roof or not").
 */
export type CarBodyStyle = "closed_roof" | "convertible" | "open_no_windshield" | "open_wheel";

/** Rollover protection only: one acceptable (outer diameter, wall thickness) tube size. Bodies commonly allow several equivalent alternates per weight bracket (e.g. a smaller diameter with a thicker wall) — a cage clears the bracket by meeting or exceeding ANY one listed size. */
export interface RolloverTubingSize {
  outerDiameterIn: number;
  wallThicknessIn: number;
}

/** Rollover protection only: one weight bracket's minimum tube spec. List brackets lightest first. */
export interface RolloverTubingTier {
  /** This tier applies to cars under this weight (lbs); omit on the heaviest tier to mean "and up." */
  underWeightLbs?: number;
  /** Acceptable tube sizes for this bracket — see RolloverTubingSize. */
  minSizes: RolloverTubingSize[];
  /** Free-text material note for this bracket (e.g. a required steel grade/alloy). */
  materialNote?: string;
}

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
  /**
   * Rollover protection only: requirement level per car body style, when it isn't uniform (e.g.
   * not required for a closed car but required for an unprotected convertible; a different
   * geometry rule for open-wheel). A style missing from this map falls back to the base
   * `requirement` above. Omit entirely when the body's rule doesn't distinguish by body style.
   */
  rolloverProtectionByBodyStyle?: Partial<Record<CarBodyStyle, RequirementLevel>>;
  /**
   * Rollover protection, convertible only: a convertible with OEM/factory-installed rollover
   * protection (integrated hoops — Boxster, S2000, MINI Cooper, etc.) is treated as satisfying
   * this rule outright, without needing an aftermarket cage/bar.
   */
  rolloverProtectionFactoryExempt?: boolean;
  /**
   * Rollover protection only (rally-style logbook bodies): a cage is accepted "as-is" only if
   * FIA-homologated, or if its logbook/build year is on or after this cutoff (built to the body's
   * current spec). An older logbooked cage isn't rejected outright — it typically needs a
   * retrofit/grandfathering step described in `condition`.
   */
  rolloverProtectionLogbookCutoffYear?: number;
  /**
   * Rollover protection only: this discipline requires the car to have a cage logbook at all — no
   * logbook is an automatic rejection, not just a caveat (typical for rally). Combine with
   * `rolloverProtectionAcceptedLogbookBodies` to also restrict which issuers count.
   */
  rolloverProtectionRequiresLogbook?: boolean;
  /**
   * Rollover protection only: which logbook-issuing bodies (ids into the shared
   * ROLLOVER_LOGBOOK_BODIES registry in standards.ts) this discipline recognizes. Omit to accept
   * any body the driver names — most useful paired with `rolloverProtectionRequiresLogbook`, where
   * a recognized-but-wrong issuer should still fail even though *some* logbook exists.
   */
  rolloverProtectionAcceptedLogbookBodies?: string[];
  /**
   * Rollover protection only: a rollbar/half-cage (fewer attachment points, not a full multi-point
   * structure — typically well under the ~6 chassis attachment points a full cage has) isn't
   * accepted where this body requires a full cage, which is most road racing and stage rally
   * bodies. Omit when the body doesn't distinguish, or a rollbar satisfies its rule (common in
   * autocross/HPDE, where this category is often not required at all for a closed car).
   */
  rolloverProtectionRequiresFullCage?: boolean;
  /**
   * Rollover protection only: a bolt-together cage (bolted/sleeved tube joints) isn't accepted —
   * the cage's joints must be welded. Most rally bodies have moved to this over time; omit when
   * the body doesn't say either way.
   */
  rolloverProtectionRequiresWelded?: boolean;
  /**
   * Rollover protection only: the cage's mounting/foot plates must be welded to the chassis, not
   * bolted — a separate question from `rolloverProtectionRequiresWelded` (tube joints). A cage can
   * have welded joints but still be bolted to the chassis via footplates, or vice versa; most
   * bodies that address this at all only regulate the joints, not the plates, so this is rarer.
   */
  rolloverProtectionRequiresWeldedPlates?: boolean;
  /**
   * Rollover protection only: minimum tube size, tiered by car weight (lightest tier first).
   * Matched against the driver's entered car weight and cage tube dimensions.
   */
  rolloverProtectionTubingSpec?: RolloverTubingTier[];
  /**
   * Seat only: this body forbids seat rails/sliders outright — the seat must be fixed-mounted,
   * regardless of whether it's otherwise a compliant certified/stock seat. Omit when the body
   * doesn't address slider/rail mounts (most don't).
   */
  seatRailsForbidden?: boolean;
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
  /** Rally only: this discipline runs with a codriver who has their own helmet/suit/seat/harness/etc. When true, the UI offers an "Add codriver gear" toggle that duplicates the per-occupant categories (see PER_OCCUPANT_CATEGORIES) into a parallel Codriver Safety Gear section. */
  supportsCodriver?: boolean;
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
