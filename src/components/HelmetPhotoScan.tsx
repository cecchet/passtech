"use client";

import { useRef, useState } from "react";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { EquipmentEntry } from "@/lib/matcher";

interface HelmetAnalysis {
  helmetType: "open_face" | "full_face" | "unclear";
  hasVisor: boolean;
  visorNote: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

/**
 * Separate from PhotoScan (tag scanning) on purpose — the certification tag is usually hidden
 * inside the helmet under the liner, so a single photo can't show both the tag and the helmet's
 * overall shape/visor. This asks for a photo of the whole helmet from outside instead.
 */
export function HelmetPhotoScan({ onApply }: { onApply: (patch: Partial<EquipmentEntry>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HelmetAnalysis | null>(null);
  const [applied, setApplied] = useState(false);

  const handleFile = async (file: File) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const imageDataUrl = await resizeImageToDataUrl(file);
      const res = await fetch("/api/analyze-helmet", {
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
      ...(result.helmetType !== "unclear" ? { helmetType: result.helmetType } : {}),
      hasVisor: result.hasVisor,
      visorNote: result.visorNote || undefined,
    });
    setApplied(true);
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
        {status === "loading" ? "Analyzing photo…" : "📷 Scan a full photo of the helmet"}
      </button>
      <span className="ml-2 text-neutral-500">
        Detects open/full face and visor from a whole-helmet photo — separate from the tag photo above, since the tag&rsquo;s usually hidden under the
        liner.
      </span>

      {error && <p className="mt-2 text-red-400">{error}</p>}

      {result && (
        <div className="mt-2 rounded border border-neutral-600 p-2">
          <p className="text-neutral-200">
            {result.helmetType === "unclear"
              ? "Style unclear from photo"
              : result.helmetType === "full_face"
                ? "Full face (integrated chin bar)"
                : "Open face (no chin bar)"}
            <span className="ml-1 text-neutral-500">({result.confidence} confidence)</span>
          </p>
          <p className="text-neutral-400">
            {result.hasVisor ? "Visor/shield detected" : "No visor/shield detected"}
            {result.visorNote ? ` — ${result.visorNote}` : ""}
          </p>
          {result.notes && <p className="mt-1 text-neutral-500">{result.notes}</p>}
          <button
            type="button"
            disabled={applied}
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
