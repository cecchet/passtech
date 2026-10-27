import { EquipmentCategory, Ruleset, getRuleset } from "@/data";
import { CATEGORY_META, isPerOccupantCategory } from "@/data/categoryMeta";
import { logbookBodyLabel, NOT_LISTED, paddingStandardLabel, standardLabel } from "@/data/standards";
import {
  TechSheetDeclaredItem,
  TechSheetPictures,
  TechSheetExportFile,
  TechSheetField,
  TechSheetItem,
  TechSheetPhotoKind,
  TechSheetTemplate,
} from "@/data/techSheetTypes";
import { GarageProfile } from "@/lib/garage";
import { bodyStyleLabel, CategoryResult, CertificationEntry, EquipmentEntry, evaluateRuleset, helmetStyle, isEntryEmpty } from "@/lib/matcher";
import { downscaleDataUrl } from "@/lib/imageResize";

export type Occupant = "driver" | "codriver";

/** One photo attached to a line in a draft — stored as a resized JPEG data URL. */
export interface TechSheetDraftPhoto {
  id: string;
  dataUrl: string;
  kind: TechSheetPhotoKind;
  /** Came from the gear set's own photos (vs. added on the sheet). */
  fromGear?: boolean;
}

export interface TechSheetDraftLine {
  declared: string;
  /** Team-checked items: the team ticked it as done. */
  done?: boolean;
  /** Check lines the team marked not applicable to this car. */
  na?: boolean;
  values: Record<string, string | string[]>;
  photos: TechSheetDraftPhoto[];
  /** Gear lines: the gear as entered on the sheet (My gear's form), pre-filled from the gear set
   * and judged by PassTech. Its photos travel as the line's photos, so it's kept without them. */
  gear?: EquipmentEntry;
}

/** A competitor's in-progress tech sheet, saved in IndexedDB (techSheets store). */
export interface TechSheetDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Snapshot of the template the sheet is filled against (an event's, or a built-in one). */
  template: TechSheetTemplate;
  /** Server template version, when the template came from an event. */
  templateVersion?: number;
  /** Server template id, when the template came from an event — sent with the submission so the
   * sheet is filed under the event's sheet the competitor filled (an event can have several). */
  templateId?: string;
  event?: { id: string; name: string };
  variant: string | null;
  /** The PassTech ruleset the gear lines are checked against. */
  rulesetId?: string;
  gearProfileId?: string;
  gearProfileName?: string;
  header: Record<string, string | string[]>;
  lines: Record<string, TechSheetDraftLine>;
  /** Photos of the car (one or two) and of the driver and co-driver. */
  pictures?: { car?: TechSheetDraftPhoto[]; driver?: TechSheetDraftPhoto; codriver?: TechSheetDraftPhoto };
  submittedSheetId?: string;
  submittedAt?: string;
}

/** One line of the sheet as shown/filled: a template item, expanded per occupant when needed. */
export interface TechSheetLine {
  key: string;
  item: TechSheetItem;
  occupant?: Occupant;
  label: string;
}

export interface TechSheetLineGroup {
  sectionId: string;
  title: string;
  lines: TechSheetLine[];
}

export function newDraftId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function newPhotoId(): string {
  return Math.random().toString(36).slice(2);
}

const OCCUPANT_LABEL: Record<Occupant, string> = { driver: "Driver", codriver: "Co-driver" };

export function occupantLabel(occupant: Occupant): string {
  return OCCUPANT_LABEL[occupant];
}

/** "Helmet" → "helmet", but an acronym ("HNR") stays as is. */
function lowerFirst(label: string): string {
  return /^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;
}

/** The variant (car class) for an event class: the variant listing that class (case-insensitive),
 * else the first. Same rule as the logbook app. */
export function variantForClass(template: TechSheetTemplate, eventClass: string | undefined): string | null {
  const variants = template.variants ?? [];
  if (variants.length === 0) return null;
  const c = (eventClass ?? "").trim().toLowerCase();
  const hit = c ? variants.find((v) => (v.classes ?? []).some((x) => x.trim().toLowerCase() === c)) : undefined;
  return (hit ?? variants[0]).id;
}

/** Whether the sheet has a co-driver to show: the car class carries one and the sheet asks about
 * them (a co-driver header field, or driver & co-driver lines). */
export function sheetHasCodriver(template: TechSheetTemplate, variant: string | null): boolean {
  if (!variantHasCodriver(template, variant)) return false;
  return template.header.some((f) => f.prefill === "codriver") || template.sections.some((s) => s.items.some((i) => i.perOccupant));
}

/** Whether cars of this variant (car class) carry a co-driver: always when the template has no
 * variants, else when the variant says so (e.g. hillclimb R1/R2). Same rule as the logbook app. */
export function variantHasCodriver(template: TechSheetTemplate, variant: string | null): boolean {
  const variants = template.variants ?? [];
  if (variants.length === 0) return true;
  return !!(variants.find((v) => v.id === variant) ?? variants[0]).codriver;
}

/** Every line of the sheet for this variant, grouped by section — perOccupant items expanded into
 * "Driver helmet" / "Co-driver helmet" (keys "helmet.driver" / "helmet.codriver") when the car has
 * a co-driver, else one line under the item's own name (key "helmet"), filled from the driver. */
