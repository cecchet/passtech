"use client";

import { useRef, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META, isPerOccupantCategory, maxPhotosFor } from "@/data/categoryMeta";
import { EquipmentEntry, ExtinguisherUnit, isEntryEmpty, newCertification, newExtinguisherUnit } from "@/lib/matcher";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { TagCandidate } from "@/lib/useTagScanner";
import { TagCandidateList } from "@/components/TagCandidateList";
import { NOT_LISTED } from "@/data/standards";

const CLASSIFIABLE_CATEGORIES: EquipmentCategory[] = [
  "helmet",
  "balaclava",
  "hnr",
  "neck_collar",
  "firesuit",
  "undergarment",
  "gloves",
  "arm_restraint",
  "shoes",
  "socks",
  "seat",
  "belts_harness",
  "window_net",
  "fuel_cell",
  "fire_extinguisher",
  "fire_suppression",
  "kill_switch",
  "tow_hook",
  "emergency_triangle",
  "window_breaker",
  "spill_kit",
  "hood_pins",
  "parachute",
  "rollover_protection",
];

// Categories with no fields of their own (no certification, no extinguisher-style data) — a
// confirmed photo just needs to flip the "I have this item" flag so it actually registers,
// mirroring the manual-entry presence checkbox (see EquipmentForm's isSimplePresenceCategory).
// Tow hook, fire extinguisher, and rollover protection are presence-only too but have their own
// dedicated handling below.
const SIMPLE_PRESENCE_CATEGORIES: EquipmentCategory[] = ["kill_switch", "emergency_triangle", "window_breaker", "spill_kit", "hood_pins", "parachute"];

// Matches the AbortController timeout below — keep these in sync so the UI copy stays honest.
const REQUEST_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_LABEL = "a minute";

type Piece = "one_piece" | "jacket" | "pants" | "front" | "rear";
type Target = "driver" | "codriver";

interface HelmetInfo {
  helmetType: "open_face" | "full_face" | "unclear" | "";
  hasVisor: boolean;
  visorNote: string;
}

interface ExtinguisherAnalysis {
  classARating: number;
  bcRating: number;
  weightLbs: number;
  manufactureDate: string;
  certificationDate: string;
  certificationDueDate: string;
}

interface AnalyzeGearPhotoResponse {
  isGearPhoto: boolean;
  category: string;
  pieceType: Piece | "";
  towHookSide: "front" | "rear" | "";
  categoryConfidence: "high" | "medium" | "low";
  notes: string;
  certifications: TagCandidate[];
  helmetType: HelmetInfo["helmetType"];
  hasVisor: boolean;
  visorNote: string;
  isCloseupOnly: boolean;
  error?: string;
}

interface QueuedPhoto {
  file: File;
  previewUrl: string;
}

/** Which "slot" within a category an item-photo fills — a two-piece firesuit has two independent slots (jacket, pants), tow hook has two (front, rear); everything else has exactly one. */
function slotKey(category: EquipmentCategory, piece: Piece | null): string {
  if (category === "firesuit") return `firesuit:${piece ?? "one_piece"}`;
  if (category === "tow_hook") return `tow_hook:${piece ?? "front"}`;
  return category;
}

function pieceLabel(piece: Piece | null): string {
  if (piece === "jacket") return "jacket/top";
  if (piece === "pants") return "pants/bottom";
  if (piece === "front") return "front";
  if (piece === "rear") return "rear";
  return "one-piece suit";
}

function describeExisting(category: EquipmentCategory, piece: Piece | null, entry: EquipmentEntry | undefined): string {
  if (!entry) return CATEGORY_META[category].label;
  const certs = piece === "pants" ? entry.pantsCertifications : entry.certifications;
  const first = certs?.[0];
  if (first?.standardId && first.standardId !== NOT_LISTED) {
    return `${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""} — already has a certification on file`;
  }
  return `${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""}`;
}

async function fetchWithTimeout(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, status: 0, data: { error: `This is taking longer than ${REQUEST_TIMEOUT_LABEL} — the connection or the vision service may be having trouble.` } };
    }
    return { ok: false, status: 0, data: { error: "Couldn't reach the server." } };
  } finally {
    clearTimeout(timer);
  }
}

