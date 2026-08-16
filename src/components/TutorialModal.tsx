"use client";

import { useEffect } from "react";

interface TutorialSection {
  number: number;
  title: string;
  description: string;
}

const MODES: TutorialSection[] = [
  {
    number: 1,
    title: "What does a sanctioning body require?",
    description:
      "Pick a sanctioning body and discipline and browse every equipment category it covers — what's required, what's accepted, any conditions — without entering your own gear. Each category also shows a collapsible red list of standards in our registry that body doesn't list, so you can spot gaps in a rulebook.",
  },
  {
    number: 2,
    title: "Will my equipment pass tech?",
    description:
      "Pick a sanctioning body, then enter what you actually have — helmet, HANS/HNR, firesuit, gloves, shoes, undergarment, arm restraint. Each item shows OK / Rejected / Needs info right under its inputs, checked against that body's rules.",
  },
  {
    number: 3,
    title: "Where can my equipment race?",
    description:
      "Enter your gear once and see every sanctioning body it's eligible for, incomplete for (missing info), or rejected by — useful if you compete with more than one club or series.",
  },
];

const TIPS = [
  {
    title: "Scan a tag instead of typing it in",
    description:
      "In modes 2 and 3, use the photo option on any item to snap or upload a picture of the certification tag — it reads the standard and any printed dates for you. It also flags photos that look like the wrong kind of tag (e.g. a glove tag scanned while checking a firesuit).",
  },
  {
    title: "Expiration warnings",
    description: "If an accepted certification is going to expire within the current calendar year, you'll see a ⚠️ warning with the exact date next to that item's result.",
  },
  {
    title: "Don't see your certification listed?",
    description: "Choose \"Not listed / other\" and describe it, then use \"Report this certification for review\" — it gets queued at the bottom of the page and you can email it to us directly.",
  },
];

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6"
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

        <p className="mt-2 text-sm text-neutral-300">
          PassTech checks your racer safety equipment (helmet, HANS/HNR, firesuit, gloves, shoes, undergarment, arm
          restraint) against the published rules of ~20 sanctioning bodies. Pick one of three ways to use it from the
          main menu:
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {MODES.map((m) => (
            <div key={m.number} className="rounded-lg border border-neutral-700 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                  {m.number}
                </span>
                <span className="text-sm font-semibold">{m.title}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">{m.description}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-5 text-sm font-semibold">Tips</h3>
        <div className="mt-2 flex flex-col gap-2">
          {TIPS.map((t) => (
            <div key={t.title}>
              <p className="text-xs font-semibold text-neutral-300">{t.title}</p>
              <p className="text-xs text-neutral-400">{t.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-lg border border-amber-700 bg-amber-950 p-3 text-xs text-amber-200">
          PassTech is a pre-screening tool, not a certification — a tech inspector/scrutineer still makes the final
          call at the event. Always verify against the current official rulebook.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