export function expandLines(template: TechSheetTemplate, variant: string | null): TechSheetLineGroup[] {
  const both = variantHasCodriver(template, variant);
  return template.sections
    .map((section) => ({
      sectionId: section.id,
      title: section.title,
      lines: section.items
        .filter((item) => !item.variants || item.variants.length === 0 || (variant !== null && item.variants.includes(variant)))
        .flatMap((item): TechSheetLine[] =>
          item.perOccupant && both
            ? (["driver", "codriver"] as Occupant[]).map((occupant) => ({
                key: `${item.id}.${occupant}`,
                item,
                occupant,
                label: `${OCCUPANT_LABEL[occupant]} ${lowerFirst(item.label)}`,
              }))
            : [item.perOccupant ? { key: item.id, item, occupant: "driver" as Occupant, label: item.label } : { key: item.id, item, label: item.label }]
        ),
    }))
    .filter((group) => group.lines.length > 0);
}

/** The gear entries (by occupant) a line is filled from. A perOccupant line takes that occupant's
 * entry; a single line for a per-seat category (e.g. one "Seats" line) takes both the driver's and,
 * when the gear set has one, the co-driver's; a car-level category takes the gear set's own entry. */
export function gearEntriesForLine(profile: GarageProfile | undefined, line: TechSheetLine): { occupant?: Occupant; entry: EquipmentEntry }[] {
  const category = line.item.gear;
  if (!profile || !category) return [];
  const driverEntry = profile.entries[category];
  const codriverEntry = profile.hasCodriver ? profile.codriverEntries?.[category] : undefined;
  const filled = (entry: EquipmentEntry | undefined) => !!entry && !isEntryEmpty(category, entry);
  if (line.occupant === "codriver") return filled(codriverEntry) ? [{ occupant: "codriver", entry: codriverEntry! }] : [];
  if (line.occupant === "driver") return filled(driverEntry) ? [{ occupant: "driver", entry: driverEntry! }] : [];
  if (isPerOccupantCategory(category) && filled(codriverEntry)) {
    return [
      ...(filled(driverEntry) ? [{ occupant: "driver" as const, entry: driverEntry! }] : []),
      { occupant: "codriver" as const, entry: codriverEntry! },
    ];
  }
  return filled(driverEntry) ? [{ entry: driverEntry! }] : [];
}

function ym(date: string | undefined): string | undefined {
  return date ? date.slice(0, 7) : undefined;
}

function describeCert(cert: CertificationEntry): string {
  const name = cert.standardId === NOT_LISTED ? cert.customStandardLabel || "Unlisted certification" : cert.standardId ? standardLabel(cert.standardId) : "Unknown certification";
  const parts = [name];
  if (cert.homologationNumber) parts.push(`homologation ${cert.homologationNumber}`);
  if (cert.serialNumber) parts.push(`serial ${cert.serialNumber}`);
  if (cert.labelDate) parts.push(`${cert.dateType === "recertification" ? "recertified" : "label"} ${ym(cert.labelDate)}`);
  if (cert.tagExpirationDate) parts.push(`expires ${ym(cert.tagExpirationDate)}`);
  if (cert.nextServiceDate) parts.push(`next service ${ym(cert.nextServiceDate)}`);
  if (cert.lastServiceDate) parts.push(`last service ${ym(cert.lastServiceDate)}`);
  return parts.join(", ");
}

function describeCerts(certs: CertificationEntry[] | undefined): string {
  return (certs ?? []).map(describeCert).join("; ");
}

/** A short, human summary of one gear entry — what the team declares on the sheet — with its tech
 * sticker when it has one. */
export function summarizeEntry(category: EquipmentCategory, entry: EquipmentEntry): string {
  const text = summarizeGear(category, entry);
  const sticker = entry.stickerCode ? `tech sticker ${entry.stickerCode.slice(0, 4)}-${entry.stickerCode.slice(4)}` : "";
  return [text, sticker].filter(Boolean).join(", ");
}

