"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryGroup, EquipmentCategory, Occupant } from "@/data/types";
import { EquipmentForm } from "@/components/EquipmentForm";
import { AutomaticGearImport } from "@/components/AutomaticGearImport";
import { SanctioningBodyPreferences } from "@/components/SanctioningBodyPreferences";
import { GearItems, myGearSlot } from "@/components/GearItems";
import { EquipmentEntry, isEntryEmpty } from "@/lib/matcher";
import { computeGearExpiryWarnings, formatGearExpiryWarning } from "@/lib/gearExpiration";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { ZoomableThumb } from "@/components/ZoomableThumb";
import { ExportButton, downloadJson, shrinkEntryPhotos, shrinkPhoto } from "@/components/ExportButton";
import {
  GarageProfile,
  GearItem,
  MyGear,
  UserPreferences,
  absorb,
  addImportedItems,
  profileItemIds,
  withoutItemLinks,
  countFilledCategories,
  exportGarageToJson,
  freshGarageId,
  garageExportFilename,
  loadMyGear,
  newGarageProfile,
  parseGarageImport,
  parseGearItemsImport,
  pruneEmptyItems,
  resolveProfile,
  saveMyGear,
  unlinkItem,
} from "@/lib/garage";

const ALL_GROUPS = new Set<CategoryGroup>(["driver", "car", "rollcage"]);

const buttonClass = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";

/** Every photo in a profile (car photo + every entry's, driver and codriver) at a smaller size —
 * used when exporting without "include high-resolution photos", to keep the export file small.
 * Only affects the exported copy; what's actually stored in IndexedDB is untouched. */
async function shrinkProfilePhotos(p: GarageProfile): Promise<GarageProfile> {
  const shrinkEntries = async (
    entries: Partial<Record<EquipmentCategory, EquipmentEntry>>
  ): Promise<Partial<Record<EquipmentCategory, EquipmentEntry>>> => {
    const out: Partial<Record<EquipmentCategory, EquipmentEntry>> = {};
    for (const category of Object.keys(entries) as EquipmentCategory[]) {
      const entry = entries[category];
      if (entry) out[category] = await shrinkEntryPhotos(entry);
    }
    return out;
  };

  return {
    ...p,
    carPhotoDataUrl: p.carPhotoDataUrl ? await shrinkPhoto(p.carPhotoDataUrl) : p.carPhotoDataUrl,
    entries: await shrinkEntries(p.entries),
    codriverEntries: p.codriverEntries ? await shrinkEntries(p.codriverEntries) : p.codriverEntries,
  };
}

/** The order the list's photo-preview thumbnails prioritize a driver's own gear categories in —
 * the pieces most useful for recognizing a gear set at a glance. Everything else (remaining
 * photos in these categories, other categories, codriver photos) still appears, just after these. */
const PHOTO_PREVIEW_PRIORITY: EquipmentCategory[] = ["firesuit", "helmet", "hnr", "gloves", "shoes", "seat", "belts_harness"];

/** Every photo attached to a gear set — the car photo, then the driver's own gear in
 * PHOTO_PREVIEW_PRIORITY order (one photo per category), then everything else (remaining photos in
 * those same categories, other categories, and codriver photos) — flattened for the list's
 * photo-preview thumbnails. */
function collectProfilePhotos(p: GarageProfile): string[] {
  const priority: string[] = [];
  const rest: string[] = [];
  if (p.carPhotoDataUrl) priority.push(p.carPhotoDataUrl);

  for (const category of PHOTO_PREVIEW_PRIORITY) {
    const first = p.entries[category]?.photoDataUrls?.[0];
    if (first) priority.push(first);
  }

  const addRemaining = (entries: GarageProfile["entries"] | undefined, prioritized: boolean) => {
    if (!entries) return;
    (Object.keys(entries) as EquipmentCategory[]).forEach((category) => {
      const urls = entries[category]?.photoDataUrls;
      if (!urls) return;
      const skipFirst = prioritized && PHOTO_PREVIEW_PRIORITY.includes(category);
      urls.forEach((url, i) => {
        if (skipFirst && i === 0) return;
        rest.push(url);
      });
    });
  };
  addRemaining(p.entries, true);
  addRemaining(p.codriverEntries, false);

  return [...priority, ...rest];
}

