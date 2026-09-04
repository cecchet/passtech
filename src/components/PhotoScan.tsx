"use client";

import { useEffect, useRef, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { CertificationEntry } from "@/lib/matcher";
import { useTagScanner } from "@/lib/useTagScanner";
import { TagCandidateList } from "@/components/TagCandidateList";
import { CameraPhotoButton } from "@/components/CameraPhotoButton";

interface Props {
  category: EquipmentCategory;
  onAdd: (cert: CertificationEntry) => void;
}

export function PhotoScan({ category, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scanner = useTagScanner(category, onAdd);
  // Defaults to true so SSR/first paint doesn't flash the offline state before hydration checks the real value.
  const [online, setOnline] = useState(true);

  // Reads the real navigator.onLine state once mounted client-side (unavailable during SSR).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFile = async (file: File) => {
    const imageDataUrl = await resizeImageToDataUrl(file);
    await scanner.analyze(imageDataUrl);
  };

  return (
    <div className="rounded border border-dashed border-neutral-600 p-2 text-xs">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
        disabled={scanner.status === "loading" || !online}
        className="rounded border border-neutral-600 px-2 py-1 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        {scanner.status === "loading" ? "Analyzing photo…" : "📷 Scan tag photo"}
      </button>
      <CameraPhotoButton
        onFile={handleFile}
        disabled={scanner.status === "loading" || !online}
        className="ml-2 rounded border border-neutral-600 px-2 py-1 text-neutral-300 hover:bg-neutral-800 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      />
      {online ? (
        <span className="ml-2 text-neutral-500">Suggests values — nothing is added until you confirm.</span>
      ) : (
        <span className="ml-2 text-amber-400">Offline — photo scan needs a connection. Enter the certification manually below.</span>
      )}

      {scanner.error && <p className="mt-2 text-red-400">{scanner.error}</p>}

      {scanner.candidates && (
        <TagCandidateList candidates={scanner.candidates} notes={scanner.notes} added={scanner.added} onAdd={scanner.addCandidate} category={category} />
      )}
    </div>
  );
}