function summarizeGear(category: EquipmentCategory, entry: EquipmentEntry): string {
  const meta = CATEGORY_META[category];
  switch (category) {
    case "fire_extinguisher": {
      const units = entry.extinguisherUnits ?? [];
      const each = units.map((u) => {
        const rating = [u.classARating ? `${u.classARating}-A` : "", u.bcRating ? `${u.bcRating}-B:C` : ""].filter(Boolean).join(":");
        const parts = [rating || "rating not entered"];
        if (u.weightLbs) parts.push(`${u.weightLbs} lb`);
        if (u.manufactureDate) parts.push(`mfd ${ym(u.manufactureDate)}`);
        if (u.certificationDate) parts.push(`certified ${ym(u.certificationDate)}`);
        if (u.certificationDueDate) parts.push(`due ${ym(u.certificationDueDate)}`);
        if (u.hasMetalBracket !== undefined) parts.push(u.hasMetalBracket ? "metal bracket" : "no metal bracket");
        if (u.metalStrapCount) parts.push(`${u.metalStrapCount} metal strap${u.metalStrapCount > 1 ? "s" : ""}`);
        return parts.join(", ");
      });
      return `${units.length} extinguisher${units.length === 1 ? "" : "s"}: ${each.join("; ")}`;
    }
    case "emergency_triangle": {
      const units = entry.triangleUnits ?? [];
      const sizes = units.map((u) => u.sideLengthIn).filter((s): s is number => !!s);
      return `${units.length} triangle${units.length === 1 ? "" : "s"}${sizes.length ? ` (${sizes.map((s) => `${s} in`).join(", ")})` : ""}`;
    }
    case "window_breaker": {
      const n = (entry.windowBreakerUnits ?? []).length;
      return `${n} window breaker / belt cutter tool${n === 1 ? "" : "s"}`;
    }
    case "tow_hook":
      return [entry.towHookFront ? "Front tow point" : "", entry.towHookRear ? "Rear tow point" : ""].filter(Boolean).join(", ");
    case "rollover_protection": {
      const parts: string[] = [];
      if (entry.cageType) parts.push(entry.cageType === "full_cage" ? "Full cage" : "Roll bar");
      if (entry.bodyStyle) parts.push(`${bodyStyleLabel(entry.bodyStyle)} car`);
      if (entry.fiaHomologated) parts.push("FIA homologated");
      if (entry.cageMountType) parts.push(entry.cageMountType === "welded" ? "welded" : "bolt-in");
      if (entry.cagePlateMountType) parts.push(`plates ${entry.cagePlateMountType}`);
      if (entry.cageTubeOuterDiameterIn && entry.cageTubeWallThicknessIn) parts.push(`tube ${entry.cageTubeOuterDiameterIn}" x ${entry.cageTubeWallThicknessIn}"`);
      if (entry.cageLogbookBody && entry.cageLogbookBody !== "none") {
        const body = entry.cageLogbookBody === NOT_LISTED ? entry.cageLogbookBodyCustom || "other" : logbookBodyLabel(entry.cageLogbookBody);
        parts.push(`logbook: ${body}${entry.cageLogbookYear ? ` (${entry.cageLogbookYear})` : ""}`);
      } else if (entry.cageLogbookYear) parts.push(`built ${entry.cageLogbookYear}`);
      if (entry.cagePaddingPresent !== undefined) {
        const std = entry.cagePaddingStandardId
          ? entry.cagePaddingStandardId === NOT_LISTED
            ? entry.cagePaddingStandardCustom
            : entry.cagePaddingStandardId === "none"
              ? "uncertified"
              : paddingStandardLabel(entry.cagePaddingStandardId)
          : undefined;
        parts.push(entry.cagePaddingPresent ? `padding${std ? ` (${std})` : ""}` : "no padding");
      }
      return parts.join(", ");
    }
  }
  if (meta.presenceOnly) return "Present";
  if (meta.hybrid && entry.mode === "material_only") return "Plain material / stock (no certification)";
  let text: string;
  if (category === "firesuit" && entry.pieceType === "two_piece") {
    text = `Two-piece — jacket: ${describeCerts(entry.certifications) || "—"}; pants: ${describeCerts(entry.pantsCertifications) || "—"}`;
  } else {
    text = describeCerts(entry.certifications);
  }
  if (category === "helmet" && !isEntryEmpty(category, entry)) {
    const style = helmetStyle(entry);
    text += `${text ? ", " : ""}${style.type === "full_face" ? "full face" : "open face"}${style.visor ? " with shield" : ""}`;
  }
  if (category === "seat" && entry.seatMounting) text += `${text ? ", " : ""}${entry.seatMounting === "fixed" ? "fixed mount" : "on rails"}`;
  return text;
}

/** Every photo stored on a gear entry with its likely role: in the item's own photos and in each
 * unit's, the first shows the whole item and the others its tag or label (the order PassTech asks
 * for them in; the scrutineer can still change it on the sheet). */
function entryPhotoKinds(entry: EquipmentEntry): { url: string; kind: TechSheetPhotoKind }[] {
  const groups = [
    entry.photoDataUrls ?? [],
    ...(entry.extinguisherUnits ?? []).map((u) => u.photoDataUrls ?? []),
    ...(entry.windowBreakerUnits ?? []).map((u) => u.photoDataUrls ?? []),
    ...(entry.triangleUnits ?? []).map((u) => u.photoDataUrls ?? []),
  ];
  return groups.flatMap((urls) => urls.map((url, i) => ({ url, kind: i === 0 ? ("item" as const) : ("tag" as const) })));
}

/** The entry without its photos (its own and each unit's) — the sheet keeps those as line photos. */
export function stripEntryPhotos(entry: EquipmentEntry): EquipmentEntry {
  const strip = <T extends { photoDataUrls?: string[] }>(x: T): T => {
    const copy = { ...x };
    delete copy.photoDataUrls;
    return copy;
  };
  const out = strip(entry);
  if (out.extinguisherUnits) out.extinguisherUnits = out.extinguisherUnits.map(strip);
  if (out.windowBreakerUnits) out.windowBreakerUnits = out.windowBreakerUnits.map(strip);
  if (out.triangleUnits) out.triangleUnits = out.triangleUnits.map(strip);
  return out;
}