type Stage =
  | { type: "processing" }
  | { type: "error"; message: string; retryable: boolean }
  | { type: "manual_category"; notes: string }
  | {
      type: "manual_tag_result";
      category: EquipmentCategory;
      piece: Piece | null;
      candidates: TagCandidate[];
      tagNotes: string;
      added: Set<number>;
    }
  | {
      type: "result";
      category: EquipmentCategory;
      piece: Piece | null;
      confidence: "high" | "medium" | "low";
      notes: string;
      itemConfirmed: boolean;
      conflict: { existingLabel: string } | null;
      helmet?: HelmetInfo;
      certifications: TagCandidate[];
      certNotes: string;
      addedCerts: Set<number>;
      /** True when this photo is a tag/label close-up rather than a shot of the whole item — used
       * so a wide overview photo confirmed later still ends up as the item's representative photo
       * (index 0) instead of losing that spot to whichever photo was confirmed first. */
      isCloseupOnly: boolean;
      /** Set when "Same item — add as another photo" couldn't actually add this photo because the
       * item is already at its per-category photo limit — shown instead of a misleading "Added". */
      photoLimitReached: boolean;
      /** Fire extinguisher only: null while the follow-up label-reading request is in flight, undefined once it's done and found nothing usable, populated once it reads a rating/date. */
      extinguisher?: ExtinguisherAnalysis | null;
    };

