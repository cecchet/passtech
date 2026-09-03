"use client";

import { useState } from "react";
import { ALL_RULESETS, EquipmentCategory, getRuleset } from "@/data";
import { CATEGORY_META } from "@/data/categoryMeta";
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

export function ScrutineerMode({ demoItemTrigger, tourActive }: { demoItemTrigger?: number; tourActive?: boolean }) {
  const [rulesetId, setRulesetId] = useState<string>(ALL_RULESETS[0]?.id ?? "");
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<EquipmentCategory | null>(null);
  const [entry, setEntry] = useState<EquipmentEntry>(emptyEntry("helmet"));

  // Tutorial only: fills in a demo item (a Snell SA2020 helmet) so the later tour steps — the
  // verdict banner, the "Scan next item" button — have something real to point at. Done
  // synchronously during render (the same "adjust state on a prop change" pattern TutorialModal
  // itself uses to reset its step) rather than in an effect: an effect here would need an extra
  // render/commit cycle to take hold, which the tutorial's own skip-past-a-missing-target check
  // doesn't wait around for, and it would skip this step before the demo item ever appeared. Only
  // fires if there's no real item already in progress — replaying the tour shouldn't clobber it.
  const [lastDemoTrigger, setLastDemoTrigger] = useState(demoItemTrigger ?? 0);
  if ((demoItemTrigger ?? 0) !== lastDemoTrigger) {
    setLastDemoTrigger(demoItemTrigger ?? 0);
    if (!category) {
      setCategory("helmet");
      setEntry({ category: "helmet", certifications: [{ ...newCertification(), standardId: "snell-sa2020" }] });
    }
  }

  // And the reverse: once the tour closes, clear the demo item — same as tapping "Scan next
  // item" — but leave the ruleset/class alone, since that's real setup worth keeping. Only when
  // the tour itself is what put an item here, though — replaying the tour mid-way through a real
  // scan must leave that scan alone when the tour closes, same as it does when the tour opens.
  const [wasTourActive, setWasTourActive] = useState(!!tourActive);
  const [tourOwnsCurrentItem, setTourOwnsCurrentItem] = useState(false);
  if (!!tourActive !== wasTourActive) {
    const startingNow = !wasTourActive && tourActive;
    const closingNow = wasTourActive && !tourActive;
    setWasTourActive(!!tourActive);
    if (startingNow) setTourOwnsCurrentItem(!category);
    if (closingNow && tourOwnsCurrentItem) {
      setCategory(null);
      setEntry(emptyEntry("helmet"));
    }
  }

  const ruleset = getRuleset(rulesetId);
  // Ignore a stale classId left over from a different ruleset — same guard page.tsx uses.
  const activeClassId = ruleset?.classes?.some((c) => c.id === classId) ? classId : undefined;
  const activeClassLabel = ruleset?.classes?.find((c) => c.id === activeClassId)?.label;

  const result = category && ruleset ? evaluateRuleset(ruleset, { [category]: entry }, undefined, activeClassId)[category] : undefined;

  // Stays on the same category — a scrutineer running only helmets can scan one after another
  // without re-picking the category each time — versus scanDifferentItem, which drops back to
  // QuickItemScan's full detect-or-pick flow.
  const scanAnother = () => {
    if (category) setEntry(emptyEntry(category));
  };
  const scanDifferentItem = () => {
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
            onDone={(cat, photoDataUrl, certifications) => {
              setCategory(cat);
              setEntry({
                category: cat,
                ...(photoDataUrl ? { photoDataUrls: [photoDataUrl] } : {}),
                ...(certifications?.length ? { certifications } : {}),
              });
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
              defaultOpen
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

          <div id="tutorial-scrutineer-next" className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={scanAnother} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
              Scan another {CATEGORY_META[category].label.toLowerCase()}
            </button>
            <button
              type="button"
              onClick={scanDifferentItem}
              className="flex-1 rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
            >
              Scan a different item
            </button>
          </div>
        </>
      )}
    </section>
  );
}
