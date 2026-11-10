import { getSupabase } from "@/lib/techSheetServer";
import { TECH_SHEET_PHOTO_BUCKET } from "@/lib/serverConfig";
import { EquipmentCategory } from "@/data/types";
import { CertificationEntry, ENTRY_PHOTO_KEYS, EquipmentEntry, formatCode } from "@/lib/matcher";
import { stableJson } from "@/lib/garage";

/**
 * Tech stickers: QR codes scrutineers issue from the Scrutineering site (the logbook app's
 * stickers.js and its sticker_view() server function). A code holds <site>/?s=<8 characters>.
 *   gear    -- a helmet, HANS, seat, fire extinguisher or suppression system: its photos and the
 *              certifications read off its tag. Good for its body's events for a season (a
 *              calendar year); whether the certification itself is accepted is PassTech's call
 *              against the ruleset picked here.
 *   car     -- a car that passed tech at an event (that event only): that tech sheet's results.
 *   logbook -- a car's digital logbook.
 */
/** The gear a sticker can go on (the server's sticker_gear()). */
export const STICKER_GEAR: EquipmentCategory[] = ["helmet", "hnr", "seat", "fire_extinguisher", "fire_suppression"];

export interface StickerView {
  code: string;
  kind: "gear" | "car" | "logbook";
  status: "valid" | "void" | "expired";
  /** Gear stickers: the season (calendar year) it's good for. */
  season?: number | null;
  /** The body's discipline it's for (e.g. SCCNH Autocross), when the body has them. */
  discipline?: string | null;
  disciplineName?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  replacedBy?: string | null;
  issuedAt: string;
  inspector?: { name?: string | null; license?: string | null } | null;
  body?: string | null;
  bodyName?: string | null;
  event?: { name?: string; location?: string | null; startsOn?: string | null; endsOn?: string | null } | null;
  snapshot: {
    category?: EquipmentCategory;
    label?: string;
    occupant?: "driver" | "codriver" | null;
    carNumber?: string;
    class?: string;
    make?: string;
    model?: string;
    year?: string;
    driver?: string;
    codriver?: string;
    digitalNumber?: string;
    gear?: Partial<EquipmentEntry>;
    photos?: { sha256: string; kind: "item" | "tag" | "car" }[];
  };
  sheet?: {
    status: string;
    variant?: string | null;
    template?: { sections?: { id: string; title: string; items?: { id: string; label: string; perOccupant?: boolean }[] }[] } | null;
    results?: Record<string, string>;
    signatures?: Record<string, { name?: string; license?: string; at?: string }>;
  };
  logbook?: { digitalNumber?: string; status?: string; publicToken?: string | null } | null;
}

/** The sticker code in a scanned QR text (a ?s= link) or typed by hand ("K7Q3-M9XD"), or null. */
export function stickerCodeFrom(text: string): string | null {
  const t = text.trim();
  try {
    const u = new URL(t);
    const s = u.searchParams.get("s") ?? u.searchParams.get("S");
    if (s) return normalize(s);
  } catch {
    // Not a link: maybe the code itself.
  }
  return normalize(t);
}

function normalize(s: string): string | null {
  const c = s.toUpperCase().replace(/[^0-9A-Z]/g, "");
  return /^[2-9A-Z]{8}$/.test(c) ? c : null;
}

export const formatStickerCode = formatCode;

export async function fetchSticker(code: string): Promise<StickerView | null> {
  const { data, error } = await getSupabase().rpc("sticker_view", { p_code: code });
  if (error) throw new Error(error.message);
  return (data as StickerView | null) ?? null;
}

const photoUrls = new Map<string, Promise<string | null>>();
/** A sticker's photo (readable by anyone while the sticker is valid), as an object URL. */
export function stickerPhotoUrl(sha256: string): Promise<string | null> {
  let p = photoUrls.get(sha256);
  if (!p) {
    p = getSupabase()
      .storage.from(TECH_SHEET_PHOTO_BUCKET)
      .download(sha256)
      .then(({ data, error }) => (error || !data ? null : URL.createObjectURL(data)));
    photoUrls.set(sha256, p);
  }
  return p;
}

/** A gear sticker's item, as an entry PassTech can judge against a ruleset. */
export function stickerEntry(v: StickerView): { category: EquipmentCategory; entry: EquipmentEntry } | null {
  const cat = v.snapshot.category;
  if (v.kind !== "gear" || !cat) return null;
  const g = v.snapshot.gear ?? {};
  const certifications = (g.certifications ?? []).map((c: CertificationEntry, i: number) => ({ ...c, key: c.key || `sticker-${i}` }));
  const entry = { ...g, category: cat, certifications } as EquipmentEntry;
  ENTRY_PHOTO_KEYS.forEach((k) => delete entry[k]);
  return { category: cat, entry };
}

/** The Scrutineering site's page for a sticker (what the QR code itself opens). */
export const stickerPageUrl = (code: string) => `https://scrutineering.frogracing.us/?s=${code}`;

/** What's wrong with using this sticker for an item of `category`, or null when it's this item's kind. */
export function stickerMismatch(v: StickerView, category: EquipmentCategory): string | null {
  const name = `Sticker ${formatStickerCode(v.code)}`;
  if (v.kind !== "gear") return `${name} is a ${v.kind === "car" ? "car's tech pass" : "logbook"} sticker, not a gear sticker.`;
  if (v.snapshot.category !== category) return `${name} is for another kind of gear (${v.snapshot.label || v.snapshot.category}).`;
  return null;
}

