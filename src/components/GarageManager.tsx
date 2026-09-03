"use client";

import { useEffect, useState } from "react";
import { CategoryGroup, EquipmentCategory } from "@/data/types";
import { EquipmentForm } from "@/components/EquipmentForm";
import { AutomaticGearImport } from "@/components/AutomaticGearImport";
import { EquipmentEntry, isEntryEmpty } from "@/lib/matcher";
import { downscaleDataUrl, resizeImageToDataUrl } from "@/lib/imageResize";
import { ZoomableThumb } from "@/components/ZoomableThumb";
import {
  GarageProfile,
  countFilledCategories,
  exportGarageToJson,
  freshGarageId,
  garageExportFilename,
  loadGarage,
  newGarageProfile,
  parseGarageImport,
  saveGarage,
} from "@/lib/garage";

const ALL_GROUPS = new Set<CategoryGroup>(["driver", "car", "rollcage"]);

const buttonClass = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Sharing a file via `navigator.share()` turned out not to be reliable enough to keep: on real
 * devices it silently rejected the file (tried both "application/json" and a "text/plain" retry —
 * see git history) and fell back to a plain download anyway, so the "Share / Email" option was
 * just a confusing extra click that landed on the same download every time. Exporting a gear set
 * is just a download now — on most phones, the browser's own download-complete notification
 * already offers a native Share action from there, which reaches the same Mail/Messages/Drive
 * picker without PassTech needing to drive it (and without the reliability problems of doing so).
 */
function ExportButton({ label, onExport }: { label: string; onExport: (includeHighRes: boolean) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        📄 {label}
      </button>
    );
  }

  const choose = (includeHighRes: boolean) => {
    onExport(includeHighRes);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-neutral-700 bg-neutral-900 p-2">
      <span className="text-xs text-neutral-300">Include high-resolution photos in the export?</span>
      <button
        type="button"
        onClick={() => choose(true)}
        className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
      >
        Yes, include them
      </button>
      <button type="button" onClick={() => choose(false)} className={buttonClass}>
        No, keep it small
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:text-neutral-300">
        Cancel
      </button>
    </div>
  );
}

const LIGHTWEIGHT_EXPORT_MAX_DIM = 480;
const LIGHTWEIGHT_EXPORT_QUALITY = 0.6;

/** Re-encodes every photo in a profile (car photo + every entry's, driver and codriver) at a
 * smaller size — used when exporting without "include high-resolution photos", to keep the export
 * file small. Only affects the exported copy; what's actually stored in IndexedDB is untouched. */
