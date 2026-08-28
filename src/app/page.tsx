"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ALL_RULESETS, CategoryGroup, DisciplineGroup, EquipmentCategory, Ruleset, RulesetClass, getRuleset } from "@/data";
import { SourceDocument } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER, DISCIPLINE_GROUP_ORDER, GROUP_COLORS, GROUP_LABELS, GROUP_ORDER, isPerOccupantCategory } from "@/data/categoryMeta";
import { EquipmentForm } from "@/components/EquipmentForm";
import { EquipmentSummary, FilledEquipmentSummary } from "@/components/EquipmentSummary";
import { GarageManager } from "@/components/GarageManager";
import { ReferenceView } from "@/components/ReferenceView";
import { ResultRow } from "@/components/ResultRow";
import {
  CategoryResults,
  EligibilityStatus,
  EquipmentEntry,
  evaluateRuleset,
  filterResultsByGroups,
  isEntryEmpty,
  isPendingConditional,
  isViolation,
  overallEligibility,
} from "@/lib/matcher";
import { GarageProfile, newGarageProfile, loadGarage, saveGarage } from "@/lib/garage";
import { BUILD_DATE } from "@/lib/version";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { BrandLogo } from "@/components/BrandLogo";
import { DisciplineIcon } from "@/components/icons/DisciplineIcons";
import { TourId, TutorialActions, TutorialModal } from "@/components/TutorialModal";
import { InstallPrompt } from "@/components/InstallPrompt";

type Mode = "landing" | "reference" | "body-first" | "equipment-first" | "garage";

const reportButtonClass = "mb-4 rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800";

const DISCIPLINE_GROUPS = DISCIPLINE_GROUP_ORDER.map((group) => ({
  group,
  rulesets: ALL_RULESETS.filter((r) => r.disciplineGroup === group).sort((a, b) => a.bodyName.localeCompare(b.bodyName)),
})).filter((g) => g.rulesets.length > 0);

interface MissingReport {
  category: EquipmentCategory;
  label: string;
  reportedAt: string;
}

// Bump this by hand whenever a new build is deployed — it's shown next to the app title so we can
// tell at a glance whether a user reporting an issue is on the latest version or a stale cached one.

