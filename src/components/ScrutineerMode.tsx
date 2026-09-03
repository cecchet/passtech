"use client";

import { useState } from "react";
import { ALL_RULESETS, EquipmentCategory, getRuleset } from "@/data";
import { CategoryResult, EquipmentEntry, evaluateRuleset, newCertification } from "@/lib/matcher";
import { CategoryCard } from "@/components/EquipmentForm";
import { QuickItemScan } from "@/components/QuickItemScan";
import { RulesetPicker, ClassPicker } from "@/components/RulesetPicker";
import { statusStyle } from "@/components/ResultRow";
import { downloadScrutineerReport } from "@/lib/pdfReport";

const reportButtonClass = "flex items-center gap-2 rounded border border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-800";

/** The scrutineer-facing verdict wording — punchier than the plain per-category status label (statusLabel/statusStyle in ResultRow.tsx), since a scrutineer wants a Pass/Fail/Conditional call at a glance, not a certification-form status name. Reuses statusStyle's color classes so it stays visually consistent with the rest of the app's status treatment. */
function verdict(result: CategoryResult): { label: string; style: string } {
  if (result.status === "ok" || result.status === "recommended_only") return { label: "PASS", style: statusStyle(result.status, result.requirement) };
  if (result.status === "rejected" || result.status === "unrecognized") return { label: "FAIL", style: statusStyle(result.status, result.requirement) };
  if (result.status === "needs_info" && result.requirement === "conditional") return { label: "CONDITIONAL", style: statusStyle(result.status, result.requirement) };
  if (result.status === "needs_info") return { label: "Enter the item's details above to get a verdict", style: statusStyle(result.status, result.requirement) };
  return { label: "Not required by this body", style: statusStyle(result.status, result.requirement) };
}

const emptyEntry = (category: EquipmentCategory): EquipmentEntry => ({ category });

export function ScrutineerMode({ demoItemTrigger }: { demoItemTrigger?: number }) {
  const [rulesetId, setRulesetId] = useState<string>(ALL_RULESETS[0]?.id ?? "");
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<EquipmentCategory | null>(null);
  const [entry, setEntry] = useState<EquipmentEntry>(emptyEntry("helmet"));

  // Tutorial only: fills in a demo item (a Snell SA2020 helmet) so the later tour steps — the
  // verdict banner, the "Scan next item" button — have something real to point at. Done
  // synchronously during render (the same "adjust state on a prop change" pattern TutorialModal
  // itself uses to reset its step) rather than in an effect: an effect here would need an extra
  // render/commit cycle to take hold, which the tutorial's own skip-past-a-missing-target check
  // doesn't wait around for, and it would skip this step before the demo item ever appeared.
  const [lastDemoTrigger, setLastDemoTrigger] = useState(demoItemTrigger ?? 0);
  if ((demoItemTrigger ?? 0) !== lastDemoTrigger) {
    setLastDemoTrigger(demoItemTrigger ?? 0);
    setCategory("helmet");
    setEntry({ category: "helmet", certifications: [{ ...newCertification(), standardId: "snell-sa2020" }] });
  }

  const ruleset = getRuleset(rulesetId);
  // Ignore a stale classId left over from a different ruleset — same guard page.tsx uses.
  const activeClassId = ruleset?.classes?.some((c) => c.id === classId) ? classId : undefined;
  const activeClassLabel = ruleset?.classes?.find((c) => c.id === activeClassId)?.label;

  const result = category && ruleset ? evaluateRuleset(ruleset, { [category]: entry }, undefined, activeClassId)[category] : undefined;

  const scanNext = () => {
    setCategory(null);
    setEntry(emptyEntry("helmet"));
  };

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
        <img src="/scrutineer-mode.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
        Scrutineer mode — check if the gear is good for an event
      </h2>
      <p className="mb-4 text-sm text-neutral-400">
        Pick the discipline, sanctioning body, and class you&rsquo;re inspecting for, then scan gear one piece at a time for a pass/fail call. Nothing here is
        saved to My Gear.
      </p>

      <RulesetPicker value={rulesetId} onChange={(id) => { setRulesetId(id); setClassId(undefined); }} />
      {ruleset?.classes && <ClassPicker classes={ruleset.classes} value={activeClassId} onChange={setClassId} />}

      {!category ? (
        <div id="tutorial-scrutineer-scan">
          <QuickItemScan
            onDone={(cat, photoDataUrl) => {
              setCategory(cat);
              setEntry({ category: cat, ...(photoDataUrl ? { photoDataUrls: [photoDataUrl] } : {}) });
            }}
          />
        </div>
      ) : (
        <>
          <div id="tutorial-scrutineer-item-card">
            <CategoryCard
              category={category}
              entry={entry}
              result={result}
              onChange={(_cat, next) => setEntry(next)}
              showPhotoUpload
              isNewGroup={false}
              sourceDocuments={ruleset?.sourceDocuments}
            />
          </div>

          {result &&
            (() => {
              const v = verdict(result);
              return (
                <div id="tutorial-scrutineer-verdict" className={`mt-4 rounded-lg border p-4 text-center text-lg font-bold ${v.style}`}>
                  {v.label}
                </div>
              );
            })()}

          {result && ruleset && (
            <button
              type="button"
              onClick={() => downloadScrutineerReport(ruleset, activeClassLabel, category, entry, result)}
              className={`${reportButtonClass} mt-4 w-full justify-center`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/pdf-export.png" alt="" className="h-5 w-5 shrink-0 object-contain" />
              Download PDF report
            </button>
          )}

          <button id="tutorial-scrutineer-next" type="button" onClick={scanNext} className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Scan next item
          </button>
        </>
      )}
    </section>
  );
}
