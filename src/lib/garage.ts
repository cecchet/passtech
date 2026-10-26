import { DisciplineGroup, EquipmentCategory, Ruleset } from "@/data/types";
import { PER_OCCUPANT_CATEGORIES } from "@/data/categoryMeta";
import { EquipmentEntry, isEntryEmpty } from "@/lib/matcher";

type Entries = Partial<Record<EquipmentCategory, EquipmentEntry>>;
type ItemIds = Partial<Record<EquipmentCategory, string>>;

/** A saved, named set of gear the driver owns — independent of any sanctioning body. Loaded into the checker's entries when the driver wants to check it against a specific body. */
export interface GarageProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** As stored: only the categories that aren't pieces of gear of their own (see GearItem) -- the
   * car's fuel cell, kill switch, cage... As loadGarage() returns it (resolved): every category,
   * the linked items' entries included. */
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  /** The pieces of gear this set is made of, by category (see GearItem): their entries live on the
   * items, shared by every set that uses them. */
  itemIds?: ItemIds;
  /** Rally only: the codriver's pieces of gear, same as itemIds. */
  codriverItemIds?: ItemIds;
  /** Rally only: whether this gear set includes a codriver's own gear (see codriverEntries). */
  hasCodriver?: boolean;
  /** Rally only: the codriver's own gear — same shape as entries, populated when hasCodriver is true. */
  codriverEntries?: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  /** Reference photo of the car itself (not a specific piece of equipment). Compressed client-side before storage. */
  carPhotoDataUrl?: string;
  /** Free-text note about the car, e.g. "2004 Miata NB, closed roof, road racing." */
  carNote?: string;
}

/** Pre-IndexedDB storage location — garage profiles lived here (as one JSON string) before the
 * quota was too easy to blow through with a few photo-heavy gear sets. Only read once, to migrate
 * a returning user's data into IndexedDB; never written to again. */
const LEGACY_LOCALSTORAGE_KEY = "safety-gear-check:garage:v1";

const DB_NAME = "passtech";
/** v1: garage. v2: + workspace. v3: + techSheets. Every upgrade only ever adds the stores a
 * browser doesn't have yet (see openDb), so a browser on any older version upgrades in place
 * without touching the data already stored. */
const DB_VERSION = 3;
const STORE_NAME = "garage";
/** The whole profiles array is stored as one record under this fixed key — same shape the app has
 * always worked with (load the full array, mutate it in React state, save the full array back),
 * just moved to a store with a much higher quota than localStorage's ~5-10MB per origin. */
const RECORD_KEY = "profiles";

/** The current-workspace "resume where I left off" snapshot (see WorkspaceState) — added in v2,
 * alongside the v1 garage store, so a browser already on v1 upgrades in place. */
const WORKSPACE_STORE_NAME = "workspace";
const WORKSPACE_RECORD_KEY = "state";

/** Tech sheet drafts (see src/lib/techSheet.ts) — added in v3, one record per draft keyed by its
 * id, unlike the single-record stores above: drafts are independent and each carries its own
 * photos, so saving one never has to rewrite the others. */
