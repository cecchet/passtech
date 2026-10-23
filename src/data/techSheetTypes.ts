import { EquipmentCategory } from "./types";
import type { EquipmentEntry } from "@/lib/matcher";

/**
 * Tech sheet templates (format 1) — shared with the Digital logbooks app, see
 * logbook-app/tech-sheets/FORMAT.md. A template describes one sanctioning body's tech inspection
 * form; PassTech lets the competitor pre-fill it (personal gear lines from My gear) and either
 * submit it to an event or export it as a file the scrutineer imports.
 */

export type TechSheetFieldType = "text" | "number" | "date" | "choice" | "multi";

export type TechSheetPrefill =
  | "event"
  | "car_number"
  | "class"
  | "driver"
  | "codriver"
  | "make"
  | "model"
  | "year"
  | "vin"
  | "plate"
  | "logbook_body"
  | "logbook_number";

export interface TechSheetField {
  id: string;
  label: string;
  type: TechSheetFieldType;
  /** choice / multi only. */
  options?: string[];
  /** number only. */
  unit?: string;
  /** Where an app fills it from, when it can. */
  prefill?: TechSheetPrefill;
  required?: boolean;
}

export interface TechSheetItem {
  id: string;
  label: string;
  /** One line for the driver and one for the co-driver (keys "<id>.driver" / "<id>.codriver"). */
  perOccupant?: boolean;
  /** Default "scrutineer". */
  checkedBy?: "scrutineer" | "team";
  /** The PassTech equipment category this line checks — pre-filled from My gear. */
  gear?: EquipmentCategory;
  /** What is accepted, in the scrutineer's words. */
  accepts?: string;
  /** The rule it comes from. */
  rule?: string;
  /** "N/A" is an acceptable result. */
  allowNA?: boolean;
  /** Only on these variants (absent = all). */
  variants?: string[];
  /** Values recorded with the item. */
  fields?: TechSheetField[];
  /** Tick-box list of what was seen. */
  options?: string[];
  /** Gear lines: the PassTech standard ids the sheet accepts (its options are their labels). */
  standards?: string[];
  /** Gear lines: also accepted without certification (stock/OEM belts, plain fire-resistant socks). */
  noCert?: boolean;
}

/** The car and crew photos sent with a sheet (each photo by its SHA-256, as items' photos are). */
export interface TechSheetPictures {
  /** One or two photos of the car. */
  car?: { sha256: string }[];
  driver?: { sha256: string };
  codriver?: { sha256: string };
}

export interface TechSheetSection {
  id: string;
  title: string;
  items: TechSheetItem[];
}

export interface TechSheetVariant {
  id: string;
  label: string;
  /** The event classes that get this version of the sheet (case-insensitive). */
  classes?: string[];
  /** Cars in these classes carry a co-driver (perOccupant items get a line for each). */
  codriver?: boolean;
}

export interface TechSheetSignoff {
  id: string;
  label: string;
  license?: boolean;
}

export interface TechSheetTemplate {
  format: 1;
  id: string;
  bodyId: string;
  passtechRulesetIds?: string[];
  title: string;
  revision?: string;
  source?: { form?: string; rules?: string };
  instructions?: string;
  variants?: TechSheetVariant[];
  header: TechSheetField[];
  sections: TechSheetSection[];
  signoff?: TechSheetSignoff[];
}

export type TechSheetPhotoKind = "item" | "tag";

export interface TechSheetPhotoRef {
  sha256: string;
  kind: TechSheetPhotoKind;
}

/** One declared line, as a submission / exported file holds it. */
export interface TechSheetDeclaredItem {
  declared?: string;
  /** Team-checked items the team ticked as done. */
  done?: boolean;
  /** Check lines the team marked not applicable to this car. */
  na?: boolean;
  values?: Record<string, string | string[]>;
  photos?: TechSheetPhotoRef[];
  /** Gear lines: the PassTech EquipmentEntry declared (without its photos — they're in `photos`),
   * for the scrutineer's app to judge with the same matcher. */
  gear?: EquipmentEntry;
}

export type TechSheetItemResult = "pass" | "fail" | "na";

export interface TechSheetInspection {
  /** teamUpdatedAt: the team changed the line after the inspection started (its result was cleared). */
  items?: Record<string, { result?: TechSheetItemResult; note?: string; values?: Record<string, unknown>; photos?: TechSheetPhotoRef[]; teamUpdatedAt?: string }>;
  corrections?: string;
  result?: "pass" | "fail";
  signatures?: Record<string, { name?: string; license?: string; at?: string }>;
  /** Earlier rounds: a Failed verdict the team then re-submitted the failed lines for. */
  history?: { result?: string; corrections?: string; at?: string; resubmittedAt?: string; signatures?: Record<string, { name?: string }> }[];
}

/** The file "Export file" writes — the Digital logbooks app imports exactly this shape. */
export interface TechSheetExportFile {
  kind: "passtech-tech-sheet";
  format: 1;
  template: { id: string; title: string; revision?: string };
  event?: { id: string; name: string };
  carNumber: string;
  variant: string | null;
  header: Record<string, string | string[]>;
  competitor: { items: Record<string, TechSheetDeclaredItem>; pictures?: TechSheetPictures };
  images: Record<string, string>;
}