export function GarageManager({
  onLoadProfile,
  onBlockNavChange,
  initialActionMenuId,
  onInitialActionMenuConsumed,
  preferences,
  onPreferencesChange,
}: {
  /** target: "body-first" loads into Option 2 (check against one body); "equipment-first" loads into Option 3 (check against every body at once). */
  onLoadProfile: (profile: GarageProfile, target: "body-first" | "equipment-first") => void;
  /** Reports whether My Gear is currently mid-way through creating a new gear set (mode choice or Automatic mode), so the page-level "Back to main menu" can be disabled — Cancel/Save to My Gear are meant to be the only two ways out of that flow. */
  onBlockNavChange?: (blocked: boolean) => void;
  /** A gear set to reopen (action menu expanded) as soon as this mounts — set by the page right before navigating back here from body-first/equipment-first, so returning to My Gear lands back on the same gear set instead of a blank list. */
  initialActionMenuId?: string | null;
  /** Called once right after initialActionMenuId has been applied, so the page can clear it — otherwise the same gear set would keep reopening on every future visit to My Gear, even unrelated ones. */
  onInitialActionMenuConsumed?: () => void;
  /** The "My preferred sanctioning bodies" settings, owned by the page (read by both this panel and the body-first/equipment-first flows). */
  preferences: UserPreferences;
  onPreferencesChange: (next: UserPreferences) => void;
}) {
  /** The gear sets as stored (their pieces of gear linked by id) and the pieces of gear. */
  const [gear, setGear] = useState<MyGear>({ profiles: [], items: [] });
  const profiles = gear.profiles;
  const items = gear.items;
  const setProfiles = (fn: (prev: GarageProfile[]) => GarageProfile[]) => setGear((g) => ({ ...g, profiles: fn(g.profiles) }));
  /** Every gear set with its pieces of gear filled in -- what's shown, checked and exported. */
  const resolved = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    return profiles.map((p) => resolveProfile(p, byId));
  }, [profiles, items]);
  /** Whether the "Add a piece of gear" picker is showing. */
  const [pickingItem, setPickingItem] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  /** A just-created profile still showing the "Automatic mode or Manual mode?" choice, before any name/gear has been entered. */
  const [modeChoiceId, setModeChoiceId] = useState<string | null>(null);
  /** Set only when Automatic mode was chosen for a brand-new profile — hides the rest of the editor (name/photo/codriver/manual form) until the import is done, so the upload prompt is the only thing shown. The full editor (new-via-Manual-mode, or editing an existing set) always shows the Automatic-mode upload panel inline instead, no toggle needed. */
  const [autoImportFocusedId, setAutoImportFocusedId] = useState<string | null>(null);
  /** True when the most recent write to localStorage failed (almost always quota exceeded — profiles carry base64 photo data). React state still has the change, but it's only in memory until this clears — surfaced as a persistent banner rather than left silent, which used to mean a change could look saved and then vanish on the next reload. */
  const [storageError, setStorageError] = useState(false);
  /** Which saved profile's action menu (Edit/pass-tech/race-check/export/delete) is currently expanded in the list, if any — collapsed by default so the list just shows a photo preview + name per gear set. Seeded from initialActionMenuId so returning from body-first/equipment-first reopens the same gear set. */
  const [actionMenuId, setActionMenuId] = useState<string | null>(initialActionMenuId ?? null);
  /** A snapshot of the profile as it was right when "Edit this gear set" was clicked — edits still write straight through live (same as everywhere else in this app), but Cancel restores this snapshot over whatever was changed, so it actually discards the edit session instead of just closing the view on top of already-committed changes. Unset for a brand-new profile (that flow's own Cancel just deletes the profile outright — see cancelNewProfile). */
  const [editSnapshot, setEditSnapshot] = useState<{ profile: GarageProfile | null; items: GearItem[] } | null>(null);
  /** True once the user has clicked Cancel on an edit session that actually has unsaved changes — arms the "discard changes?" two-step confirmation instead of cancelling immediately. */
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  // One-time client-side hydration from IndexedDB — async, so the state set here happens inside
  // the .then() callback, not synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    loadMyGear().then((loaded) => {
      if (cancelled) return;
      setGear(loaded);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // initialActionMenuId only ever needs to be applied once, right at mount (see the useState
  // initializer above) — this just tells the page it's been consumed, so it doesn't keep reopening
  // the same gear set on every later, unrelated visit to My Gear.
  useEffect(() => {
    if (initialActionMenuId) onInitialActionMenuConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Syncs UI state to whether the last IndexedDB write actually succeeded, not derivable from
  // props/state alone.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    saveMyGear(gear).then((ok) => {
      if (!cancelled) setStorageError(!ok);
    });
    return () => {
      cancelled = true;
    };
  }, [gear, hydrated]);

  // Reports "a gear set is open" up to the page so it can disable the global Back to main menu
  // button — covers the mode-choice screen, Automatic mode, and now editing an existing gear set
  // too, since all three set selectedId (modeChoiceId/autoImportFocusedId are always a subset of
  // it — never set without selectedId also being set). Cleans up on unmount too, in case this
  // component ever goes away while still mid-flow.
  useEffect(() => {
    onBlockNavChange?.(selectedId !== null);
    return () => onBlockNavChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  /** The open gear set, resolved (its pieces of gear filled in). */
  const selected = resolved.find((p) => p.id === selectedId) ?? null;
  const selectedStored = profiles.find((p) => p.id === selectedId) ?? null;

  // Whether the profile (or a piece of its gear) has actually changed since editing started —
  // drives both the Cancel confirmation and the Update button's highlight. Only meaningful while
  // editing an existing profile (editSnapshot.profile is unset for a brand-new one; see startEditing).
  const hasUnsavedEdits =
    editSnapshot?.profile != null && selected !== null && JSON.stringify(selected) !== JSON.stringify(resolveProfile(editSnapshot.profile, editSnapshot.items));

  /** Name, car photo/note, codriver toggle: the set's own fields. */
  const updateSelected = (patch: Partial<GarageProfile>) => {
    if (!selected) return;
    setProfiles((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  /** Its gear (entries / codriverEntries, resolved): pieces of gear go to their items — the linked
   * one, updated wherever else it's used, or a new one in My Gear (see absorb). */
  // A function of the set as it is when the update runs, so several changes in one go (Automatic
  // mode confirming a few items) each build on the last.
  const updateSelectedGear = (patch: (current: GarageProfile) => Partial<GarageProfile>) => {
    if (!selectedId) return;
    setGear((g) => {
      const stored = g.profiles.find((p) => p.id === selectedId);
      if (!stored) return g;
      const current = resolveProfile(stored, g.items);
      const out = absorb([{ ...current, ...patch(current), updatedAt: new Date().toISOString() }], g.items);
      return { items: out.items, profiles: g.profiles.map((p) => (p.id === selectedId ? out.profiles[0] : p)) };
    });
  };
  const setSelectedEntry = (category: EquipmentCategory, entry: EquipmentEntry) =>
    updateSelectedGear((current) => ({ entries: { ...current.entries, [category]: entry } }));
  const setSelectedCodriverEntry = (category: EquipmentCategory, entry: EquipmentEntry) =>
    updateSelectedGear((current) => ({ codriverEntries: { ...(current.codriverEntries ?? {}), [category]: entry } }));

  /** Puts a piece of gear from My Gear in a set's seat (or, itemId undefined, takes it out). A fire
   * extinguisher joins the set's others instead. */
  const linkItem = (profileId: string, occupant: Occupant, category: EquipmentCategory, itemId: string | undefined) => {
    const key = occupant === "driver" ? "itemIds" : "codriverItemIds";
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== profileId) return p;
        if (category === "fire_extinguisher") {
          const list = p.extinguisherItemIds ?? [];
          return itemId && !list.includes(itemId) ? { ...p, extinguisherItemIds: [...list, itemId], updatedAt: new Date().toISOString() } : p;
        }
        const ids = { ...(p[key] ?? {}) };
        if (itemId) ids[category] = itemId;
        else delete ids[category];
        const entries = occupant === "driver" ? { ...p.entries } : { ...(p.codriverEntries ?? {}) };
        delete entries[category];
        return { ...p, [key]: ids, ...(occupant === "driver" ? { entries } : { codriverEntries: entries }), updatedAt: new Date().toISOString() };
      })
    );
  };

  /** The selected set's cards, per seat: pick a piece of gear already in My Gear (see myGearSlot). */
  const pickFromMyGear = (occupant: Occupant) => (category: EquipmentCategory) =>
    selectedStored
      ? myGearSlot({ profile: selectedStored, items, profiles, occupant, category, onSet: (itemId) => linkItem(selectedStored.id, occupant, category, itemId) })
      : undefined;

  const createProfile = () => {
    const profile = newGarageProfile("Untitled gear set");
    setEditSnapshot({ profile: null, items });
    setProfiles((prev) => [...prev, profile]);
    setSelectedId(profile.id);
    setModeChoiceId(profile.id);
  };

  const chooseManualMode = () => setModeChoiceId(null);

  const chooseAutomaticMode = (id: string) => {
    setModeChoiceId(null);
    setAutoImportFocusedId(id);
  };

  // Backing out of the mode-choice screen, or Cancel from Automatic mode's focused view — deletes
  // the profile outright (rather than just clearing the UI state), which is what actually makes
  // Cancel mean "discard everything entered so far": items confirmed during Automatic mode are
  // written straight into the profile as they're confirmed (same as the rest of manual editing
  // does), so the only way to make them not count is to remove the profile that holds them.
  const cancelNewProfile = (id: string) => {
    // Its gear went into My Gear as it was entered: the items as they were before it go back too.
    const before = editSnapshot?.items;
    setGear((g) => ({ items: before ?? g.items, profiles: g.profiles.filter((p) => p.id !== id) }));
    setEditSnapshot(null);
    setModeChoiceId(null);
    setAutoImportFocusedId(null);
    setSelectedId(null);
  };

  // Save to My Gear from Automatic mode's focused view — everything confirmed so far is already
  // written into the profile, so this just leaves the focused Automatic-mode view and returns to
  // the list.
  const saveNewProfile = () => {
    setGear((g) => pruneEmptyItems(g));
    setEditSnapshot(null);
    setAutoImportFocusedId(null);
    setSelectedId(null);
  };

  const startEditing = (p: GarageProfile) => {
    const stored = profiles.find((x) => x.id === p.id);
    if (!stored) return;
    setActionMenuId(null);
    setEditSnapshot({ profile: structuredClone(stored), items: structuredClone(items) });
    setConfirmingCancel(false);
    setSelectedId(p.id);
  };

  // Cancel while editing an already-saved gear set — restores the snapshot taken when editing
  // started, discarding whatever was changed since (edits themselves still write straight through
  // live, same as everywhere else in this app, so this is what makes Cancel actually mean "undo
  // this editing session" rather than just closing the view on top of already-committed changes).
  const cancelEdit = () => {
    // A brand-new set (Manual mode) has no snapshot to go back to: Cancel discards it.
    if (editSnapshot && !editSnapshot.profile && selectedId) return cancelNewProfile(selectedId);
    const snap = editSnapshot?.profile;
    if (snap && editSnapshot) {
      setGear((g) => ({ items: editSnapshot.items, profiles: g.profiles.map((p) => (p.id === snap.id ? snap : p)) }));
    }
    setEditSnapshot(null);
    setConfirmingCancel(false);
    // Reopens the gear set's action menu in the list, same as the reopen behavior returning from
    // body-first/equipment-first — so leaving the editor doesn't drop you back on a blank list.
    setActionMenuId(selectedId);
    setSelectedId(null);
  };

  // Cancel is only destructive when there's actually something to lose — an untouched view can
  // just close. Mirrors the two-step arm/confirm pattern used for Delete elsewhere in this file
  // (see deleteProfile) rather than window.confirm(), for the same reason: confirm() dialogs are
  // unreliable in an installed-PWA/standalone context.
  const requestCancelEdit = () => {
    if (hasUnsavedEdits) {
      setConfirmingCancel(true);
    } else {
      cancelEdit();
    }
  };

  // Update this gear / just navigating away from an existing gear set's editor — everything is
  // already live-saved, so this only needs to clear the editing UI state.
  const finishEditing = () => {
    setGear((g) => pruneEmptyItems(g));
    setEditSnapshot(null);
    setConfirmingCancel(false);
    // Reopens the gear set's action menu in the list, same as the reopen behavior returning from
    // body-first/equipment-first — so leaving the editor doesn't drop you back on a blank list.
    setActionMenuId(selectedId);
    setSelectedId(null);
  };

  // Two-step delete (click once to arm, again to confirm) instead of window.confirm — browser
  // confirm() dialogs are unreliable when this app is running as an installed PWA in standalone
  // mode on some platforms, where they can be silently suppressed, making delete look broken.
  // withGear also removes the set's pieces of gear from My Gear, except those another set still uses.
  const deleteProfile = (id: string, withGear = false) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setGear((g) => {
      const profiles = g.profiles.filter((p) => p.id !== id);
      if (!withGear) return { ...g, profiles };
      const ids = (p: GarageProfile | undefined) => (p ? profileItemIds(p) : []);
      const stillUsed = new Set(profiles.flatMap(ids));
      const gone = new Set(ids(g.profiles.find((p) => p.id === id)).filter((i) => i && !stillUsed.has(i)));
      return { ...g, profiles, items: g.items.filter((i) => !gone.has(i.id)) };
    });
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
  };

  /** Exports the resolved set (self-contained: its gear in it), without its links to this browser's items. */
  const handleExportProfile = async (resolvedProfile: GarageProfile, includeHighRes: boolean) => {
    const profile = withoutItemLinks(resolvedProfile);
    const exportProfile = includeHighRes ? profile : await shrinkProfilePhotos(profile);
    downloadJson(exportGarageToJson([exportProfile]), garageExportFilename(profile.name));
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseGarageImport(text);
      // A piece of gear exported on its own: it joins My Gear.
      const importedItems = parseGearItemsImport(text);
      if (imported.length === 0 && importedItems.length === 0) {
        setImportStatus("No gear sets or gear found in that file.");
        return;
      }
      if (imported.length === 0) {
        const out = addImportedItems(items, importedItems);
        setGear((g) => ({ ...g, items: addImportedItems(g.items, importedItems).items }));
        setImportStatus(
          out.added
            ? `Imported ${out.added} piece${out.added === 1 ? "" : "s"} of gear into My Gear.`
            : "That gear is already in My Gear."
        );
        return;
      }
      // Always import as new entries with fresh ids — never overwrite an existing gear set, even
      // one that happens to share an id (e.g. re-importing a file you already have saved).
      // Its gear joins My Gear, reusing an identical item already there (re-importing your own
      // export doesn't double every helmet).
      const asNew = imported.map((p) => ({ ...withoutItemLinks(p), id: freshGarageId() }));
      setGear((g) => {
        const out = absorb(asNew, g.items, { dedupe: true });
        return { items: out.items, profiles: [...g.profiles, ...out.profiles] };
      });
      setImportStatus(`Imported ${imported.length} gear set${imported.length === 1 ? "" : "s"}.`);
    } catch (e) {
      setImportStatus(e instanceof Error ? e.message : "That file couldn't be imported.");
    }
  };

  // Lets you pull in a codriver's own exported gear set (they'd export it from their own PassTech
  // garage the normal way — just their driver gear) and adopt it as your currently-open profile's
  // codriver gear, instead of it landing as a separate top-level gear set.
  const handleImportCodriverFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseGarageImport(text);
      if (imported.length === 0) {
        setImportStatus("No gear found in that file.");
        return;
      }
      updateSelectedGear(() => ({ hasCodriver: true, codriverEntries: { ...imported[0].entries }, codriverItemIds: undefined }));
      setImportStatus(`Imported "${imported[0].name}" as codriver gear — replaces any codriver gear already entered here.`);
    } catch (e) {
      setImportStatus(e instanceof Error ? e.message : "That file couldn't be imported.");
    }
  };

  const handleCarPhoto = async (file: File) => {
    const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
    updateSelected({ carPhotoDataUrl: dataUrl });
  };

  if (!hydrated) return null;

  return (
    <div>
      {storageError && (
        <div className="mb-4 rounded-lg border border-red-700 bg-red-950/60 p-3 text-sm text-red-200">
          <p className="font-semibold">⚠️ Your last change couldn&apos;t be saved — browser storage is full.</p>
          <p className="mt-1 text-red-300">
            It only exists in this tab right now and will be lost if you refresh or close it. Free up space first — delete an old gear set, export one as
            a backup file and remove it, or drop a few photos — and this will start saving again automatically.
          </p>
        </div>
      )}
      {importStatus && (
        <p className="mb-4 rounded border border-sky-800 bg-sky-950/40 p-2 text-xs text-sky-200">{importStatus}</p>
      )}

      {!selected ? (
        <div>
          <div id="tutorial-garage-add" className="mb-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setPickingItem(true)}
              className="flex flex-1 items-center gap-3 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-left text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/frog-helmet.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
              Add a piece of gear
            </button>
            <button
              type="button"
              onClick={createProfile}
              className="flex flex-1 items-center gap-3 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-left text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/gear-sets.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
              Add a new gear set
            </button>
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-neutral-600 p-4 text-left text-sm font-semibold text-neutral-200 hover:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/file-import.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
              Import from a file
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleImportFile(file);
                }}
              />
            </label>
          </div>
          <GearItems
            items={items}
            profiles={profiles}
            preferences={preferences}
            picking={pickingItem}
            setPicking={setPickingItem}
            onAdd={(item) => setGear((g) => ({ ...g, items: [...g.items, item] }))}
            onChange={(item) => setGear((g) => ({ ...g, items: g.items.map((i) => (i.id === item.id ? item : i)) }))}
            onDelete={(id) => setGear((g) => ({ items: g.items.filter((i) => i.id !== id), profiles: unlinkItem(g.profiles, id) }))}
            onLink={linkItem}
            onClose={() => setGear((g) => pruneEmptyItems(g))}
          />
          <SanctioningBodyPreferences preferences={preferences} onChange={onPreferencesChange} />
          {profiles.length > 0 && (
            <div id="tutorial-garage-list">
              <h2 className="mb-2 text-sm font-semibold text-neutral-300">Available Gear Sets</h2>
              <div className="flex flex-col gap-2">
                {resolved.map((p) => {
                  const photos = collectProfilePhotos(p);
                  const isOpen = actionMenuId === p.id;
                  const expiryWarnings = computeGearExpiryWarnings(p, preferences);
                  const hasRejected = expiryWarnings.some((w) => w.severity === "rejected");
                  const hasOtherWarning = expiryWarnings.some((w) => w.severity !== "rejected");
                  return (
                    <div key={p.id} className="rounded-lg border border-neutral-700 p-3">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setActionMenuId(isOpen ? null : p.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActionMenuId(isOpen ? null : p.id);
                          }
                        }}
                        className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {photos.length > 0 ? (
                            <div className="flex shrink-0 items-center">
                              {photos.slice(0, 3).map((src, i) => (
                                <div key={i} onClick={(e) => e.stopPropagation()} style={{ marginLeft: i === 0 ? 0 : -16 }}>
                                  <ZoomableThumb src={src} className="h-12 w-12 rounded-full border-2 border-neutral-900 object-cover" />
                                </div>
                              ))}
                              {photos.length > 3 && (
                                <div
                                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-neutral-700 text-xs font-semibold text-neutral-200"
                                  style={{ marginLeft: -16 }}
                                >
                                  +{photos.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-lg text-neutral-500"
                              title="No photos"
                            >
                              📷
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{p.name}</p>
                            <p className="text-xs text-neutral-500">
                              {countFilledCategories(p, isEntryEmpty)} item{countFilledCategories(p, isEntryEmpty) === 1 ? "" : "s"} filled in ·
                              updated {new Date(p.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="flex shrink-0 items-center gap-2">
                          {!isOpen && hasRejected && (
                            <span className="text-lg" title="A preferred sanctioning body rejects some of this gear as expired">
                              ✋
                            </span>
                          )}
                          {!isOpen && !hasRejected && hasOtherWarning && (
                            <span className="text-lg" title="Some of this gear is expired or expiring soon with a preferred sanctioning body">
                              ⚠️
                            </span>
                          )}
                          <span className="text-neutral-500">{isOpen ? "▲" : "▼"}</span>
                        </span>
                      </div>
                      {isOpen && (
                        <div className="mt-3 border-t border-neutral-800 pt-3">
                          {expiryWarnings.length > 0 && (
                            <div className="mb-3 flex flex-col gap-1">
                              {expiryWarnings.map((w) => (
                                <p
                                  key={`${w.category}-${w.severity}-${w.date}`}
                                  className={
                                    w.severity === "rejected"
                                      ? "rounded border border-red-800 bg-red-950/40 px-2 py-1 text-xs text-red-300"
                                      : "rounded border border-amber-800 bg-amber-950/40 px-2 py-1 text-xs text-amber-300"
                                  }
                                >
                                  {w.severity === "rejected" ? "✋" : "⚠️"} {formatGearExpiryWarning(w)}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="mb-3 flex flex-wrap gap-2">
                            {confirmDeleteId !== p.id && (
                              <>
                                <button type="button" onClick={() => startEditing(p)} className={buttonClass}>
                                  ✏️ Edit this gear set
                                </button>
                                <ExportButton label="Export this gear set" onExport={(includeHighRes) => handleExportProfile(p, includeHighRes)} />
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteProfile(p.id)}
                              className={
                                confirmDeleteId === p.id
                                  ? "rounded border border-red-500 bg-red-900 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-800"
                                  : "rounded border border-red-800 px-2 py-1 text-xs text-red-300 hover:bg-red-950"
                              }
                            >
                              🗑️ {confirmDeleteId === p.id ? "Delete the set only (its gear stays in My Gear)" : "Delete this gear set"}
                            </button>
                            {confirmDeleteId === p.id && (
                              <button
                                type="button"
                                onClick={() => deleteProfile(p.id, true)}
                                className="rounded border border-red-500 bg-red-900 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-800"
                              >
                                🗑️ Delete the set and its gear (gear another set uses is kept)
                              </button>
                            )}
                            {confirmDeleteId === p.id && (
                              <button type="button" onClick={() => setConfirmDeleteId(null)} className={buttonClass}>
                                Cancel
                              </button>
                            )}
                          </div>
                          {confirmDeleteId !== p.id && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={() => onLoadProfile(p, "body-first")}
                                className="flex flex-col items-start gap-1 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-left hover:bg-emerald-900"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
                                <img src="/frog-option2.jpg" alt="" className="h-16 w-16 rounded-lg bg-neutral-800 object-cover" />
                                <span className="text-sm font-semibold text-emerald-200">Will my equipment pass tech?</span>
                                <span className="text-xs text-emerald-300/80">
                                  Enter your current safety gear and check it against the current rules of a sanctioning body.
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onLoadProfile(p, "equipment-first")}
                                className="flex flex-col items-start gap-1 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-left hover:bg-emerald-900"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
                                <img src="/frog-option3.jpg" alt="" className="h-16 w-16 rounded-lg bg-neutral-800 object-cover" />
                                <span className="text-sm font-semibold text-emerald-200">Where can my equipment race?</span>
                                <span className="text-xs text-emerald-300/80">
                                  See which sanctioning bodies your gear is eligible, incomplete, or rejected for.
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : modeChoiceId === selected.id ? (
        <div className="rounded-lg border border-neutral-700 p-4">
          <button type="button" onClick={() => cancelNewProfile(selected.id)} className="mb-4 text-sm font-semibold text-amber-400 hover:text-amber-300">
            ← Cancel
          </button>
          <p className="mb-4 text-sm text-neutral-300">How do you want to build this gear set?</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => chooseAutomaticMode(selected.id)}
              className="flex flex-1 flex-col items-start gap-1 rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-left hover:bg-emerald-900"
            >
              <span className="text-sm font-semibold text-emerald-200">📷 Automatic mode</span>
              <span className="text-xs text-emerald-300/80">
                Upload photos of your gear — whole items and/or certification tag close-ups — and we&apos;ll figure out what&apos;s what. You confirm
                each item before it&apos;s added.
              </span>
            </button>
            <button
              type="button"
              onClick={chooseManualMode}
              className="flex flex-1 flex-col items-start gap-1 rounded-lg border border-neutral-600 p-4 text-left hover:bg-neutral-800"
            >
              <span className="text-sm font-semibold text-neutral-200">✏️ Manual mode</span>
              <span className="text-xs text-neutral-400">
                {items.length > 0 ? "Pick gear already in My Gear, or enter" : "Enter"} your certifications and details yourself, category by category.
              </span>
            </button>
          </div>
        </div>
      ) : autoImportFocusedId === selected.id ? (
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => cancelNewProfile(selected.id)} className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              ← Cancel
            </button>
            <button
              type="button"
              onClick={saveNewProfile}
              className="rounded border border-emerald-700 bg-emerald-950 px-3 py-1.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
            >
              💾 Save to My Gear
            </button>
          </div>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium">Gear set name</span>
            <input
              type="text"
              value={selected.name}
              onChange={(e) => updateSelected({ name: e.target.value })}
              className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
            />
          </label>
          <AutomaticGearImport
            entries={selected.entries}
            onChangeEntry={setSelectedEntry}
            codriverEntries={selected.codriverEntries ?? {}}
            onChangeCodriverEntry={setSelectedCodriverEntry}
            hasCodriver={!!selected.hasCodriver}
            onSetHasCodriver={(v) => updateSelected({ hasCodriver: v })}
            onDone={saveNewProfile}
          />
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {!confirmingCancel ? (
              <button type="button" onClick={requestCancelEdit} className="text-sm font-semibold text-amber-400 hover:text-amber-300">
                ← Cancel
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-red-400">Discard your changes to this gear set?</span>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border border-red-500 bg-red-900 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-800"
                >
                  Yes, discard changes
                </button>
                <button type="button" onClick={() => setConfirmingCancel(false)} className={buttonClass}>
                  Keep editing
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ExportButton label="Export this gear set" onExport={(includeHighRes) => handleExportProfile(selected, includeHighRes)} />
              <button
                type="button"
                onClick={finishEditing}
                className={
                  hasUnsavedEdits
                    ? "rounded border-2 border-emerald-400 bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500"
                    : "rounded border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-900"
                }
              >
                💾 Update this gear
              </button>
            </div>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium">Gear set name</span>
            <input
              type="text"
              value={selected.name}
              onChange={(e) => updateSelected({ name: e.target.value })}
              className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
            />
          </label>

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-700 p-3">
            {selected.carPhotoDataUrl ? (
              <>
                <ZoomableThumb src={selected.carPhotoDataUrl} className="h-20 w-20 rounded object-cover" />
                <button type="button" onClick={() => updateSelected({ carPhotoDataUrl: undefined })} className={buttonClass}>
                  Remove car photo
                </button>
              </>
            ) : (
              <label className={`${buttonClass} cursor-pointer`}>
                📷 Add a photo of the car
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) handleCarPhoto(file);
                  }}
                />
              </label>
            )}
            <input
              type="text"
              placeholder="Car note (e.g. 2004 Miata NB, closed roof)"
              value={selected.carNote ?? ""}
              onChange={(e) => updateSelected({ carNote: e.target.value || undefined })}
              className="min-w-[200px] flex-1 rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={!!selected.hasCodriver} onChange={(e) => updateSelected({ hasCodriver: e.target.checked })} />
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/frog-codriver.jpg" alt="" className="h-12 w-auto shrink-0 rounded-lg bg-neutral-800 object-contain" />
              Add codriver gear
            </label>
            <label className={`${buttonClass} cursor-pointer`} title="Import a gear-set file your codriver exported from their own PassTech My Gear">
              Import codriver gear set from file
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleImportCodriverFile(file);
                }}
              />
            </label>
          </div>

          <div className="mb-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">Automatic mode</h3>
            <AutomaticGearImport
              entries={selected.entries}
              onChangeEntry={setSelectedEntry}
              codriverEntries={selected.codriverEntries ?? {}}
              onChangeCodriverEntry={setSelectedCodriverEntry}
              hasCodriver={!!selected.hasCodriver}
              onSetHasCodriver={(v) => updateSelected({ hasCodriver: v })}
              onDone={() => {}}
            />
          </div>

          <EquipmentForm
            entries={selected.entries}
            onChange={setSelectedEntry}
            activeGroups={ALL_GROUPS}
            orderResetKey={selected.id}
            showPhotoUpload
            stickers
            perOccupantAsDriverGroup={!!selected.hasCodriver}
            myGear={pickFromMyGear("driver")}
          />

          {selected.hasCodriver && (
            <div className="mb-4 mt-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-400">Codriver Safety Gear</h3>
              <EquipmentForm
                entries={selected.codriverEntries ?? {}}
                onChange={setSelectedCodriverEntry}
                activeGroups={ALL_GROUPS}
                orderResetKey={selected.id}
                showPhotoUpload
                stickers
                occupant="codriver"
                myGear={pickFromMyGear("codriver")}
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onLoadProfile(selected, "body-first")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/frog-option2.jpg" alt="" className="h-8 w-8 shrink-0 rounded-lg bg-neutral-800 object-cover" />
              Will my equipment pass tech?
            </button>
            <button
              type="button"
              onClick={() => onLoadProfile(selected, "equipment-first")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/frog-option3.jpg" alt="" className="h-8 w-8 shrink-0 rounded-lg bg-neutral-800 object-cover" />
              Where can my equipment race?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
