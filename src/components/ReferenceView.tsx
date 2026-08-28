import { Fragment } from "react";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_COLORS, GROUP_LABELS, filterCategoriesByGroups } from "@/data/categoryMeta";
import { logbookBodyLabel, standardLabel, standardsFor } from "@/data/standards";
import { CarBodyStyle, CategoryGroup, CategoryRule, EquipmentCategory, RequirementLevel, Ruleset, StandardAcceptance } from "@/data/types";
import { bodyStyleLabel, describeExtinguisherOptions, effectiveCategories } from "@/lib/matcher";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { CategoryMediaLinks } from "@/components/CategoryMediaLinks";
import { CitationLine } from "@/components/CitationLine";

const REQUIREMENT_STYLE: Record<CategoryRule["requirement"], string> = {
  required: "bg-neutral-100 text-neutral-900 border-neutral-300",
  conditional: "bg-amber-950 text-amber-300 border-amber-700",
  recommended: "bg-blue-950 text-blue-300 border-blue-700",
  not_addressed: "bg-neutral-900 text-neutral-400 border-neutral-700",
};

const REQUIREMENT_LABEL: Record<CategoryRule["requirement"], string> = {
  required: "Required",
  conditional: "Conditionally required",
  recommended: "Recommended",
  not_addressed: "Not addressed",
};

function acceptanceDetail(acceptance: StandardAcceptance): string {
  const parts: string[] = [];
  if (acceptance.noExpiration) parts.push("no expiration");
  else if (acceptance.expiresOn) parts.push(`accepted through ${acceptance.expiresOn}`);
  else if (acceptance.validityYearsFromLabel) parts.push(`valid ${acceptance.validityYearsFromLabel} yrs from label date`);
  if (acceptance.note) parts.push(acceptance.note);
  return parts.join(" — ");
}

/** Above this many accepted standards, the list collapses behind a click-to-expand summary (mirrors NotAcceptedList) so a card like Helmet's ~30-standard list doesn't dwarf the rest of the reference view. */
const ACCEPTED_COLLAPSE_THRESHOLD = 6;

function AcceptedList({ rule }: { rule: CategoryRule }) {
  const standards = rule.acceptedStandards ?? [];
  if (standards.length === 0) return null;

  const items = standards.map((a, i) => {
    const detail = acceptanceDetail(a);
    return (
      <li key={i}>
        • {standardLabel(a.standardId)}
        {detail ? ` (${detail})` : ""}
      </li>
    );
  });

  if (standards.length > ACCEPTED_COLLAPSE_THRESHOLD) {
    return (
      <details className="mt-3 rounded border border-emerald-900 bg-emerald-950/30">
        <summary className="cursor-pointer list-none px-2 py-1.5 text-xs font-semibold text-emerald-300 marker:content-none [&::-webkit-details-marker]:hidden">
          Accepted certifications ({standards.length}) — click to expand
        </summary>
        <ul className="space-y-0.5 px-2 pb-2 text-xs text-emerald-300/90">{items}</ul>
      </details>
    );
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-neutral-400">Accepted certifications</p>
      <ul className="mt-1 space-y-0.5 text-xs text-neutral-300">{items}</ul>
    </div>
  );
}

function NotAcceptedList({ category, rule }: { category: EquipmentCategory; rule: CategoryRule }) {
  if (rule.requirement === "not_addressed") return null;

  const accepted = new Set((rule.acceptedStandards ?? []).map((a) => a.standardId));
  const notAccepted = standardsFor(category).filter((s) => !accepted.has(s.id));
  if (notAccepted.length === 0) return null;

  return (
    <details className="mt-3 rounded border border-red-900 bg-red-950/30">
      <summary className="cursor-pointer list-none px-2 py-1.5 text-xs font-semibold text-red-300 marker:content-none [&::-webkit-details-marker]:hidden">
        Not accepted ({notAccepted.length}) — other standards in our registry this body doesn&apos;t list
      </summary>
      <ul className="space-y-0.5 px-2 pb-2 text-xs text-red-300/90">
        {notAccepted.map((s) => (
          <li key={s.id}>• {s.label}</li>
        ))}
      </ul>
    </details>
  );
}

