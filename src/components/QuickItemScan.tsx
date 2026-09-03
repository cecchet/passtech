"use client";

import { useId, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META } from "@/data/categoryMeta";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { fetchWithTimeout, REQUEST_TIMEOUT_LABEL } from "@/lib/fetchWithTimeout";
import { CLASSIFIABLE_CATEGORIES } from "@/components/AutomaticGearImport";

/**
 * The one-photo-in, one-category-out front door for Buyer mode and Scrutineer mode: upload a
 * photo of a single piece of gear, get back which category it is (via the same
 * /api/analyze-gear-photo call AutomaticGearImport uses), or fall back to picking the category
 * yourself. Deliberately stops there — it does NOT also try to read a certification off the photo
 * (unlike AutomaticGearImport's queue, which merges category+cert detection into one step). Once
 * the category is known, the caller renders CategoryCard for it, whose own "Add a photo" / "Scan
 * tag photo" controls already handle certification reading — reusing that instead of duplicating
 * it here keeps this component small and the cert-reading UX identical everywhere it appears.
 */
export function QuickItemScan({ onDone }: { onDone: (category: EquipmentCategory, photoDataUrl?: string) => void }) {
  const [stage, setStage] = useState<
    | { type: "idle" }
    | { type: "analyzing" }
    | { type: "detected"; category: EquipmentCategory; confidence: "high" | "medium" | "low"; notes: string; photoDataUrl: string }
    | { type: "not_gear"; notes: string }
    | { type: "error"; message: string }
    | { type: "manual" }
  >({ type: "idle" });
  const [manualCategory, setManualCategory] = useState<EquipmentCategory>("helmet");
  const inputId = useId();

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
    });
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
          📷 Upload a photo of the item
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

  // stage.type === "detected"
  return (
    <div className="rounded-lg border border-neutral-700 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset */}
      <img src={stage.photoDataUrl} alt="" className="mb-3 h-24 w-24 rounded object-cover" />
      <p className="text-neutral-200">
        I detected: <b>{CATEGORY_META[stage.category].label}</b>
        <span className="ml-1 text-neutral-500">({stage.confidence} confidence)</span>
      </p>
      {stage.notes && <p className="mt-1 text-xs text-neutral-500">{stage.notes}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDone(stage.category, stage.photoDataUrl)}
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