/** Whether a line has gear entered on the sheet (not just an empty form). */
export function hasSheetGear(value: TechSheetDraftLine | undefined): boolean {
  return !!value?.gear && !isEntryEmpty(value.gear.category, value.gear);
}

/** What a gear entry declares as the line's one certification, in the tick list's words (kept in
 * values.__options for what reads sheets from before the form): its first certification, or the
 * no-certification choice for plain material / stock gear. */
export function optionsFromEntry(category: EquipmentCategory, entry: EquipmentEntry | undefined): string[] {
  if (!entry || isEntryEmpty(category, entry)) return [];
  if (CATEGORY_META[category].hybrid && entry.mode === "material_only") return [noCertLabel(category)!];
  const cert = (entry.certifications ?? []).find((c) => c.standardId);
  if (!cert?.standardId) return [];
  return [cert.standardId === NOT_LISTED ? cert.customStandardLabel || "Unlisted certification" : standardLabel(cert.standardId)];
}

/** A gear line after its entry changed on the sheet: the declared text and the sheet's own values
 * it fills (e.g. an expiration date) follow the entry unless edited by hand, and values.__options
 * follows its certification. */
export function withLineGear(line: TechSheetLine, value: TechSheetDraftLine, gear: EquipmentEntry): TechSheetDraftLine {
  const category = gear.category;
  const before = value.gear ? summarizeEntry(category, value.gear) : "";
  const declared = !value.declared.trim() || value.declared.trim() === before.trim() ? summarizeEntry(category, gear) : value.declared;
  const filledBefore = value.gear ? prefillItemValues(line.item, [{ occupant: line.occupant, entry: value.gear }]) : {};
  const filledNow = prefillItemValues(line.item, [{ occupant: line.occupant, entry: gear }]);
  const values = { ...value.values };
  for (const field of line.item.fields ?? []) {
    const current = values[field.id];
    if (current !== undefined && current !== "" && current !== filledBefore[field.id]) continue;
    if (filledNow[field.id] !== undefined) values[field.id] = filledNow[field.id];
    else delete values[field.id];
  }
  values.__options = optionsFromEntry(category, gear);
  return { ...value, gear, declared, values };
}

/** Everything the sheet pins to JPEG (the server and the scrutineer's app hash JPEG bytes). */
async function asJpeg(dataUrl: string): Promise<string> {
  if (dataUrl.startsWith("data:image/jpeg")) return dataUrl;
  return downscaleDataUrl(dataUrl, 1600, 0.82);
}

function earliestExpiry(entry: EquipmentEntry): string | undefined {
  const dates = (entry.certifications ?? []).map((c) => c.tagExpirationDate).filter((d): d is string => !!d);
  return dates.length ? dates.sort()[0] : undefined;
}

/** Pre-fills an item's extra values from the gear entry, where the field obviously maps. */
function prefillItemValues(item: TechSheetItem, gear: { occupant?: Occupant; entry: EquipmentEntry }[]): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const field of item.fields ?? []) {
    const id = field.id.toLowerCase();
    if (field.type === "date" && id.includes("expir")) {
      const who: Occupant | undefined = id.startsWith("codriver") ? "codriver" : id.startsWith("driver") ? "driver" : undefined;
      const source = gear.find((g) => (who ? g.occupant === who || (!g.occupant && who === "driver") : true));
      const date = source && earliestExpiry(source.entry);
      if (date) values[field.id] = date.slice(0, 10);
    } else if (item.gear === "fire_extinguisher" && (id.includes("bc") || id.includes("rating"))) {
      const ratings = gear.flatMap((g) => (g.entry.extinguisherUnits ?? []).map((u) => u.bcRating)).filter((r): r is number => !!r);
      if (ratings.length) values[field.id] = ratings.map((r) => `${r}-B:C`).join(", ");
    } else if (field.prefill === "logbook_body") {
      const cage = gear.find((g) => g.entry.cageLogbookBody)?.entry;
      if (cage?.cageLogbookBody && cage.cageLogbookBody !== "none") values[field.id] = cage.cageLogbookBody === NOT_LISTED ? cage.cageLogbookBodyCustom ?? "" : logbookBodyLabel(cage.cageLogbookBody);
    }
  }
  return values;
}

/** The pre-filled line for a gear line: declared summary, values and the gear's own photos. */
export async function prefillLine(profile: GarageProfile | undefined, line: TechSheetLine): Promise<TechSheetDraftLine> {
  const gear = gearEntriesForLine(profile, line);
  const category = line.item.gear;
  if (!category || gear.length === 0) return { declared: "", values: {}, photos: [] };
  const declared =
    gear.length > 1
      ? gear.map((g) => `${g.occupant ? OCCUPANT_LABEL[g.occupant] : ""}: ${summarizeEntry(category, g.entry)}`).join(" | ")
      : summarizeEntry(category, gear[0].entry);
  // The sheet's own copy of the gear (a per-seat line filled from both seats takes the first),
  // so editing it on the sheet never changes My gear.
  const entry = stripEntryPhotos(structuredClone(gear[0].entry));
  const values = prefillItemValues(line.item, gear);
  const options = optionsFromEntry(category, entry);
  if (options.length) values.__options = options;
  const photos: TechSheetDraftPhoto[] = [];
  for (const g of gear) {
    for (const { url, kind } of entryPhotoKinds(g.entry)) {
      try {
        photos.push({ id: newPhotoId(), dataUrl: await asJpeg(url), kind, fromGear: true });
      } catch {
        // an unreadable stored photo is just skipped
      }
    }
  }
  return { declared, values, photos, gear: entry };
}

