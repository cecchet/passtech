"use client";

import { useId, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META } from "@/data/categoryMeta";
import { NOT_LISTED } from "@/data/standards";
import { CertificationEntry, newCertification } from "@/lib/matcher";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { fetchWithTimeout, REQUEST_TIMEOUT_LABEL } from "@/lib/fetchWithTimeout";
import { useTagScanner } from "@/lib/useTagScanner";
import { TagCandidateList } from "@/components/TagCandidateList";
import { CLASSIFIABLE_CATEGORIES } from "@/components/AutomaticGearImport";

interface CertCandidate {
  standardId: string;
  rawText: string;
  homologationNumber: string;
  labelDate: string;
  tagExpirationDate: string;
  confidence: "high" | "medium" | "low";
}

function certCandidateToEntry(c: CertCandidate): CertificationEntry {
  return {
    ...newCertification(),
    standardId: c.standardId,
    customStandardLabel: c.standardId === NOT_LISTED ? c.rawText : undefined,
    homologationNumber: c.homologationNumber || undefined,
    labelDate: c.labelDate || undefined,
    tagExpirationDate: c.tagExpirationDate || undefined,
  };
}

/**
 * The one-photo-in, one-category-out front door for Buyer mode and Scrutineer mode: upload a
 * photo of a single piece of gear, get back which category it is (via the same
 * /api/analyze-gear-photo call AutomaticGearImport uses), or fall back to picking the category
 * yourself. That same call already reads any certification tag legible in the photo — whether
 * it's a dedicated tag close-up or just readable within a wider item shot — so a confirmed
 * category with a tag already found is handed straight to the caller. When none was found, this
 * component stays open one more step and explicitly asks for a tag photo (via /api/analyze-tag,
 * now that the category is known) rather than silently leaving that to be discovered later in
 * CategoryCard's own, less prominent "Scan tag photo" control.
 */
export function QuickItemScan({
  onDone,
}: {
  onDone: (category: EquipmentCategory, photoDataUrl?: string, certifications?: CertificationEntry[]) => void;
}) {
  const [stage, setStage] = useState<
    | { type: "idle" }
    | { type: "analyzing" }
    | { type: "detected"; category: EquipmentCategory; confidence: "high" | "medium" | "low"; notes: string; photoDataUrl: string; certifications: CertCandidate[] }
    | { type: "need_tag"; category: EquipmentCategory; photoDataUrl: string; itemCertifications: CertificationEntry[] }
    | { type: "not_gear"; notes: string }
    | { type: "error"; message: string }
    | { type: "manual" }
  >({ type: "idle" });
  const [manualCategory, setManualCategory] = useState<EquipmentCategory>("helmet");
  const inputId = useId();
  const tagInputId = useId();

  const scanCategory = stage.type === "need_tag" ? stage.category : "helmet";
  const scanner = useTagScanner(scanCategory, (cert) => {
    setStage((s) => (s.type === "need_tag" ? { ...s, itemCertifications: [...s.itemCertifications, cert] } : s));
  });

  const analyzePhoto = async (file: File) => {
    setStage({ type: "analyzing" });
    let photoDataUrl: string;
    try {
      photoDataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
    } catch {
      setStage({ type: "error", message: "Couldn't read this photo file." });
      return;
    }
    const { ok, data } = await fetchWithTimeout("/api/analyze-gear-photo", { imageDataUrl: photoDataUrl });
    if (!ok) {
      const message = typeof data.error === "string" ? data.error : "Something went wrong.";
      setStage({ type: "error", message });
      return;
    }
    const category = data.category as string;
    if (!data.isGearPhoto || !category || !CLASSIFIABLE_CATEGORIES.includes(category as EquipmentCategory)) {
      setStage({ type: "not_gear", notes: (data.notes as string) ?? "" });
      return;
    }
    setStage({
      type: "detected",
      category: category as EquipmentCategory,
      confidence: (data.categoryConfidence as "high" | "medium" | "low") ?? "medium",
      notes: (data.notes as string) ?? "",
      photoDataUrl,
      certifications: (data.certifications as CertCandidate[]) ?? [],
    });
  };

  const confirmDetected = (s: Extract<typeof stage, { type: "detected" }>) => {
    if (s.certifications.length > 0) {
      onDone(s.category, s.photoDataUrl, s.certifications.map(certCandidateToEntry));
    } else {
      scanner.reset();
      setStage({ type: "need_tag", category: s.category, photoDataUrl: s.photoDataUrl, itemCertifications: [] });
    }
  };

  if (stage.type === "idle" || stage.type === "not_gear" || stage.type === "error") {
    return (
      <div className="rounded-lg border border-neutral-700 p-4">
        {stage.type === "not_gear" && (
          <p className="mb-3 text-sm text-amber-400">
            Couldn&rsquo;t confidently tell what this photo shows.{stage.notes ? ` ${stage.notes}` : ""} Try another photo, or pick the category yourself below.
          </p>
        )}
        {stage.type === "error" && <p className="mb-3 text-sm text-amber-400">{stage.message} Try another photo, or pick the category yourself below.</p>}
        <label
          htmlFor={inputId}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
        >
          📷 Upload an overall picture of the item
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void analyzePhoto(file);
            }}
          />
        </label>
        <button type="button" onClick={() => setStage({ type: "manual" })} className="mt-3 block text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-200">
          Or pick the category yourself instead
        </button>
      </div>
    );
  }

  if (stage.type === "analyzing") {
    return (
      <div className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-400">Reading the photo (can take up to {REQUEST_TIMEOUT_LABEL})…</div>
    );
  }

  if (stage.type === "manual") {
    return (
      <div className="rounded-lg border border-neutral-700 p-4">
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">What kind of gear is this?</span>
          <select
            className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
            value={manualCategory}
            onChange={(e) => setManualCategory(e.target.value as EquipmentCategory)}
          >
            {CLASSIFIABLE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-neutral-900 text-neutral-100">
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => onDone(manualCategory)} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
          Continue
        </button>
      </div>
    );
  }

  if (stage.type === "need_tag") {
    return (
      <div className="rounded-lg border border-neutral-700 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset */}
        <img src={stage.photoDataUrl} alt="" className="mb-3 h-24 w-24 rounded object-cover" />
        <p className="text-neutral-200">
          Detected: <b>{CATEGORY_META[stage.category].label}</b>
        </p>
        <p className="mt-1 text-sm text-amber-400">We couldn&rsquo;t find a certification tag on that photo. Upload a picture of the tag:</p>
        <label
          htmlFor={tagInputId}
          className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
        >
          📷 Upload a photo of the certification tag
          <input
            id={tagInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              let dataUrl: string;
              try {
                dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
              } catch {
                return;
              }
              void scanner.analyze(dataUrl);
            }}
          />
        </label>
        {scanner.status === "loading" && <p className="mt-2 text-sm text-neutral-400">Reading the tag (can take up to {REQUEST_TIMEOUT_LABEL})…</p>}
        {scanner.error && <p className="mt-2 text-sm text-red-400">{scanner.error}</p>}
        {scanner.candidates && (
          <TagCandidateList candidates={scanner.candidates} notes={scanner.notes} added={scanner.added} onAdd={scanner.addCandidate} category={stage.category} />
        )}
        <button
          type="button"
          onClick={() => onDone(stage.category, stage.photoDataUrl, stage.itemCertifications)}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          {stage.itemCertifications.length > 0 ? `Continue with ${stage.itemCertifications.length} certification(s) added` : "Continue without a certification"}
        </button>
      </div>
    );
  }

  // stage.type === "detected"
  return (
    <div className="rounded-lg border border-neutral-700 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset */}
      <img src={stage.photoDataUrl} alt="" className="mb-3 h-24 w-24 rounded object-cover" />
      <p className="text-neutral-200">
        I detected: <b>{CATEGORY_META[stage.category].label}</b>
        <span className="ml-1 text-neutral-500">({stage.confidence} confidence)</span>
      </p>
      {stage.certifications.length > 0 && (
        <p className="mt-1 text-sm text-emerald-400">
          Found {stage.certifications.length} certification{stage.certifications.length > 1 ? "s" : ""} on this photo — it&rsquo;ll be added automatically.
        </p>
      )}
      {stage.notes && <p className="mt-1 text-xs text-neutral-500">{stage.notes}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => confirmDetected(stage)}
          className="rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-900"
        >
          Yes, that&rsquo;s right
        </button>
        <button
          type="button"
          onClick={() => setStage({ type: "manual" })}
          className="rounded-lg border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Not right — pick manually
        </button>
      </div>
    </div>
  );
}

