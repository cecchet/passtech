import { EquipmentCategory } from "@/data/types";
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

const GARAGE_STORAGE_KEY = "safety-gear-check:garage:v1";

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

/** Reads all saved profiles from localStorage. Returns an empty array if nothing is saved yet, or the stored data is corrupt/unavailable. */
export function loadGarage(): GarageProfile[] {
  try {
    const raw = window.localStorage.getItem(GARAGE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGarage(profiles: GarageProfile[]): void {
  try {
    window.localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Storage full or unavailable — the caller's in-memory state still reflects the attempted
    // change, but it won't survive a reload. Nothing actionable to do here without a UI redesign.
  }
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
