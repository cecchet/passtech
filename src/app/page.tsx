"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_RULESETS, CategoryGroup, DisciplineGroup, EquipmentCategory, Ruleset, RulesetClass, getRuleset } from "@/data";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_COLORS, GROUP_LABELS, GROUP_ORDER } from "@/data/categoryMeta";
import { EquipmentForm } from "@/components/EquipmentForm";
import { ReferenceView } from "@/components/ReferenceView";
import { ResultRow } from "@/components/ResultRow";
import { CategoryResults, EquipmentEntry, evaluateRuleset, filterResultsByGroups, isPendingConditional, isViolation, overallEligibility } from "@/lib/matcher";
import { BrandLogo } from "@/components/BrandLogo";
import { TutorialModal } from "@/components/TutorialModal";
import { InstallPrompt } from "@/components/InstallPrompt";

type Mode = "landing" | "reference" | "body-first" | "equipment-first";

const DISCIPLINE_GROUP_ORDER: DisciplineGroup[] = [
  "Autocross",
  "RallyCross",
  "Rally",
  "Road Racing",
  "Hillclimb",
  "Ice Racing",
  "Endurance Racing",
  "HPDE / Track Day",
];

const DISCIPLINE_GROUPS = DISCIPLINE_GROUP_ORDER.map((group) => ({
  group,
  rulesets: ALL_RULESETS.filter((r) => r.disciplineGroup === group).sort((a, b) => a.bodyName.localeCompare(b.bodyName)),
})).filter((g) => g.rulesets.length > 0);

interface MissingReport {
  category: EquipmentCategory;
  label: string;
  reportedAt: string;
}

const STORAGE_KEY = "safety-gear-check:v2";
const TUTORIAL_SEEN_KEY = "safety-gear-check:tutorial-seen";

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");
  const [rulesetId, setRulesetId] = useState<string>(ALL_RULESETS[0]?.id ?? "");
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<Partial<Record<EquipmentCategory, EquipmentEntry>>>({});
  const [activeGroups, setActiveGroups] = useState<Set<CategoryGroup>>(new Set(["driver"]));
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // One-time hydration from localStorage on mount (must run client-side only, after SSR's default-state render).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.entries) setEntries(saved.entries);
        if (saved.activeGroups) setActiveGroups(new Set(saved.activeGroups));
        if (saved.rulesetId) setRulesetId(saved.rulesetId);
        if (saved.classId) setClassId(saved.classId);
        if (saved.mode) setMode(saved.mode);
        if (saved.missingReports) setMissingReports(saved.missingReports);
      }
      if (!window.localStorage.getItem(TUTORIAL_SEEN_KEY)) setShowTutorial(true);
    } catch {
      // ignore corrupt/unavailable storage
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const closeTutorial = () => {
    setShowTutorial(false);
    window.localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
  };

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entries, rulesetId, classId, mode, missingReports, activeGroups: Array.from(activeGroups) })
    );
  }, [entries, rulesetId, classId, mode, missingReports, activeGroups, hydrated]);

  const handleRulesetChange = (id: string) => {
    setRulesetId(id);
    setClassId(undefined);
  };

  const handleChange = (category: EquipmentCategory, entry: EquipmentEntry) => {
    setEntries((prev) => ({ ...prev, [category]: entry }));
  };

  const handleReportMissing = (category: EquipmentCategory, label: string) => {
    setMissingReports((prev) => [...prev, { category, label, reportedAt: new Date().toISOString() }]);
  };

  const clearAll = () => {
    setEntries({});
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
    () => (ruleset ? filterResultsByGroups(evaluateRuleset(ruleset, entries, undefined, activeClassId), activeGroups) : {}),
    [ruleset, entries, activeGroups, activeClassId]
  );

  const allResults = useMemo(
    () => ALL_RULESETS.map((rs) => {
      const results = filterResultsByGroups(evaluateRuleset(rs, entries), activeGroups);
      return { rs, results, status: overallEligibility(results) };
    }),
    [entries, activeGroups]
  );

  const eligible = allResults.filter((r) => r.status === "eligible");
  const eligibleConditional = allResults.filter((r) => r.status === "eligible_conditional");
  const notEligible = allResults.filter((r) => r.status === "not_eligible");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">PassTech</h1>
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
              onClick={() => {
                setMode("landing");
                setShowTutorial(true);
              }}
              className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              How it works
            </button>
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
              onClick={() => setMode("reference")}
            />
            <LandingCard
              number={2}
              title="Will my equipment pass tech?"
              description="Enter your current safety gear and check it against the current rules of a sanctioning body."
              onClick={() => setMode("body-first")}
            />
            <LandingCard
              number={3}
              title="Where can my equipment race?"
              description="Enter your current safety gear once and see which sanctioning bodies it's eligible, incomplete, or rejected for."
              onClick={() => setMode("equipment-first")}
            />
          </section>
        </>
      )}

      {mode !== "landing" && (
        <button
          type="button"
          onClick={() => setMode("landing")}
          className="mb-4 text-xs text-neutral-400 hover:text-neutral-200"
        >
          ← Back to menu
        </button>
      )}

      {mode !== "landing" && <GroupFilter active={activeGroups} onChange={setActiveGroups} />}

      {mode === "reference" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-amber-400">Sanctioning body requirements</h2>

          <RulesetPicker value={rulesetId} onChange={handleRulesetChange} />

          {ruleset?.classes && <ClassPicker classes={ruleset.classes} value={activeClassId} onChange={setClassId} />}

          {ruleset && <SourceLine ruleset={ruleset} />}

          {ruleset && <ReferenceView ruleset={ruleset} activeGroups={activeGroups} classId={activeClassId} />}
        </section>
      )}

      {mode === "body-first" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-amber-400">Will my equipment pass tech?</h2>

          {ruleset && <PassTechVerdict results={resultsForSelected} />}

          <RulesetPicker value={rulesetId} onChange={handleRulesetChange} />

          {ruleset?.classes && <ClassPicker classes={ruleset.classes} value={activeClassId} onChange={setClassId} />}

          {ruleset && <SourceLine ruleset={ruleset} />}

          <EquipmentForm
            entries={entries}
            onChange={handleChange}
            onReportMissing={handleReportMissing}
            results={resultsForSelected}
            activeGroups={activeGroups}
          />
        </section>
      )}

      {mode === "equipment-first" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-amber-400">Where can my equipment race?</h2>

          <EquipmentForm entries={entries} onChange={handleChange} onReportMissing={handleReportMissing} activeGroups={activeGroups} />

          <div className="mt-6 space-y-6">
            <ResultGroup title={`Eligible (${eligible.length})`} items={eligible} accent="border-emerald-700" />
            <ResultGroup title={`Eligible under condition (${eligibleConditional.length})`} items={eligibleConditional} accent="border-yellow-700" />
            <ResultGroup title={`Does not meet the requirements (${notEligible.length})`} items={notEligible} accent="border-red-700" />
          </div>
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
          MassTuning, Northeast GT, AMEC Ice Racing, GRIDLIFE, BMW CCA Club Racing, and BMW CCA
          Driving Events (HPDE, Autocross, Ice Autocross).
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

      <TutorialModal open={showTutorial} onClose={closeTutorial} />
    </div>
  );
}

