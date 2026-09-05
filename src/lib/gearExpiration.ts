import { getRuleset } from "@/data";
import { CategoryRule, EquipmentCategory } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/data/categoryMeta";
import { standardLabel } from "@/data/standards";
import { CertificationEntry, findAcceptance, getCertificationExpiryStatus } from "@/lib/matcher";
import { GarageProfile, UserPreferences } from "@/lib/garage";

/**
 * "rejected" — no currently-valid certification at all for this body (red, hand icon).
 * "accepted_with_warning" — the item's one certification is expired but this body still accepts it
 * anyway (see CertExpiryInfo.enforced) — yellow triangle, past tense.
 * "partial_expired" — one of several certifications has expired (or is rejected outright), but the
 * item still passes this body via another one — yellow triangle, names which certification expired.
 * "expiring_soon" — nothing has expired yet, but something will within the current calendar year.
 */
export type GearExpirySeverity = "rejected" | "accepted_with_warning" | "partial_expired" | "expiring_soon";

export interface GearExpiryWarning {
  category: EquipmentCategory;
  severity: GearExpirySeverity;
  /** ISO yyyy-mm-dd — the concerning certification's cutoff. */
  date: string;
  /** Only set for "partial_expired": the label of the specific certification that expired. */
  expiredStandardLabel?: string;
  /** Sanctioning body names (deduplicated) this date/severity applies for, sorted alphabetically. */
  bodyNames: string[];
}

const SEVERITY_RANK: Record<GearExpirySeverity, number> = { rejected: 0, accepted_with_warning: 1, partial_expired: 1, expiring_soon: 2 };

/** Every ruleset id the user has explicitly kept checked in a narrowed-down discipline — i.e. "the
 * bodies I actually race with," not every ruleset in a discipline the user simply hasn't bothered
 * to narrow. Deliberately narrower than isRulesetPreferred()'s "unrestricted = everything counts"
 * semantics (used for the Where-can-my-equipment-race filter): a personal expiry reminder should
 * only ever name bodies the driver actually picked, not the other ~40 unconfigured ones. */
function explicitlyPreferredRulesetIds(preferences: UserPreferences): string[] {
  return Object.values(preferences.preferredBodiesByDiscipline ?? {}).flat();
}

interface CertReading {
  cert: CertificationEntry;
  /** Is this specific certification, on its own, currently accepted by this body — i.e. it's on
   * the accepted list AND isn't itself expired-and-rejected right now? An item with several
   * certifications passes as long as ANY one of them reads true here (evaluatePieceCerts' own
   * "passes if ANY currently-valid certification exists" rule) — mirrored here so a warning never
   * claims an item has failed a body that would actually still accept it via a different cert. */
  currentlyValid: boolean;
  expired: boolean;
  expiringSoon: boolean;
  date?: string;
}

function readCert(category: EquipmentCategory, rule: CategoryRule, cert: CertificationEntry): CertReading | undefined {
  if (!findAcceptance(rule, cert.standardId)) return undefined;
  const info = getCertificationExpiryStatus(category, rule, cert, new Date());
  if (!info) return { cert, currentlyValid: true, expired: false, expiringSoon: false };
  if (info.status === "expiring_soon") return { cert, currentlyValid: true, expired: false, expiringSoon: true, date: info.date };
  // status === "expired": still "currently valid" if this body doesn't actually enforce it.
  return { cert, currentlyValid: !info.enforced, expired: true, expiringSoon: false, date: info.date };
}

/** The one expiry concern (if any) worth surfacing for this category, for one ruleset's rule —
 * accounting for whether the item still passes this body overall via a different certification. */
function categoryExpiryForRuleset(
  category: EquipmentCategory,
  rule: CategoryRule,
  certs: CertificationEntry[]
): { severity: GearExpirySeverity; date: string; expiredStandardLabel?: string } | undefined {
  const readings = certs.map((cert) => readCert(category, rule, cert)).filter((r): r is CertReading => !!r);
  if (readings.length === 0) return undefined;

  const anyCurrentlyValid = readings.some((r) => r.currentlyValid);
  const expiringSoon = readings.filter((r) => r.expiringSoon);
  const expired = readings.filter((r) => r.expired);

  if (!anyCurrentlyValid) {
    // Nothing here currently satisfies this body — genuinely rejected (mirrors evaluateSingleCert:
    // every expired reading here is necessarily enforced, or there'd be a currentlyValid one).
    const worst = expired.reduce((a, b) => (a.date! < b.date! ? a : b));
    return { severity: "rejected", date: worst.date! };
  }

  if (expired.length > 0) {
    const worst = expired.reduce((a, b) => (a.date! < b.date! ? a : b));
    if (certs.length > 1) {
      return { severity: "partial_expired", date: worst.date!, expiredStandardLabel: worst.cert.standardId ? standardLabel(worst.cert.standardId) : undefined };
    }
    return { severity: "accepted_with_warning", date: worst.date! };
  }

  if (expiringSoon.length > 0) {
    const soonest = expiringSoon.reduce((a, b) => (a.date! < b.date! ? a : b));
    return { severity: "expiring_soon", date: soonest.date! };
  }

  return undefined;
}

