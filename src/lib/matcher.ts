import { CategoryGroup, CategoryRule, EquipmentCategory, ExtinguisherOption, Ruleset, StandardAcceptance, StandardDef } from "@/data/types";
import { NOT_LISTED, standardFamily, standardLabel } from "@/data/standards";
import { CATEGORY_META } from "@/data/categoryMeta";

export type ItemStatus = "ok" | "rejected" | "not_required" | "recommended_only" | "needs_info" | "unrecognized";

/**
 * Hybrid categories whose plain-material/stock option is trivially met by default — a driver
 * almost certainly already has it without needing to buy anything (any ordinary closed-toe shoe;
 * the OEM seat and belts the car shipped with). Softens an unanswered "required" rule to
 * "conditional" so it doesn't read as a hard tech-inspection failure before the driver even says
 * whether they have it. Not applied to every hybrid category — fire-resistant gloves/undergarment/
 * firesuit material, for instance, aren't something a driver has by default the way OEM parts are.
 */
const SOFT_MATERIAL_ONLY_CATEGORIES = new Set<EquipmentCategory>(["shoes", "seat", "belts_harness"]);

/** One certification printed on the item's tag. An item can carry more than one (e.g. a helmet with both a Snell and an FIA sticker) — it only takes one currently-valid certification for the item to pass. */
export interface CertificationEntry {
  /** Stable key for React list rendering / row removal, not semantically meaningful. */
  key: string;
  /** May equal NOT_LISTED for a certification not in our registry. */
  standardId?: string;
  /** Free-text description when standardId === NOT_LISTED, for reporting purposes. */
  customStandardLabel?: string;
  /** Date printed on the tag/label, used for relative validity windows (e.g. HNR <5yrs, helmet <10yrs). */
  labelDate?: string;
  /** Explicit expiration date printed on the tag itself, if any. Always binding when present. */
  tagExpirationDate?: string;
  /** Fire suppression system only: date (month/year) of the next scheduled service, per the system's tag. */
  nextServiceDate?: string;
  /** Fire suppression system only: date (month/year) of the last completed service, if known — informational only, not used in eligibility. */
  lastServiceDate?: string;
}

/** Fire extinguisher only: one physical unit in the car. Rating fields are the numbers printed before each UL class, e.g. "10-B:C" → bcRating 10. */
export interface ExtinguisherUnit {
  key: string;
  bcRating?: number;
  classARating?: number;
  weightLbs?: number;
  /** Date of manufacture printed on the cylinder, if that's what's available. */
  manufactureDate?: string;
  /** Date of certification/inspection/service printed on the cylinder's tag, if separate from manufacture. */
  certificationDate?: string;
  /** Explicit "service due by" date printed on the tag, if any — takes priority over a manufacture/certification-date-based freshness check when present. */
  certificationDueDate?: string;
}

export interface EquipmentEntry {
  category: EquipmentCategory;
  /** For hybrid categories (firesuit/gloves/shoes/undergarment/arm_restraint/belts_harness/fuel_cell): whether the user is entering plain material/stock equipment or certification(s). */
  mode?: "material_only" | "certified";
  /** Firesuit only: FIA suits are always one-piece; SFI suits can be a separate jacket + pants (not required to match). */
  pieceType?: "one_piece" | "two_piece";
  /** One or more certifications printed on this item (or, for a two-piece firesuit, on the jacket). Item/piece passes if ANY currently-valid certification exists. */
  certifications?: CertificationEntry[];
  /** Two-piece firesuit only: certifications printed on the pants, evaluated independently of the jacket. */
  pantsCertifications?: CertificationEntry[];
  /** Helmet only: whether it has an integrated chin bar (full-face) or not (open-face). */
  helmetType?: "open_face" | "full_face";
  /** Fire extinguisher only: one entry per physical unit carried in the car. */
  extinguisherUnits?: ExtinguisherUnit[];
  /** User indicates they don't have / aren't entering this item at all. */
  skipped?: boolean;
}

export function newCertification(): CertificationEntry {
  return { key: Math.random().toString(36).slice(2) };
}

export function newExtinguisherUnit(): ExtinguisherUnit {
  return { key: Math.random().toString(36).slice(2) };
}