/** "ARA 2026 season · valid" */
export const stickerStatusLine = (v: StickerView) =>
  [v.kind === "gear" && v.season ? `${[v.bodyName || (v.body ?? "").toUpperCase(), v.disciplineName].filter(Boolean).join(" ")} ${v.season} season` : v.bodyName, v.status].filter(Boolean).join(" · ");

// ---- Applying for an annual sticker ----------------------------------------------------------

export interface StickerBody {
  id: string;
  name: string;
  /** The gear it gives annual stickers for (a body without disciplines); missing: a server from
   * before bodies chose (every kind). */
  gear?: string[];
  /** Its annual car inspection sheet (a body without disciplines): null, none -- no annual car stickers. */
  carTemplate?: AnnualCarTemplate | null;
  /** Its disciplines (none: the body works as one) -- an application names one -- each with the
   * gear it gives annual stickers for, and its annual car inspection sheet. */
  disciplines?: { id: string; name: string; gear?: string[]; carTemplate?: AnnualCarTemplate | null }[];
}

/** A body's annual car inspection sheet: the tech sheet a car's annual inspection is filled on. */
export interface AnnualCarTemplate {
  id: string;
  title: string;
  version?: number;
  definition: import("@/data/techSheetTypes").TechSheetTemplate;
}

/** Where a car can get an annual inspection (and sticker): each body, or discipline, with an annual car sheet. */
export function annualCarChoices(bodies: StickerBody[]): { key: string; body: string; bodyName: string; discipline?: string; disciplineName?: string; template: AnnualCarTemplate }[] {
  const out: { key: string; body: string; bodyName: string; discipline?: string; disciplineName?: string; template: AnnualCarTemplate }[] = [];
  for (const b of bodies) {
    if (b.disciplines?.length) {
      for (const d of b.disciplines) if (d.carTemplate) out.push({ key: `${b.id}/${d.id}`, body: b.id, bodyName: b.name, discipline: d.id, disciplineName: d.name, template: d.carTemplate });
    } else if (b.carTemplate) out.push({ key: b.id, body: b.id, bodyName: b.name, template: b.carTemplate });
  }
  return out;
}

/** Whether a body (or one of its disciplines) gives annual stickers for this kind of gear. */
export function acceptsGear(gear: string[] | undefined, category: string): boolean {
  return gear === undefined || gear.includes(category);
}

/** The bodies that give annual stickers for this kind of gear, each with only the disciplines that do. */
export function stickerBodiesFor(bodies: StickerBody[], category: string): StickerBody[] {
  const out: StickerBody[] = [];
  for (const b of bodies) {
    if (b.disciplines?.length) {
      const disciplines = b.disciplines.filter((d) => acceptsGear(d.gear, category));
      if (disciplines.length) out.push({ ...b, disciplines });
    } else if (acceptsGear(b.gear, category)) out.push(b);
  }
  return out;
}

export interface StickerApplication {
  id: string;
  body: string;
  bodyName?: string;
  discipline?: string | null;
  disciplineName?: string | null;
  season: number;
  category: EquipmentCategory;
  owner?: string | null;
  submittedAt: string;
  status: "pending" | "issued" | "declined" | "withdrawn";
  stickerCode?: string | null;
  note?: string | null;
  /** The gear as sent (no photos). */
  gear?: Partial<EquipmentEntry>;
}

/** Whether an application was for this item: the same details, or a certification serial number in
 * common (the server refuses a second pending one for the same item, body and season). */
export function applicationIsFor(a: StickerApplication, entry: EquipmentEntry): boolean {
  const serials = (g?: Partial<EquipmentEntry>) => (g?.certifications ?? []).map((c) => c.serialNumber).filter((s): s is string => !!s);
  const mine = serials(entry);
  if (serials(a.gear).some((s) => mine.includes(s))) return true;
  const plain = (g?: Partial<EquipmentEntry>) => {
    const copy: Partial<EquipmentEntry> = { ...(g ?? {}) };
    ENTRY_PHOTO_KEYS.forEach((k) => delete copy[k]);
    delete copy.stickerCode;
    delete copy.stickerCodes;
    return stableJson(copy);
  };
  return plain(a.gear) === plain(entry);
}

/** The sanctioning bodies a sticker can be applied for. */
export async function fetchStickerBodies(): Promise<StickerBody[]> {
  const { data, error } = await getSupabase().rpc("sticker_bodies");
  if (error) throw new Error(error.message);
  return (data as StickerBody[]) ?? [];
}

export async function fetchMyStickerApplications(): Promise<StickerApplication[]> {
  const { data, error } = await getSupabase().rpc("my_sticker_applications");
  if (error) throw new Error(error.message);
  return (data as StickerApplication[]) ?? [];
}

export async function submitStickerApplication(p: {
  body: string;
  discipline?: string;
  season: number;
  category: EquipmentCategory;
  owner?: string;
  gear: EquipmentEntry;
  photos: { sha256: string; kind: "item" | "tag" }[];
}): Promise<string> {
  const { data, error } = await getSupabase().rpc("submit_sticker_application", { p });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function withdrawStickerApplication(id: string): Promise<void> {
  const { error } = await getSupabase().rpc("withdraw_sticker_application", { p_id: id });
  if (error) throw new Error(error.message);
}
