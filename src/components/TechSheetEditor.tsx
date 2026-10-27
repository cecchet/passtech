"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getRuleset } from "@/data";
import { TechSheetField } from "@/data/techSheetTypes";
import { GarageProfile, GearItem, loadMyGear, stableJson } from "@/lib/garage";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import {
  buildDeclaration,
  buildExportFile,
  carNumberOf,
  cleanHeader,
  defaultRulesetFor,
  variantForClass,
  evaluateProfile,
  expandLines,
  exportFilename,
  gearEntriesForLine,
  hasSheetGear,
  lineChecks,
  LineCheck,
  lineOptions,
  LineStatus,
  lineStatus,
  missingRequiredHeader,
  newPhotoId,
  sheetHasCodriver,
  occupantLabel,
  prefillLine,
  sheetEntries,
  switchDraftTemplate,
  TechSheetDraft,
  TechSheetDraftLine,
  TechSheetDraftPhoto,
  TechSheetLine,
  TechSheetLineGroup,
  stripEntryPhotos,
  withLineGear,
  withPickedGear,
} from "@/lib/techSheet";
import {
  EventEntryLookup,
  eventTemplates,
  fetchTechSheetEvents,
  lookupEventEntry,
  fetchMyTechSheets,
  MyTechSheet,
  resubmitState,
  submitTechSheet,
  TechSheetEventTemplate,
  templateChoiceLabel,
  templateForClass,
  uploadTechSheetPhoto,
} from "@/lib/techSheetServer";
import { CategoryCard } from "@/components/EquipmentForm";
import { gearItemLabel } from "@/components/GearItems";
import { isEntryEmpty } from "@/lib/matcher";
import { ZoomableThumb } from "@/components/ZoomableThumb";
import { statusLabel, statusStyle } from "@/components/ResultRow";
import { TechSheetSignIn } from "@/components/TechSheetSignIn";
import { TechSheetSubmitted } from "@/components/TechSheetSubmitted";

const inputClass = "w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-base text-neutral-100 sm:text-sm";
const smallButtonClass = "flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";
const actionButtonClass = "flex items-center justify-center gap-2 rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = "flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50";

const EMPTY_LINE: TechSheetDraftLine = { declared: "", values: {}, photos: [] };

