"use client";

import { useId, useState } from "react";
import { CategoryGroup, EquipmentCategory, Occupant } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_COLORS, GROUP_LABELS, isPerOccupantCategory } from "@/data/categoryMeta";
import { NOT_LISTED, ROLLOVER_LOGBOOK_BODIES, ROLLOVER_PADDING_STANDARDS, standardLabel, standardsFor } from "@/data/standards";
import { CategoryResults, CertificationEntry, EquipmentEntry, ExtinguisherUnit, isEntryEmpty, newCertification, newExtinguisherUnit } from "@/lib/matcher";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { useTagScanner } from "@/lib/useTagScanner";
import { PhotoScan } from "@/components/PhotoScan";
import { TagCandidateList } from "@/components/TagCandidateList";
import { ResultRow, statusLabel, statusStyle } from "@/components/ResultRow";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { CategoryResult } from "@/lib/matcher";

interface Props {
  entries: Partial<Record<EquipmentCategory, EquipmentEntry>>;
  onChange: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
  /** When provided, each category's result is shown inline right under its inputs (body-first mode). */
  results?: CategoryResults;
  /** Which top-level groups (Driver/Car/Rollcage safety gear) to show at all. */
  activeGroups: ReadonlySet<CategoryGroup>;
  /**
   * Rally only: which occupant this form instance is for. "driver" (the default) shows every
   * selected category, same as always. "codriver" restricts the list to PER_OCCUPANT_CATEGORIES
   * only (the codriver's own gear — shared car items like the fuel cell aren't shown here), skips
   * the per-group subheadings (the section already has one "Codriver Safety Gear" heading from the
   * caller), and suffixes DOM ids/radio names so this instance doesn't collide with the driver's.
   */
  occupant?: Occupant;
  /**
   * Category display order (by status: needs attention first, then OK, then not-required) is
   * established once and held fixed after that — so filling in a certification doesn't yank the
   * card the user is looking at somewhere else on the page. Pass the current ruleset's id here;
   * the order only re-establishes itself when this value changes (i.e. the sanctioning body was
   * switched), not when entries/results change.
   */
  orderResetKey?: string;
  /**
   * Rally only, driver instance only: when the codriver toggle is on, the driver's own seat/belts/
   * window net (normally "car" group) display under "Driver Safety Gear" instead of "Car Safety
   * Gear" — matching the codriver's section, where all of their per-occupant gear already lives
   * under one heading. The shared car items (fuel cell, extinguisher, etc.) stay under "Car Safety
   * Gear" either way.
   */
  perOccupantAsDriverGroup?: boolean;
  /**
   * Garage only: shows a control to attach up to 3 reference photos of this item, storing
   * compressed thumbnails on the entry (see EquipmentEntry.photoDataUrls). Categories that show a
   * certification list also get a per-photo "scan for tags" action, reusing the same tag-scanning
   * flow as the upload-a-photo-to-scan button. Off elsewhere to keep the pass-tech checking flow
   * uncluttered.
   */
  showPhotoUpload?: boolean;
}

const DEFAULT_MAX_ITEM_PHOTOS = 3;
// Rollover protection often needs multiple angles (cage overview, tags/labels, logbook page,
// padding close-up) to document — everything else keeps the default 3.
const MAX_ITEM_PHOTOS_BY_CATEGORY: Partial<Record<EquipmentCategory, number>> = {
  rollover_protection: 5,
};
function maxPhotosFor(category: EquipmentCategory): number {
  return MAX_ITEM_PHOTOS_BY_CATEGORY[category] ?? DEFAULT_MAX_ITEM_PHOTOS;
}

