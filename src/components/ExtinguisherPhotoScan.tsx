"use client";

import { useState } from "react";
import { ExtinguisherUnit } from "@/lib/matcher";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

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

/**
 * Scans a photo already attached to this extinguisher unit for its rating/weight/dates and offers
 * to fill them in — separate from adding the photo itself, so attaching a reference photo doesn't
 * force a Gemini call every time (mirrors ItemPhotoThumb's "add photo" / "scan for tags" split for
 * every other category).
 */
export function ExtinguisherLabelScan({ imageDataUrl, onApply }: { imageDataUrl: string; onApply: (patch: Partial<Omit<ExtinguisherUnit, "photoDataUrls">>) => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtinguisherAnalysis | null>(null);
  const [applied, setApplied] = useState(false);

  const scan = async () => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setApplied(false);
    const { ok, data } = await fetchWithTimeout("/api/analyze-extinguisher", { imageDataUrl });
    if (!ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong.");
      setStatus("error");
      return;
    }
    setResult(data as unknown as ExtinguisherAnalysis);
    setStatus("idle");
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
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={scan}
        disabled={status === "loading"}
        className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === "loading" ? "Scanning…" : "🔍 Scan for tags"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result && (
        <div className="rounded border border-neutral-600 p-2 text-xs">
          <p className="text-neutral-200">
            {summary || "Nothing legible found"} <span className="ml-1 text-neutral-500">({result.confidence} confidence)</span>
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
