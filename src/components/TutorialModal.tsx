"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ALL_RULESETS } from "@/data";
import { DISCIPLINE_GROUP_ORDER } from "@/data/categoryMeta";

const INTRO_TEXT = `PassTech checks your safety equipment against the published rules of ${ALL_RULESETS.length} rulesets, spanning ${DISCIPLINE_GROUP_ORDER.length} disciplines.`;

export interface TutorialActions {
  selectRuleset: (id: string) => void;
  selectClass: (id: string | undefined) => void;
}

/** One page each app mode can show its own short, focused tour for — landing has no mode of its own, so it's keyed separately. */
export type TourId = "landing" | "reference" | "body-first" | "equipment-first";

interface TourStep {
  targetId: string;
  text: string;
  /** Runs once, synchronously with the click that advances to this step, so its DOM changes land in the same render as the step change. */
  onEnter?: (actions: TutorialActions) => void;
}

interface Tour {
  /** Only the landing tour opens on a centered, non-pointing slide first. */
  intro?: { title: string; text: string; image?: string };
  steps: TourStep[];
}

const TOURS: Record<TourId, Tour> = {
  landing: {
    intro: { title: "How PassTech works", text: INTRO_TEXT, image: "/disciplines.jpg" },
    steps: [
      { targetId: "tutorial-option-1", text: "Click Option 1 if you want to check the rules of a sanctioning body." },
      {
        targetId: "tutorial-option-2",
        text: "Click Option 2 if you want to check whether your safety gear will pass tech with a specific sanctioning body.",
      },
      { targetId: "tutorial-option-3", text: "Click Option 3 if you want to see where you can race with your safety gear!" },
      {
        targetId: "tutorial-mygear",
        text: "My Gear is your personal space to save named gear sets, so you don't have to re-enter everything each time — check any saved set against a sanctioning body, or against all of them at once.",
      },
    ],
  },
  reference: {
    steps: [
      {
        targetId: "tutorial-group-filter",
        text: "By default, PassTech checks driver, car, and rollover-protection safety gear all at once. Uncheck any of the three if you're only interested in the others — for example, uncheck “Car safety gear” to focus on just what you're wearing.",
      },
      {
        targetId: "tutorial-ruleset-picker",
        text: "Pick a sanctioning body and discipline from the dropdown. Here we've selected SCCA Solo as an example.",
        onEnter: (actions) => actions.selectRuleset("scca-solo"),
      },
      {
        targetId: "tutorial-class-picker",
        text: "If a body defines its own competitor classes, refine by class here. We've picked SCCA Solo's Modified (AM / BM / CM / DM / EM / FM) class.",
        onEnter: (actions) => actions.selectClass("modified"),
      },
      { targetId: "tutorial-source-line", text: "Click here to download the official rulebook for the selected body and class." },
      {
        targetId: "category-helmet",
        text: "Each category shows its requirement, accepted certifications, and any conditions — straight from the rulebook. Standards the body doesn't list are collapsed under a red “Not accepted” panel, so gaps are easy to spot.",
      },
    ],
  },
  "body-first": {
    steps: [
      {
        targetId: "tutorial-ruleset-picker",
        text: "Pick the sanctioning body you want to check your gear against. Here we've selected SCCA Solo as an example.",
        onEnter: (actions) => actions.selectRuleset("scca-solo"),
      },
      {
        targetId: "tutorial-class-picker",
        text: "Refine by class if the body defines its own — we've picked SCCA Solo's Modified (AM / BM / CM / DM / EM / FM) class.",
        onEnter: (actions) => actions.selectClass("modified"),
      },
      {
        targetId: "tutorial-hide-not-required",
        text: "Check “Hide Not Required Gear” to collapse the list below down to just what this body actually requires or conditionally requires.",
      },
      {
        targetId: "category-helmet",
        text: "Expand any category and fill in what you have — pick the certification standard printed on the tag, or use “Scan tag photo” to read it straight from a picture.",
      },
      {
        targetId: "tutorial-verdict",
        text: "The verdict updates live: red for a real violation, yellow when only an optional item is unresolved, green once everything required checks out.",
      },
    ],
  },
  "equipment-first": {
    steps: [
      {
        targetId: "tutorial-only-have-equipment",
        text: "Check “Only check the equipment I have” once you've entered your real gear, to hide any category you haven't filled in yet instead of counting it against you.",
      },
      {
        targetId: "tutorial-codriver-toggle",
        text: "Add a codriver's own gear — this only matters for rally bodies that require one.",
      },
      {
        targetId: "tutorial-discipline-filter",
        text: "Pick just the disciplines you race — every result below, the equipment summary counts, and the PDF export all narrow to match.",
      },
      {
        targetId: "tutorial-equipment-summary",
        text: "The number on each icon shows how many of the currently-filtered rulesets accept that exact item as entered, updating live as you fill things in.",
      },
      {
        targetId: "tutorial-eligibility-results",
        text: "Results sort into three buckets — Eligible, Eligible under condition, and Does not meet the requirements — each grouped by discipline.",
      },
    ],
  },
};

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
    // Instant, not smooth — a smooth scroll's landing position isn't known synchronously, and a
    // tour can now auto-launch from an arbitrary prior scroll position (not just near the top), so
    // measuring mid-animation was landing the callout off-screen on any large jump. Note "auto"
    // does NOT mean instant here — it means "defer to the html element's own scroll-behavior CSS",
    // which this app sets to smooth; "instant" is the only value that actually forces no animation.
    el.scrollIntoView({ behavior: "instant", block: "center" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const raf = requestAnimationFrame(update); // re-measure once layout has settled
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

export function TutorialModal({
  tour,
  open,
  onClose,
  actions,
}: {
  tour: TourId;
  open: boolean;
  onClose: () => void;
  actions: TutorialActions;
}) {
  const [step, setStep] = useState(0);
  const current = TOURS[tour];
  const hasIntro = !!current.intro;
  const totalSteps = (hasIntro ? 1 : 0) + current.steps.length;

  /* eslint-disable react-hooks/set-state-in-effect -- resets tour position when reopened, not derivable during render */
  useEffect(() => {
    if (open) setStep(0);
  }, [open, tour]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const pointerStep = hasIntro ? (step >= 1 ? current.steps[step - 1] : null) : current.steps[step];
  const rect = useTargetRect(open ? (pointerStep?.targetId ?? null) : null);

  if (!open) return null;

  const next = () => {
    const newStep = step + 1;
    if (newStep >= totalSteps) {
      onClose();
      return;
    }
    // Run the upcoming step's side effects in this same click handler (not a later effect) so
    // React batches them with setStep — the app's state (and DOM) is already updated by the time
    // this step's target element is measured.
    const stepIndex = hasIntro ? newStep - 1 : newStep;
    current.steps[stepIndex]?.onEnter?.(actions);
    setStep(newStep);
  };

  const isLastStep = step === totalSteps - 1;

  if (!pointerStep && current.intro) {
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
              {current.intro.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Exit the tutorial"
              className="shrink-0 rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Exit the tutorial
            </button>
          </div>

          {current.intro.image && (
            // eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img>
            <img src={current.intro.image} alt="" className="mt-3 w-full rounded-lg border border-neutral-700" />
          )}

          <p className="mt-3 text-sm text-neutral-300">{current.intro.text}</p>

          <button type="button" onClick={next} className="mt-5 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Next
          </button>
        </div>
      </div>
    );
  }

  if (!pointerStep) return null;

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
      {/* Blocks interaction with the rest of the page so users progress via the Next button, not by clicking the highlighted card directly. */}
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
            Step {step + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit the tutorial"
            className="shrink-0 rounded border border-neutral-600 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
          >
            Exit the tutorial
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-100">{pointerStep.text}</p>
        <button type="button" onClick={next} className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
          {isLastStep ? "Done" : "Next"}
        </button>
      </div>
    </>
  );
}
