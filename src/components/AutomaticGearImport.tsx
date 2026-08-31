"use client";

import { useRef, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentEntry, isEntryEmpty, newCertification } from "@/lib/matcher";
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
];

const MAX_PHOTOS_PER_ITEM = 3;

type Piece = "one_piece" | "jacket" | "pants";

interface Classification {
  isGearPhoto: boolean;
  photoType: "item" | "tag" | "unclear";
  category: string;
  pieceType: Piece | "";
  confidence: "high" | "medium" | "low";
  notes: string;
}

interface HelmetAnalysis {
  helmetType: "open_face" | "full_face" | "unclear";
  hasVisor: boolean;
  visorNote: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

interface QueuedPhoto {
  file: File;
  previewUrl: string;
}

type Target = "driver" | "codriver";

/** Which "slot" within a category an item-photo fills — a two-piece firesuit has two independent slots (jacket, pants); everything else has exactly one. */
function slotKey(category: EquipmentCategory, piece: Piece | null): string {
  if (category === "firesuit") return `firesuit:${piece ?? "one_piece"}`;
  return category;
}

function pieceLabel(piece: Piece | null): string {
  if (piece === "jacket") return "jacket/top";
  if (piece === "pants") return "pants/bottom";
  return "one-piece suit";
}

/** Short human-readable summary of what's already stored for a category/piece, for the conflict prompt. */
function describeExisting(category: EquipmentCategory, piece: Piece | null, entry: EquipmentEntry | undefined): string {
  if (!entry) return CATEGORY_META[category].label;
  const certs = piece === "pants" ? entry.pantsCertifications : entry.certifications;
  const first = certs?.[0];
  if (first?.standardId && first.standardId !== NOT_LISTED) {
    return `${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""} — already has a certification on file`;
  }
  return `${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""}`;
}

type Stage =
  | { type: "classifying" }
  | { type: "error"; message: string }
  | {
      type: "manual_category";
      notes: string;
    }
  | {
      type: "conflict";
      category: EquipmentCategory;
      piece: Piece | null;
      existingLabel: string;
    }
  | {
      type: "confirm_item";
      category: EquipmentCategory;
      piece: Piece | null;
      confidence: "high" | "medium" | "low";
      notes: string;
      helmet?: HelmetAnalysis;
    }
  | {
      type: "confirm_tag";
      category: EquipmentCategory;
      piece: Piece | null;
      candidates: TagCandidate[];
      tagNotes: string;
      added: Set<number>;
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
  // Tracks which category/piece "slots" have already gotten a confirmed item photo THIS session
  // (per target), seeded lazily from the incoming entries the first time each slot is checked —
  // see filledSlots ref below.
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
    // First time we see this slot, seed from whatever's already in the profile (e.g. entered
    // manually before switching to Automatic mode, or from an earlier photo batch).
    const entry = currentEntries(target)[category];
    const alreadyHasData =
      category === "firesuit"
        ? piece === "pants"
          ? (entry?.pantsCertifications ?? []).length > 0
          : (entry?.certifications ?? []).length > 0 || !!entry?.photoDataUrls?.length
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

  const clearSlot = (target: Target, category: EquipmentCategory, piece: Piece | null) => {
    const existing = currentEntries(target)[category];
    if (!existing) return;
    if (category === "firesuit" && piece === "pants") {
      updateEntry(target, category, { pantsCertifications: [] });
    } else if (category === "firesuit") {
      updateEntry(target, category, { certifications: [], photoDataUrls: [] });
    } else {
      updateEntry(target, category, { certifications: [], photoDataUrls: [], skipped: undefined });
    }
  };

  const noteBuilt = (label: string) => setBuiltSummary((prev) => [...prev, label]);

  const advance = (nextQueue: QueuedPhoto[]) => {
    setQueue(nextQueue);
    setProcessed((p) => p + 1);
    if (nextQueue.length === 0) {
      setCurrent(null);
      return;
    }
    void processPhoto(nextQueue[0]);
  };

  const processPhoto = async (photo: QueuedPhoto) => {
    setCurrent({ photo, dataUrl: "", target: "driver", stage: { type: "classifying" } });
    try {
      const dataUrl = await resizeImageToDataUrl(photo.file);
      const res = await fetch("/api/classify-gear-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const data: Classification & { error?: string } = await res.json();
      if (!res.ok) {
        setCurrent({ photo, dataUrl, target: "driver", stage: { type: "error", message: data.error ?? "Something went wrong." } });
        return;
      }
      await routeClassification(photo, dataUrl, data);
    } catch {
      setCurrent((c) => (c ? { ...c, stage: { type: "error", message: "Couldn't reach the server." } } : c));
    }
  };

  const routeClassification = async (photo: QueuedPhoto, dataUrl: string, c: Classification) => {
    if (!c.isGearPhoto || c.photoType === "unclear" || !c.category) {
      setCurrent({ photo, dataUrl, target: "driver", stage: { type: "manual_category", notes: c.notes } });
      return;
    }
    const category = c.category as EquipmentCategory;
    const piece = category === "firesuit" ? (c.pieceType || "one_piece") as Piece : null;

    if (c.photoType === "tag") {
      await runTagAnalysis(photo, dataUrl, category, piece, "driver");
      return;
    }

    // photoType === "item"
    if (isSlotFilled("driver", category, piece)) {
      setCurrent({
        photo,
        dataUrl,
        target: "driver",
        stage: { type: "conflict", category, piece, existingLabel: describeExisting(category, piece, currentEntries("driver")[category]) },
      });
      return;
    }

    if (category === "helmet") {
      try {
        const res = await fetch("/api/analyze-helmet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrl: dataUrl }),
        });
        const helmet: HelmetAnalysis & { error?: string } = await res.json();
        if (!res.ok) {
          setCurrent({ photo, dataUrl, target: "driver", stage: { type: "error", message: helmet.error ?? "Helmet analysis failed." } });
          return;
        }
        setCurrent({
          photo,
          dataUrl,
          target: "driver",
          stage: { type: "confirm_item", category, piece, confidence: c.confidence, notes: c.notes, helmet },
        });
      } catch {
        setCurrent({ photo, dataUrl, target: "driver", stage: { type: "error", message: "Couldn't reach the server for helmet analysis." } });
      }
      return;
    }

    setCurrent({ photo, dataUrl, target: "driver", stage: { type: "confirm_item", category, piece, confidence: c.confidence, notes: c.notes } });
  };

  const runTagAnalysis = async (photo: QueuedPhoto, dataUrl: string, category: EquipmentCategory, piece: Piece | null, target: Target) => {
    setCurrent({ photo, dataUrl, target, stage: { type: "classifying" } });
    try {
      const res = await fetch("/api/analyze-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, imageDataUrl: dataUrl }),
      });
      const data: { candidates?: TagCandidate[]; notes?: string; error?: string } = await res.json();
      if (!res.ok) {
        setCurrent({ photo, dataUrl, target, stage: { type: "error", message: data.error ?? "Tag analysis failed." } });
        return;
      }
      setCurrent({
        photo,
        dataUrl,
        target,
        stage: { type: "confirm_tag", category, piece, candidates: data.candidates ?? [], tagNotes: data.notes ?? "", added: new Set() },
      });
    } catch {
      setCurrent({ photo, dataUrl, target, stage: { type: "error", message: "Couldn't reach the server." } });
    }
  };