function FieldInput({ field, value, onChange }: { field: TechSheetField; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const id = useId();
  const label = (
    <span className="mb-1 block text-xs font-medium text-neutral-300">
      {field.label}
      {field.unit ? ` (${field.unit})` : ""}
      {field.required && <span className="text-amber-400"> *</span>}
    </span>
  );
  if (field.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset>
        <legend className="mb-1 block text-xs font-medium text-neutral-300">{field.label}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(field.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => onChange(e.target.checked ? [...selected, opt] : selected.filter((s) => s !== opt))}
                className="h-4 w-4 accent-amber-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  const str = typeof value === "string" ? value : "";
  return (
    <label htmlFor={id} className="block">
      {label}
      {field.type === "choice" ? (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">—</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "text" : field.type === "date" ? "date" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

function CheckChip({ check, showOccupant }: { check: LineCheck; showOccupant: boolean }) {
  const { result } = check;
  return (
    <div className={`rounded border px-2 py-1 text-xs ${statusStyle(result.status, result.requirement)}`}>
      <span className="font-semibold">
        {showOccupant && check.occupant ? `${occupantLabel(check.occupant)}: ` : ""}PassTech check — {statusLabel(result.status, result.requirement)}
      </span>
      <span className="mt-0.5 block opacity-80">{result.reason}</span>
    </div>
  );
}

/** One of the sheet's own photos (the car, the driver, the co-driver): up to max, each removable. */
function PictureSlot({ label, photos, max, onChange }: { label: string; photos: TechSheetDraftPhoto[]; max: number; onChange: (photos: TechSheetDraftPhoto[]) => void }) {
  return (
    <div className="rounded-lg border border-neutral-700 p-2">
      <p className="mb-1 text-xs font-medium text-neutral-300">{label}</p>
      {photos.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {photos.map((p) => (
            <li key={p.id} className="flex flex-col items-center gap-1">
              <ZoomableThumb src={p.dataUrl} className="h-20 w-20 rounded object-cover" />
              <button type="button" onClick={() => onChange(photos.filter((x) => x.id !== p.id))} className="text-[11px] text-red-400 hover:text-red-300">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {photos.length < max && <PhotoAdder onAdd={(dataUrl) => onChange([...photos, { id: newPhotoId(), dataUrl, kind: "item" as const }].slice(0, max))} />}
    </div>
  );
}

function PhotoAdder({ onAdd }: { onAdd: (dataUrl: string) => void }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const add = async (file: File) => {
    setBusy(true);
    try {
      onAdd(await resizeImageToDataUrl(file, 1600, 0.82));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <label htmlFor={id} className={smallButtonClass}>
        📷 Add a photo
        <input
          id={id}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            for (const f of files) await add(f);
          }}
        />
      </label>
      {busy && <span className="text-xs text-neutral-500">Resizing…</span>}
    </div>
  );
}

/** A line that only takes OK (or N/A): no gear, nothing to tick or fill in. */
const isSimpleLine = (line: TechSheetLine, options: string[]) => !line.item.gear && options.length === 0 && !(line.item.fields ?? []).length;

/** A gear line's pieces of gear in My gear, to fill it from one (the one it has now ticked). */
function MyGearPicker({ items, gear, onPick }: { items: GearItem[]; gear: TechSheetDraftLine["gear"]; onPick: (item: GearItem) => void }) {
  const current = gear ? stableJson(gear) : null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-900 p-2">
      <span className="text-xs text-neutral-400">From My gear:</span>
      {items.map((item) => {
        const on = current === stableJson(stripEntryPhotos(item.entry));
        const photo = item.entry.photoDataUrls?.[0];
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(item)}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-left text-xs ${on ? "border-emerald-500 bg-emerald-900 text-emerald-100" : "border-emerald-800 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo */}
            {photo && <img src={photo} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />}
            {on ? "✓ " : ""}
            {gearItemLabel(item)}
          </button>
        );
      })}
    </div>
  );
}

function LineCard({
  line,
  value,
  checks,
  options,
  status,
  hasGear,
  open,
  onToggle,
  onChange,
  myGear,
}: {
  line: TechSheetLine;
  value: TechSheetDraftLine;
  checks: LineCheck[];
  /** The tick list of a check line (the sheet's options). */
  options: string[];
  status: LineStatus;
  /** The line has gear, entered on the sheet or in the gear set (PassTech's check is about it, not
   * just the rule). */
  hasGear: boolean;
  /** Unfolded (folded lines show their title, status and a short summary only). */
  open: boolean;
  onToggle: () => void;
  onChange: (next: TechSheetDraftLine) => void;
  /** A gear line: the pieces of gear of its kind in My gear. */
  myGear?: GearItem[];
}) {
  const { item } = line;
  const simple = isSimpleLine(line, options);
  // OK / N/A: a toggle, each clearing the other.
  const answer = (k: "ok" | "na") => {
    const on = k === "ok" ? !!value.done : !!value.na;
    onChange({ ...value, done: k === "ok" ? !on : false, na: k === "na" ? !on : false });
  };
  const answerButtons = (size: "small" | "large") =>
    ([["ok", "OK"], ...(item.allowNA ? [["na", "N/A"]] : [])] as ["ok" | "na", string][]).map(([k, label]) => {
      const on = k === "ok" ? !!value.done : !!value.na;
      return (
        <button
          key={k}
          type="button"
          aria-pressed={on}
          onClick={() => answer(k)}
          className={`rounded-full border font-semibold ${size === "small" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"} ${on ? (k === "ok" ? "border-green-600 bg-green-600 text-black" : "border-neutral-400 bg-neutral-400 text-black") : "border-neutral-600 text-neutral-300 hover:bg-neutral-800"}`}
        >
          {on ? "✓ " : ""}
          {label}
        </button>
      );
    });
  const team = item.checkedBy === "team";
  const [showPhotos, setShowPhotos] = useState(value.photos.length > 0);
  // The gear form starts open while there's something to enter or fix — and stays as the user
  // leaves it (not snapping shut the moment the gear is accepted).
  const [formOpen] = useState(!value.gear || (status.state !== "ok" && status.state !== "na"));
  const setPhotos = (photos: TechSheetDraftPhoto[]) => onChange({ ...value, photos });

  return (
    // N/A (not fitted): the line is greyed out, its gear form and declaration put away.
    <li id={"ts-line-" + line.key} className={`scroll-mt-4 rounded-lg border p-3 ${value.na ? "border-neutral-800 bg-neutral-900 opacity-60" : `bg-neutral-950 ${status.state === "fix" ? "border-red-700" : status.state === "missing" ? "border-amber-700" : "border-neutral-700"}`}`}>
      <div className="flex w-full flex-wrap items-start justify-between gap-2">
        <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <span className="w-3 shrink-0 text-xs text-neutral-500">{open ? "▾" : "▸"}</span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-neutral-100">{line.label}</span>
            {!open && status.state !== "todo" && !simple && <span className="block truncate text-xs text-neutral-400">{status.text}</span>}
          </span>
        </button>
        <span className="flex shrink-0 items-center gap-1">
          {team && <span className="rounded-full border border-sky-700 bg-sky-950 px-2 py-0.5 text-[11px] text-sky-300">team</span>}
          {open && item.allowNA && <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-400">N/A ok</span>}
          {/* Folded, a simple line is answered right here (open it to read what's checked); its answer is its status. */}
          {simple && !open ? answerButtons("small") : <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATE_STYLE[status.state]}`}>{STATE_LABEL[status.state]}</span>}
        </span>
      </div>
      {open && (
        <>
          {item.accepts && <p className="mt-1 text-xs text-neutral-400">{item.accepts}</p>}
          {item.rule && <p className="mt-0.5 text-[11px] text-neutral-500">{item.rule}</p>}

          {/* Declared on the sheet (no gear in the gear set): that, instead of the rule's bare "Required". */}
          {!hasGear && status.state === "ok" && line.item.gear && (
            <div className="mt-2 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-300">
              <span className="font-semibold">Declared on the sheet</span> — {status.text}
              <span className="mt-0.5 block opacity-80">Not in your gear set, so PassTech hasn&apos;t checked it: the scrutineer will.</span>
            </div>
          )}
          {checks.length > 0 && !value.na && (hasGear || status.state !== "ok") && (
            <div className="mt-2 space-y-1">
              {checks.map((c, i) => (
                <CheckChip key={i} check={c} showOccupant={checks.length > 1} />
              ))}
            </div>
          )}

          {!item.gear && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400">{team ? "Checked by the team:" : "My car:"}</span>
              {answerButtons("large")}
            </div>
          )}

          {/* A piece of gear of its kind in My gear fills the line (its own copy, with its photos). */}
          {item.gear && !value.na && myGear && myGear.length > 0 && (
            <MyGearPicker items={myGear} gear={value.gear} onPick={(g) => withPickedGear(line, value, g.entry).then(onChange)} />
          )}

          {/* The gear itself, in My gear's form (certifications with their dates, extinguishers...):
              the sheet's own copy, judged by PassTech as entered. Its photos are the line's below. */}
          {item.gear && !value.na && (
            <div className="mt-2">
              <CategoryCard
                category={item.gear}
                entry={value.gear ?? { category: item.gear }}
                result={value.gear ? checks[0]?.result : undefined}
                hasResultsContext={false}
                isNewGroup={false}
                occupant={line.occupant ?? "driver"}
                defaultOpen={formOpen}
                showResultRow={false}
                stickerMode="sheet"
                onChange={(_, entry, scanned) => {
                  const next = withLineGear(line, value, entry);
                  // Photos scanned in the form (the whole helmet, a tag, a sticker's) join the line's.
                  const added = (Array.isArray(scanned) ? scanned : scanned ? [scanned] : []).filter((s) => !next.photos.some((p) => p.dataUrl === s.dataUrl));
                  onChange(added.length ? { ...next, photos: [...next.photos, ...added.map((s) => ({ id: newPhotoId(), dataUrl: s.dataUrl, kind: s.kind }))] } : next);
                }}
              />
            </div>
          )}

          {!(item.gear && value.na) && (
            <label className="mt-2 block">
              <span className="mb-1 block text-xs font-medium text-neutral-400">{item.gear ? "Declared (written from the details above — edit if needed)" : "Note (optional)"}</span>
              <textarea
                rows={value.declared.length > 80 ? 3 : 1}
                value={value.declared}
                onChange={(e) => onChange({ ...value, declared: e.target.value })}
                placeholder={item.gear ? "Fill in the details above, or describe it here" : ""}
                className={`${inputClass} resize-y`}
              />
            </label>
          )}

          {item.gear && item.allowNA && (
            <button
              type="button"
              aria-pressed={!!value.na}
              onClick={() => onChange({ ...value, na: !value.na })}
              className={`mt-2 rounded-full border px-3 py-1 text-xs font-semibold ${value.na ? "border-neutral-400 bg-neutral-400 text-black" : "border-neutral-600 text-neutral-300 hover:bg-neutral-800"}`}
            >
              {value.na ? "✓ " : ""}Not fitted / N/A
            </button>
          )}

          {options.length > 0 && !item.gear && (
            <div className="mt-2">
              <FieldInput
                field={{ id: "__options", label: "What's fitted", type: "multi", options }}
                value={value.values.__options}
                onChange={(v) => onChange({ ...value, values: { ...value.values, __options: v } })}
              />
            </div>
          )}
          {item.fields && item.fields.length > 0 && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {item.fields.map((f) => (
                <FieldInput key={f.id} field={f} value={value.values[f.id]} onChange={(v) => onChange({ ...value, values: { ...value.values, [f.id]: v } })} />
              ))}
            </div>
          )}

          <div className="mt-2">
            {value.photos.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-2">
                {value.photos.map((p) => (
                  <li key={p.id} className="flex flex-col items-center gap-1">
                    <ZoomableThumb src={p.dataUrl} className="h-16 w-16 rounded object-cover" />
                    <div className="flex overflow-hidden rounded border border-neutral-700 text-[11px]">
                      {(["item", "tag"] as const).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => setPhotos(value.photos.map((x) => (x.id === p.id ? { ...x, kind } : x)))}
                          className={`px-1.5 py-0.5 ${p.kind === kind ? "bg-amber-500 text-black" : "text-neutral-400 hover:bg-neutral-800"}`}
                        >
                          {kind === "item" ? "photo" : "tag"}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setPhotos(value.photos.filter((x) => x.id !== p.id))} className="text-[11px] text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showPhotos || value.photos.length > 0 ? (
              <PhotoAdder onAdd={(dataUrl) => onChange({ ...value, photos: [...value.photos, { id: newPhotoId(), dataUrl, kind: item.gear ? "tag" : "item" }] })} />
            ) : (
              <button type="button" onClick={() => setShowPhotos(true)} className="text-xs text-amber-400 hover:text-amber-300">
                + Add photos
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

const STATE_LABEL: Record<LineStatus["state"], string> = {
  ok: "Accepted",
  na: "N/A",
  declared: "Declared",
  fix: "To fix",
  missing: "Missing",
  todo: "To fill in",
};
const STATE_STYLE: Record<LineStatus["state"], string> = {
  ok: "border-emerald-700 bg-emerald-950 text-emerald-300",
  na: "border-neutral-600 bg-neutral-900 text-neutral-300",
  declared: "border-sky-700 bg-sky-950 text-sky-300",
  fix: "border-red-700 bg-red-950 text-red-300",
  missing: "border-amber-700 bg-amber-950 text-amber-300",
  todo: "border-neutral-600 bg-neutral-900 text-neutral-300",
};

/** The sheet at a glance: how many lines are accepted, declared, to fix, missing or still to fill
 * in -- and the ones needing attention, each a link to its line. */
function SheetSummary({ groups, lineInfo, onJump }: { groups: TechSheetLineGroup[]; lineInfo: Record<string, { status: LineStatus }>; onJump: (key: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const all = groups.flatMap((g) => g.lines.map((line) => ({ group: g.title, line, status: lineInfo[line.key].status })));
  const count = (s: LineStatus["state"]) => all.filter((x) => x.status.state === s).length;
  const order: LineStatus["state"][] = ["fix", "missing", "todo", "declared"];
  const attention = all
    .filter((x) => order.includes(x.status.state))
    .sort((a, b) => order.indexOf(a.status.state) - order.indexOf(b.status.state));
  const shown = showAll ? attention : attention.slice(0, 8);
  const jump = onJump;
  return (
    <section className="mb-6 rounded-lg border border-neutral-700 p-3">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">Summary</h3>
      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        {(["ok", "declared", "fix", "missing", "todo", "na"] as LineStatus["state"][]).map((s) =>
          count(s) ? (
            <span key={s} className={`rounded-full border px-2 py-0.5 ${STATE_STYLE[s]}`}>
              {count(s)} {STATE_LABEL[s].toLowerCase()}
            </span>
          ) : null
        )}
      </div>
      {attention.length === 0 ? (
        <p className="text-sm text-emerald-300">Every line is accepted or N/A — ready to submit.</p>
      ) : (
        <ul className="space-y-1">
          {shown.map(({ group, line, status }) => (
            <li key={line.key}>
              <button type="button" onClick={() => jump(line.key)} className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-neutral-800">
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATE_STYLE[status.state]}`}>{STATE_LABEL[status.state]}</span>
                <span className="min-w-0">
                  <span className="text-neutral-100">{line.label}</span>
                  <span className="text-neutral-500"> · {group}</span>
                  {(status.state === "fix" || status.state === "missing") && <span className="block text-xs text-neutral-400">{status.text}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {attention.length > 8 && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-1 text-xs text-amber-400 hover:text-amber-300">
          {showAll ? "Show fewer" : `Show all ${attention.length}`}
        </button>
      )}
    </section>
  );
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TechSheetEditor({
  draft,
  profile,
  profiles,
  onOpenGarage,
  signedInEmail,
  saveError,
  onChange,
  onDelete,
  onSubmitted,
}: {
  draft: TechSheetDraft;
  profile: GarageProfile | undefined;
  /** Every gear set in My gear, to switch the sheet to another. */
  profiles: GarageProfile[];
  /** Opens My gear (to add a gear set). */
  onOpenGarage?: () => void;
  signedInEmail: string | null;
  saveError: string | null;
  /** Merged into the latest draft (not this render's copy), so an async action finishing late
   * (submit, re-fill) never drops edits made while it ran. */
  onChange: (patch: Partial<TechSheetDraft>) => void;
  onDelete: () => void;
  /** After a successful (re-)submission: the caller closes the sheet. */
  onSubmitted?: () => void;
}) {
  const groups = useMemo(() => expandLines(draft.template, draft.variant), [draft.template, draft.variant]);
  const ruleset = draft.rulesetId ? getRuleset(draft.rulesetId) : undefined;
  const results = useMemo(() => evaluateProfile(ruleset, profile), [ruleset, profile]);
  const entries = useMemo(() => sheetEntries(draft, profile), [draft, profile]);
  const rulesetChoices = (draft.template.passtechRulesetIds ?? []).map((id) => getRuleset(id)).filter((r) => !!r);
  const variants = draft.template.variants ?? [];
  const variantLabel = variants.find((v) => v.id === draft.variant)?.label;

  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [submittedRefresh, setSubmittedRefresh] = useState(0);
  const [confirmRefill, setConfirmRefill] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // The sheet as the event has it (once submitted): whether it can still be re-submitted, and
  // after a Failed verdict which lines failed.
  const [serverSheet, setServerSheet] = useState<MyTechSheet | null>(null);
  useEffect(() => {
    if (!draft.submittedSheetId || !signedInEmail) return;
    let live = true;
    fetchMyTechSheets()
      .then((list) => {
        if (live) setServerSheet(list.find((s) => s.id === draft.submittedSheetId) ?? null);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [draft.submittedSheetId, signedInEmail, submittedRefresh]);
  const serverState = serverSheet ? resubmitState(serverSheet) : null;
  const failedResult = (key: string) => (serverSheet?.status === "failed" ? serverSheet.inspection?.items?.[key] : undefined);

  const missing = missingRequiredHeader(draft);
  const update = (patch: Partial<TechSheetDraft>) => onChange(patch);
  const setLine = (key: string, line: TechSheetDraftLine) => update({ lines: { ...draft.lines, [key]: line } });

  // Each line's PassTech check and status, for the summary and the line itself.
  const lineInfo = useMemo(() => {
    const out: Record<string, { checks: LineCheck[]; status: LineStatus; hasGear: boolean }> = {};
    for (const g of groups) {
      for (const line of g.lines) {
        const value = draft.lines[line.key];
        const checks = lineChecks(results, profile, line, { ruleset, entries, value });
        // Gear entered on the sheet decides, else the gear set's (drafts from before the form).
        const hasGear = value?.gear ? hasSheetGear(value) : gearEntriesForLine(profile, line).length > 0;
        out[line.key] = { checks, hasGear, status: lineStatus(line, value, checks, hasGear, ruleset) };
      }
    }
    return out;
  }, [groups, results, profile, draft.lines, ruleset, entries]);
  const answered = (st: LineStatus) => st.state === "ok" || st.state === "na" || st.state === "declared";
  // A line starts open while it needs an answer -- except a simple one (OK / N/A), answered folded.
  const lineByKey = useMemo(() => new Map(groups.flatMap((g) => g.lines.map((l) => [l.key, l] as const))), [groups]);
  const startsOpen = (key: string) => {
    const line = lineByKey.get(key);
    return !answered(lineInfo[key].status) && !(line && isSimpleLine(line, lineOptions(line, ruleset)));
  };
  const [openLines, setOpenLines] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.keys(lineInfo).map((key) => [key, startsOpen(key)])));
  const isOpen = (key: string) => openLines[key] ?? startsOpen(key);
  // The pieces of gear in My gear, to fill a gear line from.
  const [myItems, setMyItems] = useState<GearItem[]>([]);
  useEffect(() => {
    loadMyGear().then((g) => setMyItems(g.items.filter((i) => !isEntryEmpty(i.category, i.entry))), () => {});
  }, []);
  const openLine = (key: string) => {
    setOpenLines((o) => ({ ...o, [key]: true }));
    setTimeout(() => document.getElementById("ts-line-" + key)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };
  const totalLines = groups.reduce((n, g) => n + g.lines.length, 0);
  const filledLines = groups.reduce(
    (n, g) => n + g.lines.filter((l) => { const v = draft.lines[l.key]; return !!v && (!!v.declared.trim() || !!v.done || !!v.na || v.photos.length > 0 || hasSheetGear(v)); }).length,
    0
  );

  const handleExport = async () => {
    setBusy("export");
    setActionError(null);
    try {
      downloadJson(exportFilename(draft), await buildExportFile(draft));
    } catch (e) {
      setActionError(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = async () => {
    if (!draft.event) return;
    if (!signedInEmail) {
      setShowSignIn(true);
      return;
    }
    if (!carNumberOf(draft)) {
      setActionError("Enter the car number first.");
      return;
    }
    setActionError(null);
    try {
      setBusy("Preparing…");
      const { items, images, pictures } = await buildDeclaration(draft);
      const hashes = Object.keys(images);
      for (let i = 0; i < hashes.length; i++) {
        setBusy(`Uploading photo ${i + 1} of ${hashes.length}…`);
        await uploadTechSheetPhoto(hashes[i], images[hashes[i]]);
      }
      setBusy("Submitting…");
      const id = await submitTechSheet({
        event: draft.event.id,
        carNumber: carNumberOf(draft),
        header: cleanHeader(draft),
        variant: draft.variant,
        competitor: { items, ...(pictures ? { pictures } : {}) },
        // The event's sheet filled (drafts from before several sheets per event leave it to the server).
        ...(draft.templateId ? { template: draft.templateId } : {}),
      });
      update({ submittedSheetId: id, submittedAt: new Date().toISOString() });
      setSubmittedRefresh((n) => n + 1);
      onSubmitted?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  /** The car class picks both the sheet's lines and the ruleset the gear is checked against (e.g.
   * NEHA X car → the X lines and the neha-x ruleset). Lines new to this type are pre-filled from
   * My gear; what was entered on the other type's lines is kept in case they switch back. */
  const changeVariant = async (variant: string) => {
    const rulesetId = defaultRulesetFor(draft.template, variant, draft.rulesetId);
    const lines = { ...draft.lines };
    for (const group of expandLines(draft.template, variant)) {
      for (const line of group.lines) {
        if (line.item.gear && !lines[line.key]) lines[line.key] = await prefillLine(profile, line);
      }
    }
    update({ variant, rulesetId, lines });
  };

  /** Re-fills every gear line from a gear set (the sheet's own, or the one switched to): its gear,
   * declarations and gear photos are replaced, photos added by hand are kept. */
  const refillFrom = async (from: GarageProfile | undefined, patch: Partial<TechSheetDraft> = {}) => {
    setConfirmRefill(false);
    setBusy("Re-filling…");
    const lines = { ...draft.lines };
    for (const group of groups) {
      for (const line of group.lines) {
        if (!line.item.gear) continue;
        const filled = await prefillLine(from, line);
        const existing = lines[line.key] ?? EMPTY_LINE;
        // The certification ticked follows the gear (none when the gear set has none of it).
        const values = { ...existing.values, ...filled.values };
        if (!filled.gear && existing.gear) delete values.__options;
        lines[line.key] = {
          ...existing,
          declared: filled.declared,
          gear: filled.gear,
          values,
          photos: [...filled.photos, ...existing.photos.filter((p) => !p.fromGear)],
        };
      }
    }
    update({ ...patch, lines });
    setBusy(null);
  };
  const handleRefill = () => refillFrom(profile);

  // Car and crew from the event's entry list: typing the car number looks it up (filling the
  // empty fields); "Fill from the entry list" fills them all.
  const [entry, setEntry] = useState<{ car: string; found: EventEntryLookup | null; error?: string } | null>(null);
  const carNumber = carNumberOf(draft);
  // The draft as of the last render, for a lookup that finishes after more typing.
  const latest = useRef(draft);
  useEffect(() => {
    latest.current = draft;
  }, [draft]);
  const fillFromEntry = (found: EventEntryLookup, overwrite: boolean) => {
    const d = latest.current;
    const fields = d.template.header;
    const has = (p: string) => fields.some((f) => f.prefill === p);
    // A sheet with one "Car" field (make only) gets "2004 Subaru Impreza" in it.
    const make = [has("year") ? "" : found.year, found.make, has("model") ? "" : found.model].filter(Boolean).join(" ");
    const known: Record<string, string | undefined> = {
      event: d.event?.name, car_number: found.carNumber, class: found.class, driver: found.driver, codriver: found.codriver,
      make, model: found.model, year: found.year, vin: found.vin, logbook_number: found.logbookNumber, logbook_body: found.logbookBody,
    };
    const header = { ...d.header };
    for (const f of fields) {
      let v = f.prefill ? known[f.prefill] : undefined;
      if (!v) continue;
      // A choice field takes the option the value names ("American Rally Association (ARA)" -> "ARA").
      if (f.type === "choice" && f.options?.length) {
        const low = v.toLowerCase();
        const opt = f.options.find((o) => o.toLowerCase() === low) ?? f.options.find((o) => low.includes(o.toLowerCase()));
        if (!opt) continue;
        v = opt;
      }
      const cur = header[f.id];
      if (overwrite || !cur || (Array.isArray(cur) ? cur.length === 0 : !cur.trim())) header[f.id] = v;
    }
    const patch: Partial<TechSheetDraft> = { header };
    update(patch);
    // The car class from the event class (e.g. R2 -> the R1/R2 version of the sheet).
    if (found.class && (d.template.variants ?? []).length > 0) {
      const v = variantForClass(d.template, found.class);
      if (v && v !== d.variant) changeVariant(v);
    }
  };
  useEffect(() => {
    if (!draft.event || !carNumber) return;
    const eventId = draft.event.id;
    const timer = setTimeout(async () => {
      try {
        const found = await lookupEventEntry(eventId, carNumber);
        setEntry({ car: carNumber, found });
        if (found) fillFromEntry(found, false);
      } catch (e) {
        setEntry({ car: carNumber, found: null, error: e instanceof Error ? e.message : String(e) });
      }
    }, 700);
    return () => clearTimeout(timer);
    // Only when the car number (or the event) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.event?.id, carNumber]);
  const changeGearSet = (id: string) => {
    const next = profiles.find((p) => p.id === id);
    refillFrom(next, { gearProfileId: next?.id, gearProfileName: next?.name });
  };

  // The event's sheets, when it uses several (one per group of classes): fetched again here, so
  // the competitor can switch to another. No event list (offline, older server) → no switcher.
  const [eventSheets, setEventSheets] = useState<TechSheetEventTemplate[] | null>(null);
  const draftEventId = draft.event?.id;
  useEffect(() => {
    if (!draftEventId) return;
    let cancelled = false;
    fetchTechSheetEvents()
      .then((list) => !cancelled && setEventSheets(eventTemplates(list.find((e) => e.id === draftEventId))))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [draftEventId]);
  const sheets = draft.event && eventSheets && eventSheets.length > 1 ? eventSheets : [];
  // The draft's sheet: by server id, else (drafts from before) the one with the same template.
  const currentSheet = draft.templateId ? sheets.find((t) => t.id === draft.templateId) : sheets.find((t) => t.definition.id === draft.template.id);
  const entryClass = entry?.car === carNumber ? entry.found?.class : undefined;
  const classSheet = templateForClass(sheets, entryClass);

  /** Moves the draft to another of the event's sheets: lines made for it and pre-filled from the
   * gear set (what the two sheets share is kept), the car and crew details kept. */
  const switchSheet = async (sheet: TechSheetEventTemplate) => {
    if (busy) return;
    setBusy("Switching sheet…");
    setActionError(null);
    try {
      const d = latest.current;
      const classField = d.template.header.find((f) => f.prefill === "class");
      const headerClass = classField ? d.header[classField.id] : undefined;
      const eventClass = entryClass ?? (typeof headerClass === "string" && headerClass.trim() ? headerClass.trim() : undefined);
      update(await switchDraftTemplate(d, { template: sheet.definition, templateVersion: sheet.version, templateId: sheet.id, eventClass, profile }));
    } catch (e) {
      setActionError(`Couldn't switch sheet: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-4 rounded-lg border border-neutral-700 p-3">
        <p className="text-base font-semibold text-neutral-100">
          {draft.template.title}
          {draft.template.revision ? <span className="font-normal text-neutral-500"> · rev. {draft.template.revision}</span> : null}
        </p>
        <p className="text-xs text-neutral-400">
          {draft.event ? `Event: ${draft.event.name}` : "No event — export the file and hand it to the scrutineer"}
          {variantLabel ? ` · ${variantLabel}` : ""}
          {draft.gearProfileName ? ` · gear set "${draft.gearProfileName}"` : " · no gear set"}
        </p>
        {sheets.length > 1 && (
          <label className="mt-2 block">
            <span className="mb-1 block text-xs font-medium text-neutral-300">Tech sheet (the event uses one per group of classes)</span>
            <select
              value={currentSheet?.id ?? ""}
              disabled={!!busy}
              onChange={(e) => {
                const next = sheets.find((t) => t.id === e.target.value);
                if (next) switchSheet(next);
              }}
              className={inputClass}
            >
              {!currentSheet && <option value="">{draft.template.title}</option>}
              {sheets.map((t) => (
                <option key={t.id} value={t.id}>
                  {templateChoiceLabel(t)}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-neutral-500">
              Switching re-makes the sheet&apos;s lines for the other sheet, pre-filled from your gear set; the car and crew stay.
              {draft.submittedSheetId ? " Re-submit to move your submitted sheet to it." : ""}
            </span>
          </label>
        )}
        {draft.gearProfileId && !profile && <p className="mt-1 text-xs text-amber-300">That gear set is no longer in My gear — PassTech checks are unavailable. Pick another below.</p>}
        <label className="mt-2 block">
          <span className="mb-1 block text-xs font-medium text-neutral-300">Gear set (from My gear)</span>
          {profiles.length > 0 ? (
            <select value={profile?.id ?? ""} disabled={!!busy} onChange={(e) => changeGearSet(e.target.value)} className={inputClass}>
              {!profile && <option value="">— Pick a gear set to fill the gear lines —</option>}
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.hasCodriver ? " (with co-driver gear)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <span className="block text-xs text-neutral-400">
              No gear sets in My gear on this device yet.{" "}
              {onOpenGarage && (
                <button type="button" onClick={onOpenGarage} className="text-amber-400 underline hover:text-amber-300">
                  Add your gear in My gear
                </button>
              )}
              {onOpenGarage ? ", then come back to fill the sheet from it." : ""}
            </span>
          )}
          {profile && <span className="mt-1 block text-xs text-neutral-500">Switching gear set re-fills the gear lines from it (photos you added by hand stay).</span>}
        </label>
        {draft.template.instructions && <p className="mt-2 text-xs text-neutral-400">{draft.template.instructions}</p>}
        {variants.length > 0 && (
          <label className="mt-2 block">
            <span className="mb-1 block text-xs font-medium text-neutral-300">Car class</span>
            <select value={draft.variant ?? ""} onChange={(e) => changeVariant(e.target.value)} className={inputClass}>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            {ruleset && <span className="mt-1 block text-xs text-neutral-500">Gear checked against {ruleset.bodyName} — {ruleset.disciplineName}.</span>}
          </label>
        )}
        {variants.length === 0 && rulesetChoices.length > 1 && (
          <label className="mt-2 block">
            <span className="mb-1 block text-xs font-medium text-neutral-300">Check my gear against</span>
            <select value={draft.rulesetId ?? ""} onChange={(e) => update({ rulesetId: e.target.value || undefined })} className={inputClass}>
              {rulesetChoices.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.bodyName} — {r.disciplineName}
                </option>
              ))}
            </select>
          </label>
        )}
        {variants.length === 0 && rulesetChoices.length === 1 && ruleset && (
          <p className="mt-1 text-xs text-neutral-500">
            Gear checked against {ruleset.bodyName} — {ruleset.disciplineName}.
          </p>
        )}
        <p className="mt-2 text-xs text-neutral-500">
          {filledLines} of {totalLines} lines filled · saved on this device
          {saveError && <span className="text-red-400"> · {saveError}</span>}
        </p>
      </div>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">Car and crew</h3>
        {draft.event && (
          <p className="mb-2 text-xs text-neutral-400">
            {!carNumber
              ? "Enter your car number: if you're on the event's entry list, the rest fills in from it."
              : entry?.car !== carNumber
                ? "Looking up car " + carNumber + " on the entry list…"
                : entry.error
                  ? "Couldn't reach the entry list (" + entry.error + ") — fill it in by hand."
                  : entry.found
                    ? (
                      <>
                        Car {carNumber} is on the entry list: {[entry.found.driver, entry.found.codriver].filter(Boolean).join(" / ")}
                        {entry.found.class ? " · " + entry.found.class : ""}.{" "}
                        <button type="button" onClick={() => entry.found && fillFromEntry(entry.found, true)} className="text-amber-400 underline hover:text-amber-300">
                          Fill everything from the entry list
                        </button>
                        {classSheet && classSheet.id !== currentSheet?.id && (
                          <span className="mt-1 block text-amber-300">
                            Car {carNumber} is in class {entryClass}: the event&apos;s {entryClass} sheet is &apos;{classSheet.title}&apos; —{" "}
                            <button type="button" onClick={() => switchSheet(classSheet)} disabled={!!busy} className="text-amber-400 underline hover:text-amber-300 disabled:opacity-50">
                              switch to it
                            </button>
                          </span>
                        )}
                      </>
                    )
                    : "Car " + carNumber + " isn't on the event's entry list (yet) — fill it in by hand."}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {draft.template.header.map((field) => (
            <FieldInput key={field.id} field={field} value={draft.header[field.id]} onChange={(v) => update({ header: { ...draft.header, [field.id]: v } })} />
          ))}
        </div>
      </section>

      {profile && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          {!confirmRefill ? (
            <button type="button" onClick={() => setConfirmRefill(true)} disabled={!!busy} className="text-amber-400 hover:text-amber-300 disabled:opacity-50">
              ↻ Re-fill gear lines from &quot;{profile.name}&quot;
            </button>
          ) : (
            <>
              <span className="text-neutral-300">Replace the gear lines&apos; declarations and gear photos with what&apos;s in My gear now?</span>
              <button type="button" onClick={handleRefill} className="rounded border border-amber-600 px-2 py-1 text-amber-300 hover:bg-amber-950">
                Re-fill
              </button>
              <button type="button" onClick={() => setConfirmRefill(false)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-300 hover:bg-neutral-800">
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">Photos</h3>
        <p className="mb-2 text-xs text-neutral-400">So the scrutineers know the car and crew at a glance.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <PictureSlot
            label="The car (1 or 2)"
            photos={draft.pictures?.car ?? []}
            max={2}
            onChange={(car) => update({ pictures: { ...draft.pictures, car } })}
          />
          <PictureSlot
            label="Driver"
            photos={draft.pictures?.driver ? [draft.pictures.driver] : []}
            max={1}
            onChange={([driver]) => update({ pictures: { ...draft.pictures, driver } })}
          />
          {sheetHasCodriver(draft.template, draft.variant) && (
            <PictureSlot
              label="Co-driver"
              photos={draft.pictures?.codriver ? [draft.pictures.codriver] : []}
              max={1}
              onChange={([codriver]) => update({ pictures: { ...draft.pictures, codriver } })}
            />
          )}
        </div>
      </section>

      <SheetSummary groups={groups} lineInfo={lineInfo} onJump={openLine} />

      {groups.map((group) => (
        <section key={group.sectionId} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">{group.title}</h3>
          <ul className="space-y-2">
            {group.lines.map((line) => (
              <div key={line.key}>
              {failedResult(line.key)?.result === "fail" && (
                <p className="mb-1 rounded border border-red-700 bg-red-950/60 px-2 py-1 text-xs text-red-200">
                  <span className="font-semibold">Failed at tech</span>
                  {failedResult(line.key)?.note ? `: ${failedResult(line.key)?.note}` : ""} — fix it below, then re-submit.
                </p>
              )}
              <LineCard
                key={line.key}
                line={line}
                value={draft.lines[line.key] ?? EMPTY_LINE}
                checks={lineInfo[line.key].checks}
                options={lineOptions(line, ruleset)}
                status={lineInfo[line.key].status}
                hasGear={lineInfo[line.key].hasGear}
                open={isOpen(line.key)}
                onToggle={() => setOpenLines((o) => ({ ...o, [line.key]: !isOpen(line.key) }))}
                onChange={(next) => setLine(line.key, next)}
                myGear={line.item.gear ? myItems.filter((i) => i.category === line.item.gear) : undefined}
              />
              </div>
            ))}
          </ul>
        </section>
      ))}

      <section className="sticky bottom-0 -mx-4 border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
        {missing.length > 0 && <p className="mb-2 text-xs text-amber-300">Still to fill in: {missing.map((f) => f.label).join(", ")}</p>}
        {actionError && <p className="mb-2 text-sm text-red-400">{actionError}</p>}
        {busy && busy !== "export" && <p className="mb-2 text-sm text-neutral-300">{busy}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={handleExport} disabled={!!busy} className={actionButtonClass}>
            ⬇️ Export file
          </button>
          {draft.event && serverState !== "final" && (
            <button type="button" onClick={handleSubmit} disabled={!!busy || serverState === "locked"} className={primaryButtonClass}>
              {serverState === "failed" ? "Re-submit the failed lines" : draft.submittedSheetId ? "Re-submit to the event" : "Submit to the event"}
            </button>
          )}
        </div>
        {draft.event && !signedInEmail && !showSignIn && <p className="mt-2 text-xs text-neutral-500">Submitting needs a quick sign-in with your email.</p>}
      </section>

      {draft.event && showSignIn && !signedInEmail && (
        <div className="mt-4">
          <TechSheetSignIn intro="Sign in to submit this sheet to the event — we'll email you a one-time code." onSignedIn={() => setShowSignIn(false)} />
        </div>
      )}

      {draft.submittedSheetId && (
        <div className="mt-4 rounded-lg border border-emerald-700 bg-emerald-950 p-3 text-sm text-emerald-200">
          Submitted to {draft.event?.name}
          {draft.submittedAt ? ` on ${new Date(draft.submittedAt).toLocaleString()}` : ""}.{" "}
          {serverState === "final"
            ? "It passed tech: the sheet is final."
            : serverState === "failed"
              ? "It failed tech: fix the lines marked Failed (new gear, details, photos) and re-submit — only those lines go back to tech, to be inspected again."
              : serverState === "locked"
                ? "A scrutineer has it open right now — you can re-submit changes once they're done."
                : "You can change it and re-submit until tech gives its verdict."}
        </div>
      )}
      {draft.event && signedInEmail && <TechSheetSubmitted refreshKey={submittedRefresh} />}

      <div className="mt-8 border-t border-neutral-800 pt-4">
        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-red-400 hover:text-red-300">
            Delete this draft
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-300">Delete this draft from this device?</span>
            <button type="button" onClick={onDelete} className="rounded border border-red-600 bg-red-950 px-2 py-1 text-red-200 hover:bg-red-900">
              Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded border border-neutral-600 px-2 py-1 text-neutral-300 hover:bg-neutral-800">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