/** A fresh draft for this template — gear lines pre-filled from the gear set, header from the
 * event and gear set (and the last draft's crew/car details, which rarely change). */
export async function createDraft(opts: {
  template: TechSheetTemplate;
  templateVersion?: number;
  templateId?: string;
  event?: { id: string; name: string };
  variant: string | null;
  rulesetId?: string;
  profile?: GarageProfile;
  previous?: TechSheetDraft;
  classLabel?: string;
}): Promise<TechSheetDraft> {
  const { template, profile, previous } = opts;
  const now = new Date().toISOString();
  const header: Record<string, string | string[]> = {};
  const previousByPrefill: Partial<Record<string, string | string[]>> = {};
  if (previous) {
    for (const field of previous.template.header) {
      if (field.prefill && previous.header[field.id] !== undefined) previousByPrefill[field.prefill] = previous.header[field.id];
    }
  }
  const cage = profile?.entries.rollover_protection;
  const carNoteHead = profile?.carNote?.split(/[,;\n]/)[0]?.trim();
  for (const field of template.header) {
    let value: string | string[] | undefined;
    switch (field.prefill) {
      case "event":
        value = opts.event?.name;
        break;
      case "logbook_body":
        if (cage?.cageLogbookBody && cage.cageLogbookBody !== "none")
          value = cage.cageLogbookBody === NOT_LISTED ? cage.cageLogbookBodyCustom : logbookBodyLabel(cage.cageLogbookBody);
        break;
      case "class":
        if (opts.classLabel && (field.type !== "choice" || field.options?.includes(opts.classLabel))) value = opts.classLabel;
        break;
      case "make":
      case "model":
        value = carNoteHead || undefined;
        break;
    }
    if (value === undefined && !field.prefill && /make|model/i.test(field.id)) value = carNoteHead || undefined;
    if (value === undefined && field.prefill && field.prefill !== "event") {
      const prev = previousByPrefill[field.prefill];
      if (prev !== undefined && (field.type !== "choice" || (typeof prev === "string" && field.options?.includes(prev)))) value = prev;
    }
    if (value !== undefined && value !== "") header[field.id] = value;
  }
  const lines: Record<string, TechSheetDraftLine> = {};
  for (const group of expandLines(template, opts.variant)) {
    for (const line of group.lines) {
      if (line.item.gear) {
        const filled = await prefillLine(profile, line);
        if (filled.declared || filled.gear || filled.photos.length || Object.keys(filled.values).length) lines[line.key] = filled;
      }
    }
  }
  return {
    id: newDraftId(),
    createdAt: now,
    updatedAt: now,
    template,
    templateVersion: opts.templateVersion,
    ...(opts.templateId ? { templateId: opts.templateId } : {}),
    event: opts.event,
    variant: opts.variant,
    rulesetId: opts.rulesetId,
    gearProfileId: profile?.id,
    gearProfileName: profile?.name,
    header,
    lines,
  };
}

/** A draft rebuilt from a sheet the team submitted (on a device that doesn't have its draft): its
 * header, lines and photos as the event received them, ready to edit and re-submit. */
export async function draftFromSubmitted(
  sheet: {
    id: string;
    event: string;
    eventName?: string | null;
    variant?: string | null;
    header?: Record<string, unknown> | null;
    template?: TechSheetTemplate | null;
    competitor?: { items?: Record<string, TechSheetDeclaredItem>; pictures?: TechSheetPictures } | null;
    submittedAt?: string | null;
  },
  download: (sha256: string) => Promise<string | null>
): Promise<TechSheetDraft> {
  if (!sheet.template) throw new Error("This sheet has no template to edit.");
  const photo = async (sha256: string, kind: TechSheetPhotoKind): Promise<TechSheetDraftPhoto | null> => {
    const dataUrl = await download(sha256);
    return dataUrl ? { id: newPhotoId(), dataUrl, kind } : null;
  };
  const lines: Record<string, TechSheetDraftLine> = {};
  for (const [key, item] of Object.entries(sheet.competitor?.items ?? {})) {
    const photos = (await Promise.all((item.photos ?? []).map((p) => photo(p.sha256, p.kind)))).filter((p): p is TechSheetDraftPhoto => !!p);
    lines[key] = {
      declared: item.declared ?? "",
      ...(item.done ? { done: true } : {}),
      ...(item.na ? { na: true } : {}),
      values: item.values ?? {},
      photos,
      ...(item.gear ? { gear: item.gear } : {}),
    };
  }
  const pics = sheet.competitor?.pictures ?? {};
  const one = async (p?: { sha256: string }) => (p ? (await photo(p.sha256, "item")) ?? undefined : undefined);
  const car = (await Promise.all((pics.car ?? []).map((p) => photo(p.sha256, "item")))).filter((p): p is TechSheetDraftPhoto => !!p);
  const pictures = { ...(car.length ? { car } : {}), driver: await one(pics.driver), codriver: await one(pics.codriver) };
  const header = Object.fromEntries(
    Object.entries(sheet.header ?? {}).filter((e): e is [string, string | string[]] => typeof e[1] === "string" || Array.isArray(e[1]))
  );
  const variant = sheet.variant ?? null;
  const now = new Date().toISOString();
  return {
    id: newDraftId(),
    createdAt: now,
    updatedAt: now,
    template: sheet.template,
    event: { id: sheet.event, name: sheet.eventName ?? "Event" },
    variant,
    rulesetId: defaultRulesetFor(sheet.template, variant),
    header,
    lines,
    pictures,
    submittedSheetId: sheet.id,
    ...(sheet.submittedAt ? { submittedAt: sheet.submittedAt } : {}),
  };
}

