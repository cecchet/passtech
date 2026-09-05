"use client";

import { useState } from "react";
import { DisciplineGroup } from "@/data/types";
import { ALL_RULESETS, getRuleset } from "@/data";
import { DISCIPLINE_GROUPS, RulesetPicker, ClassPicker } from "@/components/RulesetPicker";
import { DisciplineIcon } from "@/components/icons/DisciplineIcons";
import { UserPreferences, isRulesetPreferred, toggleRulesetPreference, setDisciplinePreference } from "@/lib/garage";

const linkButtonClass = "text-neutral-400 underline underline-offset-2 hover:text-neutral-200";

/**
 * "My preferred sanctioning bodies" settings section, rendered in My Gear's list view. Fully
 * controlled — no storage calls of its own, matching RulesetPicker's own convention — so the
 * parent (page.tsx) stays the single owner of the live UserPreferences value both this panel and
 * the body-first/equipment-first flows read from.
 */
export function SanctioningBodyPreferences({ preferences, onChange }: { preferences: UserPreferences; onChange: (next: UserPreferences) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<DisciplineGroup>>(new Set());

  const toggleGroupExpanded = (group: DisciplineGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const preferredRuleset = getRuleset(preferences.preferredRulesetId ?? "");

  return (
    <div className="mb-4 rounded-lg border border-neutral-700 p-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 text-left"
      >
        <p className="font-semibold">My preferred sanctioning bodies</p>
        <span className="shrink-0 text-neutral-500">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-4 border-t border-neutral-800 pt-3">
          <div className="rounded-lg border border-sky-800 bg-sky-950/20 p-3">
            <p className="mb-2 text-sm font-semibold text-sky-300">Preferred setup for &ldquo;Will my equipment pass tech?&rdquo;</p>
            <p className="mb-3 text-xs text-neutral-500">
              Set this once and every gear set you check with &ldquo;Will my equipment pass tech?&rdquo; opens straight to this discipline, body,
              and class instead of whatever was picked last.
            </p>
            <RulesetPicker
              value={preferences.preferredRulesetId ?? ALL_RULESETS[0]?.id ?? ""}
              onChange={(id) => onChange({ ...preferences, preferredRulesetId: id, preferredClassId: undefined })}
            />
            {preferredRuleset?.classes && (
              <ClassPicker
                classes={preferredRuleset.classes}
                value={preferences.preferredClassId}
                onChange={(id) => onChange({ ...preferences, preferredClassId: id })}
              />
            )}
            {preferences.preferredRulesetId && (
              <button
                type="button"
                onClick={() => onChange({ ...preferences, preferredRulesetId: undefined, preferredClassId: undefined })}
                className={linkButtonClass + " text-xs"}
              >
                Clear preference
              </button>
            )}
          </div>

          <div className="rounded-lg border border-violet-800 bg-violet-950/20 p-3">
            <p className="mb-2 text-sm font-semibold text-violet-300">Preferred sanctioning bodies for &ldquo;Where can my equipment race?&rdquo;</p>
            <p className="mb-3 text-xs text-neutral-500">
              Uncheck a sanctioning body to leave it out of &ldquo;Where can my equipment race?&rdquo; by default — a finer filter than picking
              whole disciplines. Leave everything checked in a discipline to keep seeing every body there, including ones added later.
            </p>
            <div className="flex flex-col gap-2">
              {DISCIPLINE_GROUPS.map(({ group, rulesets }) => {
                const groupOpen = expandedGroups.has(group);
                const selectedCount = rulesets.filter((rs) => isRulesetPreferred(rs, preferences)).length;
                const allIds = rulesets.map((rs) => rs.id);
                return (
                  <div key={group} className="rounded border border-neutral-800 p-2">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleGroupExpanded(group)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleGroupExpanded(group);
                        }
                      }}
                      className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 text-left text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <DisciplineIcon group={group} className="h-6 w-6 shrink-0" />
                        <span className="truncate">{group}</span>
                        <span className="flex shrink-0 gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onChange(setDisciplinePreference(preferences, group, undefined))}
                            className={linkButtonClass}
                          >
                            Select all
                          </button>
                          <span className="text-neutral-700">|</span>
                          <button type="button" onClick={() => onChange(setDisciplinePreference(preferences, group, []))} className={linkButtonClass}>
                            Deselect all
                          </button>
                        </span>
                        <span className="shrink-0 text-xs text-neutral-500">
                          ({selectedCount}/{rulesets.length} selected)
                        </span>
                      </span>
                      <span className="shrink-0 text-neutral-500">{groupOpen ? "▲" : "▼"}</span>
                    </div>
                    {groupOpen && (
                      <div className="mt-2 border-t border-neutral-800 pt-2">
                        <div className="flex flex-col gap-1">
                          {rulesets.map((rs) => (
                            <label key={rs.id} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
                              <input
                                type="checkbox"
                                checked={isRulesetPreferred(rs, preferences)}
                                onChange={() => onChange(toggleRulesetPreference(preferences, group, rs.id, allIds))}
                              />
                              {rs.bodyName} — {rs.disciplineName}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <button type="button" onClick={() => onChange({ ...preferences, preferredBodiesByDiscipline: undefined })} className={linkButtonClass}>
                Select all
              </button>
              <span className="text-neutral-700">|</span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...preferences,
                    preferredBodiesByDiscipline: Object.fromEntries(DISCIPLINE_GROUPS.map(({ group }) => [group, []])),
                  })
                }
                className={linkButtonClass}
              >
                Deselect all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