const STORAGE_KEY = "safety-gear-check:v2";
const LEGACY_TUTORIAL_SEEN_KEY = "safety-gear-check:tutorial-seen";
const TOURS_SEEN_KEY = "safety-gear-check:tours-seen";

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");
  const [rulesetId, setRulesetId] = useState<string>(ALL_RULESETS[0]?.id ?? "");
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<Partial<Record<EquipmentCategory, EquipmentEntry>>>({});
  const [codriverEntries, setCodriverEntries] = useState<Partial<Record<EquipmentCategory, EquipmentEntry>>>({});
  const [hasCodriver, setHasCodriver] = useState(false);
  const [carPhotoDataUrl, setCarPhotoDataUrl] = useState<string | undefined>(undefined);
  const [carNote, setCarNote] = useState<string | undefined>(undefined);
  const [activeGroups, setActiveGroups] = useState<Set<CategoryGroup>>(new Set(["driver", "car", "rollcage"]));
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [onlyHaveEquipment, setOnlyHaveEquipment] = useState(false);
  const [hideNotRequired, setHideNotRequired] = useState(false);
  const [activeDisciplines, setActiveDisciplines] = useState<Set<DisciplineGroup>>(new Set(DISCIPLINE_GROUP_ORDER));
  const [hydrated, setHydrated] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const [toursSeen, setToursSeen] = useState<Partial<Record<TourId, boolean>>>({});

  // One-time hydration from localStorage on mount (must run client-side only, after SSR's default-state render).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.entries) setEntries(saved.entries);
        if (saved.codriverEntries) setCodriverEntries(saved.codriverEntries);
        if (typeof saved.hasCodriver === "boolean") setHasCodriver(saved.hasCodriver);
        if (saved.carPhotoDataUrl) setCarPhotoDataUrl(saved.carPhotoDataUrl);
        if (saved.carNote) setCarNote(saved.carNote);
        if (saved.activeGroups) setActiveGroups(new Set(saved.activeGroups));
        if (saved.rulesetId) setRulesetId(saved.rulesetId);
        if (saved.classId) setClassId(saved.classId);
        if (saved.mode) setMode(saved.mode);
        if (saved.missingReports) setMissingReports(saved.missingReports);
        if (typeof saved.onlyHaveEquipment === "boolean") setOnlyHaveEquipment(saved.onlyHaveEquipment);
        if (typeof saved.hideNotRequired === "boolean") setHideNotRequired(saved.hideNotRequired);
        if (saved.activeDisciplines) setActiveDisciplines(new Set(saved.activeDisciplines));
      }
      const rawToursSeen = window.localStorage.getItem(TOURS_SEEN_KEY);
      if (rawToursSeen) {
        setToursSeen(JSON.parse(rawToursSeen));
      } else if (window.localStorage.getItem(LEGACY_TUTORIAL_SEEN_KEY)) {
        // Pre-dates the per-page tours — the visitor has already seen the landing intro, but every
        // page-specific tour below is new to them and should still auto-launch on first visit.
        setToursSeen({ landing: true });
      }
    } catch {
      // ignore corrupt/unavailable storage
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-launches each page's own tour the first time it's visited — but never interrupts a tour
  // already in progress, and garage/My Gear has no tour of its own to offer.
  /* eslint-disable react-hooks/set-state-in-effect -- opens a tour in response to a mode change (an external-ish navigation event), not something derivable during render */
  useEffect(() => {
    if (!hydrated || activeTour || mode === "garage") return;
    if (!toursSeen[mode]) setActiveTour(mode);
  }, [mode, hydrated, activeTour, toursSeen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const closeTutorial = () => {
    if (activeTour) {
      setToursSeen((prev) => {
        const next = { ...prev, [activeTour]: true };
        window.localStorage.setItem(TOURS_SEEN_KEY, JSON.stringify(next));
        return next;
      });
    }
    setActiveTour(null);
  };

  const showTutorialForCurrentPage = () => {
    if (mode === "garage") {
      setMode("landing");
      setActiveTour("landing");
    } else {
      setActiveTour(mode);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        entries,
        codriverEntries,
        hasCodriver,
        carPhotoDataUrl,
        carNote,
        rulesetId,
        classId,
        mode,
        missingReports,
        onlyHaveEquipment,
        hideNotRequired,
        activeGroups: Array.from(activeGroups),
        activeDisciplines: Array.from(activeDisciplines),
      })
    );
  }, [
    entries,
    codriverEntries,
    hasCodriver,
    carPhotoDataUrl,
    carNote,
    rulesetId,
    classId,
    mode,
    missingReports,
    onlyHaveEquipment,
    hideNotRequired,
    activeGroups,
    activeDisciplines,
    hydrated,
  ]);

  const toggleDiscipline = (group: DisciplineGroup) => {
    setActiveDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleRulesetChange = (id: string) => {
    setRulesetId(id);
    setClassId(undefined);
  };

  const tutorialActions: TutorialActions = {
    selectRuleset: handleRulesetChange,
    selectClass: setClassId,
  };

  const handleChange = (category: EquipmentCategory, entry: EquipmentEntry) => {
    setEntries((prev) => ({ ...prev, [category]: entry }));
  };

  const handleCodriverChange = (category: EquipmentCategory, entry: EquipmentEntry) => {
    setCodriverEntries((prev) => ({ ...prev, [category]: entry }));
  };

  const handleReportMissing = (category: EquipmentCategory, label: string) => {
    setMissingReports((prev) => [...prev, { category, label, reportedAt: new Date().toISOString() }]);
  };

  const handleCodriverReportMissing = (category: EquipmentCategory, label: string) => handleReportMissing(category, `Codriver — ${label}`);

  const handleLoadGarageProfile = (profile: GarageProfile, target: "body-first" | "equipment-first") => {
    setEntries({ ...profile.entries });
    setCodriverEntries({ ...(profile.codriverEntries ?? {}) });
    setHasCodriver(!!profile.hasCodriver);
    setCarPhotoDataUrl(profile.carPhotoDataUrl);
    setCarNote(profile.carNote);
    setMode(target);
  };

  const handleSaveToGarage = (name: string) => {
    const profile = {
      ...newGarageProfile(name),
      entries: { ...entries },
      hasCodriver,
      codriverEntries: { ...codriverEntries },
      carPhotoDataUrl,
      carNote,
    };
    saveGarage([...loadGarage(), profile]);
  };

  const handleCarPhotoChange = async (file: File) => {
    setCarPhotoDataUrl(await resizeImageToDataUrl(file, 800, 0.75));
  };

  const clearAll = () => {
    setEntries({});
    setCodriverEntries({});
    setCarPhotoDataUrl(undefined);
    setCarNote(undefined);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const copyMissingReports = async () => {
    const text = missingReports.map((r) => `- [${r.category}] ${r.label} (reported ${r.reportedAt})`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Couldn't copy — select and copy manually.");
    }
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const missingReportsMailto = useMemo(() => {
    const subject = `PassTech — certification report (${missingReports.length})`;
    const body = missingReports.map((r) => `- [${r.category}] ${r.label} (reported ${r.reportedAt})`).join("\n");
    return `mailto:passtech@frogracing.us?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [missingReports]);

  const ruleset = getRuleset(rulesetId);
  // Ignore a stale classId left over from a different ruleset (e.g. after switching bodies, or
  // loading an older saved session) rather than silently applying another body's class overrides.
  const activeClassId = ruleset?.classes?.some((c) => c.id === classId) ? classId : undefined;
  const resultsForSelected = useMemo(
    () => (ruleset ? filterResultsByGroups(evaluateRuleset(ruleset, entries, undefined, activeClassId), activeGroups) : undefined),
    [ruleset, entries, activeGroups, activeClassId]
  );
  const showCodriver = !!ruleset?.supportsCodriver;
  const codriverResultsForSelected = useMemo(() => {
    if (!ruleset || !showCodriver || !hasCodriver) return {};
    const raw = filterResultsByGroups(evaluateRuleset(ruleset, codriverEntries, undefined, activeClassId), activeGroups);
    // The codriver only has their own gear (helmet...shoes, seat, belts, window net) — evaluateRuleset
    // computes every category against codriverEntries, so shared car items (fuel cell, rollover
    // protection, etc.) would otherwise show up as bogus codriver violations since nothing is entered
    // for them there.
    const perOccupant: CategoryResults = {};
    (Object.keys(raw) as EquipmentCategory[]).forEach((category) => {
      if (isPerOccupantCategory(category)) perOccupant[category] = raw[category];
    });
    return perOccupant;
  }, [ruleset, showCodriver, hasCodriver, codriverEntries, activeGroups, activeClassId]);

  const allResults = useMemo(
    () => ALL_RULESETS.map((rs) => {
      const results = filterResultsByGroups(evaluateRuleset(rs, entries), activeGroups);

      // Codriver gear only matters for rulesets that actually have a codriver — everywhere else
      // it's simply not part of that body's tech inspection, so it can't affect eligibility there.
      const codriverApplicable = hasCodriver && !!rs.supportsCodriver;
      let codriverResults: CategoryResults | undefined;
      if (codriverApplicable) {
        const rawCodriver = filterResultsByGroups(evaluateRuleset(rs, codriverEntries), activeGroups);
        const perOccupant: CategoryResults = {};
        (Object.keys(rawCodriver) as EquipmentCategory[]).forEach((category) => {
          if (isPerOccupantCategory(category)) perOccupant[category] = rawCodriver[category];
        });
        codriverResults = perOccupant;
      }

      if (!onlyHaveEquipment) {
        const status = codriverApplicable ? worseEligibility(overallEligibility(results), overallEligibility(codriverResults!)) : overallEligibility(results);
        return { rs, results, codriverResults, status, needsMoreGear: false };
      }

      // "Only check the equipment I have": drop categories with no data entered from eligibility
      // entirely, instead of letting them fail the ruleset outright. Missing *required*
      // categories are flagged separately below, as a caveat rather than a hard failure.
      const dropEmpty = (all: CategoryResults, entrySource: Partial<Record<EquipmentCategory, EquipmentEntry>>): [CategoryResults, boolean] => {
        const have: CategoryResults = {};
        let missingRequired = false;
        (Object.keys(all) as EquipmentCategory[]).forEach((category) => {
          if (isEntryEmpty(category, entrySource[category])) {
            if (all[category]!.requirement === "required") missingRequired = true;
            return;
          }
          have[category] = all[category];
        });
        return [have, missingRequired];
      };

      const [haveResults, missingRequired] = dropEmpty(results, entries);
      let status = overallEligibility(haveResults);
      let anyMissingRequired = missingRequired;
      if (codriverApplicable) {
        const [haveCodriverResults, codriverMissingRequired] = dropEmpty(codriverResults!, codriverEntries);
        status = worseEligibility(status, overallEligibility(haveCodriverResults));
        anyMissingRequired = anyMissingRequired || codriverMissingRequired;
      }
      return { rs, results, codriverResults, status, needsMoreGear: anyMissingRequired && status !== "not_eligible" };
    }),
    [entries, codriverEntries, hasCodriver, activeGroups, onlyHaveEquipment]
  );

  const disciplineFilteredResults = useMemo(
    () => allResults.filter((r) => activeDisciplines.has(r.rs.disciplineGroup)),
    [allResults, activeDisciplines]
  );

  const hasAnyEquipmentEntered =
    CATEGORY_ORDER.some((c) => !isEntryEmpty(c, entries[c])) || (hasCodriver && CATEGORY_ORDER.some((c) => !isEntryEmpty(c, codriverEntries[c])));

  const eligible = disciplineFilteredResults.filter((r) => r.status === "eligible");
  const eligibleConditional = disciplineFilteredResults.filter((r) => r.status === "eligible_conditional");
  const notEligible = disciplineFilteredResults.filter((r) => r.status === "not_eligible");

  // For each provided category: how many of the currently-filtered rulesets accept it (status
  // ok/recommended_only) — the little green badge on the Equipment Summary icons in Option 3.
  // Driver and codriver items are counted independently since they're different physical pieces
  // of gear that can each satisfy a different set of bodies.
  const filledCategoryEligibility = useMemo(() => {
    const counts: Partial<Record<EquipmentCategory, number>> = {};
    CATEGORY_ORDER.forEach((category) => {
      if (isEntryEmpty(category, entries[category])) return;
      counts[category] = disciplineFilteredResults.filter(({ results }) => {
        const result = results[category];
        return result && (result.status === "ok" || result.status === "recommended_only");
      }).length;
    });
    return counts;
  }, [disciplineFilteredResults, entries]);

  const codriverFilledEligibility = useMemo(() => {
    if (!hasCodriver) return {};
    const counts: Partial<Record<EquipmentCategory, number>> = {};
    CATEGORY_ORDER.forEach((category) => {
      if (isEntryEmpty(category, codriverEntries[category])) return;
      counts[category] = disciplineFilteredResults.filter(({ codriverResults }) => {
        const result = codriverResults?.[category];
        return result && (result.status === "ok" || result.status === "recommended_only");
      }).length;
    });
    return counts;
  }, [disciplineFilteredResults, codriverEntries, hasCodriver]);

  // jsPDF is only needed once someone actually asks for a report, so it's dynamically imported
  // here rather than pulled into the main bundle for every visitor.
  const handleDownloadReferenceReport = async () => {
    if (!ruleset) return;
    const { downloadReferenceReport } = await import("@/lib/pdfReport");
    await downloadReferenceReport(ruleset, activeClassId, activeGroups);
  };

  const handleDownloadBodyFirstReport = async () => {
    if (!ruleset) return;
    const { downloadBodyFirstReport } = await import("@/lib/pdfReport");
    const withCodriver = showCodriver && hasCodriver;
    await downloadBodyFirstReport(
      ruleset,
      resultsForSelected ?? {},
      withCodriver,
      codriverResultsForSelected,
      withCodriver,
      entries,
      codriverEntries,
      carPhotoDataUrl,
      carNote,
      hideNotRequired
    );
  };

  const handleDownloadEquipmentFirstReport = async () => {
    const { downloadEquipmentFirstReport } = await import("@/lib/pdfReport");
    await downloadEquipmentFirstReport(disciplineFilteredResults, onlyHaveEquipment, entries, codriverEntries, carPhotoDataUrl, carNote, hideNotRequired);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                PassTech <span className="text-xs font-normal text-neutral-500">({BUILD_DATE} release)</span>
              </h1>
              <p className="text-xs text-neutral-400">
                Racer Safety Gear Checker — by{" "}
                <a href="https://www.frogracing.us" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-300">
                  Frog Racing
                </a>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={showTutorialForCurrentPage}
              className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              How it works
            </button>
            <a
              href="https://cecchet.github.io/passtech/passtech-user-manual.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              User manual
            </a>
            {(mode === "body-first" || mode === "equipment-first") && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Clear all entries
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 rounded-lg border border-amber-700 bg-amber-950 p-3 text-sm text-amber-200">
          <p>
            <strong>This is a pre-screening tool, not a certification.</strong> It checks the standard number and dates
            you enter against each sanctioning body&apos;s published rules as of the &quot;last reviewed&quot; date shown
            per result. A tech inspector/scrutineer still makes the final call at the event — always verify against the
            current official rulebook before you rely on this. Entries are saved only in this browser (nothing is sent
            anywhere).
          </p>
          <p className="mt-2">
            Learn more about safety gear at{" "}
            <a
              href="https://www.frogracing.us/tech/safety-gear"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-amber-100"
            >
              frogracing.us/tech/safety-gear
            </a>
            .
          </p>
        </div>
      </header>

      {mode === "landing" && <InstallPrompt />}

      {mode === "landing" && (
        <>
          <p className="mb-3 text-sm font-semibold text-neutral-200">Click on one of the 3 following options:</p>
          <section className="grid gap-4 sm:grid-cols-3">
            <LandingCard
              number={1}
              title="Check the rules"
              description="Check the rulebook and see what is required for each safety gear category based on the current rules."
              icon="/frog-option1.jpg"
              onClick={() => setMode("reference")}
            />
            <LandingCard
              number={2}
              title="Will my equipment pass tech?"
              description="Enter your current safety gear and check it against the current rules of a sanctioning body."
              icon="/frog-option2.jpg"
              onClick={() => setMode("body-first")}
            />
            <LandingCard
              number={3}
              title="Where can my equipment race?"
              description="Enter your current safety gear once and see which sanctioning bodies it's eligible, incomplete, or rejected for."
              icon="/frog-option3.jpg"
              onClick={() => setMode("equipment-first")}
            />
          </section>
          <button
            type="button"
            id="tutorial-mygear"
            onClick={() => setMode("garage")}
            className="mt-4 flex w-full items-center gap-4 rounded-lg border border-neutral-700 p-5 text-left hover:border-neutral-400 hover:bg-neutral-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, optimizer unreliable on these (see CategoryIcons.tsx) */}
            <img src="/frog-mygear.jpg" alt="" className="h-16 w-16 shrink-0 rounded-lg bg-neutral-800 object-cover" />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold">My Gear</span>
              <span className="text-xs text-neutral-400">
                My gear is your personal space where you can store your different gear sets. Import/export gear sets and check them against
                rulesets.
              </span>
            </span>
          </button>
        </>
      )}

      {mode !== "landing" && (
        <button
          type="button"
          onClick={() => setMode("landing")}
          className="mb-4 text-sm font-semibold text-amber-400 hover:text-amber-300"
        >
          ← Back to main menu
        </button>
      )}

      {mode !== "landing" && mode !== "garage" && (
        <GroupFilter
          active={activeGroups}
          onChange={setActiveGroups}
          extra={
            mode === "equipment-first" ? (
              <>
                <label
                  id="tutorial-only-have-equipment"
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    onlyHaveEquipment ? "border-amber-700 text-amber-400 bg-neutral-900" : "border-neutral-700 text-neutral-500"
                  }`}
                >
                  <input type="checkbox" checked={onlyHaveEquipment} onChange={(e) => setOnlyHaveEquipment(e.target.checked)} />
                  Only check the equipment I have
                </label>
                <label
                  id="tutorial-hide-not-required"
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    hideNotRequired ? "border-amber-700 text-amber-400 bg-neutral-900" : "border-neutral-700 text-neutral-500"
                  }`}
                >
                  <input type="checkbox" checked={hideNotRequired} onChange={(e) => setHideNotRequired(e.target.checked)} />
                  Hide <b>Not Required</b> Gear
                </label>
              </>
            ) : mode === "body-first" ? (
              <label
                id="tutorial-hide-not-required"
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  hideNotRequired ? "border-amber-700 text-amber-400 bg-neutral-900" : "border-neutral-700 text-neutral-500"
                }`}
              >
                <input type="checkbox" checked={hideNotRequired} onChange={(e) => setHideNotRequired(e.target.checked)} />
                Hide <b>Not Required</b> Gear
              </label>
            ) : undefined
          }
        />
      )}

      {mode === "reference" && (
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
            <img src="/frog-option1.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
            Sanctioning body requirements
          </h2>

          <RulesetPicker value={rulesetId} onChange={handleRulesetChange} />

          {ruleset?.classes && <ClassPicker classes={ruleset.classes} value={activeClassId} onChange={setClassId} />}

          {ruleset && <SourceLine ruleset={ruleset} />}

          {ruleset && (
            <EquipmentSummary
              ruleset={ruleset}
              classId={activeClassId}
              activeGroups={activeGroups}
              actions={
                <button type="button" onClick={handleDownloadReferenceReport} className={`${reportButtonClass} mb-0`}>
                  📄 Download PDF report
                </button>
              }
            />
          )}

          {ruleset && <ReferenceView ruleset={ruleset} activeGroups={activeGroups} classId={activeClassId} />}
        </section>
      )}

      {mode === "body-first" && (
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
            <img src="/frog-option2.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
            Will my equipment pass tech?
          </h2>

          <RulesetPicker value={rulesetId} onChange={handleRulesetChange} />

          {ruleset?.classes && <ClassPicker classes={ruleset.classes} value={activeClassId} onChange={setClassId} />}

          {showCodriver && (
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={hasCodriver} onChange={(e) => setHasCodriver(e.target.checked)} />
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/frog-codriver.jpg" alt="" className="h-12 w-auto shrink-0 rounded-lg bg-neutral-800 object-contain" />
              Add codriver gear
            </label>
          )}

          {ruleset && <SourceLine ruleset={ruleset} />}

          {ruleset && (
            <EquipmentSummary
              ruleset={ruleset}
              classId={activeClassId}
              activeGroups={activeGroups}
              results={resultsForSelected}
              hasCodriver={showCodriver && hasCodriver}
              codriverResults={codriverResultsForSelected}
              carPhotoDataUrl={carPhotoDataUrl}
              carNote={carNote}
              onCarPhotoChange={handleCarPhotoChange}
              onRemoveCarPhoto={() => setCarPhotoDataUrl(undefined)}
              onCarNoteChange={(note) => setCarNote(note || undefined)}
              actions={
                <>
                  <SaveToGarageButton onSave={handleSaveToGarage} />
                  <button type="button" onClick={handleDownloadBodyFirstReport} className={`${reportButtonClass} mb-0`}>
                    📄 Download PDF report
                  </button>
                </>
              }
            />
          )}

          {ruleset && (
            <div id="tutorial-verdict">
              <PassTechVerdict
                results={resultsForSelected ?? {}}
                codriverResults={showCodriver && hasCodriver ? codriverResultsForSelected : undefined}
                perOccupantAsDriverGroup={showCodriver && hasCodriver}
              />
            </div>
          )}

          {showCodriver ? (
            <>
              <EquipmentForm
                entries={entries}
                onChange={handleChange}
                onReportMissing={handleReportMissing}
                results={resultsForSelected}
                activeGroups={intersectGroups(activeGroups, ["driver"])}
                orderResetKey={rulesetId}
                perOccupantAsDriverGroup={hasCodriver}
                showPhotoUpload
                hideNotRequired={hideNotRequired}
                showMediaLinks
                sourceDocuments={ruleset?.sourceDocuments}
              />
              {hasCodriver && (
                <CodriverGearSection
                  entries={codriverEntries}
                  onChange={handleCodriverChange}
                  onReportMissing={handleCodriverReportMissing}
                  results={codriverResultsForSelected}
                  activeGroups={activeGroups}
                  orderResetKey={rulesetId}
                  hideNotRequired={hideNotRequired}
                  showMediaLinks
                  sourceDocuments={ruleset?.sourceDocuments}
                />
              )}
              <EquipmentForm
                entries={entries}
                onChange={handleChange}
                onReportMissing={handleReportMissing}
                results={resultsForSelected}
                activeGroups={intersectGroups(activeGroups, ["car", "rollcage"])}
                orderResetKey={rulesetId}
                perOccupantAsDriverGroup={hasCodriver}
                showPhotoUpload
                hideNotRequired={hideNotRequired}
                showMediaLinks
                sourceDocuments={ruleset?.sourceDocuments}
              />
            </>
          ) : (
            <EquipmentForm
              entries={entries}
              onChange={handleChange}
              onReportMissing={handleReportMissing}
              results={resultsForSelected}
              activeGroups={activeGroups}
              orderResetKey={rulesetId}
              showPhotoUpload
              hideNotRequired={hideNotRequired}
              showMediaLinks
              sourceDocuments={ruleset?.sourceDocuments}
            />
          )}
        </section>
      )}

      {mode === "equipment-first" && (
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
            <img src="/frog-option3.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
            Where can my equipment race?
          </h2>

          <label id="tutorial-codriver-toggle" className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={hasCodriver} onChange={(e) => setHasCodriver(e.target.checked)} />
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
            <img src="/frog-codriver.jpg" alt="" className="h-12 w-auto shrink-0 rounded-lg bg-neutral-800 object-contain" />
            Add codriver gear (only affects rally bodies that require one)
          </label>

          <div id="tutorial-discipline-filter" className="mb-4 rounded-lg border border-neutral-700 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Pick the disciplines you are interested in</p>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINE_GROUPS.map(({ group }) => {
                const isActive = activeDisciplines.has(group);
                return (
                  <label
                    key={group}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[21px] font-medium ${
                      isActive ? "border-neutral-500 text-neutral-200 bg-neutral-900" : "border-neutral-700 text-neutral-500"
                    }`}
                  >
                    <input type="checkbox" checked={isActive} onChange={() => toggleDiscipline(group)} />
                    <DisciplineIcon group={group} className="h-9 w-9" />
                    {group}
                  </label>
                );
              })}
            </div>
          </div>

          <FilledEquipmentSummary
            entries={entries}
            codriverEntries={codriverEntries}
            hasCodriver={hasCodriver}
            activeGroups={activeGroups}
            eligibilityCounts={filledCategoryEligibility}
            codriverEligibilityCounts={codriverFilledEligibility}
            carPhotoDataUrl={carPhotoDataUrl}
            carNote={carNote}
            onCarPhotoChange={handleCarPhotoChange}
            onRemoveCarPhoto={() => setCarPhotoDataUrl(undefined)}
            onCarNoteChange={(note) => setCarNote(note || undefined)}
            actions={
              <>
                <SaveToGarageButton onSave={handleSaveToGarage} />
                <button type="button" onClick={handleDownloadEquipmentFirstReport} className={`${reportButtonClass} mb-0`}>
                  📄 Download PDF report
                </button>
              </>
            }
          />

          {onlyHaveEquipment && hasAnyEquipmentEntered && (
            <p className="mb-4 text-xs font-bold italic text-yellow-400">
              Uncheck &ldquo;Only check the equipment I have&rdquo; above if you want to add new equipment — items with nothing entered stay hidden below
              until then.
            </p>
          )}

          {hasCodriver ? (
            <>
              <EquipmentForm
                entries={entries}
                onChange={handleChange}
                onReportMissing={handleReportMissing}
                activeGroups={intersectGroups(activeGroups, ["driver"])}
                perOccupantAsDriverGroup
                showPhotoUpload
                hideEmpty={onlyHaveEquipment}
                showMediaLinks
              />
              <CodriverGearSection
                entries={codriverEntries}
                onChange={handleCodriverChange}
                onReportMissing={handleCodriverReportMissing}
                activeGroups={activeGroups}
                hideEmpty={onlyHaveEquipment}
                showMediaLinks
              />
              <EquipmentForm
                entries={entries}
                onChange={handleChange}
                onReportMissing={handleReportMissing}
                activeGroups={intersectGroups(activeGroups, ["car", "rollcage"])}
                perOccupantAsDriverGroup
                showPhotoUpload
                hideEmpty={onlyHaveEquipment}
                showMediaLinks
              />
            </>
          ) : (
            <EquipmentForm
              entries={entries}
              onChange={handleChange}
              onReportMissing={handleReportMissing}
              activeGroups={activeGroups}
              showPhotoUpload
              hideEmpty={onlyHaveEquipment}
              showMediaLinks
            />
          )}

          <div className="mt-6 space-y-6">
            <p id="tutorial-eligibility-results" className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Results, grouped by discipline
            </p>
            <ResultGroup
              title={`Eligible (${eligible.length})`}
              items={eligible}
              accent="border-emerald-700"
              titleColor="text-emerald-400"
              hideNotRequired={hideNotRequired}
            />
            <ResultGroup
              title={`Eligible under condition (${eligibleConditional.length})`}
              items={eligibleConditional}
              accent="border-yellow-700"
              titleColor="text-yellow-400"
              hideNotRequired={hideNotRequired}
            />
            <ResultGroup
              title={`Does not meet the requirements (${notEligible.length})`}
              items={notEligible}
              accent="border-red-700"
              titleColor="text-red-400"
              hideNotRequired={hideNotRequired}
            />
          </div>
        </section>
      )}

      {mode === "garage" && (
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
            <img src="/frog-mygear.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
            My Gear
          </h2>
          <GarageManager onLoadProfile={handleLoadGarageProfile} />
        </section>
      )}

      {missingReports.length > 0 && (
        <section className="mt-10 rounded-lg border border-orange-700 bg-orange-950 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-orange-200">
              Reported certifications not yet in our list ({missingReports.length})
            </h2>
            <div className="flex gap-2">
              <a
                href={missingReportsMailto}
                className="rounded border border-orange-600 px-2 py-1 text-xs text-orange-200 hover:bg-orange-900"
              >
                Email report
              </a>
              <button
                type="button"
                onClick={copyMissingReports}
                className="rounded border border-orange-600 px-2 py-1 text-xs text-orange-200 hover:bg-orange-900"
              >
                {copyStatus ?? "Copy report"}
              </button>
              <button
                type="button"
                onClick={() => setMissingReports([])}
                className="rounded border border-orange-600 px-2 py-1 text-xs text-orange-200 hover:bg-orange-900"
              >
                Clear
              </button>
            </div>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-orange-200">
            {missingReports.map((r, i) => (
              <li key={i}>
                <span className="font-mono">[{r.category}]</span> {r.label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-orange-300/80">
            These are saved in this browser and treated as not accepted until reviewed. Click &quot;Email report&quot;
            to send it to <span className="font-mono">passtech@frogracing.us</span> so the standard can be checked and
            added if it&apos;s legitimate.
          </p>
        </section>
      )}

      <footer className="mt-10 text-xs text-neutral-500">
        <p>
          Covers {DISCIPLINE_GROUPS.length} disciplines across {ALL_RULESETS.length} rulesets: SCCA (Solo, RallyCross,
          Road Racing), NASA (Road Racing, RallySport), American Rally Association, CARS (Canadian Rally Championship),
          SCCNH (Gravel Trials, Climb to the Clouds), NEHA, Pikes Peak, SCCA Time Trial (PHA, Appalachian HillClimb Series), 24 Hours of
          Lemons, ChampCar, American Endurance Racing, World Racing League, SCDA, PCA, Hooked on Driving, NEQ,
          MassTuning, Northeast GT, AMEC Ice Racing, GRIDLIFE, BMW CCA Club Racing, BMW CCA
          Driving Events (HPDE, Autocross, Ice Autocross), NHRA, WDRA, IHRA, and PDRA (Drag
          Racing), and NKA, SKUSA, USPKS, AKRA, and WKA (Karting).
        </p>
        <p className="mt-2">
          Know a ruleset we should add, or spot a missing certification or an error in one we already cover? Email{" "}
          <a href="mailto:passtech@frogracing.us" className="underline hover:text-neutral-300">
            passtech@frogracing.us
          </a>
          .
        </p>
        <p className="mt-2">
          Want to advertise on this webpage? Contact us at{" "}
          <a href="mailto:sales@frogracing.us" className="underline hover:text-neutral-300">
            sales@frogracing.us
          </a>
          .
        </p>
        <p className="mt-2">
          PassTech is provided by{" "}
          <a href="https://www.frogracing.us" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-300">
            Frog Racing
          </a>
          .
        </p>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-neutral-800 pt-6">
          <a href="https://www.anrdoezrs.net/click-101708275-10376887" target="_blank" rel="noopener noreferrer sponsored">
            {/* eslint-disable-next-line @next/next/no-img-element -- affiliate network banner, must be served from their domain for click tracking */}
            <img
              src="https://www.awltovhc.com/image-101708275-10376887"
              width={88}
              height={31}
              alt="Tirerack.com - Revolutionizing Tire Buying"
              className="border-0"
            />
          </a>
          <p className="max-w-md text-center text-[11px] text-neutral-600">
            Frog Racing is an affiliate of TireRack.com and earns a commission on sales made through the link above.
          </p>
        </div>
      </footer>

      <TutorialModal tour={activeTour ?? "landing"} open={activeTour !== null} onClose={closeTutorial} actions={tutorialActions} />
    </div>
  );
}

function GroupFilter({
  active,
  onChange,
  extra,
}: {
  active: Set<CategoryGroup>;
  onChange: (next: Set<CategoryGroup>) => void;
  extra?: ReactNode;
}) {
  const toggle = (group: CategoryGroup) => {
    const next = new Set(active);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    onChange(next);
  };

  return (
    <div id="tutorial-group-filter" className="mb-4">
      <p className="mb-1.5 text-xs font-medium text-neutral-400">Which safety gear sections do you want to check?</p>
      <div className="flex flex-wrap gap-2">
        {GROUP_ORDER.map((group) => {
          const isActive = active.has(group);
          const color = GROUP_COLORS[group];
          return (
            <label
              key={group}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${color.border} ${
                isActive ? `${color.text} bg-neutral-900` : "text-neutral-500"
              }`}
            >
              <input type="checkbox" checked={isActive} onChange={() => toggle(group)} />
              {GROUP_LABELS[group]}
              {group === "rollcage" && <span className="text-xs font-normal text-neutral-500">(beta)</span>}
            </label>
          );
        })}
        {extra}
      </div>
    </div>
  );
}

