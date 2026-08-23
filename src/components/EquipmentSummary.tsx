import { CATEGORY_META, CATEGORY_ORDER, filterCategoriesByGroups, isPerOccupantCategory } from "@/data/categoryMeta";
import { CategoryGroup, EquipmentCategory, Ruleset } from "@/data/types";
import { CategoryResults, effectiveCategories, effectiveRequirementLevel, isPendingConditional, isViolation } from "@/lib/matcher";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";

type AggregateState = "red" | "yellow" | "green" | "neutral";

/**
 * Border color communicating whether an entered item currently satisfies its requirement — only
 * meaningful when `results` is provided (body-first mode); reference mode (no results) always
 * shows a neutral border, since there's nothing entered yet to evaluate.
 */
function iconBorderClass(category: EquipmentCategory, results?: CategoryResults): string {
  const result = results?.[category];
  if (!result) return "border-neutral-700 hover:border-neutral-400";
  if (isViolation(result)) return "border-red-500";
  if (isPendingConditional(result)) return "border-yellow-500";
  return "border-emerald-500";
}

/** Worst-case state across a row's items: any violation wins (red), else any unresolved item (yellow), else all clear (green). */
function aggregateState(categories: EquipmentCategory[], results: CategoryResults): AggregateState {
  let sawYellow = false;
  for (const category of categories) {
    const result = results[category];
    if (!result || isViolation(result)) return "red";
    if (isPendingConditional(result)) sawYellow = true;
  }
  return sawYellow ? "yellow" : "green";
}

const LABEL_COLOR: Record<AggregateState, string> = {
  red: "text-red-400",
  yellow: "text-yellow-400",
  green: "text-emerald-400",
  neutral: "text-sky-400",
};

function IconRow({
  title,
  staticColor,
  categories,
  results,
  hrefSuffix = "",
  titleSuffix = "",
}: {
  title: string;
  staticColor: AggregateState;
  categories: EquipmentCategory[];
  results?: CategoryResults;
  /** Appended to each icon's #category-X jump link — used for the codriver row, whose form section has suffixed DOM ids (see EquipmentForm's occupant prop). */
  hrefSuffix?: string;
  /** Appended to each icon's title tooltip, alongside hrefSuffix. */
  titleSuffix?: string;
}) {
  if (categories.length === 0) return null;
  const labelColor = LABEL_COLOR[results ? aggregateState(categories, results) : staticColor];
  return (
    <div className="flex items-center gap-2">
      <span className={`min-w-24 shrink-0 whitespace-nowrap text-sm font-semibold ${labelColor}`}>{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <a
              key={category}
              href={`#category-${category}${hrefSuffix}`}
              title={`${CATEGORY_META[category].label}${titleSuffix}`}
              className={`block rounded-lg border-4 transition-colors ${iconBorderClass(category, results)}`}
            >
              <Icon />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function EquipmentSummary({
  ruleset,
  classId,
  activeGroups,
  results,
  hasCodriver,
  codriverResults,
}: {
  ruleset: Ruleset;
  classId?: string;
  activeGroups: ReadonlySet<CategoryGroup>;
  /** When provided, each icon's border reflects whether the entered item currently satisfies its requirement (body-first mode). Omit for a plain reference-mode summary (nothing entered yet). */
  results?: CategoryResults;
  /** Rally only: whether the "Add codriver gear" toggle is on — shows a "Codriver" row alongside "Driver" when the ruleset supports it. */
  hasCodriver?: boolean;
  /** Rally only: the codriver's own results, for the "Codriver" row's icon borders (body-first mode). */
  codriverResults?: CategoryResults;
}) {
  const effective = effectiveCategories(ruleset, classId);
  const categories = filterCategoriesByGroups(CATEGORY_ORDER.filter((c) => effective[c]), activeGroups);
  const supportsCodriver = !!ruleset.supportsCodriver;

  // Rally: the driver/codriver each have their own gear (helmet...shoes, seat, belts, window net) —
  // pulled out of Required/Conditional into their own rows, so those two rows only cover the
  // always-shared car items (fuel cell, extinguisher, kill switch, etc).
  const sharedCategories = supportsCodriver ? categories.filter((c) => !isPerOccupantCategory(c)) : categories;
  const required = sharedCategories.filter((c) => effectiveRequirementLevel(c, effective[c]!) === "required");
  const conditional = sharedCategories.filter((c) => effectiveRequirementLevel(c, effective[c]!) === "conditional");
  const occupantCategories = supportsCodriver
    ? categories.filter((c) => isPerOccupantCategory(c) && ["required", "conditional"].includes(effectiveRequirementLevel(c, effective[c]!)))
    : [];

  // Reference mode (no `results`) has no "Add codriver gear" toggle to produce a separate Codriver
  // row — since the codriver needs identical gear to the driver, say so on the one row instead.
  const driverRowTitle = supportsCodriver && !results ? "Driver & Codriver" : "Driver";

  if (required.length === 0 && conditional.length === 0 && occupantCategories.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Equipment summary</p>
      <div className="flex flex-col gap-2">
        <IconRow title="Required" staticColor="red" categories={required} results={results} />
        <IconRow title="Conditional" staticColor="yellow" categories={conditional} results={results} />
        {supportsCodriver && <IconRow title={driverRowTitle} staticColor="neutral" categories={occupantCategories} results={results} />}
        {supportsCodriver && hasCodriver && (
          <IconRow
            title="Codriver"
            staticColor="neutral"
            categories={occupantCategories}
            results={codriverResults}
            hrefSuffix="-codriver"
            titleSuffix=" (Codriver)"
          />
        )}
      </div>
    </div>
  );
}
