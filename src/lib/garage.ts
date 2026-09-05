import { DisciplineGroup, EquipmentCategory, Ruleset } from "@/data/types";
import { EquipmentEntry } from "@/lib/matcher";

/** A saved, named set of gear the driver owns — independent of any sanctioning body. Loaded into the checker's entries when the driver wants to check it against a specific body. */
export interface GarageProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
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
const DB_VERSION = 2;
const STORE_NAME = "garage";
/** The whole profiles array is stored as one record under this fixed key — same shape the app has
 * always worked with (load the full array, mutate it in React state, save the full array back),
 * just moved to a store with a much higher quota than localStorage's ~5-10MB per origin. */
const RECORD_KEY = "profiles";

/** The current-workspace "resume where I left off" snapshot (see WorkspaceState) — added in v2,
 * alongside the v1 garage store, so a browser already on v1 upgrades in place. */
const WORKSPACE_STORE_NAME = "workspace";
const WORKSPACE_RECORD_KEY = "state";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
      if (!req.result.objectStoreNames.contains(WORKSPACE_STORE_NAME)) req.result.createObjectStore(WORKSPACE_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getProfilesRecord(db: IDBDatabase): Promise<GarageProfile[] | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(RECORD_KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putProfilesRecord(db: IDBDatabase, profiles: GarageProfile[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(profiles, RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
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
 * Reads all saved profiles from IndexedDB. Returns an empty array if nothing is saved yet, or the
 * stored data is corrupt/unavailable (e.g. a browser with IndexedDB disabled).
 *
 * The first time this finds no IndexedDB record, it checks the old localStorage-based store for a
 * returning user's data, migrates it into IndexedDB, and — only once that write actually succeeds
 * — clears the old localStorage key so the space is freed. If the IndexedDB write fails, the
 * localStorage copy is left in place rather than risk losing it.
 */
export async function loadGarage(): Promise<GarageProfile[]> {
  try {
    const db = await openDb();
    const existing = await getProfilesRecord(db);
    db.close();
    if (existing) return existing;
  } catch {
    return [];
  }

  const legacy = readLegacyLocalStorage();
  if (legacy.length > 0 && (await saveGarage(legacy))) {
    window.localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  }
  return legacy;
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
export function saveGarage(profiles: GarageProfile[]): Promise<boolean> {
  const outcome = writeQueue.then(async (): Promise<boolean> => {
    try {
      const db = await openDb();
      await putProfilesRecord(db, profiles);
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