function CategoryReferenceCard({ category, rule }: { category: EquipmentCategory; rule: CategoryRule }) {
  const meta = CATEGORY_META[category];
  const Icon = CATEGORY_ICONS[category];

  return (
    <div id={`category-${category}`} className={`scroll-mt-4 rounded-lg border p-4 ${GROUP_COLORS[meta.group].border}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-3 text-sm font-semibold">
          <Icon />
          {meta.label}
        </span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${REQUIREMENT_STYLE[rule.requirement]}`}>
          {REQUIREMENT_LABEL[rule.requirement]}
        </span>
      </div>

      {rule.condition && <p className="mt-2 text-xs text-neutral-300">Condition: {rule.condition}</p>}

      {category === "helmet" && rule.fullFaceRequirement && (
        <p className="mt-2 text-xs text-neutral-300">
          {rule.fullFaceRequirement === "required"
            ? "Full-face helmet required."
            : "Full-face helmet required in some cases."}
          {rule.fullFaceCondition ? ` ${rule.fullFaceCondition}` : ""}
        </p>
      )}

      {meta.hybrid && rule.materialOnlyAccepted && (
        <p className="mt-2 text-xs text-neutral-300">
          {meta.materialOnlyDescription ?? "Plain fire-resistant material accepted, no certification required."}
          {rule.materialNote ? ` ${rule.materialNote}` : ""}
        </p>
      )}

      {!meta.hybrid && rule.materialNote && <p className="mt-2 text-xs text-neutral-300">{rule.materialNote}</p>}

      {category === "seat" && rule.seatRailsForbidden && (
        <p className="mt-2 text-xs text-neutral-300">Seat rails/sliders aren&apos;t allowed — the seat must be fixed-mounted.</p>
      )}

      {category === "fire_extinguisher" && rule.fireExtinguisherOptions && (
        <p className="mt-2 text-xs text-neutral-300">Needs {describeExtinguisherOptions(rule.fireExtinguisherOptions)}.</p>
      )}

      {category === "rollover_protection" && (
        <div className="mt-2 space-y-1.5 text-xs text-neutral-300">
          {rule.rolloverProtectionByBodyStyle && (
            <ul className="space-y-0.5">
              {(Object.entries(rule.rolloverProtectionByBodyStyle) as [CarBodyStyle, RequirementLevel][]).map(([style, level]) => (
                <li key={style}>
                  • {bodyStyleLabel(style)}: {REQUIREMENT_LABEL[level]}
                </li>
              ))}
            </ul>
          )}
          {rule.rolloverProtectionFactoryExempt && (
            <p>A convertible with OEM/factory-installed rollover protection is exempt from needing an aftermarket cage/bar.</p>
          )}
          {rule.rolloverProtectionRequiresFullCage && <p>A rollbar/half-cage isn&apos;t accepted — this body requires a full multi-point cage.</p>}
          {rule.rolloverProtectionRequiresWelded && <p>Bolt-together tube joints aren&apos;t accepted — this body requires welded joints.</p>}
          {rule.rolloverProtectionRequiresWeldedPlates && (
            <p>Bolted mounting/foot plates aren&apos;t accepted — this body requires the plates to be welded to the chassis.</p>
          )}
          {rule.rolloverProtectionRequiresLogbook && (
            <p>
              A cage logbook is required.
              {rule.rolloverProtectionAcceptedLogbookBodies && rule.rolloverProtectionAcceptedLogbookBodies.length > 0
                ? ` Recognized issuers: ${rule.rolloverProtectionAcceptedLogbookBodies.map((id) => logbookBodyLabel(id)).join(", ")}.`
                : ""}
            </p>
          )}
          {!rule.rolloverProtectionRequiresLogbook &&
            rule.rolloverProtectionAcceptedLogbookBodies &&
            rule.rolloverProtectionAcceptedLogbookBodies.length > 0 && (
              <p>Recognized logbook issuers: {rule.rolloverProtectionAcceptedLogbookBodies.map((id) => logbookBodyLabel(id)).join(", ")}.</p>
            )}
          {rule.rolloverProtectionTubingSpec && rule.rolloverProtectionTubingSpec.length > 0 && (
            <div>
              <p className="font-semibold text-neutral-400">Minimum tube size by car weight</p>
              <ul className="mt-0.5 space-y-0.5">
                {rule.rolloverProtectionTubingSpec.map((tier, i) => (
                  <li key={i}>
                    • {tier.underWeightLbs ? `Under ${tier.underWeightLbs} lbs` : "At and above the heaviest bracket"}:{" "}
                    {tier.minSizes.map((s) => `${s.outerDiameterIn}"×${s.wallThicknessIn}"`).join(" or ")}
                    {tier.materialNote ? ` (${tier.materialNote})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rule.rolloverProtectionLogbookCutoffYear && (
            <p>
              Cages logbooked/built {rule.rolloverProtectionLogbookCutoffYear} or later (or FIA-homologated) are accepted as-is;
              older cages typically need a retrofit or grandfathering step.
            </p>
          )}
        </div>
      )}

      <AcceptedList rule={rule} />

      <NotAcceptedList category={category} rule={rule} />

      {rule.notes && <p className="mt-2 text-xs text-neutral-400">{rule.notes}</p>}

      <CitationLine citation={rule.citation} confidence={rule.confidence} />

      <CategoryMediaLinks category={category} />
    </div>
  );
}

export function ReferenceView({
  ruleset,
  activeGroups,
  classId,
}: {
  ruleset: Ruleset;
  activeGroups: ReadonlySet<CategoryGroup>;
  /** Selected class id (see `ruleset.classes`), if any — refines which rule is shown per category via `ruleset.classOverrides`. */
  classId?: string;
}) {
  const effective = effectiveCategories(ruleset, classId);
  const categories = filterCategoriesByGroups(CATEGORY_ORDER.filter((c) => effective[c]), activeGroups);

  if (categories.length === 0) {
    return <p className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-400">No categories selected — check a safety gear section above.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {categories.map((category, i) => {
        const group = CATEGORY_META[category].group;
        const isNewGroup = i === 0 || CATEGORY_META[categories[i - 1]].group !== group;
        return (
          <Fragment key={category}>
            {isNewGroup && (
              <h3 className={`col-span-full mb-[-6px] mt-2 text-xs font-semibold uppercase tracking-wide first:mt-0 ${GROUP_COLORS[group].text}`}>
                {group === "driver" && ruleset.supportsCodriver ? "Driver & Codriver Safety Gear" : GROUP_LABELS[group]}
              </h3>
            )}
            <CategoryReferenceCard category={category} rule={effective[category]!} />
          </Fragment>
        );
      })}
    </div>
  );
}
