"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_RULESETS, DisciplineGroup, EquipmentCategory, Ruleset, getRuleset } from "@/data";
import { CATEGORY_ORDER } from "@/data/categoryMeta";
import { EquipmentForm } from "@/components/EquipmentForm";
import { ReferenceView } from "@/components/ReferenceView";
import { ResultRow } from "@/components/ResultRow";
import { EquipmentEntry, evaluateRuleset, overallEligibility } from "@/lib/matcher";
import { BrandLogo } from "@/components/BrandLogo";
import { TutorialModal } from "@/components/TutorialModal";

type Mode = "landing" | "reference" | "body-first" | "equipment-first";

const DISCIPLINE_GROUP_ORDER: DisciplineGroup[] = [
  "Autocross",
  "RallyCross",
  "Rally",
  "Road Racing",
  "Hillclimb",
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
  const [entries, setEntries] = useState<Partial<Record<EquipmentCategory, EquipmentEntry>>>({});
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
        if (saved.rulesetId) setRulesetId(saved.rulesetId);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, rulesetId, mode, missingReports }));
  }, [entries, rulesetId, mode, missingReports, hydrated]);

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
  const resultsForSelected = useMemo(() => (ruleset ? evaluateRuleset(ruleset, entries) : {}), [ruleset, entries]);

  const allResults = useMemo(
    () => ALL_RULESETS.map((rs) => {
      const results = evaluateRuleset(rs, entries);
      return { rs, results, status: overallEligibility(results) };
    }),
    [entries]
  );

  const eligible = allResults.filter((r) => r.status === "eligible");
  const incomplete = allResults.filter((r) => r.status === "incomplete");
  const notEligible = allResults.filter((r) => r.status === "not_eligible");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">PassTech</h1>
              <p className="text-xs text-neutral-400">
                Racer Personal Safety Equipment Checker — by{" "}
                <a href="https://www.frogracing.us" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-300">
                  Frog Racing
                </a>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
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
        <p className="mt-2 rounded-lg border border-amber-700 bg-amber-950 p-3 text-sm text-amber-200">
          <strong>This is a pre-screening tool, not a certification.</strong> It checks the standard number and dates
          you enter against each sanctioning body&apos;s published rules as of the &quot;last reviewed&quot; date shown
          per result. A tech inspector/scrutineer still makes the final call at the event — always verify against the
          current official rulebook before you rely on this. Entries are saved only in this browser (nothing is sent
          anywhere).
        </p>
      </header>

      {mode === "landing" && (
        <section className="grid gap-4 sm:grid-cols-3">
          <LandingCard
            number={1}
            title="What does a sanctioning body require?"
            description="Browse every equipment category a body covers — what's required, what's accepted, and any conditions — without entering your own gear."
            onClick={() => setMode("reference")}
          />
          <LandingCard
            number={2}
            title="Will my equipment pass tech?"
            description="Enter what you have and check it against one sanctioning body's rules."
            onClick={() => setMode("body-first")}
          />
          <LandingCard
            number={3}
            title="Where can my equipment race?"
            description="Enter what you have once and see which sanctioning bodies it's eligible, incomplete, or rejected for."
            onClick={() => setMode("equipment-first")}
          />
        </section>
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

      {mode === "reference" && (
        <section>
          <RulesetPicker value={rulesetId} onChange={setRulesetId} />

          {ruleset && <ReferenceView ruleset={ruleset} />}

          {ruleset && <SourceLine ruleset={ruleset} />}
        </section>
      )}

      {mode === "body-first" && (
        <section>
          <RulesetPicker value={rulesetId} onChange={setRulesetId} />

          <EquipmentForm entries={entries} onChange={handleChange} onReportMissing={handleReportMissing} results={resultsForSelected} />

          {ruleset && <SourceLine ruleset={ruleset} />}
        </section>
      )}

      {mode === "equipment-first" && (
        <section>
          <EquipmentForm entries={entries} onChange={handleChange} onReportMissing={handleReportMissing} />

          <div className="mt-6 space-y-6">
            <ResultGroup title={`Eligible (${eligible.length})`} items={eligible} accent="border-emerald-700" />
            <ResultGroup title={`Incomplete — need more info (${incomplete.length})`} items={incomplete} accent="border-amber-700" />
            <ResultGroup title={`Not eligible (${notEligible.length})`} items={notEligible} accent="border-red-700" />
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
          SCCNH Gravel Trials, NEHA, Pikes Peak, SCCA Time Trial (PHA, Appalachian HillClimb Series), 24 Hours of
          Lemons, ChampCar, American Endurance Racing, World Racing League, SCDA, PCA, Hooked on Driving, NEQ,
          MassTuning, and Northeast GT.
        </p>
        <p className="mt-2">
          Know a ruleset we should add, or spot a missing certification or an error in one we already cover? Email{" "}
          <a href="mailto:passtech@frogracing.us" className="underline hover:text-neutral-300">
            passtech@frogracing.us
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
      </footer>

      <TutorialModal open={showTutorial} onClose={closeTutorial} />
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

function SourceLine({ ruleset }: { ruleset: Ruleset }) {
  return (
    <p className="mt-4 text-xs text-neutral-500">
      Source:{" "}
      {ruleset.sourceDocuments.map((d, i) => (
        <span key={i}>
          {i > 0 && "; "}
          {d.url ? (
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-neutral-300">
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
      <span className="mb-1 block text-sm font-medium">Sanctioning body / discipline</span>
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