async function shrinkProfilePhotos(p: GarageProfile): Promise<GarageProfile> {
  const shrink = (url: string) => downscaleDataUrl(url, LIGHTWEIGHT_EXPORT_MAX_DIM, LIGHTWEIGHT_EXPORT_QUALITY);

  const shrinkEntries = async (
    entries: Partial<Record<EquipmentCategory, EquipmentEntry>>
  ): Promise<Partial<Record<EquipmentCategory, EquipmentEntry>>> => {
    const out: Partial<Record<EquipmentCategory, EquipmentEntry>> = {};
    for (const category of Object.keys(entries) as EquipmentCategory[]) {
      const entry = entries[category];
      if (!entry) continue;
      out[category] = entry.photoDataUrls?.length ? { ...entry, photoDataUrls: await Promise.all(entry.photoDataUrls.map(shrink)) } : entry;
    }
    return out;
  };

  return {
    ...p,
    carPhotoDataUrl: p.carPhotoDataUrl ? await shrink(p.carPhotoDataUrl) : p.carPhotoDataUrl,
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
}: {
  /** target: "body-first" loads into Option 2 (check against one body); "equipment-first" loads into Option 3 (check against every body at once). */
  onLoadProfile: (profile: GarageProfile, target: "body-first" | "equipment-first") => void;
  /** Reports whether My Gear is currently mid-way through creating a new gear set (mode choice or Automatic mode), so the page-level "Back to main menu" can be disabled — Cancel/Save to My Gear are meant to be the only two ways out of that flow. */
  onBlockNavChange?: (blocked: boolean) => void;
  /** A gear set to reopen (action menu expanded) as soon as this mounts — set by the page right before navigating back here from body-first/equipment-first, so returning to My Gear lands back on the same gear set instead of a blank list. */
  initialActionMenuId?: string | null;
  /** Called once right after initialActionMenuId has been applied, so the page can clear it — otherwise the same gear set would keep reopening on every future visit to My Gear, even unrelated ones. */
  onInitialActionMenuConsumed?: () => void;
}) {
  const [profiles, setProfiles] = useState<GarageProfile[]>([]);
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
  const [editSnapshot, setEditSnapshot] = useState<GarageProfile | null>(null);
  /** True once the user has clicked Cancel on an edit session that actually has unsaved changes — arms the "discard changes?" two-step confirmation instead of cancelling immediately. */
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  // One-time client-side hydration from IndexedDB — async, so the state set here happens inside
  // the .then() callback, not synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    loadGarage().then((loaded) => {
      if (cancelled) return;
      setProfiles(loaded);
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
    saveGarage(profiles).then((ok) => {
      if (!cancelled) setStorageError(!ok);
    });
    return () => {
      cancelled = true;
    };
  }, [profiles, hydrated]);

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

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  // Whether the profile has actually changed since editing started — drives both the Cancel
  // confirmation and the Update button's highlight. Only meaningful while editing an existing
  // profile (editSnapshot is unset for a brand-new one; see startEditing).
  const hasUnsavedEdits = editSnapshot !== null && selected !== null && JSON.stringify(selected) !== JSON.stringify(editSnapshot);

  const updateSelected = (patch: Partial<GarageProfile>) => {
    if (!selected) return;
    setProfiles((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  const createProfile = () => {
    const profile = newGarageProfile("Untitled gear set");
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
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setModeChoiceId(null);
    setAutoImportFocusedId(null);
    setSelectedId(null);
  };

  // Save to My Gear from Automatic mode's focused view — everything confirmed so far is already
  // written into the profile, so this just leaves the focused Automatic-mode view and returns to
  // the list.
  const saveNewProfile = () => {
    setAutoImportFocusedId(null);
    setSelectedId(null);
  };

  const startEditing = (p: GarageProfile) => {
    setActionMenuId(null);
    setEditSnapshot(structuredClone(p));
    setConfirmingCancel(false);
    setSelectedId(p.id);
  };

  // Cancel while editing an already-saved gear set — restores the snapshot taken when editing
  // started, discarding whatever was changed since (edits themselves still write straight through
  // live, same as everywhere else in this app, so this is what makes Cancel actually mean "undo
  // this editing session" rather than just closing the view on top of already-committed changes).
  const cancelEdit = () => {
    if (editSnapshot) {
      setProfiles((prev) => prev.map((p) => (p.id === editSnapshot.id ? editSnapshot : p)));
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
  const deleteProfile = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
  };

  const handleExportProfile = async (profile: GarageProfile, includeHighRes: boolean) => {
    const exportProfile = includeHighRes ? profile : await shrinkProfilePhotos(profile);
    downloadJson(exportGarageToJson([exportProfile]), garageExportFilename(profile.name));
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseGarageImport(text);
      if (imported.length === 0) {
        setImportStatus("No profiles found in that file.");
        return;
      }
      // Always import as new entries with fresh ids — never overwrite an existing gear set, even
      // one that happens to share an id (e.g. re-importing a file you already have saved).
      const asNew = imported.map((p) => ({ ...p, id: freshGarageId() }));
      setProfiles((prev) => [...prev, ...asNew]);
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
      updateSelected({ hasCodriver: true, codriverEntries: { ...imported[0].entries } });
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
              Import gear set from file
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
          {profiles.length > 0 && (
            <div id="tutorial-garage-list">
              <h2 className="mb-2 text-sm font-semibold text-neutral-300">Available Gear Sets</h2>
              <div className="flex flex-col gap-2">
                {profiles.map((p) => {
                  const photos = collectProfilePhotos(p);
                  const isOpen = actionMenuId === p.id;
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
                        <span className="shrink-0 text-neutral-500">{isOpen ? "▲" : "▼"}</span>
                      </div>
                      {isOpen && (
                        <div className="mt-3 border-t border-neutral-800 pt-3">
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
                              🗑️ {confirmDeleteId === p.id ? "Confirm delete?" : "Delete this gear set"}
                            </button>
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
              <span className="text-xs text-neutral-400">Enter your certifications and details yourself, category by category.</span>
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
            onChangeEntry={(category, entry) => updateSelected({ entries: { ...selected.entries, [category]: entry } })}
            codriverEntries={selected.codriverEntries ?? {}}
            onChangeCodriverEntry={(category, entry) => updateSelected({ codriverEntries: { ...(selected.codriverEntries ?? {}), [category]: entry } })}
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
              onChangeEntry={(category, entry) => updateSelected({ entries: { ...selected.entries, [category]: entry } })}
              codriverEntries={selected.codriverEntries ?? {}}
              onChangeCodriverEntry={(category, entry) => updateSelected({ codriverEntries: { ...(selected.codriverEntries ?? {}), [category]: entry } })}
              hasCodriver={!!selected.hasCodriver}
              onSetHasCodriver={(v) => updateSelected({ hasCodriver: v })}
              onDone={() => {}}
            />
          </div>

          <EquipmentForm
            entries={selected.entries}
            onChange={(category, entry) => updateSelected({ entries: { ...selected.entries, [category]: entry } })}
            activeGroups={ALL_GROUPS}
            orderResetKey={selected.id}
            showPhotoUpload
            perOccupantAsDriverGroup={!!selected.hasCodriver}
          />

          {selected.hasCodriver && (
            <div className="mb-4 mt-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-400">Codriver Safety Gear</h3>
              <EquipmentForm
                entries={selected.codriverEntries ?? {}}
                onChange={(category, entry) => updateSelected({ codriverEntries: { ...(selected.codriverEntries ?? {}), [category]: entry } })}
                activeGroups={ALL_GROUPS}
                orderResetKey={selected.id}
                showPhotoUpload
                occupant="codriver"
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
