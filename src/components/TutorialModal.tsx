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
export type TourId = "landing" | "reference" | "body-first" | "equipment-first" | "garage";

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
    intro: { title: "How PassTech works", text: INTRO_TEXT, image: "/11disciplines.png" },
    steps: [
      { targetId: "tutorial-option-1", text: "Click Option 1 if you want to check the rules of a sanctioning body." },
      {
        targetId: "tutorial-option-2",
        text: "Click Option 2 to save your safety gear in My Gear — from there you can check any saved gear set against a specific sanctioning body, or see everywhere it's eligible to race, without re-entering everything each time.",
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
        text: "Pick a discipline first, then a sanctioning body within it — two short dropdowns instead of one long list spanning every body across every discipline. Here we've picked Autocross, then SCCA Solo.",
        onEnter: (actions) => actions.selectRuleset("scca-solo"),
      },
      {
        targetId: "tutorial-class-picker",
        text: "If a body defines its own competitor classes, refine by class here. We've picked SCCA Solo's Modified (AM / BM / CM / DM / EM / FM) class.",
        onEnter: (actions) => actions.selectClass("modified"),
      },
      { targetId: "tutorial-source-line", text: "Click here to download the official rulebook for the selected body and class." },
      {
        targetId: "tutorial-tech-sheet-link",
        text: "Not every body publishes one, but when they do, a “View sample tech sheet” link shows up right here — an example of the actual form a scrutineer would use at the track. We've switched to Pikes Peak International Hill Climb for this example, since it has one.",
        onEnter: (actions) => actions.selectRuleset("pikespeak-hillclimb"),
      },
      {
        targetId: "tutorial-equipment-summary",
        text: "The Equipment Summary groups everything required or conditional into a quick icon grid — click any icon to jump straight to that category below. “Download PDF report” turns the whole page into a printable copy. Back to SCCA Solo for the rest of this tour.",
        onEnter: (actions) => {
          actions.selectRuleset("scca-solo");
          actions.selectClass("modified");
        },
      },
      {
        targetId: "category-seat",
        text: "Each category shows its requirement, a plain-language note, and any accepted certifications — straight from the rulebook. Some, like Seat here, accept plain stock/OEM equipment with no certification at all; standards the body doesn't list are collapsed under a red “Not accepted” panel, so gaps are easy to spot.",
      },
      {
        targetId: "category-firesuit",
        text: "Some categories also show up to four small logos, in this fixed order: a globe linking to Frog Racing's own write-up on that piece of gear, a Frog Racing video, a plain YouTube logo for a good outside video that isn't from Frog Racing, and a cart linking to somewhere to buy it. These are just optional research links — none of them are printed on the PDF report.",
      },
    ],
  },
  "body-first": {
    steps: [
      {
        targetId: "tutorial-ruleset-picker",
        text: "Pick a discipline first (step 1), then the sanctioning body within it you want to check your gear against (step 2).",
      },
      {
        targetId: "tutorial-class-picker",
        text: "If the body defines its own competitor classes, refine by class here.",
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
      {
        targetId: "category-firesuit",
        text: "Some categories also show up to four small logos, in this fixed order: a globe linking to Frog Racing's own write-up on that piece of gear, a Frog Racing video, a plain YouTube logo for a good outside video that isn't from Frog Racing, and a cart linking to somewhere to buy it. These are just optional research links — none of them are printed on the PDF report.",
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
        targetId: "tutorial-hide-not-required",
        text: "Check “Hide Not Required Gear” to collapse each ruleset's results — and the PDF export — down to just what it actually requires or conditionally requires, instead of listing all 24 categories.",
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
      {
        targetId: "category-firesuit",
        text: "Some categories also show up to four small logos, in this fixed order: a globe linking to Frog Racing's own write-up on that piece of gear, a Frog Racing video, a plain YouTube logo for a good outside video that isn't from Frog Racing, and a cart linking to somewhere to buy it. These are just optional research links — none of them are printed on the PDF report.",
      },
    ],
  },
  garage: {
    steps: [
      {
        targetId: "tutorial-garage-add",
        text: "Build a gear set by uploading photos (Automatic mode figures out what's what) or entering it yourself (Manual mode) — or import one someone already exported to a file.",
      },
      {
        targetId: "tutorial-garage-list",
        text: "Tap a saved gear set to open its actions: check it against one sanctioning body (“Will my equipment pass tech?”), see everywhere it's currently eligible to race, edit it, export it to a file, or delete it.",
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

  // Reset to the first step whenever the tour is (re)opened. Done synchronously during render
  // (React's documented "adjusting state when a prop changes" pattern — tracking the previous
  // open/tour in state and comparing on the next render) rather than in a useEffect: this modal
  // never unmounts between tours, so `step` can be left over from a previous run (possibly out of
  // range for a shorter tour, or pointing at a step the skip-check effect below would need to
  // evaluate). An effect-based reset would still commit that stale `step` for one render first,
  // letting the skip-check effect below act on it before the reset lands — this way `step` is
  // already correct by the time any effect for this render runs.
  const [prevOpenTour, setPrevOpenTour] = useState({ open, tour });
  if (open !== prevOpenTour.open || tour !== prevOpenTour.tour) {
    setPrevOpenTour({ open, tour });
    if (open && step !== 0) setStep(0);
  }

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

  // A step's target can genuinely not exist on the page right now — "tutorial-class-picker" when
  // the selected ruleset defines no classes, "tutorial-garage-list" with no saved gear sets yet,
  // "tutorial-tech-sheet-link" before its onEnter switches to a ruleset that has one. The first two
  // can never resolve; the third resolves in the same render pass as its onEnter (React batches the
  // state updates), so by the time this runs post-commit, the DOM already reflects it either way.
  // Showing the step anyway would leave the full-screen click-blocker below up with no visible
  // dialog to dismiss it — an unrecoverable dead end — so silently skip forward past it instead.
  /* eslint-disable react-hooks/set-state-in-effect -- advances past a step whose target isn't in the DOM; not derivable during render since it depends on a DOM lookup */
  useEffect(() => {
    if (!open || !pointerStep) return;
    if (document.getElementById(pointerStep.targetId)) return;
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-checks whenever the pointed-at step changes; `next` closes over the render's own `step`
  }, [open, pointerStep]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!open) return null;

  const isLastStep = step === totalSteps - 1;

  if (!pointerStep && current.intro) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6"
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
            <img
              src={current.intro.image}
              alt=""
              className="mx-auto mt-3 max-h-48 w-auto rounded-lg border border-neutral-700 object-contain"
            />
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
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;
  const calloutLeft = rect ? Math.max(8, Math.min(rect.left, viewportW - calloutWidth - 8)) : 8;
  // A target element can be taller than the viewport itself (a long reference card, a fully-filled-in
  // equipment form) — clamping to the visible slice of it before measuring space above/below keeps the
  // below/above decision sane, and docking to the bottom of the screen when the target eats the whole
  // viewport (so neither side has room) guarantees the callout — and its Next/Exit buttons — is always
  // on screen, never positioned past the fold where a fixed-position element can't be scrolled to.
  const visTop = rect ? Math.max(rect.top, 0) : 0;
  const visBottom = rect ? Math.min(rect.bottom, viewportH) : 0;
  const spaceBelow = rect ? viewportH - visBottom : 0;
  const spaceAbove = rect ? visTop : 0;
  const minSpace = 100;
  const dockToBottom = rect ? spaceBelow < minSpace && spaceAbove < minSpace : false;
  const showBelow = !dockToBottom && spaceBelow >= spaceAbove;
  const calloutStyle: CSSProperties = !rect
    ? { display: "none" }
    : dockToBottom
      ? { position: "fixed", bottom: 8, left: calloutLeft, maxHeight: "60vh", overflowY: "auto", zIndex: 52 }
      : showBelow
        ? {
            position: "fixed",
            top: visBottom + pad + 12,
            left: calloutLeft,
            maxHeight: `calc(100vh - ${visBottom + pad + 12 + 8}px)`,
            overflowY: "auto",
            zIndex: 52,
          }
        : {
            position: "fixed",
            bottom: viewportH - visTop + pad + 12,
            left: calloutLeft,
            maxHeight: `calc(100vh - ${viewportH - visTop + pad + 12 + 8}px)`,
            overflowY: "auto",
            zIndex: 52,
          };

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
