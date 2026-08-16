"use client";

import { useRef, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { NOT_LISTED, standardLabel } from "@/data/standards";
import { CertificationEntry, newCertification } from "@/lib/matcher";

interface Candidate {
  standardId: string;
  rawText: string;
  labelDate: string;
  tagExpirationDate: string;
  confidence: "high" | "medium" | "low";
  categoryMismatch: boolean;
  detectedCategory: string;
}

interface Props {
  category: EquipmentCategory;
  onAdd: (cert: CertificationEntry) => void;
}

export function PhotoScan({ category, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const handleFile = async (file: File) => {
    setStatus("loading");
    setError(null);
    setCandidates(null);
    setAdded(new Set());
    try {
      const imageDataUrl = await resizeImageToDataUrl(file);
      const res = await fetch("/api/analyze-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, imageDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setCandidates(data.candidates ?? []);
      setNotes(data.notes || null);
      setStatus("idle");
    } catch {
      setError("Couldn't reach the server.");
      setStatus("error");
    }
  };

  const addCandidate = (c: Candidate, i: number) => {
    onAdd({
      ...newCertification(),
      standardId: c.standardId,
      customStandardLabel: c.standardId === NOT_LISTED ? c.rawText : undefined,
      labelDate: c.labelDate || undefined,
      tagExpirationDate: c.tagExpirationDate || undefined,
    });
    setAdded((prev) => new Set(prev).add(i));
  };

  return (
    <div className="rounded border border-dashed border-neutral-600 p-2 text-xs">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "loading"}
        className="rounded border border-neutral-600 px-2 py-1 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === "loading" ? "Analyzing photo…" : "📷 Scan tag photo"}
      </button>
      <span className="ml-2 text-neutral-500">Suggests values — nothing is added until you confirm.</span>

      {error && <p className="mt-2 text-red-400">{error}</p>}

      {candidates && (
        <div className="mt-2 flex flex-col gap-2">
          {notes && <p className="text-neutral-400">{notes}</p>}
          {candidates.length === 0 && <p className="text-neutral-400">No certification recognized in the photo.</p>}
          {candidates.map((c, i) => (
            <div
              key={i}
              className={`rounded border p-2 ${c.categoryMismatch ? "border-red-600 bg-red-950" : "border-neutral-600"}`}
            >
              {c.categoryMismatch && (
                <p className="mb-1 flex items-center gap-1 font-semibold text-red-300">
                  <span aria-hidden>⚠️</span>
                  Wrong item? This looks like a {c.detectedCategory || "different"} tag, not this category.
                </p>
              )}
              <p className={c.categoryMismatch ? "text-red-200" : "text-neutral-200"}>
                {c.standardId === NOT_LISTED ? `"${c.rawText}"` : standardLabel(c.standardId)}
                <span className="ml-1 text-neutral-500">({c.confidence} confidence)</span>
              </p>
              {(c.labelDate || c.tagExpirationDate) && (
                <p className="text-neutral-500">
                  {c.labelDate && `Label date: ${c.labelDate} `}
                  {c.tagExpirationDate && `Expires: ${c.tagExpirationDate}`}
                </p>
              )}
              <button
                type="button"
                disabled={added.has(i)}
                onClick={() => addCandidate(c, i)}
                className={
                  c.categoryMismatch
                    ? "mt-1 rounded border border-red-700 bg-red-900 px-2 py-1 text-red-200 hover:bg-red-800 disabled:opacity-50"
                    : "mt-1 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900 disabled:opacity-50"
                }
              >
                {added.has(i) ? "Added" : c.categoryMismatch ? "Add anyway" : "Use this — add as a certification"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
