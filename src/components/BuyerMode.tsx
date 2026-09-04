"use client";

import { useMemo, useState } from "react";
import { ALL_RULESETS, DisciplineGroup, EquipmentCategory, Ruleset } from "@/data";
import { CATEGORY_META, DISCIPLINE_GROUP_ORDER } from "@/data/categoryMeta";
import { CategoryResult, EquipmentEntry, evaluateRuleset, expiringSoonDate, isPendingConditional, isViolation, newCertification } from "@/lib/matcher";
import { CategoryCard } from "@/components/EquipmentForm";
import { QuickItemScan } from "@/components/QuickItemScan";
import { DisciplineIcon } from "@/components/icons/DisciplineIcons";
import { ResultRow } from "@/components/ResultRow";
import { downloadBuyerModeReport } from "@/lib/pdfReport";

const reportButtonClass = "flex items-center gap-2 rounded border border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-800";

interface RulesetHit {
  rs: Ruleset;
  result: CategoryResult;
  status: "eligible" | "eligible_conditional" | "not_eligible";
}

/** Categories whose result can depend on ANOTHER category this app has no way to know about here (undergarment's tier trigger reads the firesuit's standard; balaclava's escalation reads whether an HNR is in use) — checked in isolation, so flagged rather than silently under- or over-stating the requirement. */
const CROSS_DEPENDENT_NOTE: Partial<Record<EquipmentCategory, string>> = {
  undergarment: "Some bodies only require fire-resistant underwear under certain firesuit certifications — this check can't see your firesuit, so treat a conditional result here as a reminder to check by hand.",
  balaclava: "Some bodies only require a balaclava when using a head-and-neck restraint instead of a plain neck collar — this check can't see your HNR, so treat a conditional result here as a reminder to check by hand.",
};