function LandingCard({
  number,
  title,
  description,
  icon,
  onClick,
}: {
  number: number;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`tutorial-option-${number}`}
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-lg border border-neutral-700 p-5 text-left hover:border-neutral-400 hover:bg-neutral-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, optimizer unreliable on these (see CategoryIcons.tsx) */}
      <img src={icon} alt="" className="h-16 w-16 rounded-lg bg-neutral-800 object-cover" />
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
          {number}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </span>
      <span className="text-xs text-neutral-400">{description}</span>
    </button>
  );
}

type VerdictState = "pass" | "conditional" | "fail";

const VERDICT_FLAG: Record<VerdictState, string> = {
  pass: "/frog-green-flag.jpg",
  conditional: "/frog-yellow-flag.jpg",
  fail: "/frog-red-flag.jpg",
};

const VERDICT_LABEL: Record<VerdictState, string> = {
  pass: "Pass",
  conditional: "Conditional",
  fail: "Fail",
};

const VERDICT_BOX_STYLE: Record<VerdictState, string> = {
  pass: "border-emerald-700 bg-emerald-950",
  conditional: "border-yellow-700 bg-yellow-950",
  fail: "border-red-700 bg-red-950",
};

const VERDICT_LABEL_STYLE: Record<VerdictState, string> = {
  pass: "text-emerald-300",
  conditional: "text-yellow-300",
  fail: "text-red-300",
};