interface CertResult {
  status: ItemStatus;
  reason: string;
  label: string;
  /** The registry standardId this cert resolved to, when recognized — used to cross-reference against other categories (e.g. undergarment's dependence on the firesuit's tier). */
  standardId?: string;
}

export interface CategoryResult {
  category: EquipmentCategory;
  status: ItemStatus;
  requirement: CategoryRule["requirement"];
  reason: string;
  citation: CategoryRule["citation"];
  confidence: CategoryRule["confidence"];
  /** Per-certification breakdown, populated whenever more than one certification was entered. */
  certBreakdown?: CertResult[];
  /** Two-piece firesuit only: jacket/pants evaluated independently — both must pass. */
  pieceBreakdown?: { label: string; status: ItemStatus; reason: string }[];
  /** standardIds currently accepted/valid for this item (not rejected/expired) — lets other categories cross-reference this one (e.g. undergarment's dependence on the firesuit's tier). */
  resolvedStandardIds?: string[];
}

function findAcceptance(rule: CategoryRule, standardId?: string): StandardAcceptance | undefined {
  if (!standardId) return undefined;
  return rule.acceptedStandards?.find((a) => a.standardId === standardId);
}

/**
 * FIA/SFI equipment has an inherent age limit even when a sanctioning body's own rules don't spell
 * it out — most bodies just don't restate what's already true of the certification itself. Used
 * only as a fallback when the ruleset's own `StandardAcceptance` entry doesn't already configure
 * its own validityYearsFromLabel/expiresOn/noExpiration; when it applies, an item past this age is
 * flagged with a warning rather than rejected outright, since the body hasn't actually said it
 * enforces this cutoff. See evaluateSingleCert.
 */
function intrinsicValidityYears(category: EquipmentCategory, family: StandardDef["family"]): number | undefined {
  if (category === "seat") return family === "fia" ? 5 : undefined;
  if (category === "belts_harness") return family === "fia" ? 5 : family === "sfi" ? 2 : undefined;
  if (category === "fuel_cell") return family === "fia" || family === "sfi" ? 5 : undefined;
  if (category === "fire_suppression") return family === "fia" || family === "sfi" ? 10 : undefined;
  if (CATEGORY_META[category].group === "driver") return family === "fia" ? 10 : undefined;
  return undefined;
}

/** Earliest of the cutoffs actually configured for this cert (tag's own expiration, the body's cutoff date, a label-date-relative cutoff, or an extra candidate like an intrinsic-default cutoff) — whichever binds first. */
function earliestUpcomingCutoff(cert: CertificationEntry, acceptance: StandardAcceptance, extraCandidate?: Date): Date | undefined {
  const candidates: Date[] = [];
  if (extraCandidate) candidates.push(extraCandidate);
  if (cert.tagExpirationDate) candidates.push(new Date(cert.tagExpirationDate));
  if (acceptance.expiresOn) candidates.push(new Date(acceptance.expiresOn));
  if (acceptance.validityYearsFromLabel && cert.labelDate) {
    const cutoff = new Date(cert.labelDate);
    cutoff.setFullYear(cutoff.getFullYear() + acceptance.validityYearsFromLabel);
    candidates.push(cutoff);
  }
  if (candidates.length === 0) return undefined;
  return candidates.reduce((a, b) => (a < b ? a : b));
}