/** Every line key a template can have (any variant, with or without a co-driver), with the gear
 * category the line checks ("" for a check line). */
function lineKinds(template: TechSheetTemplate): Map<string, string> {
  const out = new Map<string, string>();
  for (const section of template.sections) {
    for (const item of section.items) {
      const kind = item.gear ?? "";
      out.set(item.id, kind);
      if (item.perOccupant) {
        out.set(`${item.id}.driver`, kind);
        out.set(`${item.id}.codriver`, kind);
      }
    }
  }
  return out;
}

/** The draft moved to another of its event's sheets (e.g. NEHA non-X → X): the lines are made for
 * the new template as a new draft's are (gear lines pre-filled from the gear set), except that a
 * line the two sheets share (same key, same gear category) keeps what was entered on it, and lines
 * only on the old sheet are kept for a switch back. The car and crew stay: each of the new sheet's
 * header fields takes the old value of the field with its id, else with its prefill. */
export async function switchDraftTemplate(
  draft: TechSheetDraft,
  opts: { template: TechSheetTemplate; templateVersion?: number; templateId: string; eventClass?: string; profile?: GarageProfile }
): Promise<Partial<TechSheetDraft>> {
  const { template } = opts;
  const variant = variantForClass(template, opts.eventClass);
  const rulesetId = defaultRulesetFor(template, variant, draft.rulesetId);
  const fresh = await createDraft({ template, event: draft.event, variant, rulesetId, profile: opts.profile, classLabel: opts.eventClass });
  const header = { ...fresh.header };
  const oldById = new Map(draft.template.header.map((f) => [f.id, f]));
  for (const field of template.header) {
    const from = oldById.has(field.id) ? field.id : draft.template.header.find((f) => field.prefill && f.prefill === field.prefill)?.id;
    const v = from !== undefined ? draft.header[from] : undefined;
    if (v === undefined || (Array.isArray(v) ? v.length === 0 : v.trim() === "")) continue;
    if (field.type === "choice" && (typeof v !== "string" || !field.options?.includes(v))) continue;
    if (field.type === "multi" && !Array.isArray(v)) continue;
    header[field.id] = v;
  }
  const oldKinds = lineKinds(draft.template);
  const newKinds = lineKinds(template);
  const lines = { ...fresh.lines };
  for (const [key, line] of Object.entries(draft.lines)) {
    if (!newKinds.has(key) || newKinds.get(key) === oldKinds.get(key)) lines[key] = line;
  }
  return { template, templateVersion: opts.templateVersion, templateId: opts.templateId, variant, rulesetId, header, lines };
}

/** The PassTech ruleset a template's gear lines are checked against: the user's preferred one when
 * the template serves it, then one matching the variant (e.g. "neha-x" for variant "x"), then the
 * first that exists. */
export function defaultRulesetFor(template: TechSheetTemplate, variant: string | null, preferredRulesetId?: string): string | undefined {
  let ids = (template.passtechRulesetIds ?? []).filter((id) => !!getRuleset(id));
  if (variant) {
    const byVariant = ids.find((id) => id.endsWith(`-${variant}`));
    if (byVariant) return byVariant;
    // Not the rulesets named for the template's other variants (Standard isn't checked as neha-x).
    const others = (template.variants ?? []).filter((v) => v.id !== variant).map((v) => `-${v.id}`);
    ids = ids.filter((id) => !others.some((o) => id.endsWith(o)));
  }
  if (preferredRulesetId && ids.includes(preferredRulesetId)) return preferredRulesetId;
  return ids[0];
}

// ---------------------------------------------------------------------------
// Line status: what the summary at the top of the sheet counts
// ---------------------------------------------------------------------------

/** What a hybrid category's no-certification choice is called ("Stock/OEM belts (no certification)"). */
export function noCertLabel(category: EquipmentCategory | undefined): string | undefined {
  if (!category) return undefined;
  const meta = CATEGORY_META[category];
  return meta.hybrid ? meta.materialOnlyLabel ?? "Fire-resistant material (no certification)" : undefined;
}

/** A line's tick list: the sheet's options, plus the no-certification choice when the sheet or the
 * ruleset accepts it (sheets made before the editor offered it still get it from the ruleset). */