  const skip = () => advance(queue.slice(1));

  const confirmItem = (category: EquipmentCategory, piece: Piece | null, target: Target, dataUrl: string, helmet?: HelmetAnalysis) => {
    const existing = currentEntries(target)[category];
    const photos = [...(existing?.photoDataUrls ?? [])];
    if (photos.length < MAX_PHOTOS_PER_ITEM) photos.push(dataUrl);
    updateEntry(target, category, {
      photoDataUrls: photos,
      ...(category === "firesuit" ? { pieceType: (piece === "jacket" || piece === "pants" ? "two_piece" : "one_piece") as EquipmentEntry["pieceType"] } : {}),
      ...(category === "firesuit" || CATEGORY_META[category].hybrid ? { mode: existing?.mode ?? "certified" } : {}),
      ...(helmet && helmet.helmetType !== "unclear" ? { helmetType: helmet.helmetType } : {}),
      ...(helmet ? { hasVisor: helmet.hasVisor, visorNote: helmet.visorNote || undefined } : {}),
    });
    markSlotFilled(target, category, piece);
    noteBuilt(`${target === "codriver" ? "Codriver — " : ""}${CATEGORY_META[category].label}${piece ? ` (${pieceLabel(piece)})` : ""} photo`);
    advance(queue.slice(1));
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
    setTotalQueued((t) => t + photos.length);
    setProcessed(0);
    if (!current) {
      void processPhoto(photos[0]);
      setQueue(photos.slice(1));
    } else {
      setQueue((q) => [...q, ...photos]);
    }
  };

