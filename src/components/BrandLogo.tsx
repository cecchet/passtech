"use client";

import { useEffect, useState } from "react";

const LOGO_SRC = "/frog-racing-logo.png";

/**
 * Renders the Frog Racing logo from /public/frog-racing-logo.png if present.
 * Drop the badge logo file at that exact path — nothing else needs to change.
 * Renders nothing until the file's presence is confirmed (checked via a
 * standalone Image() probe in an effect, not the visible <img>'s onError —
 * a 404 that resolves before hydration attaches listeners would otherwise
 * leave a broken-image icon on screen instead of hiding cleanly).
 */
export function BrandLogo({ className = "h-12 w-12" }: { className?: string }) {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setExists(true);
    };
    probe.onerror = () => {
      if (!cancelled) setExists(false);
    };
    probe.src = LOGO_SRC;
    return () => {
      cancelled = true;
    };
  }, []);

  if (!exists) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- presence already confirmed by the probe above
    <img
      src={LOGO_SRC}
      alt="Frog Racing"
      title="Watermelon is pastèque in French, enjoy the Frog joke!"
      className={`${className} cursor-help object-contain`}
    />
  );
}
