import { Fragment } from "react";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_COLORS, GROUP_LABELS, filterCategoriesByGroups } from "@/data/categoryMeta";
import { standardLabel, standardsFor } from "@/data/standards";
import { CategoryGroup, CategoryRule, EquipmentCategory, Ruleset, StandardAcceptance } from "@/data/types";
import { describeExtinguisherOptions, effectiveCategories } from "@/lib/matcher";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
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
    <div className={`rounded-lg border p-4 ${GROUP_COLORS[meta.group].border}`}>
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

      {category === "fire_extinguisher" && rule.fireExtinguisherOptions && (
        <p className="mt-2 text-xs text-neutral-300">Needs {describeExtinguisherOptions(rule.fireExtinguisherOptions)}.</p>
      )}

      {rule.acceptedStandards && rule.acceptedStandards.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-neutral-400">Accepted certifications</p>
          <ul className="mt-1 space-y-0.5 text-xs text-neutral-300">
            {rule.acceptedStandards.map((a, i) => {
              const detail = acceptanceDetail(a);
              return (
                <li key={i}>
                  • {standardLabel(a.standardId)}
                  {detail ? ` (${detail})` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <NotAcceptedList category={category} rule={rule} />

      {rule.notes && <p className="mt-2 text-xs text-neutral-400">{rule.notes}</p>}

      <CitationLine citation={rule.citation} confidence={rule.confidence} />
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
                {GROUP_LABELS[group]}
              </h3>
            )}
            <CategoryReferenceCard category={category} rule={effective[category]!} />
          </Fragment>
        );
      })}
    </div>
  );
}
