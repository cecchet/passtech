"use client";

import { useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { NOT_LISTED } from "@/data/standards";
import { CertificationEntry, newCertification } from "@/lib/matcher";

export interface TagCandidate {
  standardId: string;
  rawText: string;
  homologationNumber: string;
  labelDate: string;
  tagExpirationDate: string;
  confidence: "high" | "medium" | "low";
  categoryMismatch: boolean;
  detectedCategory: string;
}

/** Shared logic behind "scan a photo for certification tags" — used both by the upload-and-scan flow (PhotoScan) and by scanning a photo already attached to a garage item. */
export function useTagScanner(category: EquipmentCategory, onAdd: (cert: CertificationEntry) => void) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<TagCandidate[] | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const analyze = async (imageDataUrl: string) => {
    setStatus("loading");
    setError(null);
    setCandidates(null);
    setAdded(new Set());
    try {
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

  const addCandidate = (c: TagCandidate, i: number) => {
    onAdd({
      ...newCertification(),
      standardId: c.standardId,
      customStandardLabel: c.standardId === NOT_LISTED ? c.rawText : undefined,
      homologationNumber: c.homologationNumber || undefined,
      labelDate: c.labelDate || undefined,
      tagExpirationDate: c.tagExpirationDate || undefined,
    });
    setAdded((prev) => new Set(prev).add(i));
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setCandidates(null);
    setNotes(null);
    setAdded(new Set());
  };

  return { status, error, candidates, notes, added, analyze, addCandidate, reset };
}
