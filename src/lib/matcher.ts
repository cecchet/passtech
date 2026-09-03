import { CarBodyStyle, CategoryGroup, CategoryRule, EquipmentCategory, ExtinguisherOption, RequirementLevel, RolloverTubingTier, Ruleset, StandardAcceptance, StandardDef } from "@/data/types";
import { logbookBodyLabel, NOT_LISTED, ROLLOVER_PADDING_STANDARDS, standardFamily, standardLabel } from "@/data/standards";
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

/**
 * The requirement level actually in effect, once the OEM/stock-equipment softening is applied:
 * shoes/seat/belts_harness read as "conditional" rather than a hard "required" whenever the body
 * accepts plain OEM/stock equipment for it — the bar is trivially met by default (an ordinary
 * closed-toe shoe qualifies; cars already ship with an OEM seat and belts fitted), so it shouldn't
 * present as a tech-inspection failure before the driver even says whether they have it. Used both
 * by evaluateCategory (to decide the actual pass/fail) and anywhere else that needs to bucket a
 * category the same way the evaluator will (e.g. the reference-view equipment summary).
 */
export function effectiveRequirementLevel(category: EquipmentCategory, rule: CategoryRule): RequirementLevel {
  return SOFT_MATERIAL_ONLY_CATEGORIES.has(category) && rule.requirement === "required" && rule.materialOnlyAccepted ? "conditional" : rule.requirement;
}

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
  /** Homologation number printed on the tag (e.g. "DC.001.18-O"), for standards backed by an FIA Technical List — see src/lib/fiaHomologation.ts. Purely informational to the matcher; not used in the pass/fail eligibility check itself. */
  homologationNumber?: string;
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
  /** This unit's own photos (overview + label close-ups) — kept per-unit rather than on the shared EquipmentEntry.photoDataUrls, since a gear set can carry several extinguishers and a scrutineer needs to see which photo documents which physical unit. */
  photoDataUrls?: string[];
}

/**
 * Window breaker / seatbelt cutter only: one physical tool carried in the car. No rating or date
 * fields — unlike a fire extinguisher, no body cites a spec for the tool itself, just presence
 * (e.g. ARA requires "one or more" reachable by both driver and co-driver, which in practice often
 * means a separate tool at each seat) — so this exists purely to let each physical tool carry its
 * own photo rather than lumping them into one shared pool.
 */
export interface WindowBreakerUnit {
  key: string;
  photoDataUrls?: string[];
}

/**
 * Emergency triangle only: one physical warning triangle carried in the car. Some bodies (e.g.
 * ARA) require a specific count each meeting a minimum side length — see
 * CategoryRule.emergencyTriangleMinQuantity/emergencyTriangleMinSideLengthIn.
 */