function GroupFilter({ active, onChange }: { active: Set<CategoryGroup>; onChange: (next: Set<CategoryGroup>) => void }) {
  const toggle = (group: CategoryGroup) => {
    const next = new Set(active);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    onChange(next);
  };

  return (
    <div className="mb-4">
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
              {group === "rollcage" && <span className="text-xs font-normal text-neutral-500">(coming soon)</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function LandingCard({
  number,
  title,
  description,
  onClick,
}: {
  number: number;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`tutorial-option-${number}`}
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-lg border border-neutral-700 p-5 text-left hover:border-neutral-400 hover:bg-neutral-900"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
        {number}
      </span>
      <span className="text-sm font-semibold">{title}</span>
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

function PassTechVerdict({ results }: { results: CategoryResults }) {
  const entries = (Object.keys(results) as EquipmentCategory[]).map((category) => ({ category, result: results[category]! }));
  const violations = entries.filter(({ result }) => isViolation(result));
  const pendingConditionals = entries.filter(({ result }) => isPendingConditional(result));

  const state: VerdictState = violations.length > 0 ? "fail" : pendingConditionals.length > 0 ? "conditional" : "pass";
  const list = state === "fail" ? violations : state === "conditional" ? pendingConditionals : [];

  const groupedList = GROUP_ORDER.map((group) => ({
    group,
    items: list.filter(({ category }) => CATEGORY_META[category].group === group),
  })).filter((g) => g.items.length > 0);

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
          {groupedList.map(({ group, items }) => (
            <div key={group}>
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${GROUP_COLORS[group].text}`}>{GROUP_LABELS[group]}</h3>
              <ul className="mt-1 space-y-1">
                {items.map(({ category, result }) => (
                  <li key={category}>
                    •{" "}
                    <a href={`#category-${category}`} className="underline underline-offset-2 hover:text-white">
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

function SourceLine({ ruleset }: { ruleset: Ruleset }) {
  return (
    <p className="mb-6 mt-4 rounded-lg border border-sky-900 bg-sky-950/40 p-3 text-sm text-sky-200">
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
  );
}

function RulesetPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <label className="mb-4 block">
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
    <label className="mb-4 block">
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

function ResultGroup({
  title,
  items,
  accent,
}: {
  title: string;
  items: { rs: (typeof ALL_RULESETS)[number]; results: ReturnType<typeof evaluateRuleset> }[];
  accent: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <div className="space-y-3">
        {items.map(({ rs, results }) => (
          <details key={rs.id} className={`rounded-lg border p-3 ${accent}`}>
            <summary className="cursor-pointer text-sm font-medium">
              {rs.bodyName} — {rs.disciplineName}
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {CATEGORY_ORDER.map((category) => {
                const result = results[category];
                return result ? <ResultRow key={category} result={result} /> : null;
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
