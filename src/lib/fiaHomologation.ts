import { FiaHomologationEntry } from "@/data/types";
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

export interface HomologationLookupResult {
  status: HomologationLookupStatus;
  entry?: FiaHomologationEntry;
  listNumber?: number;
  /** Every list checked, e.g. when a standard's number could plausibly appear on more than one list. */
  listsChecked: number[];
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
export function lookupHomologation(standardId: string, rawNumber: string): HomologationLookupResult {
  const lists = fiaListsForStandard(standardId);
  const listsChecked = lists.map((l) => l.listNumber);
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

    if (entry.revoked) {
      return { status: "revoked", entry, listNumber: list.listNumber, listsChecked };
    }
    if (isPastValidUntil(entry)) {
      return { status: "expired", entry, listNumber: list.listNumber, listsChecked };
    }
    if (!entry.homologationStart && !entry.homologationEnd && !entry.validUntil) {
      return { status: "found_unverified_dates", entry, listNumber: list.listNumber, listsChecked };
    }
    return { status: "valid", entry, listNumber: list.listNumber, listsChecked };
  }

  return { status: "not_found", listsChecked };
}