function evaluateSingleCert(category: EquipmentCategory, rule: CategoryRule, cert: CertificationEntry, asOf: Date): CertResult {
  const label = cert.standardId ? standardLabel(cert.standardId) : "(no standard selected)";

  if (!cert.standardId) {
    return { status: "needs_info", reason: "Select the certification standard shown on the tag.", label };
  }

  if (cert.standardId === NOT_LISTED) {
    const desc = cert.customStandardLabel ? `"${cert.customStandardLabel}"` : "This certification";
    return {
      status: "unrecognized",
      reason: `${desc} isn't in our standards list yet — treated as not accepted until it's verified.`,
      label: cert.customStandardLabel || "Not listed",
    };
  }

  const acceptance = findAcceptance(rule, cert.standardId);
  if (!acceptance) {
    return {
      status: rule.requirement === "recommended" ? "recommended_only" : "rejected",
      reason: `${label} is not on this discipline's accepted list.`,
      label,
      standardId: cert.standardId,
    };
  }

  if (cert.tagExpirationDate) {
    const tagExp = new Date(cert.tagExpirationDate);
    if (asOf > tagExp) {
      return { status: "rejected", reason: `${label}'s printed expiration date (${cert.tagExpirationDate}) has passed.`, label, standardId: cert.standardId };
    }
  }

  if (acceptance.expiresOn) {
    const cutoff = new Date(acceptance.expiresOn);
    if (asOf > cutoff) {
      return {
        status: "rejected",
        reason: `${label} is no longer accepted by this discipline after ${acceptance.expiresOn}.`,
        label,
        standardId: cert.standardId,
      };
    }
  }

  if (acceptance.validityYearsFromLabel) {
    if (!cert.labelDate) {
      return {
        status: "needs_info",
        reason: `${label} requires a label/conformance date less than ${acceptance.validityYearsFromLabel} years old — enter the date on the tag.`,
        label,
        standardId: cert.standardId,
      };
    }
    const labelDate = new Date(cert.labelDate);
    const cutoff = new Date(labelDate);
    cutoff.setFullYear(cutoff.getFullYear() + acceptance.validityYearsFromLabel);
    if (asOf > cutoff) {
      return {
        status: "rejected",
        reason: `${label}'s label is more than ${acceptance.validityYearsFromLabel} years old (dated ${cert.labelDate}).`,
        label,
        standardId: cert.standardId,
      };
    }
  }

  // Fallback age check for FIA/SFI equipment that's intrinsically time-limited even when this
  // body's own rule doesn't say so: flagged as a warning, not a rejection, since the body hasn't
  // actually said it enforces it.
  let intrinsicCutoff: Date | undefined;
  let intrinsicExpiredWarning = "";
  const explicitlyConfigured =
    acceptance.validityYearsFromLabel !== undefined || acceptance.expiresOn !== undefined || acceptance.noExpiration === true;
  if (!explicitlyConfigured && !cert.tagExpirationDate && cert.labelDate) {
    const family = standardFamily(cert.standardId);
    const years = family ? intrinsicValidityYears(category, family) : undefined;
    if (years) {
      const cutoff = new Date(cert.labelDate);
      cutoff.setFullYear(cutoff.getFullYear() + years);
      intrinsicCutoff = cutoff;
      if (asOf > cutoff) {
        const familyLabel = family === "fia" ? "FIA" : "SFI";
        intrinsicExpiredWarning = ` ⚠️ This equipment is expired by ${familyLabel} standards (more than ${years} years since manufacture) but might still be accepted by this sanctioning body.`;
      }
    }
  }

  const acceptanceNote = acceptance.note ? ` (${acceptance.note})` : "";
  const status: ItemStatus = rule.requirement === "recommended" ? "recommended_only" : "ok";
  const cutoff = earliestUpcomingCutoff(cert, acceptance, intrinsicExpiredWarning ? undefined : intrinsicCutoff);
  const expiryWarning =
    cutoff && cutoff.getFullYear() === asOf.getFullYear() && !intrinsicExpiredWarning
      ? ` ⚠️ This equipment will expire on ${cutoff.toISOString().slice(0, 10)}.`
      : "";
  return {
    status,
    reason: `${label} is accepted.${acceptanceNote}${expiryWarning}${intrinsicExpiredWarning}`,
    label,
    standardId: cert.standardId,
  };
}

const STATUS_RANK: Record<ItemStatus, number> = {
  ok: 0,
  recommended_only: 1,
  needs_info: 2,
  unrecognized: 3,
  rejected: 4,
  not_required: 5,
};

interface PieceEvaluation {
  status: ItemStatus;
  reason: string;
  certBreakdown?: CertResult[];
  /** standardIds among this piece's certs that are currently accepted/valid (ok or recommended_only). */
  validStandardIds: string[];
}