export function BuyerMode({ demoItemTrigger, tourActive }: { demoItemTrigger?: number; tourActive?: boolean }) {
  const [category, setCategory] = useState<EquipmentCategory | null>(null);
  const [entry, setEntry] = useState<EquipmentEntry>({ category: "helmet" });
  const [activeDisciplines, setActiveDisciplines] = useState<Set<DisciplineGroup>>(new Set(DISCIPLINE_GROUP_ORDER));

  // Tutorial only: fills in a demo item (a Snell SA2020 helmet) so the later tour steps — the
  // discipline filter, the eligibility buckets — have something real to point at. Done
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

  // And the reverse: once the tour closes (Done, Exit, or Escape), drop back to the initial
  // "upload a photo" screen instead of leaving the demo item sitting there mid-page — the tour is
  // a guided example, not something a buyer coming back from it should have to clear by hand. Only
  // when the tour itself is what put an item here, though — replaying the tour over a real,
  // already-in-progress check must leave that check alone when the tour closes, same as it does
  // when the tour opens.
  const [wasTourActive, setWasTourActive] = useState(!!tourActive);
  const [tourOwnsCurrentItem, setTourOwnsCurrentItem] = useState(false);
  if (!!tourActive !== wasTourActive) {
    const startingNow = !wasTourActive && tourActive;
    const closingNow = wasTourActive && !tourActive;
    setWasTourActive(!!tourActive);
    if (startingNow) setTourOwnsCurrentItem(!category);
    if (closingNow && tourOwnsCurrentItem) {
      setCategory(null);
      setEntry({ category: "helmet" });
    }
  }

  const toggleDiscipline = (group: DisciplineGroup) => {
    setActiveDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };
  const selectAllDisciplines = () => setActiveDisciplines(new Set(DISCIPLINE_GROUP_ORDER));
  const deselectAllDisciplines = () => setActiveDisciplines(new Set());

  const hits: RulesetHit[] = useMemo(() => {
    if (!category) return [];
    return ALL_RULESETS.flatMap((rs) => {
      // Evaluated with only this one category's entry, so `evaluateRuleset` reports every OTHER
      // category in the ruleset as empty/needs_info too — status must come from this category's
      // own result alone (isViolation/isPendingConditional, the same two checks
      // overallEligibility itself aggregates across a whole gear set), not from rolling up the
      // whole `results` map, which would count every other item this app never asked about as
      // missing and fail the ruleset regardless of this one item's real status.
      const results = evaluateRuleset(rs, { [category]: entry }, undefined, undefined, true);
      const result = results[category];
      if (!result) return [];
      const status = isViolation(result) ? "not_eligible" : isPendingConditional(result) ? "eligible_conditional" : "eligible";
      return [{ rs, result, status }];
    });
  }, [category, entry]);

  const filtered = hits.filter((h) => activeDisciplines.has(h.rs.disciplineGroup));
  const eligible = filtered.filter((h) => h.status === "eligible");
  const eligibleConditional = filtered.filter((h) => h.status === "eligible_conditional");
  const notEligible = filtered.filter((h) => h.status === "not_eligible");
  // Earliest "expires within the current year" date among the rulesets that currently accept this
  // item — surfaced right on the collapsed category card, not just buried inside each ruleset's
  // own expanded result, so "eligible, but expiring soon" is visible at a glance. Flagged as
  // "universal" only when every currently-eligible ruleset shares that same expiry, so the badge
  // doesn't imply a blanket expiry when it's really just one or two stricter bodies.
  const eligibleExpiryDates = eligible.map((h) => expiringSoonDate(h.result.reason)).filter((d): d is string => !!d);
  const expiryWarning =
    eligibleExpiryDates.length > 0
      ? { date: eligibleExpiryDates.sort()[0], universal: eligibleExpiryDates.length === eligible.length }
      : undefined;

  const reset = () => {
    setCategory(null);
    setEntry({ category: "helmet" });
  };

  const scrollToBucket = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold text-amber-400">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
        <img src="/buyer-mode.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
        Buyer mode — check the gear before you buy it
      </h2>
      <p className="mb-4 text-sm text-neutral-400">
        Photograph or describe one piece of gear — a helmet for sale, say — and see every sanctioning body it&rsquo;s eligible for. Nothing here is saved to My
        Gear; it&rsquo;s a one-off check.
      </p>

      {!category ? (
        <div id="tutorial-buyer-scan">
          <QuickItemScan
            onDone={(cat, photoDataUrl, certifications, extinguisherUnit) => {
              setCategory(cat);
              setEntry({
                category: cat,
                ...(photoDataUrl ? { photoDataUrls: [photoDataUrl] } : {}),
                ...(certifications?.length ? { certifications, ...(CATEGORY_META[cat].hybrid ? { mode: "certified" as const } : {}) } : {}),
                ...(extinguisherUnit ? { extinguisherUnits: [extinguisherUnit] } : {}),
              });
            }}
          />
        </div>
      ) : (
        <>
          <button type="button" onClick={reset} className="mb-3 text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-200">
            ← Check a different item instead
          </button>

          {/* No single result to show here — Buyer mode checks against every body at once, not one specific ruleset — so the per-item status pill is turned off (hasResultsContext=false), matching how Option 3 (equipment-first) renders these same cards. */}
          <div id="tutorial-buyer-item-card">
            <CategoryCard
              category={category}
              entry={entry}
              onChange={(_cat, next) => setEntry(next)}
              showPhotoUpload
              isNewGroup={false}
              hasResultsContext={false}
              defaultOpen
              eligibilityBadge={{
                eligible: eligible.length,
                fail: notEligible.length,
                onEligibleClick: () => scrollToBucket("buyer-bucket-eligible"),
                onFailClick: () => scrollToBucket("buyer-bucket-not-eligible"),
              }}
              expiryWarning={expiryWarning}
            />
          </div>

          {CROSS_DEPENDENT_NOTE[category] && (
            <p className="mt-3 rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-xs text-amber-200">{CROSS_DEPENDENT_NOTE[category]}</p>
          )}

          <div id="tutorial-buyer-disciplines" className="mt-4 rounded-lg border border-neutral-700 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Pick the disciplines you are interested in</p>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={selectAllDisciplines} className="text-neutral-400 underline underline-offset-2 hover:text-neutral-200">
                  Select all
                </button>
                <span className="text-neutral-700">|</span>
                <button type="button" onClick={deselectAllDisciplines} className="text-neutral-400 underline underline-offset-2 hover:text-neutral-200">
                  Deselect all
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINE_GROUP_ORDER.map((group) => {
                const isActive = activeDisciplines.has(group);
                return (
                  <label
                    key={group}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                      isActive ? "border-neutral-500 bg-neutral-900 text-neutral-200" : "border-neutral-700 text-neutral-500"
                    }`}
                  >
                    <input type="checkbox" checked={isActive} onChange={() => toggleDiscipline(group)} />
                    <DisciplineIcon group={group} className="h-6 w-6" />
                    {group}
                  </label>
                );
              })}
            </div>
          </div>

          {filtered.length > 0 && (
            <button
              type="button"
              onClick={() => downloadBuyerModeReport(category, entry, filtered)}
              className={`${reportButtonClass} mt-4`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
              <img src="/pdf-export.png" alt="" className="h-5 w-5 shrink-0 object-contain" />
              Download PDF report
            </button>
          )}

          <div id="tutorial-buyer-results" className="mt-6 space-y-8">
            <div id="buyer-bucket-eligible" className="scroll-mt-4">
              <EligibilityGroup title={`Eligible (${eligible.length})`} items={eligible} accent="border-emerald-700" titleColor="text-emerald-400" />
            </div>
            <EligibilityGroup
              title={`Eligible under condition (${eligibleConditional.length})`}
              items={eligibleConditional}
              accent="border-yellow-700"
              titleColor="text-yellow-400"
            />
            <div id="buyer-bucket-not-eligible" className="scroll-mt-4">
              <EligibilityGroup title={`Does not meet the requirements (${notEligible.length})`} items={notEligible} accent="border-red-800" titleColor="text-red-400" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function EligibilityGroup({ title, items, accent, titleColor }: { title: string; items: RulesetHit[]; accent: string; titleColor: string }) {
  if (items.length === 0) return null;
  const groups = DISCIPLINE_GROUP_ORDER.map((discipline) => ({ discipline, items: items.filter((i) => i.rs.disciplineGroup === discipline) })).filter(
    (g) => g.items.length > 0
  );
  return (
    <div>
      <h3 className={`mb-2 text-lg font-bold ${titleColor}`}>{title}</h3>
      <div className="space-y-5">
        {groups.map(({ discipline, items }) => (
          <div key={discipline}>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              <DisciplineIcon group={discipline} className="h-6 w-6" />
              {discipline}
            </h4>
            <div className="space-y-2">
              {items.map(({ rs, result }) => {
                const expiry = expiringSoonDate(result.reason);
                return (
                  <details key={rs.id} className={`rounded-lg border p-3 ${accent}`}>
                    {/* The expiry date sits right on the collapsed summary line — not just inside
                        the expanded result — so scanning down a long list of bodies shows at a
                        glance which specific ones are expiring this item soon. */}
                    <summary className="flex cursor-pointer flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      <span>
                        {rs.bodyName} — {rs.disciplineName}
                      </span>
                      {expiry && <span className="text-xs font-normal text-amber-400">⚠️ Expires {expiry}</span>}
                    </summary>
                    <div className="mt-3">
                      <ResultRow result={result} sourceDocuments={rs.sourceDocuments} />
                    </div>
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
