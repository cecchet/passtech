"use client";

import { useEffect, useState } from "react";
import { CategoryGroup } from "@/data/types";
import { EquipmentForm } from "@/components/EquipmentForm";
import { AutomaticGearImport } from "@/components/AutomaticGearImport";
import { isEntryEmpty } from "@/lib/matcher";
import { resizeImageToDataUrl } from "@/lib/imageResize";
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
function ExportButton({ label, onExport }: { label: string; onExport: () => void }) {
  return (
    <button type="button" onClick={onExport} className={buttonClass}>
      📄 {label}
    </button>
  );
}

export function GarageManager({
  onLoadProfile,
  onBlockNavChange,
}: {
  /** target: "body-first" loads into Option 2 (check against one body); "equipment-first" loads into Option 3 (check against every body at once). */
  onLoadProfile: (profile: GarageProfile, target: "body-first" | "equipment-first") => void;
  /** Reports whether My Gear is currently mid-way through creating a new gear set (mode choice or Automatic mode), so the page-level "Back to main menu" can be disabled — Cancel/Save to My Gear are meant to be the only two ways out of that flow. */
  onBlockNavChange?: (blocked: boolean) => void;
}) {
  const [profiles, setProfiles] = useState<GarageProfile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  /** Which profile currently has the "upload photos" (Automatic mode) panel open, if any. */
  const [autoImportOpenId, setAutoImportOpenId] = useState<string | null>(null);
  /** A just-created profile still showing the "Automatic mode or Manual mode?" choice, before any name/gear has been entered. */
  const [modeChoiceId, setModeChoiceId] = useState<string | null>(null);
  /** Set alongside autoImportOpenId only when Automatic mode was chosen for a brand-new profile — hides the rest of the editor (name/photo/codriver/manual form) until the import is done, so the upload prompt is the only thing shown. Left unset when "Add gear from photos" is used on an existing set, which shows the import panel above the full editor instead. */
  const [autoImportFocusedId, setAutoImportFocusedId] = useState<string | null>(null);
  /** True when the most recent write to localStorage failed (almost always quota exceeded — profiles carry base64 photo data). React state still has the change, but it's only in memory until this clears — surfaced as a persistent banner rather than left silent, which used to mean a change could look saved and then vanish on the next reload. */
  const [storageError, setStorageError] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- one-time client-side hydration from localStorage */
  useEffect(() => {
    setProfiles(loadGarage());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- syncs UI state to whether the last localStorage write actually succeeded, not derivable from props/state alone */
  useEffect(() => {
    if (!hydrated) return;
    setStorageError(!saveGarage(profiles));
  }, [profiles, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reports the "new gear set in progress" state up to the page so it can disable the global
  // Back to main menu button — cleans up on unmount too, in case this component ever goes away
  // while still mid-flow.
  useEffect(() => {
    onBlockNavChange?.(modeChoiceId !== null || autoImportFocusedId !== null);
    return () => onBlockNavChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeChoiceId, autoImportFocusedId]);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

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
    setAutoImportOpenId(id);
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
    setAutoImportOpenId(null);
    setAutoImportFocusedId(null);
    setSelectedId(null);
  };

  // Save to My Gear from Automatic mode's focused view — everything confirmed so far is already
  // written into the profile, so this just leaves the focused Automatic-mode view and returns to
  // the list.
  const saveNewProfile = () => {
    setAutoImportOpenId(null);
    setAutoImportFocusedId(null);
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

  const handleExportProfile = (profile: GarageProfile) => {
    downloadJson(exportGarageToJson([profile]), garageExportFilename(profile.name));
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
    const dataUrl = await resizeImageToDataUrl(file, 800, 0.75);
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
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
            <div className="flex flex-col gap-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-700 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {p.carPhotoDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- user-provided photo
                      <img src={p.carPhotoDataUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-xs text-neutral-500">
                        {countFilledCategories(p, isEntryEmpty)} item{countFilledCategories(p, isEntryEmpty) === 1 ? "" : "s"} filled in · updated{" "}
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {confirmDeleteId !== p.id && (
                      <>
                        <button type="button" onClick={() => setSelectedId(p.id)} className={buttonClass}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadProfile(p, "body-first")}
                          className="flex items-center gap-1.5 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
                          title="Enter your current safety gear and check it against the current rules of a sanctioning body"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
                          <img src="/frog-option2.jpg" alt="" className="h-6 w-6 shrink-0 rounded bg-neutral-800 object-cover" />
                          Will my equipment pass tech?
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoadProfile(p, "equipment-first")}
                          className="flex items-center gap-1.5 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
                          title="Enter your current safety gear once and see which sanctioning bodies it's eligible, incomplete, or rejected for"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
                          <img src="/frog-option3.jpg" alt="" className="h-6 w-6 shrink-0 rounded bg-neutral-800 object-cover" />
                          Where can my equipment race?
                        </button>
                        <ExportButton label="Export gear set" onExport={() => handleExportProfile(p)} />
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
                      {confirmDeleteId === p.id ? "Confirm delete?" : "Delete"}
                    </button>
                    {confirmDeleteId === p.id && (
                      <button type="button" onClick={() => setConfirmDeleteId(null)} className={buttonClass}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
            <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              ← Back to My Gear
            </button>
            <div className="flex gap-2">
              {autoImportOpenId !== selected.id && (
                <button
                  type="button"
                  onClick={() => setAutoImportOpenId(selected.id)}
                  className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
                >
                  📷 Add gear from photos
                </button>
              )}
              <ExportButton label="Export this gear set" onExport={() => handleExportProfile(selected)} />
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
                {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo */}
                <img src={selected.carPhotoDataUrl} alt="" className="h-20 w-20 rounded object-cover" />
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

          {autoImportOpenId === selected.id && (
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">Automatic mode</h3>
              <AutomaticGearImport
                entries={selected.entries}
                onChangeEntry={(category, entry) => updateSelected({ entries: { ...selected.entries, [category]: entry } })}
                codriverEntries={selected.codriverEntries ?? {}}
                onChangeCodriverEntry={(category, entry) => updateSelected({ codriverEntries: { ...(selected.codriverEntries ?? {}), [category]: entry } })}
                hasCodriver={!!selected.hasCodriver}
                onSetHasCodriver={(v) => updateSelected({ hasCodriver: v })}
                onDone={() => setAutoImportOpenId(null)}
              />
            </div>
          )}

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