/**
 * Per-gear-set expiry reminders against the user's explicitly preferred sanctioning bodies (My
 * Gear's "My preferred sanctioning bodies" section) — empty until the user has actually narrowed
 * at least one discipline down. Groups by (category, severity, date) so e.g. "Helmet expires on
 * 2027-03-15 with SCCA and NEHA" collapses bodies that agree, while a body with a different grace
 * period or enforcement stance (see CARS/NASA's seat rules) gets its own line.
 */
export function computeGearExpiryWarnings(profile: GarageProfile, preferences: UserPreferences): GearExpiryWarning[] {
  const rulesetIds = explicitlyPreferredRulesetIds(preferences);
  if (rulesetIds.length === 0) return [];
  const rulesets = rulesetIds.map((id) => getRuleset(id)).filter((rs): rs is NonNullable<typeof rs> => !!rs);
  if (rulesets.length === 0) return [];

  const warnings: GearExpiryWarning[] = [];

  for (const category of CATEGORY_ORDER) {
    const entry = profile.entries[category];
    if (!entry) continue;
    const certs = [...(entry.certifications ?? []), ...(entry.pantsCertifications ?? [])];
    if (certs.length === 0) continue;

    const byKey = new Map<string, { severity: GearExpirySeverity; date: string; expiredStandardLabel?: string; bodyNames: Set<string> }>();
    for (const rs of rulesets) {
      const rule = rs.categories[category];
      if (!rule) continue;
      const result = categoryExpiryForRuleset(category, rule, certs);
      if (!result) continue;
      const key = `${result.severity}|${result.date}|${result.expiredStandardLabel ?? ""}`;
      if (!byKey.has(key)) byKey.set(key, { ...result, bodyNames: new Set() });
      byKey.get(key)!.bodyNames.add(rs.bodyName);
    }

    for (const { severity, date, expiredStandardLabel, bodyNames } of byKey.values()) {
      warnings.push({ category, severity, date, expiredStandardLabel, bodyNames: Array.from(bodyNames).sort() });
    }
  }

  warnings.sort((a, b) => (a.severity !== b.severity ? SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] : a.date.localeCompare(b.date)));
  return warnings;
}

function joinBodies(bodyNames: string[]): string {
  return bodyNames.length === 1 ? bodyNames[0] : bodyNames.slice(0, -1).join(", ") + " and " + bodyNames.slice(-1);
}

/**
 * Short summary line for one warning, e.g.:
 * - expiring_soon: "Helmet expires on 2027-03-15 with SCCA and NEHA."
 * - rejected: "Seat expired on 2015-01-01 with CARS (Canadian Rally Championship)."
 * - accepted_with_warning: "Seat expired on 2024-12-31 but is still accepted by ARA and NEHA — check with tech."
 * - partial_expired: "Helmet's Snell SA2015 certification expired on 2025-12-31 with NASA — still accepted via another certification."
 */
export function formatGearExpiryWarning(warning: GearExpiryWarning): string {
  const label = CATEGORY_META[warning.category].label;
  const bodies = joinBodies(warning.bodyNames);
  if (warning.severity === "expiring_soon") return `${label} expires on ${warning.date} with ${bodies}.`;
  if (warning.severity === "accepted_with_warning") return `${label} expired on ${warning.date} but is still accepted by ${bodies} — check with tech.`;
  if (warning.severity === "partial_expired") {
    const which = warning.expiredStandardLabel ? `'s ${warning.expiredStandardLabel} certification` : "'s certification";
    return `${label}${which} expired on ${warning.date} with ${bodies} — still accepted via another certification.`;
  }
  return `${label} expired on ${warning.date} with ${bodies}.`;
}
