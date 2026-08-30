import { EquipmentCategory, FiaTechnicalList } from "../types";
import list74 from "./list-74.json";
import list57 from "./list-57.json";
import list24 from "./list-24.json";
import list16 from "./list-16.json";
import list12 from "./list-12.json";
import list27 from "./list-27.json";

/**
 * Parsed FIA Technical Lists — see fia-lists/README.md for how these are generated
 * (scripts/parse-fia-list.mjs against a cached PDF). Only the lists whose table format has
 * actually been verified against real entries are wired in here; see that script's
 * LIST_CONFIG for ones still pending (29, 40, 91 — messier layouts, not yet trusted).
 *
 * List 24 and List 12 in particular: their tables have extra columns (strap/attachment counts
 * and buckle type for 24; seat-support position and an "S2000" flag for 12) this app doesn't
 * use, which the current parser doesn't cleanly separate from manufacturer/model — so those two
 * display fields are unreliable for these two lists specifically. The safety-relevant fields
 * (homologation number, dates, revoked) are unaffected.
 *
 * List 27 (FIA 8856-2000) is scoped to `categories: ["firesuit"]` — only its Part 1 (numbered
 * overalls/suits) is wired up. Its Part 2 (undergarment/balaclava/sock/shoe manufacturers) and
 * Part 3 (gloves) are "approved manufacturer/model" lists with no homologation number at all,
 * so there's nothing for this app's number-lookup UI to check for those categories under this
 * older standard — see FiaTechnicalList.categories' doc comment.
 */
export const FIA_TECHNICAL_LISTS: FiaTechnicalList[] = [list74, list57, list24, list16, list12, list27] as FiaTechnicalList[];

/**
 * This app's standardId -> the FIA Technical List(s) that are its homologation register. Pass
 * the category too when known (it always is, in practice — see CertificationRow) so a list
 * scoped to specific categories (see FiaTechnicalList.categories) doesn't show up for a category
 * it doesn't actually assign numbers to.
 */
export function fiaListsForStandard(standardId: string, category?: EquipmentCategory): FiaTechnicalList[] {
  return FIA_TECHNICAL_LISTS.filter(
    (l) => l.standardIds.includes(standardId) && (!l.categories || (category !== undefined && l.categories.includes(category)))
  );
}