/** Evaluates one physical piece's certifications: the piece passes if ANY currently-valid certification exists on it. */
function evaluatePieceCerts(category: EquipmentCategory, rule: CategoryRule, certs: CertificationEntry[], asOf: Date): PieceEvaluation {
  if (certs.length === 0) {
    return { status: "needs_info", reason: "Add at least one certification shown on the tag.", validStandardIds: [] };
  }
  const results = certs.map((c) => evaluateSingleCert(category, rule, c, asOf));
  const best = results.reduce((a, b) => (STATUS_RANK[a.status] <= STATUS_RANK[b.status] ? a : b));
  const validStandardIds = results.filter((r) => r.status === "ok" || r.status === "recommended_only").map((r) => r.standardId!);
  return { status: best.status, reason: best.reason, certBreakdown: results.length > 1 ? results : undefined, validStandardIds };
}

export interface EvaluationContext {
  /** Undergarment only: standardIds currently valid on the driver's entered firesuit, if resolvable. */
  firesuitStandardIds?: string[];
}

/** How recent a manufacture/certification date must be, for options that require a current date, when no explicit due date is printed. */
const FRESH_EXTINGUISHER_YEARS = 2;

function optionLabel(option: ExtinguisherOption): string {
  const specs: string[] = [];
  if (option.minClassARating) specs.push(`${option.minClassARating}-A`);
  if (option.minBcRating) specs.push(`${option.minBcRating}-B:C`);
  if (option.minWeightLbs) specs.push(`${option.minWeightLbs} lb`);
  const spec = specs.length > 0 ? `rated at least ${specs.join(":")}` : "of any rating";
  const freshness = option.requireCurrentDate
    ? `, with a current certification/service date or a manufacture date less than ${FRESH_EXTINGUISHER_YEARS} years old`
    : "";
  return option.quantity === 1 ? `1 extinguisher ${spec}${freshness}` : `${option.quantity} extinguishers ${spec}${freshness} each`;
}

export function describeExtinguisherOptions(options: ExtinguisherOption[]): string {
  return options.map(optionLabel).join(", or ");
}

/** True if the unit's certification/service tag isn't expired, or (absent an explicit due date) its manufacture/certification date is recent enough. */
function unitHasCurrentDate(unit: ExtinguisherUnit, asOf: Date): boolean {
  if (unit.certificationDueDate) return asOf <= new Date(unit.certificationDueDate);
  const anchor = unit.certificationDate ?? unit.manufactureDate;
  if (!anchor) return false;
  const cutoff = new Date(anchor);
  cutoff.setFullYear(cutoff.getFullYear() + FRESH_EXTINGUISHER_YEARS);
  return asOf <= cutoff;
}

function unitMeetsOption(unit: ExtinguisherUnit, option: ExtinguisherOption, asOf: Date): boolean {
  if (option.minBcRating && (unit.bcRating ?? 0) < option.minBcRating) return false;
  if (option.minClassARating && (unit.classARating ?? 0) < option.minClassARating) return false;
  if (option.minWeightLbs && (unit.weightLbs ?? 0) < option.minWeightLbs) return false;
  if (option.requireCurrentDate && !unitHasCurrentDate(unit, asOf)) return false;
  return true;
}

/** Fire extinguisher only: satisfied if the entered units satisfy ANY one of the body's accepted (quantity, minimum rating) combinations. */
function evaluateExtinguishers(
  rule: CategoryRule,
  units: ExtinguisherUnit[],
  base: Omit<CategoryResult, "status" | "reason">,
  asOf: Date
): CategoryResult {
  const options = rule.fireExtinguisherOptions!;

  if (units.length === 0) {
    return { ...base, status: "needs_info", reason: "Add at least one extinguisher and its rating." };
  }
  const unrated = units.every((u) => u.bcRating === undefined && u.classARating === undefined && u.weightLbs === undefined);
  if (unrated) {
    return { ...base, status: "needs_info", reason: "Enter each extinguisher's rating (or weight) shown on its label." };
  }

  const satisfiedOption = options.find((option) => units.filter((u) => unitMeetsOption(u, option, asOf)).length >= option.quantity);
  if (satisfiedOption) {
    const status: ItemStatus = base.requirement === "recommended" ? "recommended_only" : "ok";
    return { ...base, status, reason: `Meets the requirement — ${optionLabel(satisfiedOption)}.` };
  }
  return {
    ...base,
    status: base.requirement === "recommended" ? "recommended_only" : "rejected",
    reason: `Doesn't meet any accepted combination — needs ${describeExtinguisherOptions(options)}.`,
  };
}