export interface TriangleUnit {
  key: string;
  /** Side length in inches, as measured/printed on the triangle. */
  sideLengthIn?: number;
  photoDataUrls?: string[];
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
  /**
   * Helmet only: whether a visor/face shield is attached, either entered manually or detected
   * from a full helmet photo scan (see HelmetPhotoScan). Informational only — not used in the
   * pass/fail eligibility check, since visor requirements vary by body (some require one, e.g.
   * Lemons/AKRA; some only recommend one, e.g. BMW CCA) and aren't modeled as a structured rule
   * yet — see each body's own free-text notes on the helmet category for its actual requirement.
   */
  hasVisor?: boolean;
  /** Helmet only: free-text detail about the visor (position, condition) from a photo scan. */
  visorNote?: string;
  /** Fire extinguisher only: one entry per physical unit carried in the car. */
  extinguisherUnits?: ExtinguisherUnit[];
  /** Window breaker / seatbelt cutter only: one entry per physical tool carried in the car. */
  windowBreakerUnits?: WindowBreakerUnit[];
  /** Emergency triangle only: one entry per physical triangle carried in the car. */
  triangleUnits?: TriangleUnit[];
  /** Rollover protection only: the car's body style. */
  bodyStyle?: CarBodyStyle;
  /** Rollover protection, convertible only: does the car have OEM/factory-installed rollover protection (integrated hoops)? */
  factoryProtection?: boolean;
  /** Rollover protection only: year the cage was logbooked/built, for bodies that gate acceptance on a cutoff year. */
  cageLogbookYear?: number;
  /** Rollover protection only: is the cage FIA-homologated? Accepted outright by every body that cites Article 253. */
  fiaHomologated?: boolean;
  /** Rollover protection only: rollbar (aka half-cage) vs. a full multi-point cage. */
  cageType?: "rollbar" | "full_cage";
  /** Rollover protection only: are the cage's tube joints bolted/sleeved together, or welded? Most rally bodies no longer accept bolt-together cages. */
  cageMountType?: "bolt_in" | "welded";
  /** Rollover protection only: are the cage's mounting/foot plates bolted to the chassis, or welded? Independent of cageMountType — a cage's joints and its chassis attachment are regulated separately where a body addresses both. */
  cagePlateMountType?: "bolted" | "welded";
  /** Rollover protection only: which body issued the cage's logbook — an id from ROLLOVER_LOGBOOK_BODIES, "none", or NOT_LISTED (paired with cageLogbookBodyCustom). */
  cageLogbookBody?: string;
  /** Rollover protection only: free-text issuer name when cageLogbookBody is NOT_LISTED. */
  cageLogbookBodyCustom?: string;
  /** Seat only: fixed-mounted, or on sliders/rails? Several bodies forbid seat rails outright. */
  seatMounting?: "fixed" | "rails";
  /** Rollover protection only: the car's weight as raced (lbs), for bodies whose tubing spec is tiered by weight. */
  carWeightLbs?: number;
  /** Rollover protection only: the cage's tube outer diameter (inches). */
  cageTubeOuterDiameterIn?: number;
  /** Rollover protection only: the cage's tube wall thickness (inches). */
  cageTubeWallThicknessIn?: number;
  /** Rollover protection only: is high-density padding installed wherever an occupant's helmet/body could contact the cage or roll bar? */
  cagePaddingPresent?: boolean;
  /** Rollover protection only: is padding installed across all tubing forward of and including the main hoop in the roofline, regardless of whether it could actually be contacted? Asked consistently for every body (not just ones that require it) alongside cagePaddingPresent. */
  cageForwardHoopPaddingPresent?: boolean;
  /** Rollover protection only: which certification (if any) the padding carries — an id from ROLLOVER_PADDING_STANDARDS, "none" (plain/uncertified material), or NOT_LISTED (paired with cagePaddingStandardCustom). */
  cagePaddingStandardId?: string;
  /** Rollover protection only: free-text standard name when cagePaddingStandardId is NOT_LISTED. */
  cagePaddingStandardCustom?: string;
  /**
   * Presence-only categories with no other fields (tow rope, first aid kit, kill switch, hood
   * pins, spill kit, parachute) only: the single "I have this item" checkbox. `false` means
   * checked/present; anything else (including undefined) reads as "no data yet". Categories with
   * real fields of their own (certifications, extinguisher/window-breaker/triangle units, tow
   * hook's front/rear pair, rollover protection's dedicated fields) infer presence from those
   * fields instead — see `isEntryEmpty`.
   */
  skipped?: boolean;
  /** Tow hook only: whether a front tow hook/point is present, entered separately from rear since some bodies require both. */
  towHookFront?: boolean;
  /** Tow hook only: whether a rear tow hook/point is present. */
  towHookRear?: boolean;
  /** Garage only: reference photos of the actual physical item (distinct from the tag-scan flow, which reads a photo but doesn't keep it) — up to 3 for most categories, up to 5 for rollover_protection (see EquipmentForm's MAX_ITEM_PHOTOS_BY_CATEGORY). Compressed client-side before storage — see resizeImageToDataUrl. Any of these can also be run back through the tag scanner. */
  photoDataUrls?: string[];
}

export function newCertification(): CertificationEntry {
  return { key: Math.random().toString(36).slice(2) };
}

export function newExtinguisherUnit(): ExtinguisherUnit {
  return { key: Math.random().toString(36).slice(2) };
}

export function newWindowBreakerUnit(): WindowBreakerUnit {
  return { key: Math.random().toString(36).slice(2) };
}

