"use client";

import { useId } from "react";

/**
 * A plain `<input type="file" accept="image/*">` with no `capture` attribute opens the native
 * gallery/photo-library picker on mobile — but on at least some Android + Google Photos
 * combinations, that's now the *only* option offered, with no way back to the camera from there.
 * Rather than pick one behavior, every photo-upload spot gets this as a second, explicit button
 * alongside its existing (gallery) one — `capture="environment"` here forces the camera specifically.
 */
export function CameraPhotoButton({ onFile, className, disabled }: { onFile: (file: File) => void; className: string; disabled?: boolean }) {
  const id = useId();
  return (
    <label htmlFor={id} className={className} aria-disabled={disabled}>
      📷 Take a picture with my camera
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