/**
 * Fire suppression system only: layered on top of the standard's own cert check. A system whose
 * underlying standard is already accepted can still be flagged (or rejected, if this body requires
 * it) over its next-service date — separate from the standard's own manufacture-date-based
 * intrinsic validity, which evaluateSingleCert already applied.
 */
function applyServiceDateCheck(
  rule: CategoryRule,
  cert: CertificationEntry | undefined,
  asOf: Date,
  result: PieceEvaluation,
  base: Omit<CategoryResult, "status" | "reason">,
  conditionNote: string
): CategoryResult {
  const ok = { ...base, status: result.status, certBreakdown: result.certBreakdown, resolvedStandardIds: result.validStandardIds };

  if (!cert?.nextServiceDate) {
    return { ...ok, reason: result.reason + conditionNote };
  }

  const nextService = new Date(cert.nextServiceDate);
  const expired = asOf > nextService;

  if (expired) {
    if (rule.fireSuppressionRequiresCurrentService) {
      return {
        ...ok,
        status: "rejected",
        reason: `Next service date (${cert.nextServiceDate}) has passed — this sanctioning body requires a current fire suppression service date.${conditionNote}`,
      };
    }
    return {
      ...ok,
      reason: `${result.reason} ⚠️ Next service date (${cert.nextServiceDate}) has passed — some sanctioning bodies require a current service date even if this one doesn't say so explicitly.${conditionNote}`,
    };
  }

  if (nextService.getFullYear() === asOf.getFullYear()) {
    return { ...ok, reason: `${result.reason} ⚠️ Next service due ${cert.nextServiceDate}.${conditionNote}` };
  }

  return { ...ok, reason: result.reason + conditionNote };
}

