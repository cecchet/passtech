import { EquipmentCategory, FiaHomologationEntry } from "@/data/types";
import { fiaListsForStandard } from "@/data/fiaHomologation";

export type HomologationLookupStatus =
  /** Found, not revoked, and either has no stated expiration or is still within it. */
  | "valid"
  /** Found, but explicitly withdrawn by FIA — not authorized to race regardless of any date on the tag. */
  | "revoked"
  /** Found, but past its own "product valid until" date (when the list states one). */
  | "expired"
  /** Found, but the parsed entry has no date fields to check — can't confirm current validity from this data alone. */
  | "found_unverified_dates"
  /** Not present anywhere in the list(s) backing this standard. */
  | "not_found"
  /** This standard has no FIA Technical List wired up yet (see fiaHomologation/index.ts). */
  | "no_list_for_standard";

/** A technical list, reduced to just what the UI needs to link to it. */
export interface FiaListRef {
  listNumber: number;
  sourceUrl: string;
}

export interface HomologationLookupResult {
  status: HomologationLookupStatus;
  entry?: FiaHomologationEntry;
  listNumber?: number;
  sourceUrl?: string;
  /** Every list checked, e.g. when a standard's number could plausibly appear on more than one list. */
  listsChecked: FiaListRef[];
}

function normalize(number: string): string {
  return number.trim().toUpperCase().replace(/\s+/g, "");
}

/** Best-effort "is this still within its stated validity" check against the current year — the entry's own homologation label is always the authoritative source (see FiaHomologationEntry.validUntil doc comment), this is just a sanity check on the list data itself. */
function isPastValidUntil(entry: FiaHomologationEntry): boolean {
  if (!entry.validUntil) return false;
  const year = parseInt(entry.validUntil, 10);
  if (Number.isNaN(year)) return false;
  return new Date().getFullYear() > year;
}

/**
 * Looks up a homologation number (as entered by the user or read off a tag) against the FIA
 * Technical List(s) backing the given standardId. Presence-only for standards with no list
 * wired up yet — callers should treat "no_list_for_standard" as "can't check this one yet",
 * not as a negative result.
 */
export function lookupHomologation(standardId: string, rawNumber: string, category?: EquipmentCategory): HomologationLookupResult {
  const lists = fiaListsForStandard(standardId, category);
  const listsChecked: FiaListRef[] = lists.map((l) => ({ listNumber: l.listNumber, sourceUrl: l.sourceUrl }));
  if (lists.length === 0) {
    return { status: "no_list_for_standard", listsChecked };
  }

  const target = normalize(rawNumber);
  if (!target) {
    return { status: "not_found", listsChecked };
  }

  for (const list of lists) {
    const entry = list.entries.find((e) => normalize(e.number) === target);
    if (!entry) continue;

    const found = { listNumber: list.listNumber, sourceUrl: list.sourceUrl, entry, listsChecked };
    if (entry.revoked) {
      return { status: "revoked", ...found };
    }
    if (isPastValidUntil(entry)) {
      return { status: "expired", ...found };
    }
    if (!entry.homologationStart && !entry.homologationEnd && !entry.validUntil) {
      return { status: "found_unverified_dates", ...found };
    }
    return { status: "valid", ...found };
  }

  return { status: "not_found", listsChecked };
}
