"use client";

import { useEffect, useState } from "react";
import { CategoryGroup } from "@/data/types";
import { EquipmentForm } from "@/components/EquipmentForm";
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
 * "Email" export. There's no server here to send mail from (see the app's "nothing is sent
 * anywhere" privacy stance), so this uses the device's own share sheet — on phones/modern
 * browsers that's `navigator.share` with the export file attached, letting the user pick Mail,
 * Gmail, Messages, etc. themselves. Where the browser can't share a file (most desktop browsers),
 * a `mailto:` link can't attach a file either — so we download it instead and open a pre-filled
 * email asking the user to attach the file that just downloaded.
 */
async function shareOrEmailJson(json: string, filename: string, title: string) {
  const file = new File([json], filename, { type: "application/json" });
  const canShareFile = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  if (canShareFile) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // user cancelled the share sheet
      // Any other failure (e.g. no share target installed) — fall through to the mailto fallback.
    }
  }
  downloadJson(json, filename);
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(
    `${title}\n\nYour browser can't attach the exported file to an email automatically, so it just downloaded as "${filename}" instead — attach that file to this email before sending.`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/** Small "Save as file" / "Email" dropdown shared by every export button in this component. */
function ExportMenu({
  label,
  onExportFile,
  onExportEmail,
  disabled,
}: {
  label: string;
  onExportFile: () => void;
  onExportEmail: () => void;
  disabled?: boolean;
}) {
  const close = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.closest("details")?.removeAttribute("open");
  };
  return (
    <details className={`relative inline-block ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <summary
        className={`${buttonClass} inline-flex cursor-pointer list-none items-center gap-1 marker:content-none [&::-webkit-details-marker]:hidden`}
      >
        {label} <span aria-hidden>▾</span>
      </summary>
      <div className="absolute right-0 z-10 mt-1 flex flex-col gap-0.5 whitespace-nowrap rounded border border-neutral-600 bg-neutral-900 p-1 shadow-lg">
        <button
          type="button"
          onClick={(e) => {
            close(e);
            onExportFile();
          }}
          className="rounded px-2 py-1 text-left text-xs text-neutral-200 hover:bg-neutral-800"
        >
          📄 Save as file
        </button>
        <button
          type="button"
          onClick={(e) => {
            close(e);
            onExportEmail();
          }}
          className="rounded px-2 py-1 text-left text-xs text-neutral-200 hover:bg-neutral-800"
        >
          📧 Email
        </button>
      </div>
    </details>
  );
}

export function GarageManager({
  onLoadProfile,
}: {
  /** target: "body-first" loads into Option 2 (check against one body); "equipment-first" loads into Option 3 (check against every body at once). */
  onLoadProfile: (profile: GarageProfile, target: "body-first" | "equipment-first") => void;
}) {
  const [profiles, setProfiles] = useState<GarageProfile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- one-time client-side hydration from localStorage */
  useEffect(() => {
    setProfiles(loadGarage());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    saveGarage(profiles);
  }, [profiles, hydrated]);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  const updateSelected = (patch: Partial<GarageProfile>) => {
    if (!selected) return;
    setProfiles((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  const createProfile = () => {
    const profile = newGarageProfile("Untitled gear set");
    setProfiles((prev) => [...prev, profile]);
    setSelectedId(profile.id);
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

  const handleExportProfileEmail = (profile: GarageProfile) => {
    shareOrEmailJson(exportGarageToJson([profile]), garageExportFilename(profile.name), `PassTech gear set: ${profile.name}`);
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
      <div className="mb-4">
        <p className="text-sm text-neutral-400">
          Save named sets of gear here — you can load one straight into a body&apos;s tech check any time, instead of re-entering everything.
        </p>
      </div>

      {importStatus && (
        <p className="mb-4 rounded border border-sky-800 bg-sky-950/40 p-2 text-xs text-sky-200">{importStatus}</p>
      )}

      {!selected ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={createProfile} className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">
              + New gear set
            </button>
            <label className="cursor-pointer rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">
              Import
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

          {profiles.length === 0 ? (
            <p className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-400">
              Nothing saved yet — click &quot;+ New gear set&quot; to start building your My Gear collection.
            </p>
          ) : (
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
                        <ExportMenu label="Export gear set" onExportFile={() => handleExportProfile(p)} onExportEmail={() => handleExportProfileEmail(p)} />
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
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-semibold text-amber-400 hover:text-amber-300">
              ← Back to My Gear
            </button>
            <ExportMenu label="Export this gear set" onExportFile={() => handleExportProfile(selected)} onExportEmail={() => handleExportProfileEmail(selected)} />
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