export function evaluateCategory(
  category: EquipmentCategory,
  rule: CategoryRule | undefined,
  entry: EquipmentEntry | undefined,
  asOf: Date = new Date(),
  context?: EvaluationContext
): CategoryResult | null {
  if (!rule) return null;

  if (rule.requirement === "not_addressed") {
    return {
      category,
      requirement: rule.requirement,
      citation: rule.citation,
      confidence: rule.confidence,
      status: "not_required",
      reason: "Not addressed by this sanctioning body's rules for this discipline.",
    };
  }

  // Categories satisfiable with plain stock/OEM equipment (no certification needed) are a much
  // softer bar than a certified item — treated as conditional rather than a hard "required"
  // failure when nothing's been entered yet, since the bar is trivially met by default: any
  // ordinary closed-toe shoe qualifies, and cars already ship with an OEM seat and belts fitted.
  const effectiveRequirement =
    SOFT_MATERIAL_ONLY_CATEGORIES.has(category) && rule.requirement === "required" && rule.materialOnlyAccepted
      ? "conditional"
      : rule.requirement;

  const base = {
    category,
    requirement: effectiveRequirement,
    citation: rule.citation,
    confidence: rule.confidence,
  };

  if (!entry || entry.skipped) {
    if (effectiveRequirement === "required") {
      return { ...base, status: "needs_info", reason: "Required, but you indicated you don't have this item." };
    }
    if (effectiveRequirement === "conditional") {
      // Undergarment's condition usually hinges on the firesuit's own tier (e.g. only required
      // under a minimum-tier SFI 3.2A/1 suit) — if we already know the driver's firesuit
      // standard and it's not one of the triggering tiers, this resolves automatically instead
      // of sitting as an unresolved "conditional" forever.
      if (category === "undergarment" && rule.undergarmentTriggerStandards && context?.firesuitStandardIds?.length) {
        const suitTriggersRequirement = context.firesuitStandardIds.some((id) => rule.undergarmentTriggerStandards!.includes(id));
        if (!suitTriggersRequirement) {
          return {
            ...base,
            status: "not_required",
            reason: `Not required — your firesuit's certification doesn't fall under the tier that triggers this. ${rule.condition ?? ""}`.trim(),
          };
        }
      }
      const reason =
        rule.requirement === "conditional"
          ? `Conditionally required — ${rule.condition ?? "check the condition against your setup"}. Nothing entered yet.`
          : `${rule.materialNote ?? CATEGORY_META[category].materialOnlyDescription ?? "No certification required for the base requirement."} Not specified yet.`;
      return { ...base, status: "needs_info", reason };
    }
    return { ...base, status: "not_required", reason: "Recommended, not required — nothing entered." };
  }

  if (category === "fire_extinguisher" && rule.fireExtinguisherOptions) {
    return evaluateExtinguishers(rule, entry.extinguisherUnits ?? [], base, asOf);
  }

  if (CATEGORY_META[category].presenceOnly) {
    const status: ItemStatus = rule.requirement === "recommended" ? "recommended_only" : "ok";
    return { ...base, status, reason: rule.materialNote ?? "Present." };
  }

  const hybrid = CATEGORY_META[category].hybrid;

  if (hybrid) {
    if (!entry.mode) {
      return { ...base, status: "needs_info", reason: "Choose whether this item is plain material or carries a certification." };
    }
    if (entry.mode === "material_only") {
      if (rule.materialOnlyAccepted) {
        const status: ItemStatus = rule.requirement === "recommended" ? "recommended_only" : "ok";
        return { ...base, status, reason: rule.materialNote ?? "Meets the stated material requirement." };
      }
      return {
        ...base,
        status: rule.requirement === "recommended" ? "recommended_only" : "rejected",
        reason: "This body requires a certified item (SFI or FIA rated) — plain material without certification doesn't qualify.",
      };
    }
  }

  const conditionNote = rule.condition ? ` Note: ${rule.condition}` : "";

  // Two-piece firesuit (SFI jacket + pants sold/certified separately): both pieces must
  // independently pass — unlike multiple stickers on one item, this is AND, not OR.
  if (category === "firesuit" && entry.pieceType === "two_piece") {
    const jacket = evaluatePieceCerts(category, rule, entry.certifications ?? [], asOf);
    const pants = evaluatePieceCerts(category, rule, entry.pantsCertifications ?? [], asOf);
    const worst = STATUS_RANK[jacket.status] >= STATUS_RANK[pants.status] ? jacket : pants;
    return {
      ...base,
      status: worst.status,
      reason: `Jacket: ${jacket.reason} Pants: ${pants.reason}${conditionNote}`,
      pieceBreakdown: [
        { label: "Jacket", status: jacket.status, reason: jacket.reason },
        { label: "Pants", status: pants.status, reason: pants.reason },
      ],
      resolvedStandardIds: [...jacket.validStandardIds, ...pants.validStandardIds],
    };
  }

  // Standard-based: pure categories (helmet, HNR) always, hybrid categories in "certified" mode.
  const certs = entry.certifications ?? [];
  const result = evaluatePieceCerts(category, rule, certs, asOf);

  if (category === "fire_suppression" && (result.status === "ok" || result.status === "recommended_only")) {
    return applyServiceDateCheck(rule, certs[0], asOf, result, base, conditionNote);
  }

  if (category === "helmet" && rule.fullFaceRequirement) {
    const faceNote = rule.fullFaceCondition ? ` ${rule.fullFaceCondition}` : "";

    if (rule.fullFaceRequirement === "required" && entry.helmetType === "open_face") {
      return {
        ...base,
        status: "rejected",
        reason: `Open-face helmets aren't permitted — this discipline requires a full-face (integrated chin bar) helmet.${faceNote}`,
        certBreakdown: result.certBreakdown,
        resolvedStandardIds: result.validStandardIds,
      };
    }

    if (rule.fullFaceRequirement === "required" && !entry.helmetType) {
      const status: ItemStatus = STATUS_RANK[result.status] >= STATUS_RANK.needs_info ? result.status : "needs_info";
      return {
        ...base,
        status,
        reason: `${result.reason}${conditionNote} Also specify whether your helmet is full-face or open-face — this discipline requires full-face.${faceNote}`,
        certBreakdown: result.certBreakdown,
        resolvedStandardIds: result.validStandardIds,
      };
    }

    return {
      ...base,
      status: result.status,
      reason: result.reason + conditionNote + faceNote,
      certBreakdown: result.certBreakdown,
      resolvedStandardIds: result.validStandardIds,
    };
  }

  return { ...base, status: result.status, reason: result.reason + conditionNote, certBreakdown: result.certBreakdown, resolvedStandardIds: result.validStandardIds };
}

