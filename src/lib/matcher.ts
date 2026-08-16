import { CategoryRule, EquipmentCategory, Ruleset, StandardAcceptance } from "@/data/types";
import { NOT_LISTED, standardLabel } from "@/data/standards";
import { CATEGORY_META } from "@/data/categoryMeta";

export type ItemStatus = "ok" | "rejected" | "not_required" | "recommended_only" | "needs_info" | "unrecognized";

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
}

export interface EquipmentEntry {
  category: EquipmentCategory;
  /** For hybrid categories (firesuit/gloves/shoes/undergarment/arm_restraint): whether the user is entering plain material or certification(s). */
  mode?: "material_only" | "certified";
  /** Firesuit only: FIA suits are always one-piece; SFI suits can be a separate jacket + pants (not required to match). */
  pieceType?: "one_piece" | "two_piece";
  /** One or more certifications printed on this item (or, for a two-piece firesuit, on the jacket). Item/piece passes if ANY currently-valid certification exists. */
  certifications?: CertificationEntry[];
  /** Two-piece firesuit only: certifications printed on the pants, evaluated independently of the jacket. */
  pantsCertifications?: CertificationEntry[];
  /** Helmet only: whether it has an integrated chin bar (full-face) or not (open-face). */
  helmetType?: "open_face" | "full_face";
  /** User indicates they don't have / aren't entering this item at all. */
  skipped?: boolean;
}

export function newCertification(): CertificationEntry {
  return { key: Math.random().toString(36).slice(2) };
}

interface CertResult {
  status: ItemStatus;
  reason: string;
  label: string;
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
}

function findAcceptance(rule: CategoryRule, standardId?: string): StandardAcceptance | undefined {
  if (!standardId) return undefined;
  return rule.acceptedStandards?.find((a) => a.standardId === standardId);
}

/** Earliest of the cutoffs actually configured for this cert (tag's own expiration, the body's cutoff date, or a label-date-relative cutoff) — whichever binds first. */
function earliestUpcomingCutoff(cert: CertificationEntry, acceptance: StandardAcceptance): Date | undefined {
  const candidates: Date[] = [];
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

function evaluateSingleCert(rule: CategoryRule, cert: CertificationEntry, asOf: Date): CertResult {
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
    };
  }

  if (cert.tagExpirationDate) {
    const tagExp = new Date(cert.tagExpirationDate);
    if (asOf > tagExp) {
      return { status: "rejected", reason: `${label}'s printed expiration date (${cert.tagExpirationDate}) has passed.`, label };
    }
  }

  if (acceptance.expiresOn) {
    const cutoff = new Date(acceptance.expiresOn);
    if (asOf > cutoff) {
      return { status: "rejected", reason: `${label} is no longer accepted by this discipline after ${acceptance.expiresOn}.`, label };
    }
  }

  if (acceptance.validityYearsFromLabel) {
    if (!cert.labelDate) {
      return {
        status: "needs_info",
        reason: `${label} requires a label/conformance date less than ${acceptance.validityYearsFromLabel} years old — enter the date on the tag.`,
        label,
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
      };
    }
  }

  const acceptanceNote = acceptance.note ? ` (${acceptance.note})` : "";
  const status: ItemStatus = rule.requirement === "recommended" ? "recommended_only" : "ok";
  const cutoff = earliestUpcomingCutoff(cert, acceptance);
  const expiryWarning =
    cutoff && cutoff.getFullYear() === asOf.getFullYear()
      ? ` ⚠️ This equipment will expire on ${cutoff.toISOString().slice(0, 10)}.`
      : "";
  return { status, reason: `${label} is accepted.${acceptanceNote}${expiryWarning}`, label };
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
}