function ItemPhotoThumb({
  category,
  imageDataUrl,
  canScan,
  onRemove,
  onAddCertification,
}: {
  category: EquipmentCategory;
  imageDataUrl: string;
  canScan: boolean;
  onRemove: () => void;
  onAddCertification: (cert: CertificationEntry) => void;
}) {
  const scanner = useTagScanner(category, onAddCertification);
  return (
    <div className="flex max-w-[220px] flex-col gap-1">
      <div className="flex items-start gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset */}
        <img src={imageDataUrl} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
        <div className="flex flex-col gap-1">
          {canScan && (
            <button
              type="button"
              onClick={() => scanner.analyze(imageDataUrl)}
              disabled={scanner.status === "loading"}
              className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            >
              {scanner.status === "loading" ? "Scanning…" : "🔍 Scan for tags"}
            </button>
          )}
          <button type="button" onClick={onRemove} className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
            Remove photo
          </button>
        </div>
      </div>
      {scanner.error && <p className="text-xs text-red-400">{scanner.error}</p>}
      {scanner.candidates && (
        <TagCandidateList candidates={scanner.candidates} notes={scanner.notes} added={scanner.added} onAdd={scanner.addCandidate} />
      )}
    </div>
  );
}

function ItemPhotos({
  category,
  entry,
  canScan,
  onChange,
  onAddCertification,
}: {
  category: EquipmentCategory;
  entry: EquipmentEntry;
  canScan: boolean;
  onChange: (photoDataUrls: string[]) => void;
  onAddCertification: (cert: CertificationEntry) => void;
}) {
  const inputId = useId();
  const photos = entry.photoDataUrls ?? [];
  const maxPhotos = maxPhotosFor(category);
  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="flex flex-col gap-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <ItemPhotoThumb
              key={i}
              category={category}
              imageDataUrl={url}
              canScan={canScan}
              onRemove={() => onChange(photos.filter((_, idx) => idx !== i))}
              onAddCertification={onAddCertification}
            />
          ))}
        </div>
      )}
      {canAddMore && (
        <label
          htmlFor={inputId}
          className="flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          📷 Add a photo of this item ({photos.length}/{maxPhotos})
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const dataUrl = await resizeImageToDataUrl(file, 640, 0.75);
              onChange([...photos, dataUrl]);
            }}
          />
        </label>
      )}
    </div>
  );
}

// Matches the teal used for the "Codriver Safety Gear" heading/verdict group elsewhere (page.tsx) —
// codriver cards get this one color regardless of the category's own driver/car group, so the
// whole codriver section reads as visually distinct from the driver's own cards above it.
const CODRIVER_COLOR = { text: "text-teal-400", border: "border-teal-800" };

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
            Manufacturing date on tag/label (if any)
            <input
              type="date"
              className={dateClass}
              value={cert.labelDate ?? ""}
              onChange={(e) => onChange({ labelDate: e.target.value || undefined })}
            />
          </label>
          {category === "fire_suppression" ? (
            <>
              <label className="flex flex-1 flex-col gap-1 text-xs text-neutral-400">
                Next service date (month/year)
                <input
                  type="month"
                  className={dateClass}
                  value={cert.nextServiceDate ?? ""}
                  onChange={(e) => onChange({ nextServiceDate: e.target.value || undefined })}
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-xs text-neutral-400">
                Last service date (optional)
                <input
                  type="month"
                  className={dateClass}
                  value={cert.lastServiceDate ?? ""}
                  onChange={(e) => onChange({ lastServiceDate: e.target.value || undefined })}
                />
              </label>
            </>
          ) : (
            <label className="flex flex-1 flex-col gap-1 text-xs text-neutral-400">
              Expiration date on tag (if printed)
              <input
                type="date"
                className={dateClass}
                value={cert.tagExpirationDate ?? ""}
                onChange={(e) => onChange({ tagExpirationDate: e.target.value || undefined })}
              />
            </label>
          )}
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

const numberInputClass = "rounded border border-neutral-500 bg-neutral-900 p-1.5 text-sm text-neutral-100";

