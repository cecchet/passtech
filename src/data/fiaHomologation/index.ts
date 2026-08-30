import { FiaTechnicalList } from "../types";
import list74 from "./list-74.json";
import list57 from "./list-57.json";
import list24 from "./list-24.json";
import list16 from "./list-16.json";

/**
 * Parsed FIA Technical Lists — see fia-lists/README.md for how these are generated
 * (scripts/parse-fia-list.mjs against a cached PDF). Only the lists whose table format has
 * actually been verified against real entries are wired in here; see that script's
 * LIST_CONFIG for ones still pending (27, 29, 12, 40, 91 — messier layouts, not yet trusted).
 *
 * List 24 in particular: its table has extra columns (strap count, attachment count, buckle
 * type) this app doesn't use, which the current parser doesn't cleanly separate from
 * manufacturer/model — so those two display fields are unreliable for this list specifically.
 * The safety-relevant fields (homologation number, dates, revoked) are unaffected.
 */
export const FIA_TECHNICAL_LISTS: FiaTechnicalList[] = [list74, list57, list24, list16] as FiaTechnicalList[];

/** This app's standardId -> the FIA Technical List(s) that are its homologation register. */
export function fiaListsForStandard(standardId: string): FiaTechnicalList[] {
  return FIA_TECHNICAL_LISTS.filter((l) => l.standardIds.includes(standardId));
}