export function lineOptions(line: TechSheetLine, ruleset: Ruleset | undefined): string[] {
  const { item } = line;
  const options = [...(item.options ?? [])];
  const label = noCertLabel(item.gear);
  const rule = item.gear && ruleset ? ruleset.categories[item.gear] : undefined;
  if (label && (item.noCert || rule?.materialOnlyAccepted) && !options.includes(label)) options.push(label);
  return options;
}

export type LineState = "ok" | "na" | "declared" | "fix" | "missing" | "todo";
export interface LineStatus {
  state: LineState;
  text: string;
}

/** Where a line stands: accepted (PassTech checked the gear, or an accepted option is ticked),
 * declared (written, not checked), to fix (PassTech rejects the gear), missing (required gear with
 * nothing declared), or still to fill. */
export function lineStatus(line: TechSheetLine, value: TechSheetDraftLine | undefined, checks: LineCheck[], hasGear: boolean, ruleset?: Ruleset): LineStatus {
  if (value?.na) return { state: "na", text: "N/A" };
  if (hasGear && checks.length > 0) {
    const bad = checks.find((c) => c.result.status === "rejected");
    if (bad) return { state: "fix", text: bad.result.reason };
    const info = checks.find((c) => c.result.status === "needs_info" || c.result.status === "unrecognized");
    if (info) return { state: "missing", text: info.result.reason };
    return { state: "ok", text: "Checked by PassTech" };
  }
  const ticked = value?.values.__options;
  if (Array.isArray(ticked) && ticked.length > 0) return { state: "ok", text: line.item.gear ? ticked[0] : ticked.join(", ") };
  if (value?.done) return { state: "ok", text: "OK" };
  if (value?.declared.trim()) return { state: "declared", text: value.declared.trim() };
  const required = checks.some((c) => c.result.requirement === "required") || (!!line.item.gear && ruleset?.categories[line.item.gear]?.requirement === "required");
  if (line.item.gear && required) return { state: "missing", text: "Required — nothing declared yet" };
  return { state: "todo", text: "Not filled in yet" };
}

export interface LineCheck {
  occupant?: Occupant;
  result: CategoryResult;
}

/** PassTech's own check of each occupant's gear against a ruleset — the same evaluateRuleset the
 * "My gear" check uses, run once per occupant. */
export function evaluateProfile(ruleset: Ruleset | undefined, profile: GarageProfile | undefined) {
  if (!ruleset || !profile) return undefined;
  return {
    driver: evaluateRuleset(ruleset, profile.entries),
    codriver: profile.hasCodriver ? evaluateRuleset(ruleset, profile.codriverEntries ?? {}) : {},
  };
}

/** Each occupant's gear as the sheet has it: the gear set's entries, with the gear entered on the
 * sheet's lines on top (the first line for a category wins). */
export type SheetEntries = Record<Occupant, Partial<Record<EquipmentCategory, EquipmentEntry>>>;

export function sheetEntries(draft: TechSheetDraft, profile: GarageProfile | undefined): SheetEntries {
  const out: SheetEntries = { driver: { ...(profile?.entries ?? {}) }, codriver: profile?.hasCodriver ? { ...(profile.codriverEntries ?? {}) } : {} };
  const taken = new Set<string>();
  for (const group of expandLines(draft.template, draft.variant)) {
    for (const line of group.lines) {
      const category = line.item.gear;
      const gear = draft.lines[line.key]?.gear;
      const who = line.occupant ?? "driver";
      if (!category || !gear || taken.has(`${who}.${category}`)) continue;
      taken.add(`${who}.${category}`);
      out[who][category] = gear;
    }
  }
  return out;
}

/** A line's PassTech check. Gear entered on the sheet is judged as entered — with the occupant's
 * other gear from the sheet, for the rules that look across items (a balaclava with an HNR, an
 * undergarment under the firesuit) — else the gear set's own check, as "My gear" has it. */
export function lineChecks(
  results: ReturnType<typeof evaluateProfile>,
  profile: GarageProfile | undefined,
  line: TechSheetLine,
  sheet?: { ruleset: Ruleset | undefined; entries: SheetEntries; value: TechSheetDraftLine | undefined }
): LineCheck[] {
  const category = line.item.gear;
  if (category && sheet?.ruleset && sheet.value?.gear) {
    const who = line.occupant ?? "driver";
    const result = evaluateRuleset(sheet.ruleset, { ...sheet.entries[who], [category]: sheet.value.gear })[category];
    return result ? [{ occupant: line.occupant, result }] : [];
  }
  if (!results || !category) return [];
  const gear = gearEntriesForLine(profile, line);
  if (gear.length === 0) {
    // Nothing in the gear set for it: still show what the ruleset says (e.g. "Required").
    const r = (line.occupant === "codriver" ? results.codriver : results.driver)[category];
    return r ? [{ occupant: line.occupant, result: r }] : [];
  }
  return gear.flatMap((g): LineCheck[] => {
    const result = (g.occupant === "codriver" ? results.codriver : results.driver)[category];
    return result ? [{ occupant: g.occupant, result }] : [];
  });
}