  const targetToggle = (target: Target, onChange: (t: Target) => void) => (
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
          <p className="mb-3 text-sm text-neutral-400">
            Upload photos of your gear — whole items and/or certification tag close-ups, in any order and any mix. We&apos;ll go through them one at a
            time and check with you before adding anything.
          </p>
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
            Photo {processed} of {totalQueued} {queue.length > 0 ? `(${queue.length} more queued)` : ""}
          </p>
          <div className="mb-2 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, transient preview */}
            <img src={current.photo.previewUrl} alt="" className="h-24 w-24 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              {current.stage.type === "classifying" && <p className="text-neutral-400">Looking at this photo…</p>}

              {current.stage.type === "error" && (
                <div>
                  <p className="text-red-400">{current.stage.message}</p>
                  <button type="button" onClick={skip} className="mt-2 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800">
                    Skip this photo
                  </button>
                </div>
              )}

              {current.stage.type === "manual_category" && (
                <ManualCategoryPicker
                  notes={current.stage.notes}
                  onPick={(category, photoType) => {
                    const piece = category === "firesuit" ? "one_piece" : null;
                    if (photoType === "tag") {
                      void runTagAnalysis(current.photo, current.dataUrl, category, piece, current.target);
                    } else if (isSlotFilled(current.target, category, piece)) {
                      setCurrent((c) =>
                        c
                          ? {
                              ...c,
                              stage: {
                                type: "conflict",
                                category,
                                piece,
                                existingLabel: describeExisting(category, piece, currentEntries(current.target)[category]),
                              },
                            }
                          : c
                      );
                    } else {
                      setCurrent((c) =>
                        c ? { ...c, stage: { type: "confirm_item", category, piece, confidence: "low", notes: "" } } : c
                      );
                    }
                  }}
                  onSkip={skip}
                />
              )}

              {current.stage.type === "conflict" && (
                <div className="rounded border border-amber-700 bg-amber-950/40 p-2">
                  <p className="text-amber-200">
                    You already have a {current.stage.existingLabel.toLowerCase()} in this gear set. This photo also looks like{" "}
                    {CATEGORY_META[current.stage.category].label.toLowerCase()}
                    {current.stage.piece ? ` (${pieceLabel(current.stage.piece)})` : ""} — a gear set can only have one, unless this is for a codriver.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const { category, piece } = current.stage as Extract<Stage, { type: "conflict" }>;
                        confirmItem(category, piece, current.target, current.dataUrl);
                      }}
                      className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800"
                    >
                      Same item — add as another photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const { category, piece } = current.stage as Extract<Stage, { type: "conflict" }>;
                        clearSlot(current.target, category, piece);
                        confirmItem(category, piece, current.target, current.dataUrl);
                      }}
                      className="rounded border border-red-700 bg-red-950 px-2 py-1 text-red-200 hover:bg-red-900"
                    >
                      Replace the existing one
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const { category, piece } = current.stage as Extract<Stage, { type: "conflict" }>;
                        setCurrent((c) => (c ? { ...c, target: "codriver" } : c));
                        if (!isSlotFilled("codriver", category, piece)) {
                          confirmItem(category, piece, "codriver", current.dataUrl);
                        } else {
                          setCurrent((c) =>
                            c
                              ? {
                                  ...c,
                                  target: "codriver",
                                  stage: {
                                    type: "conflict",
                                    category,
                                    piece,
                                    existingLabel: describeExisting(category, piece, currentEntries("codriver")[category]),
                                  },
                                }
                              : c
                          );
                        }
                      }}
                      className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800"
                    >
                      This is for my codriver
                    </button>
                    <button type="button" onClick={skip} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
                      Skip this photo
                    </button>
                  </div>
                </div>
              )}

              {current.stage.type === "confirm_item" && (
                <div>
                  {targetToggle(current.target, (t) => setCurrent((c) => (c ? { ...c, target: t } : c)))}
                  <p className="text-neutral-200">
                    I detected: <b>{CATEGORY_META[current.stage.category].label}</b>
                    {current.stage.piece && current.stage.category === "firesuit" ? ` — ${pieceLabel(current.stage.piece)}` : ""}
                    <span className="ml-1 text-neutral-500">({current.stage.confidence} confidence)</span>
                  </p>
                  {current.stage.helmet && (
                    <p className="text-neutral-400">
                      {current.stage.helmet.helmetType === "unclear"
                        ? "Style unclear from photo"
                        : current.stage.helmet.helmetType === "full_face"
                          ? "Full face (integrated chin bar)"
                          : "Open face (no chin bar)"}
                      {" · "}
                      {current.stage.helmet.hasVisor ? "visor/shield detected" : "no visor/shield detected"}
                    </p>
                  )}
                  {current.stage.notes && <p className="text-neutral-500">{current.stage.notes}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const { category, piece, helmet } = current.stage as Extract<Stage, { type: "confirm_item" }>;
                        confirmItem(category, piece, current.target, current.dataUrl, helmet);
                      }}
                      className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900"
                    >
                      Use this
                    </button>
                    <button type="button" onClick={skip} className="rounded border border-neutral-600 px-2 py-1 text-neutral-200 hover:bg-neutral-800">
                      Not right — skip
                    </button>
                  </div>
                </div>
              )}

              {current.stage.type === "confirm_tag" && (
                <div>
                  {targetToggle(current.target, (t) => setCurrent((c) => (c ? { ...c, target: t } : c)))}
                  <p className="text-neutral-200">
                    I detected a <b>{CATEGORY_META[current.stage.category].label.toLowerCase()}</b> certification tag
                    {current.stage.category === "firesuit" ? " — which piece is it from?" : ""}
                  </p>
                  {current.stage.category === "firesuit" && (
                    <div className="mt-1 flex gap-2 text-xs">
                      {(["one_piece", "jacket", "pants"] as Piece[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrent((c) => (c && c.stage.type === "confirm_tag" ? { ...c, stage: { ...c.stage, piece: p } } : c))}
                          className={`rounded border px-2 py-0.5 ${
                            current.stage.type === "confirm_tag" && current.stage.piece === p
                              ? "border-amber-600 bg-neutral-900 text-amber-300"
                              : "border-neutral-700 text-neutral-400"
                          }`}
                        >
                          {pieceLabel(p)}
                        </button>
                      ))}
                    </div>
                  )}
                  <TagCandidateList
                    candidates={current.stage.candidates}
                    notes={current.stage.tagNotes || null}
                    added={current.stage.added}
                    category={current.stage.category}
                    onAdd={(c, i) => {
                      const { category, piece } = current.stage as Extract<Stage, { type: "confirm_tag" }>;
                      addTagCandidate(category, piece, current.target, c);
                      setCurrent((cur) =>
                        cur && cur.stage.type === "confirm_tag" ? { ...cur, stage: { ...cur.stage, added: new Set(cur.stage.added).add(i) } } : cur
                      );
                    }}
                  />
                  <button type="button" onClick={skip} className="mt-2 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800">
                    Done with this photo — next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