/** Evaluates one physical piece's certifications: the piece passes if ANY currently-valid certification exists on it. */
function evaluatePieceCerts(rule: CategoryRule, certs: CertificationEntry[], asOf: Date): PieceEvaluation {
  if (certs.length === 0) {
    return { status: "needs_info", reason: "Add at least one certification shown on the tag." };
  }
  const results = certs.map((c) => evaluateSingleCert(rule, c, asOf));
  const best = results.reduce((a, b) => (STATUS_RANK[a.status] <= STATUS_RANK[b.status] ? a : b));
  return { status: best.status, reason: best.reason, certBreakdown: results.length > 1 ? results : undefined };
}

export function evaluateCategory(
  category: EquipmentCategory,
  rule: CategoryRule | undefined,
  entry: EquipmentEntry | undefined,
  asOf: Date = new Date()
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

  // Shoes satisfiable with plain non-flammable material (no certification needed) are a much
  // softer bar than a certified item — treat them as conditional rather than a hard "required"
  // failure when nothing's been entered yet, since any ordinary closed-toe shoe qualifies.
  const effectiveRequirement =
    category === "shoes" && rule.requirement === "required" && rule.materialOnlyAccepted ? "conditional" : rule.requirement;

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
      const reason =
        rule.requirement === "conditional"
          ? `Conditionally required — ${rule.condition ?? "check the condition against your setup"}. Nothing entered yet.`
          : "Any closed-toe, non-flammable/fire-resistant shoes qualify — no certification required. Not specified yet.";
      return { ...base, status: "needs_info", reason };
    }
    return { ...base, status: "not_required", reason: "Recommended, not required — nothing entered." };
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
    const jacket = evaluatePieceCerts(rule, entry.certifications ?? [], asOf);
    const pants = evaluatePieceCerts(rule, entry.pantsCertifications ?? [], asOf);
    const worst = STATUS_RANK[jacket.status] >= STATUS_RANK[pants.status] ? jacket : pants;
    return {
      ...base,
      status: worst.status,
      reason: `Jacket: ${jacket.reason} Pants: ${pants.reason}${conditionNote}`,
      pieceBreakdown: [
        { label: "Jacket", status: jacket.status, reason: jacket.reason },
        { label: "Pants", status: pants.status, reason: pants.reason },
      ],
    };
  }

  // Standard-based: pure categories (helmet, HNR) always, hybrid categories in "certified" mode.
  const certs = entry.certifications ?? [];
  const result = evaluatePieceCerts(rule, certs, asOf);

  if (category === "helmet" && rule.fullFaceRequirement) {
    const faceNote = rule.fullFaceCondition ? ` ${rule.fullFaceCondition}` : "";

    if (rule.fullFaceRequirement === "required" && entry.helmetType === "open_face") {
      return {
        ...base,
        status: "rejected",
        reason: `Open-face helmets aren't permitted — this discipline requires a full-face (integrated chin bar) helmet.${faceNote}`,
        certBreakdown: result.certBreakdown,
      };
    }

    if (rule.fullFaceRequirement === "required" && !entry.helmetType) {
      const status: ItemStatus = STATUS_RANK[result.status] >= STATUS_RANK.needs_info ? result.status : "needs_info";
      return {
        ...base,
        status,
        reason: `${result.reason}${conditionNote} Also specify whether your helmet is full-face or open-face — this discipline requires full-face.${faceNote}`,
        certBreakdown: result.certBreakdown,
      };
    }

    return { ...base, status: result.status, reason: result.reason + conditionNote + faceNote, certBreakdown: result.certBreakdown };
  }

  return { ...base, status: result.status, reason: result.reason + conditionNote, certBreakdown: result.certBreakdown };
}

export type CategoryResults = Partial<Record<EquipmentCategory, CategoryResult>>;

export function evaluateRuleset(ruleset: Ruleset, entries: Partial<Record<EquipmentCategory, EquipmentEntry>>, asOf: Date = new Date()): CategoryResults {
  const results: CategoryResults = {};
  (Object.keys(ruleset.categories) as EquipmentCategory[]).forEach((category) => {
    const result = evaluateCategory(category, ruleset.categories[category], entries[category], asOf);
    if (result) results[category] = result;
  });
  return results;
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