export type CategoryResults = Partial<Record<EquipmentCategory, CategoryResult>>;

/**
 * The rules actually in effect for a ruleset once a class is (or isn't) selected: the base
 * `categories` with any `classOverrides[classId]` entries layered on top, category by category.
 * With no classId (or a class that has no overrides configured), this is just `ruleset.categories`.
 */
export function effectiveCategories(ruleset: Ruleset, classId?: string): Partial<Record<EquipmentCategory, CategoryRule>> {
  const overrides = classId ? ruleset.classOverrides?.[classId] : undefined;
  if (!overrides) return ruleset.categories;
  return { ...ruleset.categories, ...overrides };
}

export function evaluateRuleset(
  ruleset: Ruleset,
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>,
  asOf: Date = new Date(),
  classId?: string
): CategoryResults {
  const categories = effectiveCategories(ruleset, classId);
  const results: CategoryResults = {};
  // Firesuit first — undergarment's condition can depend on the firesuit's resolved tier.
  const firesuitResult = evaluateCategory("firesuit", categories.firesuit, entries.firesuit, asOf);
  if (firesuitResult) results.firesuit = firesuitResult;

  (Object.keys(categories) as EquipmentCategory[]).forEach((category) => {
    if (category === "firesuit") return;
    const context: EvaluationContext | undefined =
      category === "undergarment" ? { firesuitStandardIds: firesuitResult?.resolvedStandardIds } : undefined;
    const result = evaluateCategory(category, categories[category], entries[category], asOf, context);
    if (result) results[category] = result;
  });

  // Interchangeable categories (e.g. arm restraint OR window net): if the driver has a
  // currently-valid entry for either side, the other side's own unresolved/rejected result is
  // superseded — the body's actual requirement (one of the two) is already satisfied.
  (Object.keys(results) as EquipmentCategory[]).forEach((category) => {
    const current = results[category]!;
    if (current.status === "ok" || current.status === "not_required" || current.status === "recommended_only") return;
    const altCategory = categories[category]?.satisfiedByAlternative;
    const altResult = altCategory ? results[altCategory] : undefined;
    if (altResult && (altResult.status === "ok" || altResult.status === "recommended_only")) {
      results[category] = {
        ...current,
        status: "not_required",
        reason: `Not required — satisfied via ${CATEGORY_META[altCategory!].label} instead.`,
      };
    }
  });

  return results;
}

/** Keeps only the results for categories whose group is currently selected (e.g. hides car-gear violations when only Driver Safety Gear is checked). */
export function filterResultsByGroups(results: CategoryResults, activeGroups: ReadonlySet<CategoryGroup>): CategoryResults {
  const filtered: CategoryResults = {};
  (Object.keys(results) as EquipmentCategory[]).forEach((category) => {
    if (activeGroups.has(CATEGORY_META[category].group)) filtered[category] = results[category];
  });
  return filtered;
}

/** A required (or applicable conditional) item that's rejected, unrecognized, or still needs_info while required counts as a real tech-inspection failure. */
export function isViolation(result: Pick<CategoryResult, "status" | "requirement">): boolean {
  if (result.requirement !== "required" && result.requirement !== "conditional") return false;
  if (result.status === "rejected" || result.status === "unrecognized") return true;
  return result.status === "needs_info" && result.requirement === "required";
}

/** A conditional item that simply hasn't been resolved yet — not a violation, just unknown whether it applies. */
export function isPendingConditional(result: Pick<CategoryResult, "status" | "requirement">): boolean {
  return result.requirement === "conditional" && result.status === "needs_info";
}

export type EligibilityStatus = "eligible" | "eligible_conditional" | "not_eligible";

export function overallEligibility(results: CategoryResults): EligibilityStatus {
  const values = Object.values(results) as CategoryResult[];
  if (values.some(isViolation)) return "not_eligible";
  if (values.some(isPendingConditional)) return "eligible_conditional";
  return "eligible";
}
