import { ReactNode } from "react";
import { CATEGORY_META, CATEGORY_ORDER, filterCategoriesByGroups, isPerOccupantCategory } from "@/data/categoryMeta";
import { CategoryGroup, EquipmentCategory, Ruleset } from "@/data/types";
import { CategoryResults, EquipmentEntry, effectiveCategories, effectiveRequirementLevel, isEntryEmpty, isPendingConditional, isViolation } from "@/lib/matcher";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";

type AggregateState = "red" | "yellow" | "green" | "neutral";

const smallButtonClass = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";

/**
 * Reference photo of the car itself (not a specific piece of safety equipment) plus a free-text
 * note, e.g. "2004 Miata NB, closed roof, road racing" — same fields Garage profiles carry
 * (src/lib/garage.ts), shown here so the car shows up alongside the gear in the Equipment Summary
 * and in the PDF report, whether it came from a loaded Garage profile or was set right here.
 */
function CarPhotoRow({
  carPhotoDataUrl,
  carNote,
  onPhotoChange,
  onRemovePhoto,
  onNoteChange,
}: {
  carPhotoDataUrl?: string;
  carNote?: string;
  onPhotoChange: (file: File) => void;
  onRemovePhoto: () => void;
  onNoteChange: (note: string) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-700 p-2">
      {carPhotoDataUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo */}
          <img src={carPhotoDataUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
          <button type="button" onClick={onRemovePhoto} className={smallButtonClass}>
            Remove car photo
          </button>
        </>
      ) : (
        <label className={`${smallButtonClass} cursor-pointer`}>
          📷 Add a photo of the car
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onPhotoChange(file);
            }}
          />
        </label>
      )}
      <input
        type="text"
        placeholder="Car note (e.g. 2004 Miata NB, closed roof)"
        value={carNote ?? ""}
        onChange={(e) => onNoteChange(e.target.value)}
        className="min-w-[200px] flex-1 rounded border border-neutral-500 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
    </div>
  );
}

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
  carPhotoDataUrl,
  carNote,
  onCarPhotoChange,
  onRemoveCarPhoto,
  onCarNoteChange,
  actions,
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
  /** Car photo/note — only meaningful once there's real equipment to summarize (body-first mode), so omit these in reference mode. */
  carPhotoDataUrl?: string;
  carNote?: string;
  onCarPhotoChange?: (file: File) => void;
  onRemoveCarPhoto?: () => void;
  onCarNoteChange?: (note: string) => void;
  /** Buttons (save to garage, download PDF, etc.) shown alongside the "Equipment summary" label. */
  actions?: ReactNode;
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

  const hasContent = required.length > 0 || conditional.length > 0 || occupantCategories.length > 0;
  const showCarRow = !!results && !!(onCarPhotoChange || carPhotoDataUrl);
  if (!hasContent && !actions && !showCarRow) return null;

  return (
    <div id="tutorial-equipment-summary" className="mb-6 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Equipment summary</p>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {showCarRow && (
        <CarPhotoRow
          carPhotoDataUrl={carPhotoDataUrl}
          carNote={carNote}
          onPhotoChange={(file) => onCarPhotoChange?.(file)}
          onRemovePhoto={() => onRemoveCarPhoto?.()}
          onNoteChange={(note) => onCarNoteChange?.(note)}
        />
      )}
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

/**
 * Option 3 ("Where can my equipment race?") has no single ruleset to compute Required/Conditional
 * from — it checks the same equipment against every body at once. This variant instead just shows
 * whichever categories have actually been provided, one flat row, no Required/Conditional split —
 * each icon jump-linking to that category's form section. When "Add codriver gear" is on, the
 * driver's and codriver's own items for the same category (e.g. both have a helmet) are two
 * distinct icons — driver in the usual neutral border, codriver in teal — each with its own link
 * and its own eligibility count, since they're different physical items.
 */
export function FilledEquipmentSummary({
  entries,
  codriverEntries,
  hasCodriver,
  activeGroups,
  eligibilityCounts,
  codriverEligibilityCounts,
  carPhotoDataUrl,
  carNote,
  onCarPhotoChange,
  onRemoveCarPhoto,
  onCarNoteChange,
  actions,
}: {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  codriverEntries?: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  hasCodriver?: boolean;
  activeGroups: ReadonlySet<CategoryGroup>;
  /** Number of sanctioning bodies the driver's item for this category currently satisfies (badge on the icon) — keyed the same as `entries`. */
  eligibilityCounts?: Partial<Record<EquipmentCategory, number>>;
  /** Same, for the codriver's own item. */
  codriverEligibilityCounts?: Partial<Record<EquipmentCategory, number>>;
  carPhotoDataUrl?: string;
  carNote?: string;
  onCarPhotoChange?: (file: File) => void;
  onRemoveCarPhoto?: () => void;
  onCarNoteChange?: (note: string) => void;
  actions?: ReactNode;
}) {
  const categories = filterCategoriesByGroups(CATEGORY_ORDER, activeGroups);
  const driverProvided = categories.filter((c) => !isEntryEmpty(c, entries[c]));
  const codriverProvided = hasCodriver ? categories.filter((c) => isPerOccupantCategory(c) && !isEntryEmpty(c, codriverEntries?.[c])) : [];

  const items = [
    ...driverProvided.map((category) => ({ category, isCodriver: false, count: eligibilityCounts?.[category] })),
    ...codriverProvided.map((category) => ({ category, isCodriver: true, count: codriverEligibilityCounts?.[category] })),
  ];

  const showCarRow = !!(onCarPhotoChange || carPhotoDataUrl);
  if (items.length === 0 && !actions && !showCarRow) return null;

  return (
    <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Equipment summary</p>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {showCarRow && (
        <CarPhotoRow
          carPhotoDataUrl={carPhotoDataUrl}
          carNote={carNote}
          onPhotoChange={(file) => onCarPhotoChange?.(file)}
          onRemovePhoto={() => onRemoveCarPhoto?.()}
          onNoteChange={(note) => onCarNoteChange?.(note)}
        />
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ category, isCodriver, count }) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <a
              key={`${category}-${isCodriver ? "codriver" : "driver"}`}
              href={`#category-${category}${isCodriver ? "-codriver" : ""}`}
              title={`${CATEGORY_META[category].label}${isCodriver ? " (Codriver)" : ""}`}
              className={`relative block rounded-lg border-4 transition-colors ${
                isCodriver ? "border-teal-700 hover:border-teal-400" : "border-neutral-700 hover:border-neutral-400"
              }`}
            >
              <Icon />
              {count !== undefined && (
                <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500">
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