const TECH_SHEETS_STORE_NAME = "techSheets";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
      if (!req.result.objectStoreNames.contains(WORKSPACE_STORE_NAME)) req.result.createObjectStore(WORKSPACE_STORE_NAME);
      if (!req.result.objectStoreNames.contains(TECH_SHEETS_STORE_NAME)) req.result.createObjectStore(TECH_SHEETS_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** The pieces of gear (GearItem[]), next to the profiles in the same store -- added without a
 * version bump: a browser that has profiles but no items record yet moves its gear sets' gear into
 * items the first time it loads (see loadMyGear). */
const ITEMS_RECORD_KEY = "items";

function getRecord<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Profiles and items in one transaction, so a set never points at an item that wasn't saved. */
function putMyGearRecords(db: IDBDatabase, gear: MyGear): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(gear.profiles, RECORD_KEY);
    tx.objectStore(STORE_NAME).put(gear.items, ITEMS_RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** One-time read of the old localStorage-based store — used only to migrate a returning user's
 * data into IndexedDB the first time loadGarage() finds nothing there yet. */
function readLegacyLocalStorage(): GarageProfile[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** A fresh, collision-free id — used both for brand-new profiles and to re-key an imported profile so importing never overwrites an existing one with the same id (e.g. re-importing a file you already have saved). */
export function freshGarageId(): string {
  return newId();
}

export function newGarageProfile(name: string): GarageProfile {
  const now = new Date().toISOString();
  return { id: newId(), name, createdAt: now, updatedAt: now, entries: {} };
}

/**
 * One piece of gear the driver owns -- a helmet, a HANS, a seat -- on its own in My Gear, whether or
 * not a gear set uses it. Gear sets link items by id (GarageProfile.itemIds), so the same helmet in
 * two sets is one item: editing it, or its tech sticker, shows in both.
 */
export interface GearItem {
  id: string;
  category: EquipmentCategory;
  /** The driver's own name for it ("White Bell HP7"), to tell two helmets apart. */
  name?: string;
  entry: EquipmentEntry;
  createdAt: string;
  updatedAt: string;
}

/** The categories that are pieces of gear of their own: the driver's personal gear, seat, harness
 * and window net (per occupant), and the fire extinguisher and suppression system (they get tech
 * stickers). The rest (fuel cell, kill switch, cage...) belongs to the car, so stays in its set. */
export const GEAR_ITEM_CATEGORIES: EquipmentCategory[] = [...PER_OCCUPANT_CATEGORIES, "fire_extinguisher", "fire_suppression"];
export const isGearItemCategory = (c: EquipmentCategory) => GEAR_ITEM_CATEGORIES.includes(c);

export function newGearItem(category: EquipmentCategory, entry: EquipmentEntry = { category }): GearItem {
  const now = new Date().toISOString();
  return { id: newId(), category, entry, createdAt: now, updatedAt: now };
}

export interface MyGear {
  /** As stored (see GarageProfile.entries). */
  profiles: GarageProfile[];
  items: GearItem[];
}

/** JSON with every object's keys in order, to compare two entries (or a server's jsonb) by content. */
export function stableJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableJson).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stableJson(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

/** A stored gear set with its items' entries filled in -- what every checker, tech sheet and export reads. */
export function resolveProfile(p: GarageProfile, items: GearItem[] | Map<string, GearItem>): GarageProfile {
  const byId = items instanceof Map ? items : new Map(items.map((i) => [i.id, i]));
  const fill = (entries: Entries | undefined, ids: ItemIds | undefined): Entries => {
    const out: Entries = { ...(entries ?? {}) };
    for (const [c, id] of Object.entries(ids ?? {}) as [EquipmentCategory, string][]) {
      const item = byId.get(id);
      if (item) out[c] = item.entry;
    }
    return out;
  };
  return {
    ...p,
    entries: fill(p.entries, p.itemIds),
    codriverEntries: p.codriverEntries || p.codriverItemIds ? fill(p.codriverEntries, p.codriverItemIds) : undefined,
  };
}

/**
 * The other way: resolved gear sets back to stored ones plus their items. Each piece of gear's
 * entry goes to the item the set links for it -- updating the item when it differs from the item
 * as it was before this call (so another set's stale copy of a shared item can't undo the edit) --
 * or to a new item when nothing's linked yet. An entry that's emptied stays linked, so clearing a
 * field mid-edit doesn't split the item in two (pruneEmptyItems drops empty items later).
 *   dedupe: a new piece of gear identical to an item of the same category already in My Gear uses
 *   that item instead (moving to items, importing a file, saving from the checker) -- never while
 *   editing, where a half-typed entry could match some other item.
 */
export function absorb(resolved: GarageProfile[], items: GearItem[], opts: { dedupe?: boolean } = {}): MyGear {
  const before = new Map(items.map((i) => [i.id, i]));
  const after = new Map(before);
  const now = new Date().toISOString();
  const take = (category: EquipmentCategory, entry: EquipmentEntry, id: string | undefined): string | undefined => {
    const orig = id ? before.get(id) : undefined;
    if (orig && orig.category === category) {
      if (stableJson(orig.entry) !== stableJson(entry)) after.set(orig.id, { ...after.get(orig.id)!, entry, updatedAt: now });
      return orig.id;
    }
    if (isEntryEmpty(category, entry)) return undefined;
    if (opts.dedupe) {
      const json = stableJson(entry);
      for (const it of after.values()) if (it.category === category && stableJson(it.entry) === json) return it.id;
    }
    const item = newGearItem(category, entry);
    after.set(item.id, item);
    return item.id;
  };
  const split = (entries: Entries | undefined, ids: ItemIds | undefined) => {
    const rest: Entries = {};
    const outIds: ItemIds = {};
    for (const [c, e] of Object.entries(entries ?? {}) as [EquipmentCategory, EquipmentEntry | undefined][]) {
      if (!e) continue;
      if (!isGearItemCategory(c)) {
        rest[c] = e;
        continue;
      }
      const id = take(c, e, ids?.[c]);
      if (id) outIds[c] = id;
    }
    return { rest, ids: outIds };
  };
  const profiles = resolved.map((p) => {
    const driver = split(p.entries, p.itemIds);
    const out: GarageProfile = { ...p, entries: driver.rest, itemIds: driver.ids };
    if (p.codriverEntries) {
      const codriver = split(p.codriverEntries, p.codriverItemIds);
      out.codriverEntries = codriver.rest;
      out.codriverItemIds = codriver.ids;
    } else {
      delete out.codriverItemIds;
    }
    return out;
  });
  return { profiles, items: [...after.values()] };
}

/** Drops the items with nothing entered (a piece of gear started and left empty, or emptied in a
 * set's editor), and every set's link to them. */
export function pruneEmptyItems(gear: MyGear): MyGear {
  const empty = new Set(gear.items.filter((i) => isEntryEmpty(i.category, i.entry)).map((i) => i.id));
  if (empty.size === 0) return gear;
  const keep = (ids: ItemIds | undefined) =>
    ids && (Object.fromEntries(Object.entries(ids).filter(([, id]) => !empty.has(id as string))) as ItemIds);
  return {
    items: gear.items.filter((i) => !empty.has(i.id)),
    profiles: gear.profiles.map((p) => ({ ...p, itemIds: keep(p.itemIds), codriverItemIds: keep(p.codriverItemIds) })),
  };
}

/** Takes an item out of every set that uses it (the item itself stays in My Gear). */
export function unlinkItem(profiles: GarageProfile[], itemId: string): GarageProfile[] {
  const drop = (ids: ItemIds | undefined) => ids && (Object.fromEntries(Object.entries(ids).filter(([, id]) => id !== itemId)) as ItemIds);
  return profiles.map((p) =>
    Object.values(p.itemIds ?? {}).includes(itemId) || Object.values(p.codriverItemIds ?? {}).includes(itemId)
      ? { ...p, itemIds: drop(p.itemIds), codriverItemIds: drop(p.codriverItemIds), updatedAt: new Date().toISOString() }
      : p
  );
}

/**
 * Reads My Gear from IndexedDB: the gear sets as stored, and the pieces of gear. Empty if nothing is
 * saved yet, or the stored data is corrupt/unavailable (e.g. a browser with IndexedDB disabled).
 *
 * The first time this finds no profiles record, it checks the old localStorage-based store for a
 * returning user's data, migrates it into IndexedDB, and — only once that write actually succeeds
 * — clears the old localStorage key so the space is freed. If the IndexedDB write fails, the
 * localStorage copy is left in place rather than risk losing it. The first time it finds no items
 * record, it moves each set's gear into items (the same helmet in two sets becoming one item).
 */
export async function loadMyGear(): Promise<MyGear> {
  let profiles: GarageProfile[] | undefined;
  let items: GearItem[] | undefined;
  try {
    const db = await openDb();
    profiles = await getRecord<GarageProfile[]>(db, RECORD_KEY);
    items = await getRecord<GearItem[]>(db, ITEMS_RECORD_KEY);
    db.close();
  } catch {
    return { profiles: [], items: [] };
  }
  const legacy = profiles ? null : readLegacyLocalStorage();
  if (items && profiles) return pruneEmptyItems({ profiles, items });

  const moved = absorb(profiles ?? legacy ?? [], items ?? [], { dedupe: true });
  if ((await saveMyGear(moved)) && legacy?.length) window.localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  return moved;
}

/** Every gear set, resolved (its pieces of gear filled in) — for the checker and tech sheets. */
export async function loadGarage(): Promise<GarageProfile[]> {
  const { profiles, items } = await loadMyGear();
  const byId = new Map(items.map((i) => [i.id, i]));
  return profiles.map((p) => resolveProfile(p, byId));
}

/** Chains every saveGarage() write onto the previous one so they land in IndexedDB in the same
 * order they were called, no matter how their underlying promises happen to resolve. Without this,
 * two writes fired in quick succession (e.g. two profiles-state updates in the same tick) could
 * finish out of order and leave the *older* one as what's actually persisted. localStorage's
 * setItem was synchronous, so this couldn't happen before the IndexedDB migration. */
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Returns whether the write actually succeeded. Storage can fail (quota exceeded is far less
 * likely under IndexedDB than it was under localStorage, but browsers can still refuse — private
 * browsing, a disk that's actually full, IndexedDB disabled) while React state updates happily
 * regardless, so a caller that ignores this return value will show the change in the UI right up
 * until the next reload silently reverts it. Callers should surface a failure to the user
 * immediately, before they navigate away or close the tab.
 */
export function saveMyGear(gear: MyGear): Promise<boolean> {
  const outcome = writeQueue.then(async (): Promise<boolean> => {
    try {
      const db = await openDb();
      await putMyGearRecords(db, gear);
      db.close();
      return true;
    } catch {
      return false;
    }
  });
  writeQueue = outcome.then(
    () => undefined,
    () => undefined
  );
  return outcome;
}

/** Saves resolved gear sets (as loadGarage() gives them, edited): their gear goes to their items —
 * see absorb. Items no set uses stay in My Gear. Same return value as saveMyGear. */
export async function saveGarage(profiles: GarageProfile[]): Promise<boolean> {
  const { items } = await loadMyGear();
  return saveMyGear(absorb(profiles, items, { dedupe: true }));
}

/** How many categories in a profile actually have data — shown in the profile list so an empty/skeleton profile is visually distinguishable from one that's actually filled in. */
export function countFilledCategories(profile: GarageProfile, isEmpty: (category: EquipmentCategory, entry: EquipmentEntry | undefined) => boolean): number {
  return (Object.keys(profile.entries) as EquipmentCategory[]).filter((c) => !isEmpty(c, profile.entries[c])).length;
}

export function exportGarageToJson(profiles: GarageProfile[]): string {
  return JSON.stringify({ passtechGarageExport: 1, exportedAt: new Date().toISOString(), profiles }, null, 2);
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "gear-set";
}

/** Export filename — includes the gear set's own name (slugified) when exporting a single profile, otherwise a generic "my-gear" name for a full multi-profile backup. */
export function garageExportFilename(profileName?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return profileName ? `passtech-gear-${slugify(profileName)}-${date}.json` : `passtech-my-gear-${date}.json`;
}

/** Parses a previously-exported garage file. Throws with a user-presentable message on anything that doesn't look like a valid export. */
export function parseGarageImport(json: string): GarageProfile[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const profiles = (parsed as { profiles?: unknown })?.profiles;
  if (!Array.isArray(profiles)) throw new Error("That file doesn't look like a PassTech My Gear export.");
  return profiles.filter(
    (p): p is GarageProfile => p && typeof p === "object" && typeof p.id === "string" && typeof p.name === "string" && typeof p.entries === "object"
  );
}

interface WorkspaceMissingReport {
  category: EquipmentCategory;
  label: string;
  reportedAt: string;
}

/**
 * The "resume where I left off" snapshot of the checker workspace (as opposed to a named,
 * intentionally-saved GarageProfile) — everything page.tsx needs to restore on the next visit.
 * Used to live as one JSON blob in localStorage; moved to IndexedDB for the same reason the garage
 * store was (see LEGACY_LOCALSTORAGE_KEY above) — a few photo-heavy gear sets loaded into the
 * workspace routinely blew past localStorage's ~5-10MB quota and crashed the app outright.
 */
export interface WorkspaceState {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  codriverEntries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  hasCodriver: boolean;
  carPhotoDataUrl?: string;
  carNote?: string;
  rulesetId: string;
  classId?: string;
  mode: string;
  missingReports: WorkspaceMissingReport[];
  onlyHaveEquipment: boolean;
  hideNotRequired: boolean;
  activeGroups: string[];
  activeDisciplines: string[];
}

/** Pre-IndexedDB storage location for the workspace snapshot — same one-time-migration-then-never-
 * written-again treatment as LEGACY_LOCALSTORAGE_KEY above. */
const LEGACY_WORKSPACE_LOCALSTORAGE_KEY = "safety-gear-check:v2";

function getWorkspaceRecord(db: IDBDatabase): Promise<WorkspaceState | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(WORKSPACE_STORE_NAME, "readonly").objectStore(WORKSPACE_STORE_NAME).get(WORKSPACE_RECORD_KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putWorkspaceRecord(db: IDBDatabase, state: WorkspaceState): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKSPACE_STORE_NAME, "readwrite");
    tx.objectStore(WORKSPACE_STORE_NAME).put(state, WORKSPACE_RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function readLegacyWorkspaceLocalStorage(): WorkspaceState | undefined {
  try {
    const raw = window.localStorage.getItem(LEGACY_WORKSPACE_LOCALSTORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkspaceState) : undefined;
  } catch {
    return undefined;
  }
}

/** Same migrate-once-then-clear treatment as loadGarage() — see its comment. */
export async function loadWorkspace(): Promise<WorkspaceState | undefined> {
  try {
    const db = await openDb();
    const existing = await getWorkspaceRecord(db);
    db.close();
    if (existing) return existing;
  } catch {
    return undefined;
  }

  const legacy = readLegacyWorkspaceLocalStorage();
  if (legacy && (await saveWorkspace(legacy))) {
    window.localStorage.removeItem(LEGACY_WORKSPACE_LOCALSTORAGE_KEY);
  }
  return legacy;
}

/** Own write-queue, independent of saveGarage()'s — see its comment for why one's needed at all;
 * these two write streams target different stores so there's no ordering relationship between them
 * to preserve, just within each one's own sequence of calls. */
let workspaceWriteQueue: Promise<void> = Promise.resolve();

/** Fire-and-forget from the caller's point of view (unlike saveGarage(), whose callers must check
 * the result) — this is a convenience snapshot, not the record of truth, so a failed write here
 * just means the next visit resumes from an older point rather than losing anything a user
 * intentionally saved. */
export function saveWorkspace(state: WorkspaceState): Promise<boolean> {
  const outcome = workspaceWriteQueue.then(async (): Promise<boolean> => {
    try {
      const db = await openDb();
      await putWorkspaceRecord(db, state);
      db.close();
      return true;
    } catch {
      return false;
    }
  });
  workspaceWriteQueue = outcome.then(
    () => undefined,
    () => undefined
  );
  return outcome;
}

export async function clearWorkspace(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(WORKSPACE_STORE_NAME, "readwrite");
      tx.objectStore(WORKSPACE_STORE_NAME).delete(WORKSPACE_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore — worst case the next visit resumes from the last successfully-saved snapshot
  }
}

const PREFERENCES_LOCALSTORAGE_KEY = "safety-gear-check:preferences:v1";

/** Standalone user preferences — small enough (a ruleset id, optional class id, and per-discipline
 * ruleset-id arrays) to live directly in localStorage like TOURS_SEEN_KEY in page.tsx, unlike
 * GarageProfile/WorkspaceState which moved to IndexedDB only because of base64 photo payloads. */
export interface UserPreferences {
  preferredRulesetId?: string;
  preferredClassId?: string;
  /** Explicit allow-list of ruleset ids per discipline. An ABSENT key means "unrestricted" (every
   * ruleset in that discipline counts as preferred, including ones added to the data set later) —
   * only an explicit array (even []) narrows it. Never store an array covering every id currently
   * in the group; delete the key instead, so future new rulesets in that discipline default to
   * included rather than silently excluded. */
  preferredBodiesByDiscipline?: Partial<Record<DisciplineGroup, string[]>>;
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_LOCALSTORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserPreferences) : {};
  } catch {
    return {};
  }
}

export function savePreferences(preferences: UserPreferences): void {
  try {
    window.localStorage.setItem(PREFERENCES_LOCALSTORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // ignore — worst case the preference silently doesn't persist across reloads
  }
}

export function isRulesetPreferred(rs: Ruleset, preferences: UserPreferences): boolean {
  const allowed = preferences.preferredBodiesByDiscipline?.[rs.disciplineGroup];
  return !allowed || allowed.includes(rs.id);
}

/** Pure helper for the per-discipline checkbox UI: flips one ruleset's membership in
 * preferredBodiesByDiscipline[group]. allIdsInGroup is every ruleset id currently in that
 * discipline — used both to materialize an explicit list when the group was previously
 * unrestricted, and to collapse back to "unrestricted" when the toggle produces the full set
 * again. */
export function toggleRulesetPreference(
  preferences: UserPreferences,
  group: DisciplineGroup,
  rulesetId: string,
  allIdsInGroup: string[]
): UserPreferences {
  const current = preferences.preferredBodiesByDiscipline?.[group] ?? allIdsInGroup;
  const next = current.includes(rulesetId) ? current.filter((id) => id !== rulesetId) : [...current, rulesetId];
  const byDiscipline = { ...preferences.preferredBodiesByDiscipline };
  if (next.length === allIdsInGroup.length) delete byDiscipline[group];
  else byDiscipline[group] = next;
  return { ...preferences, preferredBodiesByDiscipline: byDiscipline };
}

/** Select all (ids = undefined, deletes the key → unrestricted) / Deselect all (ids = []) for one
 * discipline's row. */
export function setDisciplinePreference(preferences: UserPreferences, group: DisciplineGroup, ids: string[] | undefined): UserPreferences {
  const byDiscipline = { ...preferences.preferredBodiesByDiscipline };
  if (ids === undefined) delete byDiscipline[group];
  else byDiscipline[group] = ids;
  return { ...preferences, preferredBodiesByDiscipline: byDiscipline };
}

/** Every saved tech sheet draft, newest first. Empty when nothing is saved or IndexedDB is unavailable. */
export async function loadTechSheetDrafts<T extends { updatedAt: string }>(): Promise<T[]> {
  try {
    const db = await openDb();
    const all = await new Promise<T[]>((resolve, reject) => {
      const req = db.transaction(TECH_SHEETS_STORE_NAME, "readonly").objectStore(TECH_SHEETS_STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

/** Same ordered write-queue treatment as saveGarage() — see its comment. */
let techSheetWriteQueue: Promise<void> = Promise.resolve();

/** Returns whether the write succeeded — callers should surface a failure (storage full). */
export function saveTechSheetDraft<T extends { id: string }>(draft: T): Promise<boolean> {
  const outcome = techSheetWriteQueue.then(async (): Promise<boolean> => {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(TECH_SHEETS_STORE_NAME, "readwrite");
        tx.objectStore(TECH_SHEETS_STORE_NAME).put(draft, draft.id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
      return true;
    } catch {
      return false;
    }
  });
  techSheetWriteQueue = outcome.then(
    () => undefined,
    () => undefined
  );
  return outcome;
}

export function deleteTechSheetDraft(id: string): Promise<boolean> {
  const outcome = techSheetWriteQueue.then(async (): Promise<boolean> => {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(TECH_SHEETS_STORE_NAME, "readwrite");
        tx.objectStore(TECH_SHEETS_STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      return true;
    } catch {
      return false;
    }
  });
  techSheetWriteQueue = outcome.then(
    () => undefined,
    () => undefined
  );
  return outcome;
}