const VERDICT_LIST_STYLE: Record<VerdictState, string> = {
  pass: "",
  conditional: "text-yellow-200",
  fail: "text-red-200",
};

function PassTechVerdict({
  results,
  codriverResults,
  perOccupantAsDriverGroup,
}: {
  results: CategoryResults;
  codriverResults?: CategoryResults;
  /** When the codriver toggle is on, the driver's own seat/belts/window net (normally "car" group) should list under "Driver Safety Gear" here too, matching how EquipmentForm displays them. */
  perOccupantAsDriverGroup?: boolean;
}) {
  const toEntries = (r: CategoryResults, anchorSuffix: string) =>
    (Object.keys(r) as EquipmentCategory[]).map((category) => ({ category, result: r[category]!, anchorSuffix }));
  const entries = [...toEntries(results, ""), ...toEntries(codriverResults ?? {}, "-codriver")];
  const violations = entries.filter(({ result }) => isViolation(result));
  const pendingConditionals = entries.filter(({ result }) => isPendingConditional(result));

  const state: VerdictState = violations.length > 0 ? "fail" : pendingConditionals.length > 0 ? "conditional" : "pass";
  const list = state === "fail" ? violations : state === "conditional" ? pendingConditionals : [];

  const driverList = list.filter((i) => i.anchorSuffix === "");
  const codriverList = list.filter((i) => i.anchorSuffix === "-codriver");

  const driverGroupFor = (category: EquipmentCategory): CategoryGroup =>
    perOccupantAsDriverGroup && isPerOccupantCategory(category) ? "driver" : CATEGORY_META[category].group;

  // Order: Driver, then Codriver (if any), then Car/Rollcage — codriver's own gear reads more
  // naturally right after the driver's than tacked on at the end, after the shared car items.
  const groupedList: { group: string; label: string; color: string; items: typeof driverList }[] = [
    {
      group: "driver",
      label: GROUP_LABELS.driver,
      color: GROUP_COLORS.driver.text,
      items: driverList.filter(({ category }) => driverGroupFor(category) === "driver"),
    },
    ...(codriverList.length > 0 ? [{ group: "codriver", label: "Codriver Safety Gear", color: "text-teal-400", items: codriverList }] : []),
    ...GROUP_ORDER.filter((group) => group !== "driver").map((group) => ({
      group,
      label: GROUP_LABELS[group],
      color: GROUP_COLORS[group].text,
      items: driverList.filter(({ category }) => driverGroupFor(category) === group),
    })),
  ].filter((g) => g.items.length > 0);

  return (
    <div className={`mb-4 rounded-lg border p-4 ${VERDICT_BOX_STYLE[state]}`}>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static flag icon */}
        <img src={VERDICT_FLAG[state]} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        <span className="font-bold">PassTech</span>
        <span className={`text-sm font-semibold ${VERDICT_LABEL_STYLE[state]}`}>{VERDICT_LABEL[state]}</span>
      </div>
      {groupedList.length > 0 && (
        <div className={`mt-2 space-y-3 text-sm ${VERDICT_LIST_STYLE[state]}`}>
          {groupedList.map(({ group, label, color, items }) => (
            <div key={group}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{label}</h3>
              <ul className="mt-1 space-y-1">
                {items.map(({ category, result, anchorSuffix }) => (
                  <li key={category}>
                    •{" "}
                    <a href={`#category-${category}${anchorSuffix}`} className="underline underline-offset-2 hover:text-white">
                      {CATEGORY_META[category].label}
                    </a>
                    : {result.reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveToGarageButton({ onSave }: { onSave: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setSavedMessage(`Saved "${trimmed}" to My Gear.`);
    setOpen(false);
    setName("");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  if (savedMessage) {
    return <p className="mb-4 text-sm text-emerald-400">{savedMessage}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
      >
        💾 Save this gear to My Gear
      </button>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        type="text"
        autoFocus
        placeholder="Name this gear set (e.g. My road racing kit)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="min-w-[220px] flex-1 rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <button type="button" onClick={save} className="rounded border border-emerald-700 bg-emerald-950 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-900">
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setName("");
        }}
        className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
      >
        Cancel
      </button>
    </div>
  );
}

function intersectGroups(base: ReadonlySet<CategoryGroup>, allowed: CategoryGroup[]): Set<CategoryGroup> {
  return new Set(allowed.filter((g) => base.has(g)));
}

const ELIGIBILITY_RANK: Record<EligibilityStatus, number> = { eligible: 0, eligible_conditional: 1, not_eligible: 2 };

/** Combines a driver's and codriver's eligibility for the same ruleset — both have to pass for the pair to compete, so the worse of the two wins. */
function worseEligibility(a: EligibilityStatus, b: EligibilityStatus): EligibilityStatus {
  return ELIGIBILITY_RANK[b] > ELIGIBILITY_RANK[a] ? b : a;
}

function CodriverGearSection({
  entries,
  onChange,
  onReportMissing,
  results,
  activeGroups,
  orderResetKey,
  hideNotRequired,
  hideEmpty,
  showMediaLinks,
  sourceDocuments,
}: {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  onChange: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
  results?: CategoryResults;
  activeGroups: ReadonlySet<CategoryGroup>;
  orderResetKey?: string;
  hideNotRequired?: boolean;
  hideEmpty?: boolean;
  showMediaLinks?: boolean;
  sourceDocuments?: SourceDocument[];
}) {
  return (
    <div className="my-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-400">Codriver Safety Gear</h3>
      <EquipmentForm
        entries={entries}
        onChange={onChange}
        onReportMissing={onReportMissing}
        results={results}
        activeGroups={activeGroups}
        orderResetKey={orderResetKey}
        occupant="codriver"
        showPhotoUpload
        hideNotRequired={hideNotRequired}
        hideEmpty={hideEmpty}
        showMediaLinks={showMediaLinks}
        sourceDocuments={sourceDocuments}
      />
    </div>
  );
}

function SourceLine({ ruleset }: { ruleset: Ruleset }) {
  return (
    <>
      <p id="tutorial-source-line" className="mb-6 mt-4 rounded-lg border border-sky-900 bg-sky-950/40 p-3 text-sm text-sky-200">
        Source:{" "}
        {ruleset.sourceDocuments.map((d, i) => (
          <span key={i}>
            {i > 0 && "; "}
            {d.url ? (
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                {d.title}
                {d.version ? ` (${d.version})` : ""}
              </a>
            ) : (
              <>
                {d.title}
                {d.version ? ` (${d.version})` : ""}
              </>
            )}
          </span>
        ))}{" "}
        — last reviewed {ruleset.lastReviewed}
      </p>
      {ruleset.knownGaps && ruleset.knownGaps.length > 0 && (
        <div className="-mt-4 mb-6 rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-200">
          <p className="font-semibold">⚠️ Not tracked by this app:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {ruleset.knownGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function RulesetPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <label id="tutorial-ruleset-picker" className="mb-4 block">
      <span className="mb-1 block text-sm font-medium">Select a sanctioning body / discipline</span>
      <select
        className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {DISCIPLINE_GROUPS.map(({ group, rulesets }) => (
          <optgroup key={group} label={group} className="bg-neutral-900 text-neutral-100">
            {rulesets.map((d) => (
              <option key={d.id} value={d.id} className="bg-neutral-900 text-neutral-100">
                {d.bodyName} — {d.disciplineName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function ClassPicker({
  classes,
  value,
  onChange,
}: {
  classes: RulesetClass[];
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
  return (
    <label id="tutorial-class-picker" className="mb-4 block">
      <span className="mb-1 block text-sm font-medium">Refine by class (optional)</span>
      <select
        className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option className="bg-neutral-900 text-neutral-100" value="">
          All classes — general rules
        </option>
        {classes.map((c) => (
          <option key={c.id} value={c.id} className="bg-neutral-900 text-neutral-100">
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Keeps a category row if it has a result at all, and — unless hideNotRequired is on — unless this ruleset doesn't mark it required or conditional. Same rule EquipmentForm's "Hide Not Required Gear" uses for the single-ruleset form. */
function keepForHideNotRequired(result: CategoryResults[EquipmentCategory] | undefined, hideNotRequired?: boolean): boolean {
  if (!result) return false;
  return !hideNotRequired || result.requirement === "required" || result.requirement === "conditional";
}

function ResultGroup({
  title,
  items,
  accent,
  titleColor,
  hideNotRequired,
}: {
  title: string;
  items: {
    rs: (typeof ALL_RULESETS)[number];
    results: ReturnType<typeof evaluateRuleset>;
    codriverResults?: CategoryResults;
    needsMoreGear?: boolean;
  }[];
  accent: string;
  titleColor: string;
  hideNotRequired?: boolean;
}) {
  if (items.length === 0) return null;
  const groups = DISCIPLINE_GROUP_ORDER.map((discipline) => ({ discipline, items: items.filter((i) => i.rs.disciplineGroup === discipline) })).filter(
    (g) => g.items.length > 0
  );
  return (
    <div>
      <h2 className={`mb-2 text-lg font-bold ${titleColor}`}>{title}</h2>
      <div className="space-y-5">
        {groups.map(({ discipline, items }) => (
          <div key={discipline}>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold uppercase tracking-wide text-neutral-500">
              <DisciplineIcon group={discipline} className="h-[30px] w-[30px]" />
              {discipline}
            </h3>
            <div className="space-y-3">
              {items.map(({ rs, results, codriverResults, needsMoreGear }) => {
                const shownCategories = CATEGORY_ORDER.filter((category) => keepForHideNotRequired(results[category], hideNotRequired));
                const shownCodriverCategories = codriverResults
                  ? CATEGORY_ORDER.filter((category) => keepForHideNotRequired(codriverResults[category], hideNotRequired))
                  : [];
                return (
                  <details key={rs.id} className={`rounded-lg border p-3 ${accent}`}>
                    <summary className="cursor-pointer text-sm font-medium">
                      {rs.bodyName} — {rs.disciplineName}
                      {needsMoreGear && (
                        <span className="ml-2 rounded border border-amber-700 bg-amber-950 px-1.5 py-0.5 text-xs font-normal text-amber-300">
                          Additional equipment required to compete
                        </span>
                      )}
                    </summary>
                    {shownCategories.length > 0 ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {shownCategories.map((category) => (
                          <ResultRow key={category} result={results[category]!} sourceDocuments={rs.sourceDocuments} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-neutral-400">
                        Nothing required or conditional for this body — uncheck &ldquo;Hide Not Required Gear&rdquo; to see the rest.
                      </p>
                    )}
                    {codriverResults && shownCodriverCategories.length > 0 && (
                      <div className="mt-3">
                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-400">Codriver</h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {shownCodriverCategories.map((category) => (
                            <ResultRow key={`${category}-codriver`} result={codriverResults[category]!} sourceDocuments={rs.sourceDocuments} />
                          ))}
                        </div>
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