// ---------------------------------------------------------------------------
// Photos: SHA-256 of the JPEG bytes
// ---------------------------------------------------------------------------

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const base64 = dataUrl.slice(comma + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hasContent(line: TechSheetDraftLine | undefined): line is TechSheetDraftLine {
  if (!line) return false;
  return !!line.declared.trim() || !!line.done || !!line.na || line.photos.length > 0 || hasSheetGear(line) || Object.values(line.values).some((v) => (Array.isArray(v) ? v.length > 0 : v !== ""));
}

/** The competitor's declaration for every line on the sheet (current variant only), with each
 * photo referenced by its SHA-256 — plus the images themselves, keyed by that hash. */
export async function buildDeclaration(
  draft: TechSheetDraft
): Promise<{ items: Record<string, TechSheetDeclaredItem>; images: Record<string, string>; pictures?: TechSheetPictures }> {
  const items: Record<string, TechSheetDeclaredItem> = {};
  const images: Record<string, string> = {};
  for (const group of expandLines(draft.template, draft.variant)) {
    for (const line of group.lines) {
      const filled = draft.lines[line.key];
      if (!hasContent(filled)) continue;
      const item: TechSheetDeclaredItem = {};
      const declared = filled.declared.trim() || (filled.done ? "OK" : filled.na ? "N/A — not applicable to this car" : "");
      if (declared) item.declared = declared;
      if (filled.done) item.done = true;
      if (filled.na) item.na = true;
      const values = Object.fromEntries(
        Object.entries(filled.values)
          .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v !== ""))
          // A gear line has one certification (a draft from before the single choice may hold more).
          .map(([k, v]) => (k === "__options" && line.item.gear && Array.isArray(v) ? [k, v.slice(0, 1)] : [k, v]))
      );
      if (Object.keys(values).length) item.values = values;
      // The gear as entered, for the scrutineer's app to judge with the same matcher — without its
      // photos: any added in the form (e.g. an extinguisher's label) join the line's photos.
      const gear = hasSheetGear(filled) ? filled.gear : undefined;
      if (gear) item.gear = stripEntryPhotos(gear);
      const photos: { dataUrl: string; kind: TechSheetPhotoKind }[] = [...filled.photos];
      for (const { url, kind } of gear ? entryPhotoKinds(gear) : []) {
        try {
          photos.push({ dataUrl: await asJpeg(url), kind });
        } catch {
          // an unreadable photo is just skipped
        }
      }
      if (photos.length) {
        item.photos = [];
        for (const photo of photos) {
          const sha = await sha256Hex(dataUrlToBytes(photo.dataUrl));
          images[sha] = photo.dataUrl;
          if (!item.photos.some((p) => p.sha256 === sha)) item.photos.push({ sha256: sha, kind: photo.kind });
        }
      }
      items[line.key] = item;
    }
  }
  // The car and crew photos (the co-driver's only when the car carries one).
  const ref = async (photo: TechSheetDraftPhoto) => {
    const sha256 = await sha256Hex(dataUrlToBytes(photo.dataUrl));
    images[sha256] = photo.dataUrl;
    return { sha256 };
  };
  const p = draft.pictures ?? {};
  const pictures: TechSheetPictures = {};
  if (p.car?.length) pictures.car = await Promise.all(p.car.slice(0, 2).map(ref));
  if (p.driver) pictures.driver = await ref(p.driver);
  if (p.codriver && sheetHasCodriver(draft.template, draft.variant)) pictures.codriver = await ref(p.codriver);
  return { items, images, ...(Object.keys(pictures).length ? { pictures } : {}) };
}

export function cleanHeader(draft: TechSheetDraft): Record<string, string | string[]> {
  return Object.fromEntries(Object.entries(draft.header).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v.trim() !== "")));
}

export function carNumberOf(draft: TechSheetDraft): string {
  const v = draft.header.car_number;
  return typeof v === "string" ? v.trim() : "";
}

export async function buildExportFile(draft: TechSheetDraft): Promise<TechSheetExportFile> {
  const { items, images, pictures } = await buildDeclaration(draft);
  return {
    kind: "passtech-tech-sheet",
    format: 1,
    template: { id: draft.template.id, title: draft.template.title, ...(draft.template.revision ? { revision: draft.template.revision } : {}) },
    ...(draft.event ? { event: draft.event } : {}),
    carNumber: carNumberOf(draft),
    variant: draft.variant,
    header: cleanHeader(draft),
    competitor: { items, ...(pictures ? { pictures } : {}) },
    images,
  };
}

export function exportFilename(draft: TechSheetDraft): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const car = carNumberOf(draft);
  return `passtech-tech-sheet-${slug(draft.event?.name ?? draft.template.id)}${car ? `-car-${slug(car)}` : ""}.json`;
}

/** Required header fields still empty — shown before export/submit. */
export function missingRequiredHeader(draft: TechSheetDraft): TechSheetField[] {
  return draft.template.header.filter((f) => {
    if (!f.required) return false;
    const v = draft.header[f.id];
    return v === undefined || (Array.isArray(v) ? v.length === 0 : v.trim() === "");
  });
}