export function newTriangleUnit(): TriangleUnit {
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
  /** Balaclava only: whether the driver has a currently-valid hnr (head-and-neck restraint) entry — see CategoryRule.balaclavaRequiredIfHnrUsed. */
  hnrSatisfied?: boolean;
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

/** Emergency triangle only: satisfied once enough entered triangles each meet the body's minimum side length (when it specifies one). */
function evaluateTriangles(rule: CategoryRule, units: TriangleUnit[], base: Omit<CategoryResult, "status" | "reason">): CategoryResult {
  const minQuantity = rule.emergencyTriangleMinQuantity ?? 1;
  const minSideLengthIn = rule.emergencyTriangleMinSideLengthIn;

  if (units.length === 0) {
    return { ...base, status: "needs_info", reason: `Add at least ${minQuantity === 1 ? "one triangle" : `${minQuantity} triangles`}${minSideLengthIn ? " and its size" : ""}.` };
  }
  if (minSideLengthIn && units.every((u) => u.sideLengthIn === undefined)) {
    return { ...base, status: "needs_info", reason: "Enter each triangle's side length." };
  }

  const qualifying = minSideLengthIn ? units.filter((u) => (u.sideLengthIn ?? 0) >= minSideLengthIn).length : units.length;
  if (qualifying >= minQuantity) {
    const status: ItemStatus = base.requirement === "recommended" ? "recommended_only" : "ok";
    const spec = minSideLengthIn ? ` at least ${minSideLengthIn}" per side` : "";
    return { ...base, status, reason: `Meets the requirement — ${minQuantity === 1 ? "1 triangle" : `${minQuantity} triangles`}${spec}.` };
  }
  const spec = minSideLengthIn ? ` at least ${minSideLengthIn}" per side` : "";
  return {
    ...base,
    status: base.requirement === "recommended" ? "recommended_only" : "rejected",
    reason: `Needs ${minQuantity === 1 ? "1 triangle" : `${minQuantity} triangles`}${spec} — you have ${qualifying} qualifying.`,
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

export function bodyStyleLabel(style: CarBodyStyle): string {
  switch (style) {
    case "closed_roof":
      return "closed-roof";
    case "convertible":
      return "convertible";
    case "open_no_windshield":
      return "open (no windshield frame)";
    case "open_wheel":
      return "open-wheel";
  }
}

/**
 * Rollover protection only. `entry` here is never skipped (evaluateCategory already resolved the
 * skipped/no-entry case before reaching this branch) — "I have this item" just means "some form of
 * rollover protection"; body style and the fields below refine what kind, and whether that kind
 * satisfies this specific body's rule.
 */
/** Rollover protection only: the lightest tier whose `underWeightLbs` the car's weight is still under, or the last (heaviest, "and up") tier if none apply. Tiers are sorted by weight regardless of input order. */
function matchTubingTier(tiers: RolloverTubingTier[], weightLbs: number): RolloverTubingTier {
  const sorted = [...tiers].sort((a, b) => (a.underWeightLbs ?? Infinity) - (b.underWeightLbs ?? Infinity));
  return sorted.find((t) => t.underWeightLbs === undefined || weightLbs < t.underWeightLbs) ?? sorted[sorted.length - 1];
}

/** Seat only: layered on top of an otherwise-passing material/cert result — a seat on sliders/rails doesn't satisfy a body that forbids them outright, however compliant it is otherwise. */
function applySeatMountingCheck(rule: CategoryRule, entry: EquipmentEntry, result: CategoryResult): CategoryResult {
  if (!rule.seatRailsForbidden) return result;
  if (result.status !== "ok" && result.status !== "recommended_only") return result;
  if (!entry.seatMounting) {
    return { ...result, status: "needs_info", reason: `${result.reason} Also confirm the seat is fixed-mounted, not on sliders/rails — this body doesn't allow seat rails.` };
  }
  if (entry.seatMounting === "rails") {
    return { ...result, status: "rejected", reason: "Seat is mounted on sliders/rails — this body doesn't allow seat rails, even with an otherwise-compliant seat." };
  }
  return result;
}

function evaluateRolloverProtection(rule: CategoryRule, entry: EquipmentEntry, base: Omit<CategoryResult, "status" | "reason">): CategoryResult {
  if (!entry.bodyStyle) {
    return {
      ...base,
      status: "needs_info",
      reason: "Specify your car's body style (closed roof, convertible, open with no windshield frame, or open-wheel) to see what's required.",
    };
  }

  const styleRequirement = rule.rolloverProtectionByBodyStyle?.[entry.bodyStyle] ?? rule.requirement;

  if (styleRequirement === "not_addressed") {
    return { ...base, status: "not_required", reason: "Not addressed by this sanctioning body's rules for this discipline." };
  }
  if (styleRequirement !== "required" && styleRequirement !== "conditional") {
    return { ...base, status: "not_required", reason: `Not required for a ${bodyStyleLabel(entry.bodyStyle)} car under this discipline's rules.` };
  }

  if (entry.bodyStyle === "convertible" && rule.rolloverProtectionFactoryExempt) {
    if (entry.factoryProtection === undefined) {
      return {
        ...base,
        status: "needs_info",
        reason: "Does your convertible have OEM/factory-installed rollover protection (integrated hoops)? If so, this body doesn't require anything further.",
      };
    }
    if (entry.factoryProtection) {
      return { ...base, status: "not_required", reason: "Factory-installed rollover protection satisfies this body's requirement — no aftermarket cage/bar needed." };
    }
  }

  const conditionNote = rule.condition ? ` ${rule.condition}` : "";

  if (rule.rolloverProtectionRequiresFullCage) {
    if (!entry.cageType) {
      return {
        ...base,
        status: "needs_info",
        reason: "Is it a rollbar (half-cage) or a full multi-point cage? This body requires a full cage — a rollbar alone isn't accepted.",
      };
    }
    if (entry.cageType === "rollbar") {
      return { ...base, status: "rejected", reason: `A rollbar/half-cage isn't accepted here — this body requires a full multi-point cage.${conditionNote}` };
    }
  }

  if (rule.rolloverProtectionRequiresWelded) {
    if (!entry.cageMountType) {
      return { ...base, status: "needs_info", reason: "Are the cage's tube joints bolted/sleeved together, or welded? This body requires welded joints." };
    }
    if (entry.cageMountType === "bolt_in") {
      return { ...base, status: "rejected", reason: `Bolt-together cages aren't accepted here — this body requires welded joints.${conditionNote}` };
    }
  }

  if (rule.rolloverProtectionRequiresWeldedPlates) {
    if (!entry.cagePlateMountType) {
      return { ...base, status: "needs_info", reason: "Are the cage's mounting/foot plates bolted to the chassis, or welded? This body requires welded plates." };
    }
    if (entry.cagePlateMountType === "bolted") {
      return { ...base, status: "rejected", reason: `Bolted mounting plates aren't accepted here — this body requires the plates to be welded to the chassis.${conditionNote}` };
    }
  }

  if (rule.rolloverProtectionRequiresLogbook && !entry.fiaHomologated) {
    if (!entry.cageLogbookBody) {
      return {
        ...base,
        status: "needs_info",
        reason: "Which body issued your cage's logbook? Select \"No logbook\" if it doesn't have one — logbooks are required here.",
      };
    }
    if (entry.cageLogbookBody === "none") {
      return { ...base, status: "rejected", reason: `A cage logbook is required here — without one, this cage isn't accepted.${conditionNote}` };
    }
    if (entry.cageLogbookBody === NOT_LISTED && !entry.cageLogbookBodyCustom) {
      return { ...base, status: "needs_info", reason: "Which body issued the logbook? Enter its name." };
    }
    if (
      entry.cageLogbookBody !== NOT_LISTED &&
      rule.rolloverProtectionAcceptedLogbookBodies &&
      !rule.rolloverProtectionAcceptedLogbookBodies.includes(entry.cageLogbookBody)
    ) {
      return {
        ...base,
        status: "rejected",
        reason: `${logbookBodyLabel(entry.cageLogbookBody)} isn't a logbook issuer this body recognizes.${conditionNote}`,
      };
    }
  }

  if (rule.rolloverProtectionTubingSpec && rule.rolloverProtectionTubingSpec.length > 0) {
    if (!entry.carWeightLbs || !entry.cageTubeOuterDiameterIn || !entry.cageTubeWallThicknessIn) {
      return {
        ...base,
        status: "needs_info",
        reason: "Enter your car's weight and the cage's tube outer diameter/wall thickness — the minimum tube size required here scales with car weight.",
      };
    }
    const tier = matchTubingTier(rule.rolloverProtectionTubingSpec, entry.carWeightLbs);
    const clears = tier.minSizes.some((s) => entry.cageTubeOuterDiameterIn! >= s.outerDiameterIn && entry.cageTubeWallThicknessIn! >= s.wallThicknessIn);
    if (!clears) {
      const sizes = tier.minSizes.map((s) => `${s.outerDiameterIn}"×${s.wallThicknessIn}"`).join(" or ");
      return {
        ...base,
        status: "rejected",
        reason: `At ${entry.carWeightLbs} lbs, this body requires at least ${sizes} tubing${tier.materialNote ? ` (${tier.materialNote})` : ""} — entered ${entry.cageTubeOuterDiameterIn}"×${entry.cageTubeWallThicknessIn}" is undersized.`,
      };
    }
  }

  if (rule.rolloverProtectionRequiresPadding) {
    if (entry.cagePaddingPresent === undefined) {
      return {
        ...base,
        status: "needs_info",
        reason: "Is high-density padding installed wherever an occupant's helmet or body could contact the cage/roll bar? This body requires it.",
      };
    }
    if (!entry.cagePaddingPresent) {
      return { ...base, status: "rejected", reason: `Padding is required wherever the cage/roll bar could be contacted by an occupant's helmet or body.${conditionNote}` };
    }
  }

  // Asked consistently for every body, not just ones that need it — some (e.g. ARA) require
  // padding across this zone outright, regardless of whether it would actually be contacted, on
  // top of (not instead of) the plain contact-based requirement above.
  if (rule.rolloverProtectionRequiresForwardHoopPadding) {
    if (entry.cageForwardHoopPaddingPresent === undefined) {
      return {
        ...base,
        status: "needs_info",
        reason:
          "Is padding installed across all tubing forward of and including the main hoop in the roofline — regardless of whether it could actually be contacted? This body requires it there either way.",
      };
    }
    if (!entry.cageForwardHoopPaddingPresent) {
      return {
        ...base,
        status: "rejected",
        reason: `Padding is required across all tubing forward of and including the main hoop in the roofline, regardless of contact.${conditionNote}`,
      };
    }
  }

  if (rule.rolloverProtectionPaddingCertRequired && (rule.rolloverProtectionRequiresPadding || rule.rolloverProtectionRequiresForwardHoopPadding)) {
    // A stored id that no longer matches a known standard (e.g. an option this app has since
    // removed from the list) is treated the same as unanswered — it can't silently satisfy a
    // certification requirement just because some value happens to be present.
    const recognizedStandardId =
      entry.cagePaddingStandardId === "none" ||
      entry.cagePaddingStandardId === NOT_LISTED ||
      ROLLOVER_PADDING_STANDARDS.some((s) => s.id === entry.cagePaddingStandardId);
    if (!entry.cagePaddingStandardId || !recognizedStandardId) {
      return {
        ...base,
        status: "needs_info",
        reason: "What certification does the padding carry (e.g. SFI 45.1 or FIA 8857-2001)? This body requires certified padding, not just plain material — select \"Plain/uncertified material\" if it isn't certified.",
      };
    }
    if (entry.cagePaddingStandardId === "none") {
      return {
        ...base,
        status: "rejected",
        reason: `Certified padding (e.g. SFI 45.1 or FIA 8857-2001) is required here — plain/uncertified padding material isn't accepted.${conditionNote}`,
      };
    }
    if (entry.cagePaddingStandardId === NOT_LISTED && !entry.cagePaddingStandardCustom) {
      return { ...base, status: "needs_info", reason: "What certification does the padding carry? Enter its name." };
    }
  }

  if (rule.rolloverProtectionLogbookCutoffYear) {
    if (entry.fiaHomologated) {
      return { ...base, status: "ok", reason: `FIA-homologated cages are accepted — bring the homologation documentation to tech.${conditionNote}` };
    }
    if (!entry.cageLogbookYear) {
      return { ...base, status: "needs_info", reason: "Enter the year your cage was logbooked/built, or confirm it's FIA-homologated." };
    }
    if (entry.cageLogbookYear >= rule.rolloverProtectionLogbookCutoffYear) {
      return { ...base, status: "ok", reason: `Logbooked ${entry.cageLogbookYear} — built to this body's current spec.${conditionNote}` };
    }
    return {
      ...base,
      // Overrides the base "required" so this renders as a conditional pass (amber), not a
      // still-outstanding requirement (red) — a pre-cutoff logbook is a legitimate grandfathered
      // path, not a gap the driver still needs to close.
      requirement: "conditional",
      status: "needs_info",
      reason: `Logbooked ${entry.cageLogbookYear}, before this body's ${rule.rolloverProtectionLogbookCutoffYear} cutoff — grandfathered under the older spec instead of needing a full upgrade.${conditionNote} This app doesn't yet ask about the specific grandfathering elements the older spec requires, so treat this as conditional and confirm them at tech.`,
    };
  }

  return {
    ...base,
    status: "ok",
    reason: `Present — meets this body's rollover-protection requirement for a ${bodyStyleLabel(entry.bodyStyle)} car.${conditionNote}`,
  };
}

/**
 * Whether the entry has no meaningful data entered for this category yet. Replaces the old
 * skipped/"I don't have this item" toggle — there's no separate "explicitly said no" state
 * anymore, so a blank entry and one the user filled in and then fully cleared out both read as
 * "no data" the same way.
 */
export function isEntryEmpty(category: EquipmentCategory, entry: EquipmentEntry | undefined): boolean {
  if (!entry) return true;
  if (category === "fire_extinguisher") return (entry.extinguisherUnits ?? []).length === 0;
  if (category === "window_breaker") return (entry.windowBreakerUnits ?? []).length === 0;
  if (category === "emergency_triangle") return (entry.triangleUnits ?? []).length === 0;
  if (category === "tow_hook") return !entry.towHookFront && !entry.towHookRear;
  if (category === "rollover_protection") return !entry.bodyStyle;
  const meta = CATEGORY_META[category];
  if (meta.presenceOnly) return entry.skipped !== false;
  if (meta.hybrid) {
    if (!entry.mode) return true;
    if (entry.mode === "material_only") return false;
    return (entry.certifications ?? []).length === 0 && (entry.pantsCertifications ?? []).length === 0;
  }
  return (entry.certifications ?? []).length === 0;
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

  const effectiveRequirement = effectiveRequirementLevel(category, rule);

  // Balaclava only: a conditional "required only if you're using an HNR instead of a plain neck
  // collar" rule escalates to a hard requirement once the driver actually has a currently-valid
  // hnr entry — see CategoryRule.balaclavaRequiredIfHnrUsed.
  const balaclavaEscalated = category === "balaclava" && rule.balaclavaRequiredIfHnrUsed === true && context?.hnrSatisfied === true;

  const base = {
    category,
    requirement: balaclavaEscalated ? "required" : effectiveRequirement,
    citation: rule.citation,
    confidence: rule.confidence,
  };

  if (!entry || isEntryEmpty(category, entry)) {
    if (effectiveRequirement === "required") {
      return { ...base, status: "needs_info", reason: "Required — no data entered yet." };
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

  if (category === "emergency_triangle" && (rule.emergencyTriangleMinQuantity || rule.emergencyTriangleMinSideLengthIn)) {
    return evaluateTriangles(rule, entry.triangleUnits ?? [], base);
  }

  if (category === "rollover_protection") {
    return evaluateRolloverProtection(rule, entry, base);
  }

  if (category === "tow_hook" && rule.towHookSidesRequired) {
    const hasFront = entry.towHookFront === true;
    const hasRear = entry.towHookRear === true;
    const need = rule.towHookSidesRequired;
    const satisfied = need === "front" ? hasFront : need === "rear" ? hasRear : hasFront && hasRear;
    if (!satisfied) {
      const needLabel = need === "front" ? "a front tow hook" : need === "rear" ? "a rear tow hook" : "both a front AND a rear tow hook";
      const haveLabel = [hasFront && "front", hasRear && "rear"].filter(Boolean).join(" and ") || "neither";
      return {
        ...base,
        status: base.requirement === "recommended" ? "recommended_only" : "rejected",
        reason: `Needs ${needLabel} — you have ${haveLabel}.`,
      };
    }
    const status: ItemStatus = rule.requirement === "recommended" ? "recommended_only" : "ok";
    return { ...base, status, reason: rule.materialNote ?? "Present." };
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
        const result = { ...base, status, reason: rule.materialNote ?? "Meets the stated material requirement." };
        return category === "seat" ? applySeatMountingCheck(rule, entry, result) : result;
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

  const finalResult = { ...base, status: result.status, reason: result.reason + conditionNote, certBreakdown: result.certBreakdown, resolvedStandardIds: result.validStandardIds };
  return category === "seat" ? applySeatMountingCheck(rule, entry, finalResult) : finalResult;
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

  // HNR next — balaclava's requirement can depend on whether the driver is using a head-and-neck
  // restraint device (vs. a plain neck collar) instead. See CategoryRule.balaclavaRequiredIfHnrUsed.
  const hnrResult = evaluateCategory("hnr", categories.hnr, entries.hnr, asOf);
  if (hnrResult) results.hnr = hnrResult;

  (Object.keys(categories) as EquipmentCategory[]).forEach((category) => {
    if (category === "firesuit" || category === "hnr") return;
    const context: EvaluationContext | undefined =
      category === "undergarment"
        ? { firesuitStandardIds: firesuitResult?.resolvedStandardIds }
        : category === "balaclava"
          ? { hnrSatisfied: hnrResult?.status === "ok" || hnrResult?.status === "recommended_only" }
          : undefined;
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
