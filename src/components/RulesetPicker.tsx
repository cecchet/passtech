"use client";

import { ALL_RULESETS, DisciplineGroup, RulesetClass, getRuleset } from "@/data";
import { DISCIPLINE_GROUP_ORDER } from "@/data/categoryMeta";

/** Every discipline group that actually has at least one ruleset, each with its rulesets sorted by body name — the shape every discipline→body picker in the app is built from. */
export const DISCIPLINE_GROUPS = DISCIPLINE_GROUP_ORDER.map((group) => ({
  group,
  rulesets: ALL_RULESETS.filter((r) => r.disciplineGroup === group).sort((a, b) => a.bodyName.localeCompare(b.bodyName)),
})).filter((g) => g.rulesets.length > 0);

export function RulesetPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  // Derived straight from `value` (no local state needed) — step 1 always reflects whichever
  // ruleset is actually selected, whether that came from step 2's own select, the tutorial
  // walkthrough, or loading a saved gear set.
  const discipline = getRuleset(value)?.disciplineGroup ?? DISCIPLINE_GROUPS[0]?.group;
  const rulesetsInDiscipline = DISCIPLINE_GROUPS.find((g) => g.group === discipline)?.rulesets ?? [];

  const handleDisciplineChange = (group: DisciplineGroup) => {
    const firstInGroup = DISCIPLINE_GROUPS.find((g) => g.group === group)?.rulesets[0];
    if (firstInGroup) onChange(firstInGroup.id);
  };

  return (
    <div id="tutorial-ruleset-picker" className="mb-4">
      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium">1. Pick a discipline</span>
        <select
          className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
          value={discipline}
          onChange={(e) => handleDisciplineChange(e.target.value as DisciplineGroup)}
        >
          {DISCIPLINE_GROUPS.map(({ group }) => (
            <option key={group} value={group} className="bg-neutral-900 text-neutral-100">
              {group}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">2. Pick a sanctioning body</span>
        <select
          className="w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {rulesetsInDiscipline.map((d) => (
            <option key={d.id} value={d.id} className="bg-neutral-900 text-neutral-100">
              {d.bodyName} — {d.disciplineName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function ClassPicker({
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