/**
 * Scrutineer mode's "Scan another [category]" front door: unlike QuickItemScan, the category is
 * already known (same as the item just scanned) — so this skips straight to the tag photo instead
 * of re-detecting a category or asking for an overall shot again. Mounted only while a rescan is in
 * progress and unmounted once it hands back to the caller, so its own useTagScanner state (and the
 * category card's, once that remounts) can never carry stale "Added" candidates over from the
 * previous item.
 */
export function TagOnlyScan({ category, onDone }: { category: EquipmentCategory; onDone: (certifications: CertificationEntry[]) => void }) {
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const scanner = useTagScanner(category, (cert) => setCertifications((c) => [...c, cert]));
  const tagInputId = useId();

  return (
    <div className="rounded-lg border border-neutral-700 p-4">
      <p className="text-neutral-200">
        Scanning another: <b>{CATEGORY_META[category].label}</b>
      </p>
      <label
        htmlFor={tagInputId}
        className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900"
      >
        📷 Upload a photo of the certification tag
        <input
          id={tagInputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            let dataUrl: string;
            try {
              dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
            } catch {
              return;
            }
            void scanner.analyze(dataUrl);
          }}
        />
      </label>
      {scanner.status === "loading" && <p className="mt-2 text-sm text-neutral-400">Reading the tag (can take up to {REQUEST_TIMEOUT_LABEL})…</p>}
      {scanner.error && <p className="mt-2 text-sm text-red-400">{scanner.error}</p>}
      {scanner.candidates && (
        <TagCandidateList candidates={scanner.candidates} notes={scanner.notes} added={scanner.added} onAdd={scanner.addCandidate} category={category} />
      )}
      <button type="button" onClick={() => onDone(certifications)} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
        {certifications.length > 0 ? `Continue with ${certifications.length} certification(s) added` : "Continue without a certification"}
      </button>
    </div>
  );
}