function ExtinguisherUnitRow({ unit, onChange, onRemove }: { unit: ExtinguisherUnit; onChange: (patch: Partial<ExtinguisherUnit>) => void; onRemove: () => void }) {
  const numeric = (raw: string): number | undefined => (raw === "" ? undefined : Number(raw));

  return (
    <div className="flex flex-wrap items-end gap-2 rounded border border-neutral-700 p-2">
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Class A rating (if any)
        <input
          type="number"
          min={0}
          placeholder="e.g. 1"
          className={`${numberInputClass} w-28`}
          value={unit.classARating ?? ""}
          onChange={(e) => onChange({ classARating: numeric(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        B:C rating
        <input
          type="number"
          min={0}
          placeholder="e.g. 10"
          className={`${numberInputClass} w-24`}
          value={unit.bcRating ?? ""}
          onChange={(e) => onChange({ bcRating: numeric(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Weight (lbs)
        <input
          type="number"
          min={0}
          step="0.1"
          placeholder="e.g. 5"
          className={`${numberInputClass} w-24`}
          value={unit.weightLbs ?? ""}
          onChange={(e) => onChange({ weightLbs: numeric(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Manufacture date (on cylinder)
        <input
          type="date"
          className={`${dateClass} w-40`}
          value={unit.manufactureDate ?? ""}
          onChange={(e) => onChange({ manufactureDate: e.target.value || undefined })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Certification/service date (if separate)
        <input
          type="date"
          className={`${dateClass} w-40`}
          value={unit.certificationDate ?? ""}
          onChange={(e) => onChange({ certificationDate: e.target.value || undefined })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Service due date (if printed)
        <input
          type="date"
          className={`${dateClass} w-40`}
          value={unit.certificationDueDate ?? ""}
          onChange={(e) => onChange({ certificationDueDate: e.target.value || undefined })}
        />
      </label>
      <button type="button" onClick={onRemove} aria-label="Remove this extinguisher" className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800">
        Remove
      </button>
    </div>
  );
}

function ExtinguisherUnitList({ units, onChange }: { units: ExtinguisherUnit[]; onChange: (units: ExtinguisherUnit[]) => void }) {
  const updateUnit = (index: number, patch: Partial<ExtinguisherUnit>) => onChange(units.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  const removeUnit = (index: number) => onChange(units.filter((_, i) => i !== index));
  const addUnit = () => onChange([...units, newExtinguisherUnit()]);

  return (
    <div className="flex flex-col gap-2">
      {units.map((unit, i) => (
        <ExtinguisherUnitRow key={unit.key} unit={unit} onChange={(patch) => updateUnit(i, patch)} onRemove={() => removeUnit(i)} />
      ))}
      <button type="button" onClick={addUnit} className="self-start rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
        + Add {units.length > 0 ? "another extinguisher" : "an extinguisher"}
      </button>
    </div>
  );
}

const BODY_STYLE_OPTIONS: { value: NonNullable<EquipmentEntry["bodyStyle"]>; label: string }[] = [
  { value: "closed_roof", label: "Closed roof (sedan / coupe / hatchback)" },
  { value: "convertible", label: "Convertible (removable soft or hard top)" },
  { value: "open_no_windshield", label: "Open, no windshield frame (roadster / spec racer)" },
  { value: "open_wheel", label: "Open-wheel (formula / sports racer)" },
];

function RolloverProtectionFields({
  category,
  entry,
  onChange,
  onReportMissing,
}: {
  category: EquipmentCategory;
  entry: EquipmentEntry;
  onChange: (patch: Partial<EquipmentEntry>) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-400">Car body style</span>
        <select
          className={selectClass}
          value={entry.bodyStyle ?? ""}
          onChange={(e) => onChange({ bodyStyle: (e.target.value || undefined) as EquipmentEntry["bodyStyle"] })}
        >
          <option className={optionClass} value="">
            Select…
          </option>
          {BODY_STYLE_OPTIONS.map((o) => (
            <option key={o.value} className={optionClass} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {entry.bodyStyle === "convertible" && (
        <div className="flex items-center gap-3 text-xs text-neutral-300">
          <span className="text-neutral-400">Factory/OEM rollover protection (integrated hoops)?</span>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" name="factory-protection" checked={entry.factoryProtection === true} onChange={() => onChange({ factoryProtection: true })} />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" name="factory-protection" checked={entry.factoryProtection === false} onChange={() => onChange({ factoryProtection: false })} />
            No
          </label>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-400">Rollbar/half-cage, or full multi-point cage?</span>
        <select
          className={selectClass}
          value={entry.cageType ?? ""}
          onChange={(e) => onChange({ cageType: (e.target.value || undefined) as EquipmentEntry["cageType"] })}
        >
          <option className={optionClass} value="">
            Select…
          </option>
          <option className={optionClass} value="rollbar">
            Rollbar / half-cage (fewer attachment points)
          </option>
          <option className={optionClass} value="full_cage">
            Full cage (typically 6+ points to the chassis)
          </option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-400">Tube joints: bolted/sleeved together, or welded?</span>
        <select
          className={selectClass}
          value={entry.cageMountType ?? ""}
          onChange={(e) => onChange({ cageMountType: (e.target.value || undefined) as EquipmentEntry["cageMountType"] })}
        >
          <option className={optionClass} value="">
            Select…
          </option>
          <option className={optionClass} value="bolt_in">
            Bolt-together (bolted or sleeved tube joints)
          </option>
          <option className={optionClass} value="welded">
            Welded joints
          </option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-neutral-400">Mounting/foot plates: bolted to chassis, or welded?</span>
        <select
          className={selectClass}
          value={entry.cagePlateMountType ?? ""}
          onChange={(e) => onChange({ cagePlateMountType: (e.target.value || undefined) as EquipmentEntry["cagePlateMountType"] })}
        >
          <option className={optionClass} value="">
            Select…
          </option>
          <option className={optionClass} value="bolted">
            Bolted plates
          </option>
          <option className={optionClass} value="welded">
            Welded plates
          </option>
        </select>
      </label>

      <div className="flex flex-wrap items-end gap-3 rounded border border-neutral-700 p-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Car weight, as raced (lbs)
          <input
            type="number"
            min={0}
            placeholder="e.g. 2600"
            className={`${numberInputClass} w-28`}
            value={entry.carWeightLbs ?? ""}
            onChange={(e) => onChange({ carWeightLbs: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Cage tube outer diameter (in)
          <input
            type="number"
            min={0}
            step="0.001"
            placeholder="e.g. 1.5"
            className={`${numberInputClass} w-28`}
            value={entry.cageTubeOuterDiameterIn ?? ""}
            onChange={(e) => onChange({ cageTubeOuterDiameterIn: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Cage tube wall thickness (in)
          <input
            type="number"
            min={0}
            step="0.001"
            placeholder="e.g. 0.095"
            className={`${numberInputClass} w-28`}
            value={entry.cageTubeWallThicknessIn ?? ""}
            onChange={(e) => onChange({ cageTubeWallThicknessIn: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
        </label>
      </div>
      <p className="text-xs text-neutral-500">Weight/tube size mainly matter for road racing and hillclimb bodies, which size the cage to the car. Logbook year mainly matters for rally bodies.</p>

      <div className="flex flex-col gap-2 rounded border border-neutral-700 p-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- static bundled icon */}
          <img
            src="/logbook.jpg"
            alt=""
            className="h-6 w-6 shrink-0 rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-xs font-semibold text-neutral-300">Cage logbook</span>
        </div>

        {!entry.fiaHomologated && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">Logbook issued by</span>
            <select
              className={selectClass}
              value={entry.cageLogbookBody ?? ""}
              onChange={(e) => onChange({ cageLogbookBody: e.target.value || undefined, cageLogbookBodyCustom: undefined })}
            >
              <option className={optionClass} value="">
                Select…
              </option>
              <option className={optionClass} value="none">
                No logbook
              </option>
              {ROLLOVER_LOGBOOK_BODIES.map((b) => (
                <option key={b.id} className={optionClass} value={b.id}>
                  {b.label}
                </option>
              ))}
              <option className={optionClass} value={NOT_LISTED}>
                Not listed / other…
              </option>
            </select>
          </label>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Cage logbooked/built (year)
            <input
              type="number"
              min={1970}
              max={2100}
              placeholder="e.g. 2018"
              className={`${numberInputClass} w-28`}
              value={entry.cageLogbookYear ?? ""}
              onChange={(e) => onChange({ cageLogbookYear: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-1 pb-2 text-xs text-neutral-300">
            <input type="checkbox" checked={!!entry.fiaHomologated} onChange={(e) => onChange({ fiaHomologated: e.target.checked || undefined })} />
            FIA-homologated
          </label>
        </div>

        {entry.cageLogbookBody === NOT_LISTED && (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Which body issued it?"
              className={`${numberInputClass} placeholder:text-neutral-500`}
              value={entry.cageLogbookBodyCustom ?? ""}
              onChange={(e) => onChange({ cageLogbookBodyCustom: e.target.value })}
            />
            {onReportMissing && (
              <button
                type="button"
                className="self-start rounded border border-amber-700 bg-amber-950 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900"
                onClick={() => onReportMissing(category, entry.cageLogbookBodyCustom || "(no description entered)")}
              >
                Report this logbook issuer for review
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded border border-neutral-700 p-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- static bundled icon */}
          <img
            src="/rollcage-padding.jpg"
            alt=""
            className="h-6 w-6 shrink-0 rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-xs font-semibold text-neutral-300">Rollcage padding</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-300">
          <span className="text-neutral-400">Padding installed wherever an occupant could contact the cage/bar?</span>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" name="cage-padding-present" checked={entry.cagePaddingPresent === true} onChange={() => onChange({ cagePaddingPresent: true })} />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name="cage-padding-present"
              checked={entry.cagePaddingPresent === false}
              onChange={() =>
                onChange({
                  cagePaddingPresent: false,
                  ...(entry.cageForwardHoopPaddingPresent ? {} : { cagePaddingStandardId: undefined, cagePaddingStandardCustom: undefined }),
                })
              }
            />
            No
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-300">
          <span className="text-neutral-400">
            Padding installed on all tubing forward of and including the main hoop in the roofline — regardless of contact?
          </span>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name="cage-forward-hoop-padding-present"
              checked={entry.cageForwardHoopPaddingPresent === true}
              onChange={() => onChange({ cageForwardHoopPaddingPresent: true })}
            />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name="cage-forward-hoop-padding-present"
              checked={entry.cageForwardHoopPaddingPresent === false}
              onChange={() =>
                onChange({
                  cageForwardHoopPaddingPresent: false,
                  ...(entry.cagePaddingPresent ? {} : { cagePaddingStandardId: undefined, cagePaddingStandardCustom: undefined }),
                })
              }
            />
            No
          </label>
        </div>

        {(entry.cagePaddingPresent || entry.cageForwardHoopPaddingPresent) && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">What does the padding&apos;s tag/label say?</span>
            <select
              className={selectClass}
              value={entry.cagePaddingStandardId ?? ""}
              onChange={(e) => onChange({ cagePaddingStandardId: e.target.value || undefined, cagePaddingStandardCustom: undefined })}
            >
              <option className={optionClass} value="">
                Select…
              </option>
              <option className={optionClass} value="none">
                No certification — plain/uncertified material
              </option>
              {ROLLOVER_PADDING_STANDARDS.map((s) => (
                <option key={s.id} className={optionClass} value={s.id}>
                  {s.label}
                </option>
              ))}
              <option className={optionClass} value={NOT_LISTED}>
                Not listed / other…
              </option>
            </select>
          </label>
        )}

        {entry.cagePaddingStandardId === NOT_LISTED && (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="What does the tag say?"
              className={`${numberInputClass} placeholder:text-neutral-500`}
              value={entry.cagePaddingStandardCustom ?? ""}
              onChange={(e) => onChange({ cagePaddingStandardCustom: e.target.value })}
            />
            {onReportMissing && (
              <button
                type="button"
                className="self-start rounded border border-amber-700 bg-amber-950 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900"
                onClick={() => onReportMissing(category, entry.cagePaddingStandardCustom || "(no description entered)")}
              >
                Report this padding certification for review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Presence-only categories with no other fields of their own (tow hook, tow rope, emergency
// triangle, first aid kit, window breaker, kill switch) — the only way the user can indicate
// possession is a single checkbox. Fire extinguisher and rollover protection are presence-only
// too but have their own dedicated fields, so they're excluded here.
function isSimplePresenceCategory(category: EquipmentCategory): boolean {
  return CATEGORY_META[category].presenceOnly === true && category !== "fire_extinguisher" && category !== "rollover_protection";
}

const CERT_BADGE_COLOR: Record<CategoryResult["status"], string> = {
  ok: "text-emerald-400",
  recommended_only: "text-emerald-400",
  rejected: "text-red-400",
  unrecognized: "text-red-400",
  // Missing something (e.g. a required expiration/label date) — same yellow as a pending
  // conditional item elsewhere, not a plain gray, since it's a specific thing to go fix rather
  // than a neutral "not applicable" state.
  needs_info: "text-yellow-400",
  not_required: "text-neutral-400",
};

interface CertBadge {
  key: string;
  label: string;
  colorClass: string;
}

/**
 * What's actually entered for the collapsed card header — e.g. "SNELL SA2015", or "Stock/OEM" for
 * material-only mode. With a dual certification (e.g. both a Snell and an FIA sticker), every
 * certification gets its own badge, each colored by whether THAT specific certification is
 * accepted (green) or rejected (red) — a dual cert can have one of each, and the item as a whole
 * still passes as long as one is accepted (see evaluatePieceCerts's "best of" status). Colors only
 * apply once a rule has actually been evaluated against (`result` present, i.e. body-first mode);
 * garage editing with no ruleset selected shows the same labels in neutral gray.
 */
function summarizeEntryCerts(category: EquipmentCategory, entry: EquipmentEntry, result: CategoryResult | undefined): CertBadge[] {
  const meta = CATEGORY_META[category];
  if (meta.hybrid && entry.mode === "material_only") {
    const label = meta.materialOnlyLabel ?? "Material only";
    return [{ key: "material", label, colorClass: result ? CERT_BADGE_COLOR[result.status] : "text-neutral-400" }];
  }

  const certs = entry.certifications ?? [];
  // Two-piece firesuit doesn't expose a flat certBreakdown for the jacket's own certs — fall back
  // to the jacket's overall pass/fail from pieceBreakdown so multi-cert jackets still get colored,
  // just without per-certificate precision in that one edge case.
  const jacketFallbackStatus = result?.pieceBreakdown?.[0]?.status;

  return certs.flatMap((c, i): CertBadge[] => {
    if (!c.standardId) return [];
    const label = c.standardId === NOT_LISTED ? c.customStandardLabel || "Not listed" : standardLabel(c.standardId);
    const status = result?.certBreakdown?.[i]?.status ?? (certs.length === 1 ? result?.status : undefined) ?? jacketFallbackStatus;
    return [{ key: c.key, label, colorClass: status ? CERT_BADGE_COLOR[status] : "text-neutral-400" }];
  });
}

function NoDataBadge() {
  return <span className="shrink-0 rounded-full border border-neutral-600 px-2 py-0.5 text-xs text-neutral-400">No data</span>;
}

function StatusPill({ status, requirement }: { status: CategoryResult["status"]; requirement: CategoryResult["requirement"] }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${statusStyle(status, requirement)}`}>
      {statusLabel(status, requirement)}
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

// Keeps categories in their natural group order (driver, then car, then rollcage) so a group
// header always makes sense, while still surfacing items needing attention first within each group.
// `groupOf` decides which group each category buckets/sorts under — usually just its
// CATEGORY_META group, except the driver's own per-occupant items (seat/belts/window net) when
// perOccupantAsDriverGroup is active, which bucket as "driver" instead of "car" (see Props).
function groupCategoriesForDisplay(categories: EquipmentCategory[], results: CategoryResults | undefined, groupOf: (c: EquipmentCategory) => CategoryGroup): EquipmentCategory[] {
  const byGroup = new Map<CategoryGroup, EquipmentCategory[]>();
  for (const c of categories) {
    const g = groupOf(c);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(c);
  }
  return [...byGroup.values()].flatMap((group) => {
    if (!results) return group;
    return [...group].sort((a, b) => {
      const ra = results[a] ? STATUS_DISPLAY_ORDER[results[a].status] : 0;
      const rb = results[b] ? STATUS_DISPLAY_ORDER[results[b].status] : 0;
      return ra - rb;
    });
  });
}

export function EquipmentForm({
  entries,
  onChange,
  onReportMissing,
  results,
  activeGroups,
  occupant = "driver",
  orderResetKey,
  perOccupantAsDriverGroup,
  showPhotoUpload,
}: Props) {
  const groupOf = (c: EquipmentCategory): CategoryGroup =>
    occupant === "driver" && perOccupantAsDriverGroup && isPerOccupantCategory(c) ? "driver" : CATEGORY_META[c].group;
  // Filters by the *effective* group (post perOccupantAsDriverGroup reclassification), not each
  // category's raw CATEGORY_META group — otherwise a caller restricting activeGroups to just
  // {"driver"} (to render the driver-only section, with a codriver section slotted in after it)
  // would miss seat/belts/window net even though they're displaying as "driver" group right now.
  const visibleCategories = CATEGORY_ORDER.filter((c) => activeGroups.has(groupOf(c)) && (occupant === "driver" || isPerOccupantCategory(c)));

  // Compute the status-sorted order once per orderResetKey (the current ruleset) and hold it
  // fixed after that, even as entries/results change the underlying statuses — otherwise a card
  // jumps elsewhere in the list the instant its status changes (e.g. right as you finish entering
  // a certification), which is disorienting mid-edit. This is React's documented "adjust state
  // during render" pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  const setKey = `${orderResetKey ?? ""}::${perOccupantAsDriverGroup ? "1" : "0"}::${visibleCategories.join(",")}`;
  const [orderState, setOrderState] = useState(() => ({ key: setKey, order: groupCategoriesForDisplay(visibleCategories, results, groupOf) }));
  let orderedCategories = orderState.order;
  if (orderState.key !== setKey) {
    orderedCategories = groupCategoriesForDisplay(visibleCategories, results, groupOf);
    setOrderState({ key: setKey, order: orderedCategories });
  }

  if (orderedCategories.length === 0) {
    return <p className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-400">No categories selected — check a safety gear section above.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {orderedCategories.map((category, i) => {
        const meta = CATEGORY_META[category];
        const entry = entries[category] ?? { category };
        const update = (patch: Partial<EquipmentEntry>) => onChange(category, { ...entry, category, ...patch });
        const showCertList = !meta.presenceOnly && (!meta.hybrid || entry.mode === "certified");
        const result = results?.[category];
        const Icon = CATEGORY_ICONS[category];
        const displayGroup = groupOf(category);
        const isNewGroup = occupant === "driver" && (i === 0 || groupOf(orderedCategories[i - 1]) !== displayGroup);
        const groupColor = occupant === "codriver" ? CODRIVER_COLOR : GROUP_COLORS[displayGroup];
        const domId = occupant === "driver" ? `category-${category}` : `category-${category}-${occupant}`;
        const isEmpty = isEntryEmpty(category, entry);
        const certBadges = showPhotoUpload ? summarizeEntryCerts(category, entry, result) : [];

        return (
          <div key={category} id={domId} className="scroll-mt-4">
            {isNewGroup && <h3 className={`mb-1 text-xs font-semibold uppercase tracking-wide ${groupColor.text}`}>{GROUP_LABELS[displayGroup]}</h3>}
            <details className={`rounded-lg border p-4 ${groupColor.border}`}>
            <summary className="flex flex-wrap cursor-pointer list-none items-center gap-3 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <Icon />
                <span className="min-w-0">{meta.label}</span>
              </span>
              {certBadges.length > 0 && (
                <span className="flex max-w-[12rem] shrink flex-wrap items-center justify-end gap-x-1 text-xs font-normal">
                  {certBadges.map((badge, badgeIndex) => (
                    <span key={badge.key} className={`truncate ${badge.colorClass}`}>
                      {badge.label}
                      {badgeIndex < certBadges.length - 1 ? "," : ""}
                    </span>
                  ))}
                </span>
              )}
              {showPhotoUpload && entry.photoDataUrls?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset
                <img src={entry.photoDataUrls[0]} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
              )}
              {isEmpty && <NoDataBadge />}
              {result && <StatusPill status={result.status} requirement={result.requirement} />}
            </summary>
            <p className="mb-2 mt-2 text-xs text-neutral-400">{meta.hint}</p>

            <div className="flex flex-col gap-2">
                {showPhotoUpload && (
                  <ItemPhotos
                    category={category}
                    entry={entry}
                    canScan={!meta.presenceOnly}
                    onChange={(photoDataUrls) => update({ photoDataUrls })}
                    onAddCertification={(cert) =>
                      update({
                        certifications: [...(entry.certifications ?? []), cert],
                        // Finding a tag on the photo means it's a certified item — flip a hybrid
                        // category (gloves, seat, etc.) out of "material only" mode automatically,
                        // rather than leaving the found certification stranded under a mode that
                        // hides the certification list.
                        ...(meta.hybrid && entry.mode !== "certified" ? { mode: "certified" as const } : {}),
                      })
                    }
                  />
                )}

                {isSimplePresenceCategory(category) && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
                    <input type="checkbox" checked={entry.skipped === false} onChange={(e) => update({ skipped: e.target.checked ? false : undefined })} />
                    I have this item
                  </label>
                )}

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

                {category === "fire_extinguisher" && (
                  <ExtinguisherUnitList units={entry.extinguisherUnits ?? []} onChange={(extinguisherUnits) => update({ extinguisherUnits })} />
                )}

                {category === "rollover_protection" && (
                  <RolloverProtectionFields category={category} entry={entry} onChange={update} onReportMissing={onReportMissing} />
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
                      {meta.materialOnlyLabel ?? "No certification (fire-resistant / non-flammable material)"}
                    </option>
                    <option className={optionClass} value="certified">
                      {meta.certifiedLabel ?? "Certified (SFI or FIA rated)"}
                    </option>
                  </select>
                )}

                {category === "seat" && entry.mode && (
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-400">Fixed-mounted, or on sliders/rails?</span>
                    <select
                      className={selectClass}
                      value={entry.seatMounting ?? ""}
                      onChange={(e) => update({ seatMounting: (e.target.value || undefined) as EquipmentEntry["seatMounting"] })}
                    >
                      <option className={optionClass} value="">
                        Select…
                      </option>
                      <option className={optionClass} value="fixed">
                        Fixed-mounted
                      </option>
                      <option className={optionClass} value="rails">
                        Sliders / rails
                      </option>
                    </select>
                  </label>
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

            {result && (
              <div className="mt-3">
                <ResultRow result={result} />
              </div>
            )}
            </details>
          </div>
        );
      })}
    </div>
  );
}
