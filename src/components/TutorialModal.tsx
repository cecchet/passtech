"use client";

import { useEffect, useState, type CSSProperties } from "react";

const INTRO_TEXT =
  "PassTech checks your racer safety equipment (helmet, balaclava, HANS/HNR, firesuit, gloves, shoes, undergarment, arm restraint) against the published rules of ~20 sanctioning bodies.";

interface PointerStep {
  targetId: string;
  text: string;
}

const POINTER_STEPS: PointerStep[] = [
  { targetId: "tutorial-option-1", text: "Click Option 1 if you want to check the rules of a sanctioning body." },
  { targetId: "tutorial-option-2", text: "Click Option 2 if you want to check whether your safety gear will pass tech with a specific sanctioning body." },
  { targetId: "tutorial-option-3", text: "Click Option 3 if you want to see where you can race with your safety gear!" },
];

const TOTAL_STEPS = 1 + POINTER_STEPS.length;

/** Tracks the viewport-relative rect of a target element by id, scrolling it into view and re-measuring on resize/scroll. */
function useTargetRect(targetId: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- syncs internal position state to the target DOM node's live layout, not derivable from props/state */
  useEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }
    const el = document.getElementById(targetId);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const raf = requestAnimationFrame(update); // re-measure once the smooth scroll settles
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [targetId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return rect;
}

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect -- resets tour position when reopened, not derivable during render */
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const pointerStep = step >= 1 ? POINTER_STEPS[step - 1] : null;
  const rect = useTargetRect(open ? (pointerStep?.targetId ?? null) : null);

  if (!open) return null;

  const next = () => {
    if (step + 1 >= TOTAL_STEPS) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  if (!pointerStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="tutorial-title" className="text-lg font-bold">
              How PassTech works
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tutorial"
              className="shrink-0 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Close
            </button>
          </div>

          <p className="mt-3 text-sm text-neutral-300">{INTRO_TEXT}</p>

          <button type="button" onClick={next} className="mt-5 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            OK
          </button>
        </div>
      </div>
    );
  }

  const pad = 8;
  const spotlightStyle: CSSProperties = rect
    ? {
        position: "fixed",
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        borderRadius: 12,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
        border: "2px solid white",
        pointerEvents: "none",
        zIndex: 51,
      }
    : { display: "none" };

  const calloutWidth = 320;
  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const showBelow = rect ? spaceBelow > 160 || rect.top < 160 : true;
  const calloutStyle: CSSProperties = rect
    ? {
        position: "fixed",
        top: showBelow ? rect.bottom + pad + 12 : undefined,
        bottom: showBelow ? undefined : window.innerHeight - rect.top + pad + 12,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - calloutWidth - 8)),
        zIndex: 52,
      }
    : { display: "none" };

  return (
    <>
      {/* Blocks interaction with the rest of the page so users progress via the OK button, not by clicking the highlighted card directly. */}
      <div className="fixed inset-0 z-50" onClick={(e) => e.stopPropagation()} />
      <div style={spotlightStyle} />
      <div
        role="dialog"
        aria-modal="true"
        style={calloutStyle}
        className="w-80 max-w-[calc(100vw-16px)] rounded-lg border border-neutral-700 bg-neutral-900 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-500">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="shrink-0 rounded border border-neutral-600 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-100">{pointerStep.text}</p>
        <button type="button" onClick={next} className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
          OK
        </button>
      </div>
    </>
  );
}