export function AutomaticGearImport({
  entries,
  onChangeEntry,
  codriverEntries,
  onChangeCodriverEntry,
  hasCodriver,
  onSetHasCodriver,
  onDone,
}: {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  onChangeEntry: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  codriverEntries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  onChangeCodriverEntry: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  hasCodriver: boolean;
  onSetHasCodriver: (v: boolean) => void;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [processed, setProcessed] = useState(0);
  const [totalQueued, setTotalQueued] = useState(0);
  const [current, setCurrent] = useState<{ photo: QueuedPhoto; dataUrl: string; target: Target; stage: Stage } | null>(null);
  const filledSlotsRef = useRef<{ driver: Set<string>; codriver: Set<string> }>({ driver: new Set(), codriver: new Set() });
  const [builtSummary, setBuiltSummary] = useState<string[]>([]);

  const currentEntries = (target: Target) => (target === "driver" ? entries : codriverEntries);
  const updateEntry = (target: Target, category: EquipmentCategory, patch: Partial<EquipmentEntry>) => {
    const existing = currentEntries(target)[category] ?? { category };
    const next = { ...existing, ...patch };
    if (target === "driver") onChangeEntry(category, next);
    else {
      if (!hasCodriver) onSetHasCodriver(true);
      onChangeCodriverEntry(category, next);
    }
  };

  const isSlotFilled = (target: Target, category: EquipmentCategory, piece: Piece | null): boolean => {
    const key = slotKey(category, piece);
    if (filledSlotsRef.current[target].has(key)) return true;
    const entry = currentEntries(target)[category];
    const alreadyHasData =
      category === "firesuit"
        ? piece === "pants"
          ? (entry?.pantsCertifications ?? []).length > 0
          : (entry?.certifications ?? []).length > 0 || !!entry?.photoDataUrls?.length
        : category === "tow_hook"
          ? piece === "rear"
            ? entry?.towHookRear === true
            : entry?.towHookFront === true
          : !isEntryEmpty(category, entry);
    if (alreadyHasData) {
      filledSlotsRef.current[target].add(key);
      return true;
    }
    return false;
  };

  const markSlotFilled = (target: Target, category: EquipmentCategory, piece: Piece | null) => {
    filledSlotsRef.current[target].add(slotKey(category, piece));
  };

  const noteBuilt = (label: string) => setBuiltSummary((prev) => [...prev, label]);

  // `remainingQueue` is everything still waiting, NOT including whatever's current (see
  // handleFiles, which sets queue to photos.slice(1) right after starting photos[0]) -- so moving
  // on means popping its head into the new current and leaving the rest as the new queue state.
  const advance = (remainingQueue: QueuedPhoto[]) => {
    setProcessed((p) => p + 1);
    if (remainingQueue.length === 0) {
      setQueue([]);
      setCurrent(null);
      return;
    }
    const [next, ...rest] = remainingQueue;
    setQueue(rest);
    void processPhoto(next);
  };

  const processPhoto = async (photo: QueuedPhoto) => {
    setCurrent({ photo, dataUrl: "", target: "driver", stage: { type: "processing" } });
    let dataUrl: string;
    try {
      dataUrl = await resizeImageToDataUrl(photo.file);
    } catch {
      setCurrent({ photo, dataUrl: "", target: "driver", stage: { type: "error", message: "Couldn't read this photo file.", retryable: false } });
      return;
    }
    await runAnalysis(photo, dataUrl);
  };

  const runAnalysis = async (photo: QueuedPhoto, dataUrl: string) => {
    setCurrent({ photo, dataUrl, target: "driver", stage: { type: "processing" } });
    const { ok, status, data } = await fetchWithTimeout("/api/analyze-gear-photo", { imageDataUrl: dataUrl });
    if (!ok) {
      const message = typeof data.error === "string" ? data.error : "Something went wrong.";
      // A 429 (quota) will fail again on immediate retry until the window resets; anything else
      // (network blip, 5xx, our own timeout) is worth a retry.
      setCurrent({ photo, dataUrl, target: "driver", stage: { type: "error", message, retryable: status !== 429 } });
      return;
    }
    const result = data as unknown as AnalyzeGearPhotoResponse;
    routeResult(photo, dataUrl, result);
  };

  const routeResult = (photo: QueuedPhoto, dataUrl: string, r: AnalyzeGearPhotoResponse) => {
    if (!r.isGearPhoto || !r.category) {
      setCurrent({ photo, dataUrl, target: "driver", stage: { type: "manual_category", notes: r.notes } });
      return;
    }
    const category = r.category as EquipmentCategory;
    const piece = category === "firesuit" ? ((r.pieceType || "one_piece") as Piece) : category === "tow_hook" ? ((r.towHookSide || null) as Piece | null) : null;
    setCurrent({
      photo,
      dataUrl,
      target: "driver",
      stage: {
        type: "result",
        category,
        piece,
        confidence: r.categoryConfidence,
        notes: r.notes,
        itemConfirmed: false,
        conflict: null,
        helmet: r.helmetType ? { helmetType: r.helmetType, hasVisor: r.hasVisor, visorNote: r.visorNote } : undefined,
        certifications: r.certifications ?? [],
        certNotes: "",
        addedCerts: new Set(),
        isCloseupOnly: !!r.isCloseupOnly,
        photoLimitReached: false,
        extinguisher: category === "fire_extinguisher" ? null : undefined,
      },
    });
    if (category === "fire_extinguisher") void runExtinguisherAnalysis(photo, dataUrl);
  };

  // Fire extinguishers don't have a standardId-based certification tag the shared classifier
  // schema can extract — this reuses the dedicated analyze-extinguisher endpoint (same one behind
  // the per-unit "Scan label photo" button) as a follow-up call once the photo's been classified.
  // Fire-and-forget: if it fails or finds nothing, confirming the item still works, just without
  // prefilled rating/date fields.
  const runExtinguisherAnalysis = async (photo: QueuedPhoto, dataUrl: string) => {
    const { ok, data } = await fetchWithTimeout("/api/analyze-extinguisher", { imageDataUrl: dataUrl });
    setCurrent((c) => {
      if (!c || c.photo !== photo || c.stage.type !== "result") return c;
      const extinguisher = ok ? (data as unknown as ExtinguisherAnalysis) : undefined;
      return { ...c, stage: { ...c.stage, extinguisher } };
    });
  };

  const runManualTagAnalysis = async (photo: QueuedPhoto, dataUrl: string, category: EquipmentCategory, piece: Piece | null, target: Target) => {
    setCurrent({ photo, dataUrl, target, stage: { type: "processing" } });
    const { ok, status, data } = await fetchWithTimeout("/api/analyze-tag", { category, imageDataUrl: dataUrl });
    if (!ok) {
      const message = typeof data.error === "string" ? data.error : "Something went wrong.";
      setCurrent({ photo, dataUrl, target, stage: { type: "error", message, retryable: status !== 429 } });
      return;
    }
    setCurrent({
      photo,
      dataUrl,
      target,
      stage: {
        type: "manual_tag_result",
        category,
        piece,
        candidates: (data.candidates as TagCandidate[]) ?? [],
        tagNotes: (data.notes as string) ?? "",
        added: new Set(),
      },
    });
  };

  const skip = () => advance(queue);

  const retry = () => {
    if (!current) return;
    void runAnalysis(current.photo, current.dataUrl);
  };

  /**
   * Returns whether the photo was actually added — false when the item was already at its
   * per-category photo limit, so the caller can tell the user instead of claiming success.
   */
  const confirmItem = (
    category: EquipmentCategory,
    piece: Piece | null,
    target: Target,
    dataUrl: string,
    isCloseupOnly: boolean,
    helmet: HelmetInfo | undefined,
    extinguisher?: ExtinguisherAnalysis | null,
    extinguisherMode: "new" | "merge" = "new"
  ): boolean => {
    const existing = currentEntries(target)[category];

    // Fire extinguishers are handled entirely separately: a gear set can carry several, each with
    // its own photos (so a scrutineer can tell which label documents which physical unit) rather
    // than one shared photo pool for the category. "merge" attaches this photo/data to the most
    // recently confirmed unit (same physical extinguisher, e.g. a wide shot then its label
    // close-up); "new" always starts a fresh unit.
    if (category === "fire_extinguisher") {
      const existingUnits = existing?.extinguisherUnits ?? [];
      const targetUnit = extinguisherMode === "merge" ? existingUnits[existingUnits.length - 1] : undefined;
      const currentPhotos = targetUnit?.photoDataUrls ?? [];
      const photoAdded = currentPhotos.length < maxPhotosFor(category);
      const mergedFields = {
        ...(extinguisher?.classARating && !targetUnit?.classARating ? { classARating: extinguisher.classARating } : {}),
        ...(extinguisher?.bcRating && !targetUnit?.bcRating ? { bcRating: extinguisher.bcRating } : {}),
        ...(extinguisher?.weightLbs && !targetUnit?.weightLbs ? { weightLbs: extinguisher.weightLbs } : {}),
        ...(extinguisher?.manufactureDate && !targetUnit?.manufactureDate ? { manufactureDate: extinguisher.manufactureDate } : {}),
        ...(extinguisher?.certificationDate && !targetUnit?.certificationDate ? { certificationDate: extinguisher.certificationDate } : {}),
        ...(extinguisher?.certificationDueDate && !targetUnit?.certificationDueDate ? { certificationDueDate: extinguisher.certificationDueDate } : {}),
      };
      let units: ExtinguisherUnit[];
      if (targetUnit) {
        const updated: ExtinguisherUnit = { ...targetUnit, ...mergedFields, photoDataUrls: photoAdded ? [...currentPhotos, dataUrl] : currentPhotos };
        units = existingUnits.map((u) => (u.key === targetUnit.key ? updated : u));
      } else {
        const newUnit: ExtinguisherUnit = { ...newExtinguisherUnit(), ...mergedFields, photoDataUrls: photoAdded ? [dataUrl] : [] };
        units = [...existingUnits, newUnit];
      }
      updateEntry(target, category, { extinguisherUnits: units });
      markSlotFilled(target, category, piece);
      if (photoAdded) {
        noteBuilt(`${target === "codriver" ? "Codriver — " : ""}${CATEGORY_META[category].label}${targetUnit ? "" : ` #${units.length}`} photo`);
      }
      return photoAdded;
    }

    const photos = [...(existing?.photoDataUrls ?? [])];
    const photoAdded = photos.length < maxPhotosFor(category);
    // A wide/overview shot always leads the list (index 0), even when confirmed after a tag
    // close-up — that first photo is what the "Available Gear Sets" list preview shows, so it
    // shouldn't lose that spot to a close-up that just happened to get confirmed first.
    if (photoAdded) {
      if (isCloseupOnly) photos.push(dataUrl);
      else photos.unshift(dataUrl);
    }

    updateEntry(target, category, {
      photoDataUrls: photos,
      ...(category === "firesuit" ? { pieceType: (piece === "jacket" || piece === "pants" ? "two_piece" : "one_piece") as EquipmentEntry["pieceType"] } : {}),
      ...(category === "firesuit" || CATEGORY_META[category].hybrid ? { mode: existing?.mode ?? "certified" } : {}),
      ...(helmet && helmet.helmetType && helmet.helmetType !== "unclear" ? { helmetType: helmet.helmetType } : {}),
      ...(helmet ? { hasVisor: helmet.hasVisor, visorNote: helmet.visorNote || undefined } : {}),
      ...(category === "tow_hook" ? (piece === "rear" ? { towHookRear: true } : { towHookFront: true }) : {}),
      ...(SIMPLE_PRESENCE_CATEGORIES.includes(category) ? { skipped: false } : {}),
    });
    markSlotFilled(target, category, piece);
    if (photoAdded) {
      noteBuilt(`${target === "codriver" ? "Codriver — " : ""}${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""} photo`);
    }
    return photoAdded;
  };

  const addTagCandidate = (category: EquipmentCategory, piece: Piece | null, target: Target, c: TagCandidate) => {
    const existing = currentEntries(target)[category];
    const cert = {
      ...newCertification(),
      standardId: c.standardId,
      customStandardLabel: c.standardId === NOT_LISTED ? c.rawText : undefined,
      homologationNumber: c.homologationNumber || undefined,
      labelDate: c.labelDate || undefined,
      tagExpirationDate: c.tagExpirationDate || undefined,
    };
    const isPants = category === "firesuit" && piece === "pants";
    const list = isPants ? (existing?.pantsCertifications ?? []) : (existing?.certifications ?? []);
    updateEntry(target, category, {
      mode: existing?.mode ?? "certified",
      ...(category === "firesuit" && piece ? { pieceType: (piece === "jacket" || piece === "pants" ? "two_piece" : "one_piece") as EquipmentEntry["pieceType"] } : {}),
      ...(isPants ? { pantsCertifications: [...list, cert] } : { certifications: [...list, cert] }),
    });
    noteBuilt(
      `${target === "codriver" ? "Codriver — " : ""}${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""} — ${
        c.standardId === NOT_LISTED ? c.rawText : c.standardId
      }`
    );
  };

  const handleFiles = (files: FileList) => {
    const photos = Array.from(files).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    if (!current) {
      // Nothing's in progress — this is a fresh batch, so the counter starts over instead of
      // carrying over the total (or the finished progress) from whatever was uploaded before.
      setTotalQueued(photos.length);
      setProcessed(0);
      void processPhoto(photos[0]);
      setQueue(photos.slice(1));
    } else {
      // Still reviewing an earlier photo — these extend that same batch, so the total grows but
      // progress-so-far is left alone.
      setTotalQueued((t) => t + photos.length);
      setQueue((q) => [...q, ...photos]);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-700 p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {!current && (
        <div>
          <p className="mb-2 text-sm text-neutral-400">
            Upload photos of your gear, in any order and any mix. One photo per item is usually enough — if a certification tag is legible in the same
            shot (e.g. an arm restraint with its tag visible), we&apos;ll pick that up too. If a tag is hard to read in a wide photo (tucked inside a
            helmet, hidden under a collar), add a close-up of just the tag as a separate photo and we&apos;ll attach it to the same item.
          </p>
          <p className="mb-3 text-xs text-neutral-500">We&apos;ll go through them one at a time and check with you before adding anything.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-900"
          >
            📷 Upload gear photos
          </button>
          {builtSummary.length > 0 && (
            <div className="mt-4 rounded border border-neutral-700 p-3 text-xs">
              <p className="mb-1 font-semibold text-neutral-300">Added so far ({builtSummary.length}):</p>
              <ul className="list-disc space-y-0.5 pl-4 text-neutral-400">
                {builtSummary.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <button type="button" onClick={onDone} className="mt-3 rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
                Done — review/edit manually below
              </button>
            </div>
          )}
        </div>
      )}

      {current && (
        <div>
          <p className="mb-2 text-xs text-neutral-500">
            Photo {processed + 1} of {totalQueued} {queue.length > 0 ? `(${queue.length} more queued)` : ""}
          </p>
          <div className="mb-2 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, transient preview */}
            <img src={current.photo.previewUrl} alt="" className="h-24 w-24 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              {current.stage.type === "processing" && <p className="text-neutral-400">Processing this picture (can take up to {REQUEST_TIMEOUT_LABEL})…</p>}

              {current.stage.type === "error" && (
                <div>
                  <p className="text-red-400">{current.stage.message}</p>
                  <div className="mt-2 flex gap-2">
                    {current.stage.retryable && (
                      <button type="button" onClick={retry} className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900">
                        Retry
                      </button>
                    )}
                    <button type="button" onClick={skip} className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800">
                      Skip this photo
                    </button>
                  </div>
                </div>
              )}

              {current.stage.type === "manual_category" && (
                <ManualCategoryPicker
                  notes={current.stage.notes}
                  onPick={(category, photoType) => {
                    const piece = category === "firesuit" ? "one_piece" : null;
                    if (photoType === "tag") {
                      void runManualTagAnalysis(current.photo, current.dataUrl, category, piece, current.target);
                    } else {
                      setCurrent((c) =>
                        c
                          ? {
                              ...c,
                              stage: {
                                type: "result",
                                category,
                                piece,
                                confidence: "low",
                                notes: "",
                                itemConfirmed: false,
                                conflict: null,
                                certifications: [],
                                certNotes: "",
                                addedCerts: new Set(),
                                isCloseupOnly: false,
                                photoLimitReached: false,
                              },
                            }
                          : c
                      );
                    }
                  }}
                  onSkip={skip}
                />
              )}

              {current.stage.type === "manual_tag_result" && (
                <div>
                  {targetToggle(current.target, (t) => setCurrent((c) => (c ? { ...c, target: t } : c)), current.stage.category)}
                  <TagCandidateList
                    candidates={current.stage.candidates}
                    notes={current.stage.tagNotes || null}
                    added={current.stage.added}
                    category={current.stage.category}
                    onAdd={(c, i) => {
                      const { category, piece } = current.stage as Extract<Stage, { type: "manual_tag_result" }>;
                      addTagCandidate(category, piece, current.target, c);
                      setCurrent((cur) =>
                        cur && cur.stage.type === "manual_tag_result" ? { ...cur, stage: { ...cur.stage, added: new Set(cur.stage.added).add(i) } } : cur
                      );
                    }}
                  />
                  <button type="button" onClick={skip} className="mt-2 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800">
                    Done with this photo — next
                  </button>
                </div>
              )}

              {current.stage.type === "result" && (
                <ResultCard
                  stage={current.stage}
                  target={current.target}
                  onChangeTarget={(t) => setCurrent((c) => (c ? { ...c, target: t } : c))}
                  onSetPiece={(piece) => setCurrent((c) => (c && c.stage.type === "result" ? { ...c, stage: { ...c.stage, piece } } : c))}
                  onRequestConflictCheck={(category, piece, target) => {
                    if (isSlotFilled(target, category, piece)) {
                      setCurrent((c) =>
                        c && c.stage.type === "result"
                          ? { ...c, stage: { ...c.stage, conflict: { existingLabel: describeExisting(category, piece, currentEntries(target)[category]) } } }
                          : c
                      );
                    } else {
                      const added = confirmItem(
                        category,
                        piece,
                        target,
                        current.dataUrl,
                        current.stage.type === "result" ? current.stage.isCloseupOnly : false,
                        current.stage.type === "result" ? current.stage.helmet : undefined,
                        current.stage.type === "result" ? current.stage.extinguisher : undefined
                      );
                      setCurrent((c) =>
                        c && c.stage.type === "result" ? { ...c, stage: { ...c.stage, itemConfirmed: added, conflict: null, photoLimitReached: !added } } : c
                      );
                    }
                  }}
                  onResolveConflictSameItem={(category, piece, target) => {
                    const added = confirmItem(
                      category,
                      piece,
                      target,
                      current.dataUrl,
                      current.stage.type === "result" ? current.stage.isCloseupOnly : false,
                      current.stage.type === "result" ? current.stage.helmet : undefined,
                      current.stage.type === "result" ? current.stage.extinguisher : undefined,
                      "merge"
                    );
                    setCurrent((c) =>
                      c && c.stage.type === "result" ? { ...c, stage: { ...c.stage, itemConfirmed: added, conflict: null, photoLimitReached: !added } } : c
                    );
                  }}
                  onResolveConflictNewExtinguisher={(category, piece, target) => {
                    const added = confirmItem(
                      category,
                      piece,
                      target,
                      current.dataUrl,
                      current.stage.type === "result" ? current.stage.isCloseupOnly : false,
                      current.stage.type === "result" ? current.stage.helmet : undefined,
                      current.stage.type === "result" ? current.stage.extinguisher : undefined,
                      "new"
                    );
                    setCurrent((c) =>
                      c && c.stage.type === "result" ? { ...c, stage: { ...c.stage, itemConfirmed: added, conflict: null, photoLimitReached: !added } } : c
                    );
                  }}
                  onResolveConflictCodriver={(category, piece) => {
                    setCurrent((c) => (c ? { ...c, target: "codriver" } : c));
                    if (isSlotFilled("codriver", category, piece)) {
                      setCurrent((c) =>
                        c && c.stage.type === "result"
                          ? {
                              ...c,
                              target: "codriver",
                              stage: { ...c.stage, conflict: { existingLabel: describeExisting(category, piece, currentEntries("codriver")[category]) } },
                            }
                          : c
                      );
                    } else {
                      const added = confirmItem(
                        category,
                        piece,
                        "codriver",
                        current.dataUrl,
                        current.stage.type === "result" ? current.stage.isCloseupOnly : false,
                        current.stage.type === "result" ? current.stage.helmet : undefined,
                        current.stage.type === "result" ? current.stage.extinguisher : undefined
                      );
                      setCurrent((c) =>
                        c && c.stage.type === "result"
                          ? { ...c, target: "codriver", stage: { ...c.stage, itemConfirmed: added, conflict: null, photoLimitReached: !added } }
                          : c
                      );
                    }
                  }}
                  onAddCert={(category, piece, target, c, i) => {
                    addTagCandidate(category, piece, target, c);
                    setCurrent((cur) =>
                      cur && cur.stage.type === "result" ? { ...cur, stage: { ...cur.stage, addedCerts: new Set(cur.stage.addedCerts).add(i) } } : cur
                    );
                  }}
                  onNext={skip}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  stage,
  target,
  onChangeTarget,
  onSetPiece,
  onRequestConflictCheck,
  onResolveConflictSameItem,
  onResolveConflictNewExtinguisher,
  onResolveConflictCodriver,
  onAddCert,
  onNext,
}: {
  stage: Extract<Stage, { type: "result" }>;
  target: Target;
  onChangeTarget: (t: Target) => void;
  onSetPiece: (piece: Piece) => void;
  onRequestConflictCheck: (category: EquipmentCategory, piece: Piece | null, target: Target) => void;
  onResolveConflictSameItem: (category: EquipmentCategory, piece: Piece | null, target: Target) => void;
  onResolveConflictNewExtinguisher: (category: EquipmentCategory, piece: Piece | null, target: Target) => void;
  onResolveConflictCodriver: (category: EquipmentCategory, piece: Piece | null) => void;
  onAddCert: (category: EquipmentCategory, piece: Piece | null, target: Target, c: TagCandidate, i: number) => void;
  onNext: () => void;
}) {
  const { category, piece, confidence, notes, helmet, certifications, certNotes, addedCerts, itemConfirmed, conflict, photoLimitReached, extinguisher } = stage;
  const perOccupant = isPerOccupantCategory(category);
  const isExtinguisher = category === "fire_extinguisher";
  const needsSideChoice = category === "tow_hook" && !piece;
  const extinguisherLoading = category === "fire_extinguisher" && extinguisher === null;
  const extinguisherSummary = extinguisher
    ? [
        extinguisher.classARating || extinguisher.bcRating
          ? `${extinguisher.classARating ? `${extinguisher.classARating}-A:` : ""}${extinguisher.bcRating ? `${extinguisher.bcRating}-B:C` : ""}`
          : null,
        extinguisher.weightLbs ? `${extinguisher.weightLbs} lb` : null,
        extinguisher.manufactureDate ? `mfg ${extinguisher.manufactureDate}` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  return (
    <div>
      {targetToggle(target, onChangeTarget, category)}
      <p className="text-neutral-200">
        I detected: <b>{CATEGORY_META[category].label}</b>
        {piece && (category === "firesuit" || category === "tow_hook") ? ` — ${pieceLabel(piece)}` : ""}
        <span className="ml-1 text-neutral-500">({confidence} confidence)</span>
      </p>
      {helmet && helmet.helmetType && (
        <p className="text-neutral-400">
          {helmet.helmetType === "unclear" ? "Style unclear from photo" : helmet.helmetType === "full_face" ? "Full face (integrated chin bar)" : "Open face (no chin bar)"}
          {" · "}
          {helmet.hasVisor ? "visor/shield detected" : "no visor/shield detected"}
        </p>
      )}
      {category === "fire_extinguisher" &&
        (extinguisherLoading ? (
          <p className="text-neutral-500">Reading the label…</p>
        ) : extinguisherSummary ? (
          <p className="text-neutral-400">{extinguisherSummary}</p>
        ) : (
          <p className="text-neutral-500">No rating/date legible on this photo — you can fill those in (or scan again) after adding it.</p>
        ))}
      {category === "tow_hook" && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Which side:</span>
          <button
            type="button"
            onClick={() => onSetPiece("front")}
            className={`rounded border px-2 py-0.5 ${piece === "front" ? "border-amber-600 bg-neutral-900 text-amber-300" : "border-neutral-700 text-neutral-400"}`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => onSetPiece("rear")}
            className={`rounded border px-2 py-0.5 ${piece === "rear" ? "border-amber-600 bg-neutral-900 text-amber-300" : "border-neutral-700 text-neutral-400"}`}
          >
            Rear
          </button>
        </div>
      )}
      {notes && <p className="text-neutral-500">{notes}</p>}

      {photoLimitReached ? (
        <div className="mt-2 rounded border border-amber-700 bg-amber-950/40 p-2 text-xs">
          <p className="text-amber-200">
            {CATEGORY_META[category].label} already has the maximum of {maxPhotosFor(category)} photos — this one wasn&rsquo;t added.
            Scroll down to that category below and remove one of its photos, then retry.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => onResolveConflictSameItem(category, piece, target)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
              Retry
            </button>
            {perOccupant && (
              <button type="button" onClick={() => onResolveConflictCodriver(category, piece)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
                This is for my codriver
              </button>
            )}
          </div>
        </div>
      ) : !conflict ? (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            disabled={itemConfirmed || needsSideChoice || extinguisherLoading}
            onClick={() => onRequestConflictCheck(category, piece, target)}
            className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900 disabled:opacity-50"
          >
            {itemConfirmed ? "Added as item photo" : needsSideChoice ? "Pick front or rear first" : "Use this as the item photo"}
          </button>
        </div>
      ) : (
        <div className="mt-2 rounded border border-amber-700 bg-amber-950/40 p-2 text-xs">
          <p className="text-amber-200">
            {isExtinguisher
              ? "You already have a fire extinguisher in this gear set — is this the same one (e.g. its label, after an overview shot) or a different extinguisher?"
              : `You already have a ${conflict.existingLabel.toLowerCase()} in this gear set — a gear set can only have one${perOccupant ? ", unless this is for a codriver" : ""}.`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => onResolveConflictSameItem(category, piece, target)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
              {isExtinguisher ? "Same extinguisher — attach this too" : "Same item — add as another photo"}
            </button>
            {isExtinguisher && (
              <button
                type="button"
                onClick={() => onResolveConflictNewExtinguisher(category, piece, target)}
                className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800"
              >
                Different extinguisher — add as new
              </button>
            )}
            {perOccupant && (
              <button type="button" onClick={() => onResolveConflictCodriver(category, piece)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
                This is for my codriver
              </button>
            )}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mt-3 border-t border-neutral-700 pt-2">
          <p className="text-neutral-300">Certification tag found on this photo:</p>
          <TagCandidateList
            candidates={certifications}
            notes={certNotes || null}
            added={addedCerts}
            category={category}
            onAdd={(c, i) => onAddCert(category, piece, target, c, i)}
          />
        </div>
      )}

      <button type="button" onClick={onNext} className="mt-3 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800">
        Next photo
      </button>
    </div>
  );
}

// Only per-occupant categories (driver-worn gear, plus seat/belts/window net) can actually have a
// distinct codriver entry that means anything — every other category is a single shared car-level
// item (see PER_OCCUPANT_CATEGORIES), so a "codriver" choice there would silently go nowhere.
function targetToggle(target: Target, onChange: (t: Target) => void, category: EquipmentCategory) {
  if (!isPerOccupantCategory(category)) return null;
  return (
    <div className="mb-2 flex items-center gap-2 text-xs">
      <span className="text-neutral-500">Add this to:</span>
      <button
        type="button"
        onClick={() => onChange("driver")}
        className={`rounded border px-2 py-0.5 ${target === "driver" ? "border-amber-600 bg-neutral-900 text-amber-300" : "border-neutral-700 text-neutral-400"}`}
      >
        Driver
      </button>
      <button
        type="button"
        onClick={() => onChange("codriver")}
        className={`rounded border px-2 py-0.5 ${target === "codriver" ? "border-amber-600 bg-neutral-900 text-amber-300" : "border-neutral-700 text-neutral-400"}`}
      >
        Codriver
      </button>
    </div>
  );
}

function ManualCategoryPicker({ notes, onPick, onSkip }: { notes: string; onPick: (category: EquipmentCategory, photoType: "item" | "tag") => void; onSkip: () => void }) {
  const [category, setCategory] = useState<EquipmentCategory>("helmet");
  const [photoType, setPhotoType] = useState<"item" | "tag">("item");
  return (
    <div className="rounded border border-neutral-600 p-2">
      <p className="text-neutral-300">Couldn&apos;t confidently tell what this photo shows.{notes ? ` ${notes}` : ""}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
          className="rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100"
        >
          {CLASSIFIABLE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <select
          value={photoType}
          onChange={(e) => setPhotoType(e.target.value as "item" | "tag")}
          className="rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100"
        >
          <option value="item">Whole item photo</option>
          <option value="tag">Certification tag close-up</option>
        </select>
        <button type="button" onClick={() => onPick(category, photoType)} className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900">
          Use this
        </button>
        <button type="button" onClick={onSkip} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
          Skip this photo
        </button>
      </div>
    </div>
  );
}
