"use client";

import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/data/categoryMeta";
import { NOT_LISTED, standardsFor } from "@/data/standards";
import { CategoryResults, CertificationEntry, EquipmentEntry, newCertification } from "@/lib/matcher";
import { PhotoScan } from "@/components/PhotoScan";
import { ResultRow, STATUS_LABEL, STATUS_STYLE } from "@/components/ResultRow";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { CategoryResult } from "@/lib/matcher";

interface Props {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  onChange: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
  /** When provided, each category's result is shown inline right under its inputs (body-first mode). */
  results?: CategoryResults;
}

const selectClass = "rounded border border-neutral-500 bg-neutral-900 p-1.5 text-sm text-neutral-100";
const optionClass = "bg-neutral-900 text-neutral-100";
const dateClass = "rounded border border-neutral-500 bg-neutral-900 p-1.5 text-sm text-neutral-100";

function CertificationRow({
  category,
  cert,
  onChange,
  onRemove,
  onReportMissing,
}: {
  category: EquipmentCategory;
  cert: CertificationEntry;
  onChange: (patch: Partial<CertificationEntry>) => void;
  onRemove: () => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
}) {
  const standards = standardsFor(category);
  const notListed = cert.standardId === NOT_LISTED;

  return (
    <div className="rounded border border-neutral-700 p-2">
      <div className="flex items-start gap-2">
        <select
          className={`${selectClass} flex-1`}
          value={cert.standardId ?? ""}
          onChange={(e) => onChange({ standardId: e.target.value || undefined, customStandardLabel: undefined })}
        >
          <option className={optionClass} value="">
            Select certification standard…
          </option>
          {standards.map((s) => (
            <option key={s.id} className={optionClass} value={s.id}>
              {s.label}
            </option>
          ))}
          <option className={optionClass} value={NOT_LISTED}>
            Not listed / other…
          </option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this certification"
          className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800"
        >
          Remove
        </button>
      </div>

      {notListed && (
        <div className="mt-2 flex flex-col gap-1">
          <input
            type="text"
            placeholder="What does the tag say? (e.g. brand + spec number)"
            className={`${dateClass} placeholder:text-neutral-500`}
            value={cert.customStandardLabel ?? ""}
            onChange={(e) => onChange({ customStandardLabel: e.target.value })}
          />
          {onReportMissing && (
            <button
              type="button"
              className="self-start rounded border border-amber-700 bg-amber-950 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900"
              onClick={() => onReportMissing(category, cert.customStandardLabel || "(no description entered)")}
            >
              Report this certification for review
            </button>
          )}
        </div>
      )}

      {cert.standardId && !notListed && (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-xs text-neutral-400">
            Date on tag/label (if any)
            <input
              type="date"
              className={dateClass}
              value={cert.labelDate ?? ""}
              onChange={(e) => onChange({ labelDate: e.target.value || undefined })}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs text-neutral-400">
            Expiration date on tag (if printed)
            <input
              type="date"
              className={dateClass}
              value={cert.tagExpirationDate ?? ""}
              onChange={(e) => onChange({ tagExpirationDate: e.target.value || undefined })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function CertificationList({
  category,
  certifications,
  onChange,
  onReportMissing,
}: {
  category: EquipmentCategory;
  certifications: CertificationEntry[];
  onChange: (certifications: CertificationEntry[]) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
}) {
  const updateCert = (index: number, patch: Partial<CertificationEntry>) => {
    onChange(certifications.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };
  const removeCert = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };
  const addCert = () => onChange([...certifications, newCertification()]);
  const addFromScan = (cert: CertificationEntry) => onChange([...certifications, cert]);

  return (
    <div className="flex flex-col gap-2">
      {certifications.map((cert, i) => (
        <CertificationRow
          key={cert.key}
          category={category}
          cert={cert}
          onChange={(patch) => updateCert(i, patch)}
          onRemove={() => removeCert(i)}
          onReportMissing={onReportMissing}
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addCert}
          className="self-start rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          + Add {certifications.length > 0 ? "another certification (e.g. dual Snell/FIA rating)" : "a certification"}
        </button>
      </div>
      <PhotoScan category={category} onAdd={addFromScan} />
    </div>
  );
}

function StatusPill({ status }: { status: CategoryResult["status"] }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// Surfaces items needing attention first, then passes, then boilerplate "not required" entries last.
const STATUS_DISPLAY_ORDER: Record<CategoryResult["status"], number> = {
  needs_info: 0,
  unrecognized: 1,
  rejected: 2,
  ok: 3,
  recommended_only: 4,
  not_required: 5,
};

export function EquipmentForm({ entries, onChange, onReportMissing, results }: Props) {
  const orderedCategories = results
    ? [...CATEGORY_ORDER].sort((a, b) => {
        const ra = results[a] ? STATUS_DISPLAY_ORDER[results[a].status] : 0;
        const rb = results[b] ? STATUS_DISPLAY_ORDER[results[b].status] : 0;
        return ra - rb;
      })
    : CATEGORY_ORDER;

  return (
    <div className="flex flex-col gap-3">
      {orderedCategories.map((category) => {
        const meta = CATEGORY_META[category];
        const entry = entries[category] ?? { category, skipped: true };
        const update = (patch: Partial<EquipmentEntry>) => onChange(category, { ...entry, category, ...patch });
        const showCertList = !meta.hybrid || entry.mode === "certified";
        const result = results?.[category];
        const Icon = CATEGORY_ICONS[category];

        return (
          <details key={category} className="rounded-lg border border-neutral-700 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                <Icon />
                {meta.label}
              </span>
              {result && <StatusPill status={result.status} />}
            </summary>
            <p className="mb-2 mt-2 text-xs text-neutral-400">{meta.hint}</p>

            <label className="mb-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!entry.skipped} onChange={(e) => update({ skipped: !e.target.checked })} />
              I have this item
            </label>

            {!entry.skipped && (
              <div className="flex flex-col gap-2">
                {category === "helmet" && (
                  <select
                    className={selectClass}
                    value={entry.helmetType ?? ""}
                    onChange={(e) => update({ helmetType: (e.target.value || undefined) as EquipmentEntry["helmetType"] })}
                  >
                    <option className={optionClass} value="">
                      Helmet style — select…
                    </option>
                    <option className={optionClass} value="full_face">
                      Full face (integrated chin bar)
                    </option>
                    <option className={optionClass} value="open_face">
                      Open face (no chin bar)
                    </option>
                  </select>
                )}

                {meta.hybrid && (
                  <select
                    className={selectClass}
                    value={entry.mode ?? ""}
                    onChange={(e) =>
                      update({
                        mode: (e.target.value || undefined) as EquipmentEntry["mode"],
                        certifications: [],
                        pantsCertifications: [],
                      })
                    }
                  >
                    <option className={optionClass} value="">
                      Select…
                    </option>
                    <option className={optionClass} value="material_only">
                      No certification (fire-resistant / non-flammable material)
                    </option>
                    <option className={optionClass} value="certified">
                      Certified (SFI or FIA rated)
                    </option>
                  </select>
                )}

                {category === "firesuit" && entry.mode === "certified" && (
                  <select
                    className={selectClass}
                    value={entry.pieceType ?? "one_piece"}
                    onChange={(e) => update({ pieceType: e.target.value as EquipmentEntry["pieceType"] })}
                  >
                    <option className={optionClass} value="one_piece">
                      One piece (FIA suits are always one-piece)
                    </option>
                    <option className={optionClass} value="two_piece">
                      Two piece — separate jacket + pants (SFI only, not required to match)
                    </option>
                  </select>
                )}

                {showCertList &&
                  (category === "firesuit" && entry.mode === "certified" && entry.pieceType === "two_piece" ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-neutral-300">Jacket</p>
                        <CertificationList
                          category={category}
                          certifications={entry.certifications ?? []}
                          onChange={(certifications) => update({ certifications })}
                          onReportMissing={onReportMissing}
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold text-neutral-300">Pants</p>
                        <CertificationList
                          category={category}
                          certifications={entry.pantsCertifications ?? []}
                          onChange={(pantsCertifications) => update({ pantsCertifications })}
                          onReportMissing={onReportMissing}
                        />
                      </div>
                    </div>
                  ) : (
                    <CertificationList
                      category={category}
                      certifications={entry.certifications ?? []}
                      onChange={(certifications) => update({ certifications })}
                      onReportMissing={onReportMissing}
                    />
                  ))}
              </div>
            )}

            {result && (
              <div className="mt-3">
                <ResultRow result={result} />
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
