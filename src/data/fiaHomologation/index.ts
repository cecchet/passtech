import { EquipmentCategory, FiaTechnicalList } from "../types";
import list74 from "./list-74.json";
import list57 from "./list-57.json";
import list24 from "./list-24.json";
import list16 from "./list-16.json";
import list12 from "./list-12.json";
import list27 from "./list-27.json";
import list29 from "./list-29.json";
import list40 from "./list-40.json";
import list91 from "./list-91.json";
import list1 from "./list-1.json";
import list69 from "./list-69.json";
import list33 from "./list-33.json";
import list48 from "./list-48.json";
import list49 from "./list-49.json";
import list79 from "./list-79.json";
import list101Firesuit from "./list-101-firesuit.json";
import list101Gloves from "./list-101-gloves.json";
import list101Shoes from "./list-101-shoes.json";
import list107 from "./list-107.json";
import list108 from "./list-108.json";

/**
 * Parsed FIA Technical Lists — see fia-lists/README.md for how these are generated
 * (scripts/parse-fia-list.mjs against a cached PDF). Only the lists whose table format has
 * actually been verified against real entries are wired in here; see that script's
 * LIST_CONFIG for the ones still pending.
 *
 * List 24 (FIA 8853/98 harnesses) is hand-transcribed — same drift bug and era as List 12 below
 * (its table has the same style, just with extra strap/attachment/buckle columns this app
 * doesn't use). B-104.T/98 read as manufacturer "Magnum 4pts" (actually the model) with dates
 * borrowed from a different row. All 55 entries are hand-verified — see LIST_24_MANUAL_ENTRIES.
 *
 * List 57 (FIA 8853-2016 harnesses, the newer harness standard) has the same drift bug too —
 * SH.020.17-T-6 read as manufacturer "T-BAR 2x2" (actually SH.014's model) with model "6"
 * (actually the attachments-count column). All 119 entries are hand-verified — see
 * LIST_57_MANUAL_ENTRIES.
 *
 * List 12 (FIA 8855-1999 seats) is hand-transcribed, like List 91 below — its table drifts the
 * MODEL and DATE columns out of sync with the NUMBER/BRAND columns as pdftotext -layout reads
 * down each page (not a clean, reversible offset; it varies row to row and resets each page
 * break), so the generic parser silently attributed one product's model/dates to a different,
 * nearby number throughout the whole list, not just a messy section. All 599 entries are
 * hand-verified against the rendered pages — see LIST_12_MANUAL_ENTRIES in the parser script.
 *
 * List 16 (FIA 8865-2015 fire extinguisher systems) is hand-transcribed too, for a different
 * reason: many rows have a multi-line MODEL cell (several alternate part numbers stacked
 * together, e.g. one homologation covering six FX G-TEC variants), and the generic parser
 * dropped most of these rows outright rather than misattributing them — it found only 14 of the
 * real 74 entries. All 74 are hand-verified — see LIST_16_MANUAL_ENTRIES. This list has no
 * separate "valid until" column, so `validUntil` is never set for it.
 *
 * List 27 (FIA 8856-2000) is scoped to `categories: ["firesuit"]` — only its Part 1 (numbered
 * overalls/suits) is wired up. Its Part 2 (undergarment/balaclava/sock/shoe manufacturers) and
 * Part 3 (gloves) are "approved manufacturer/model" lists with no homologation number at all,
 * so there's nothing for this app's number-lookup UI to check for those categories under this
 * older standard — see FiaTechnicalList.categories' doc comment. It's also hand-transcribed, like
 * the other older-era lists — the same drift bug, on a list whose columns print as
 * NUMBER/MODEL/MANUFACTURER (the reverse order of every other list here). All 347 entries are
 * hand-verified — see LIST_27_MANUAL_ENTRIES in the parser script.
 *
 * List 29 (FIA 8858-2010) is scoped to `categories: ["hnr"]` — only its Part 1 (numbered FHR
 * devices) is wired up. Its Part 2 (tether systems) and the appended older FIA 8858-2002 section
 * are both non-numbered "approved manufacturer/model" lists, same situation as List 27's Parts
 * 2/3. It's also hand-transcribed, like the lists above — the same drift bug, worsened by "HANS
 * PERFORMANCE PRODUCTS" being a 2-line manufacturer name that pushes rows further out of
 * alignment (FHR.027.11-A read as manufacturer "PRODUCTS", a fragment of a different row's brand
 * name, with model/dates borrowed from FHR.016.10-A entirely). All 83 entries are hand-verified —
 * see LIST_29_MANUAL_ENTRIES. The true count is 83, not the 82 the old parser found. No
 * revocations exist in this list (no WARNING section at all).
 *
 * List 40 (FIA 8862-2009 advanced racing seats) is hand-transcribed, like Lists 12 and 91 — a
 * model name (e.g. AS.002.10's RT4129WTHR) can land on a text line disconnected from its own
 * number and brand entirely, while OTHER numbers on the same page keep model correctly on their
 * own line, with no reliable way to tell which case a given number falls into from the text
 * alone. All 113 entries are hand-verified against the rendered pages — see
 * LIST_40_MANUAL_ENTRIES in the parser script. Brackets were unregulated under this standard
 * (unlike List 91's 8855-2021), so this list carries no approvedBrackets data.
 *
 * List 91 (FIA 8855-2021 competition seats) is hand-transcribed from the rendered PDF pages, not
 * generated by scripts/parse-fia-list.mjs's generic text-based row parser — the parser was tried
 * first, but cross-checking its output against the actual pages (via `pdftoppm`) showed
 * `pdftotext -layout` doesn't reliably keep a homologation number in the same reading-order
 * position as the product row it belongs to (e.g. CS.002.21/CS.003.21 looked like bracket
 * variants of CS.001.21 in the text, but are actually two entirely different seat models). All 33
 * entries are complete and verified against the source images — see fia-lists/README.md and
 * LIST_91_MANUAL_ENTRIES in the parser script. Each entry's `approvedBrackets` lists every
 * bracket FIA homologated together with that specific seat — this is the first seat standard to
 * require that pairing (brackets were unregulated under 8855-1999/List 12 and 8862-2009/List 40).
 *
 * List 1 (fuel cells, FT3-1999/FT3.5-1999/FT5-1999) and List 69 (helmets, FIA 8860-2018) were
 * built from spreadsheet conversions the user made of the source PDFs, not by rendering/reading
 * pages — a cell-by-cell spreadsheet read sidesteps pdftotext's row-drift bug entirely, since
 * there's no line-by-line text reflow to go wrong. See each list's own comment in
 * scripts/parse-fia-list.mjs (LIST_CONFIG[1] / LIST_CONFIG[69]) for format-specific notes: List 1
 * has one revoked entry (FT3-4) whose WARNING notice doesn't state a homologation number, so it's
 * marked revoked by hand; List 69's "-ABP" numbers are scoped to both fia-8860-2018 and
 * fia-8860-2018-abp since this list has no per-entry standard field to distinguish them.
 *
 * Lists 33 (helmets, FIA 8860-2010), 48 (racing nets, FIA 8863-2013), 49 (premium helmets, FIA
 * 8859-2015), 79 (karting high seats, FIA 8873-2018), 101 (karting protective clothing, FIA
 * 8877-2022), 107 (premium helmets, FIA 8859-2024), and 108 (karting helmets, FIA 8878-2024) are
 * all also spreadsheet-built, same reasoning as List 1/69 — see each one's own comment in
 * scripts/parse-fia-list.mjs's LIST_CONFIG for format-specific notes. List 101 is the one
 * structurally novel case: it mixes firesuits, gloves, AND shoes in one FIA list with no
 * distinguishing column between them, so it's split into three separate FiaTechnicalList objects
 * here (list101Firesuit/Gloves/Shoes, all listNumber 101, all standardId fia-8877-2022) rather
 * than one — the homologation number's own suffix letter (`-0`/`-G`/`-Z`) reliably classifies
 * each entry, so no schema change was needed, but this app's category-scoped-list model can't
 * express "one list, three disjoint categories" as a single object the way every other list here
 * is one file. See LIST_CONFIG["101-firesuit"/"101-gloves"/"101-shoes"] for how each is generated.
 */
export const FIA_TECHNICAL_LISTS: FiaTechnicalList[] = [
  list74,
  list57,
  list24,
  list16,
  list12,
  list27,
  list29,
  list40,
  list91,
  list1,
  list69,
  list33,
  list48,
  list49,
  list79,
  list101Firesuit,
  list101Gloves,
  list101Shoes,
  list107,
  list108,
] as FiaTechnicalList[];

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
