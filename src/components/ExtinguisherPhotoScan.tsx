"use client";

import { useRef, useState } from "react";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { ExtinguisherUnit } from "@/lib/matcher";

interface ExtinguisherAnalysis {
  classARating: number;
  bcRating: number;
  weightLbs: number;
  manufactureDate: string;
  certificationDate: string;
  certificationDueDate: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

/** Scans a photo of one extinguisher's label/service tag and offers to fill in its rating, weight, and dates. */
export function ExtinguisherPhotoScan({ onApply }: { onApply: (patch: Partial<ExtinguisherUnit>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtinguisherAnalysis | null>(null);
  const [applied, setApplied] = useState(false);

  const handleFile = async (file: File) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const imageDataUrl = await resizeImageToDataUrl(file);
      const res = await fetch("/api/analyze-extinguisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("idle");
    } catch {
      setError("Couldn't reach the server.");
      setStatus("error");
    }
  };

  const apply = () => {
    if (!result) return;
    onApply({
      ...(result.classARating ? { classARating: result.classARating } : {}),
      ...(result.bcRating ? { bcRating: result.bcRating } : {}),
      ...(result.weightLbs ? { weightLbs: result.weightLbs } : {}),
      ...(result.manufactureDate ? { manufactureDate: result.manufactureDate } : {}),
      ...(result.certificationDate ? { certificationDate: result.certificationDate } : {}),
      ...(result.certificationDueDate ? { certificationDueDate: result.certificationDueDate } : {}),
    });
    setApplied(true);
  };

  const summary = result
    ? [
        result.classARating || result.bcRating ? `${result.classARating ? `${result.classARating}-A:` : ""}${result.bcRating ? `${result.bcRating}-B:C` : ""}` : null,
        result.weightLbs ? `${result.weightLbs} lb` : null,
        result.manufactureDate ? `mfg ${result.manufactureDate}` : null,
        result.certificationDate ? `serviced ${result.certificationDate}` : null,
        result.certificationDueDate ? `due ${result.certificationDueDate}` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

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
        {status === "loading" ? "Analyzing photo…" : "📷 Scan label photo"}
      </button>
      <span className="ml-2 text-neutral-500">Reads the rating, weight, and dates off the cylinder&rsquo;s label or service tag.</span>

      {error && <p className="mt-2 text-red-400">{error}</p>}

      {result && (
        <div className="mt-2 rounded border border-neutral-600 p-2">
          <p className="text-neutral-200">
            {summary || "Nothing legible found on this photo"} <span className="ml-1 text-neutral-500">({result.confidence} confidence)</span>
          </p>
          {result.notes && <p className="mt-1 text-neutral-500">{result.notes}</p>}
          <button
            type="button"
            disabled={applied || !summary}
            onClick={apply}
            className="mt-1 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900 disabled:opacity-50"
          >
            {applied ? "Applied" : "Use this"}
          </button>
        </div>
      )}
    </div>
  );
}
