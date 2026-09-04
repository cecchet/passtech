"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CategoryGroup, EquipmentCategory, Occupant, SourceDocument } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_COLORS, GROUP_LABELS, isPerOccupantCategory, maxPhotosFor } from "@/data/categoryMeta";
import { NOT_LISTED, ROLLOVER_LOGBOOK_BODIES, ROLLOVER_PADDING_STANDARDS, standardLabel, standardsFor } from "@/data/standards";
import {
  CategoryResults,
  CertificationEntry,
  EquipmentEntry,
  ExtinguisherUnit,
  TriangleUnit,
  WindowBreakerUnit,
  isEntryEmpty,
  newCertification,
  newExtinguisherUnit,
  newTriangleUnit,
  newWindowBreakerUnit,
} from "@/lib/matcher";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { fiaListsForStandard } from "@/data/fiaHomologation";
import { lookupHomologation } from "@/lib/fiaHomologation";
import { useTagScanner } from "@/lib/useTagScanner";
import { PhotoScan } from "@/components/PhotoScan";
import { HelmetPhotoScan } from "@/components/HelmetPhotoScan";
import { CameraPhotoButton } from "@/components/CameraPhotoButton";
import { ExtinguisherLabelScan } from "@/components/ExtinguisherPhotoScan";
import { TagCandidateList } from "@/components/TagCandidateList";
import { HomologationResultBanner, FiaListLink } from "@/components/HomologationResultBanner";
import { ResultRow, statusLabel, statusStyle } from "@/components/ResultRow";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { CategoryMediaLinks } from "@/components/CategoryMediaLinks";
import { ZoomableThumb } from "@/components/ZoomableThumb";
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
  /** Body-first only: hide any category this ruleset doesn't mark "required" (recommended, conditional, not-addressed, or with no result at all). */
  hideNotRequired?: boolean;
  /** Equipment-first only: hide any category with nothing entered — mirrors "Only check the equipment I have" so the form only shows what's actually being evaluated. */
  hideEmpty?: boolean;
  /**
   * Options 2/3 only: show each category's video/product logos (see CategoryMediaLinks) — in the
   * collapsed summary while the item still needs attention (required or conditional and not yet
   * OK, or — with no `results`, i.e. Option 3 — simply not filled in yet), then at the bottom of
   * the expanded card once it's resolved (OK, or any data entered when there's no `results`). Off
   * by default so My Gear editing (which has no body to check against) stays uncluttered.
   */
  showMediaLinks?: boolean;
  /** The current ruleset's source documents, forwarded to each category's result citation so it can link out even though CategoryRule.citation almost never sets its own url. Only meaningful together with `results`. */
  sourceDocuments?: SourceDocument[];
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
        <ZoomableThumb src={imageDataUrl} className="h-16 w-16 shrink-0 rounded object-cover" />
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
            🗑️ Remove photo
          </button>
        </div>
      </div>
      {scanner.error && <p className="text-xs text-red-400">{scanner.error}</p>}
      {scanner.candidates && (
        <TagCandidateList candidates={scanner.candidates} notes={scanner.notes} added={scanner.added} onAdd={scanner.addCandidate} category={category} />
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
        <div className="flex flex-wrap gap-2">
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
                const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
                onChange([...photos, dataUrl]);
              }}
            />
          </label>
          <CameraPhotoButton
            onFile={async (file) => {
              const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
              onChange([...photos, dataUrl]);
            }}
            className="flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
          />
        </div>
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
    // A visible fill (not just a border) so each certification reads as its own box against the
    // category card's own chrome and the neighboring "Add a photo"/"Scan tag photo" controls —
    // with two or more certifications on one item, a border-only box (and, before that, a low-
    // contrast tinted one) was hard to tell apart from its neighbors.
    <div className="rounded-lg border-2 border-sky-400 bg-sky-900/80 p-2">
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

      {cert.standardId && !notListed && fiaListsForStandard(cert.standardId, category).length > 0 && (
        <HomologationCheck
          standardId={cert.standardId}
          category={category}
          value={cert.homologationNumber}
          onChange={(v) => onChange({ homologationNumber: v })}
        />
      )}
    </div>
  );
}

/** For standards backed by an FIA Technical List (see src/data/fiaHomologation): a free-text field for the number printed on the tag, checked live against the cached list. */
function HomologationCheck({
  standardId,
  category,
  value,
  onChange,
}: {
  standardId: string;
  category: EquipmentCategory;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const trimmed = (value ?? "").trim();
  const result = trimmed ? lookupHomologation(standardId, trimmed, category) : undefined;
  const listsForStandard = fiaListsForStandard(standardId, category);

  return (
    <div className="mt-2 flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        <span>
          FIA homologation number on tag (optional — checked against{" "}
          {listsForStandard.map((l, i) => (
            <span key={l.listNumber}>
              {i > 0 && "/"}
              <FiaListLink listNumber={l.listNumber} sourceUrl={l.sourceUrl} />
            </span>
          ))}
          )
        </span>
        <input
          type="text"
          placeholder="e.g. DC.001.18-O"
          className={`${dateClass} placeholder:text-neutral-500`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      </label>
      <HomologationResultBanner standardId={standardId} result={result} />
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

function ExtinguisherUnitRow({
  unit,
  missingFields,
  onChange,
  onRemove,
}: {
  unit: ExtinguisherUnit;
  /** Which fields the active ruleset's mounting requirement is still waiting on for this unit — see CategoryResult.missingExtinguisherMountFields. Highlighted red so the driver can see exactly what's blocking the verdict, not just read it in the reason text. */
  missingFields?: ("hasMetalBracket" | "metalStrapCount" | "hasAntiTorpedoTabs" | "weightLbs")[];
  onChange: (patch: Partial<ExtinguisherUnit>) => void;
  onRemove: () => void;
}) {
  const numeric = (raw: string): number | undefined => (raw === "" ? undefined : Number(raw));
  const photos = unit.photoDataUrls ?? [];
  const maxPhotos = maxPhotosFor("fire_extinguisher");
  const canAddMore = photos.length < maxPhotos;
  const inputId = useId();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const removePhoto = (i: number) => onChange({ photoDataUrls: photos.filter((_, idx) => idx !== i) });
  const isMissing = (field: "hasMetalBracket" | "metalStrapCount" | "hasAntiTorpedoTabs" | "weightLbs") => !!missingFields?.includes(field);
  const missingRing = "border-red-500 ring-1 ring-red-500";

  return (
    // Same bright highlight as a certification box (CertificationRow) — one item can carry
    // several of these units (extinguishers, window breakers, triangles), and a border-only box
    // was just as hard to tell apart from its neighbors as an uncertified certification row was.
    <div className="flex flex-col gap-2 rounded-lg border-2 border-sky-400 bg-sky-900/80 p-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={i} className="flex flex-col gap-1" style={{ width: 220, maxWidth: 220 }}>
              <div className="flex items-start gap-2">
                <ZoomableThumb src={p} className="h-16 w-16 shrink-0 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  🗑️ Remove photo
                </button>
              </div>
              <ExtinguisherLabelScan imageDataUrl={p} onApply={(patch) => onChange(patch)} />
            </div>
          ))}
        </div>
      )}
      {canAddMore && (
        <div className="flex flex-wrap gap-2">
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
                const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
                onChange({ photoDataUrls: [...photos, dataUrl] });
              }}
            />
          </label>
          <CameraPhotoButton
            onFile={async (file) => {
              const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
              onChange({ photoDataUrls: [...photos, dataUrl] });
            }}
            className="flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
          />
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
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
          className={`${numberInputClass} w-24 ${isMissing("weightLbs") ? missingRing : ""}`}
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
      </div>
      <div className="flex flex-wrap items-end gap-2">
      <div className={`flex flex-col gap-1 rounded p-1 text-xs text-neutral-400 ${isMissing("hasMetalBracket") ? missingRing : ""}`}>
        Metal bracket (not plastic, velcro, or zip ties)?
        <div className="flex items-center gap-3 text-neutral-300">
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" name={`metal-bracket-${unit.key}`} checked={unit.hasMetalBracket === true} onChange={() => onChange({ hasMetalBracket: true })} />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" name={`metal-bracket-${unit.key}`} checked={unit.hasMetalBracket === false} onChange={() => onChange({ hasMetalBracket: false })} />
            No
          </label>
        </div>
      </div>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Metal straps/fastenings
        <input
          type="number"
          min={0}
          placeholder="e.g. 2"
          className={`${numberInputClass} w-24 ${isMissing("metalStrapCount") ? missingRing : ""}`}
          value={unit.metalStrapCount ?? ""}
          onChange={(e) => onChange({ metalStrapCount: numeric(e.target.value) })}
        />
      </label>
      <div className={`flex flex-col gap-1 rounded p-1 text-xs text-neutral-400 ${isMissing("hasAntiTorpedoTabs") ? missingRing : ""}`}>
        Anti-torpedo tabs on the bracket?
        <div className="flex items-center gap-3 text-neutral-300">
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name={`anti-torpedo-${unit.key}`}
              checked={unit.hasAntiTorpedoTabs === true}
              onChange={() => onChange({ hasAntiTorpedoTabs: true })}
            />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              name={`anti-torpedo-${unit.key}`}
              checked={unit.hasAntiTorpedoTabs === false}
              onChange={() => onChange({ hasAntiTorpedoTabs: false })}
            />
            No
          </label>
        </div>
      </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
      {!confirmRemove ? (
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800"
        >
          🗑️ Remove this extinguisher
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onRemove}
            className="rounded border border-red-500 bg-red-900 px-2 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-800"
          >
            🗑️ Confirm delete{photos.length > 0 ? ` (removes ${photos.length} photo${photos.length === 1 ? "" : "s"} too)` : ""}?
          </button>
          <button type="button" onClick={() => setConfirmRemove(false)} className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
            Cancel
          </button>
        </>
      )}
      </div>
    </div>
  );
}

function ExtinguisherUnitList({
  units,
  missingFieldsByUnit,
  onChange,
}: {
  units: ExtinguisherUnit[];
  /** From CategoryResult.missingExtinguisherMountFields — which unit(s) still have unanswered mounting fields blocking the verdict. */
  missingFieldsByUnit?: { key: string; fields: ("hasMetalBracket" | "metalStrapCount" | "hasAntiTorpedoTabs" | "weightLbs")[] }[];
  onChange: (units: ExtinguisherUnit[]) => void;
}) {
  const updateUnit = (index: number, patch: Partial<ExtinguisherUnit>) => onChange(units.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  const removeUnit = (index: number) => onChange(units.filter((_, i) => i !== index));
  const addUnit = () => onChange([...units, newExtinguisherUnit()]);

  return (
    <div className="flex flex-col gap-2">
      {units.map((unit, i) => (
        <ExtinguisherUnitRow
          key={unit.key}
          unit={unit}
          missingFields={missingFieldsByUnit?.find((m) => m.key === unit.key)?.fields}
          onChange={(patch) => updateUnit(i, patch)}
          onRemove={() => removeUnit(i)}
        />
      ))}
      <button type="button" onClick={addUnit} className="self-start rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
        + Add {units.length > 0 ? "another extinguisher" : "an extinguisher"}
      </button>
    </div>
  );
}

// A window breaker/seatbelt cutter has no rating or date fields (unlike a fire extinguisher) —
// this only exists so each physical tool (e.g. one at the driver's seat, one at the codriver's)
// can carry its own photo instead of lumping every photo into one shared pool.
function WindowBreakerUnitRow({ unit, onChange, onRemove }: { unit: WindowBreakerUnit; onChange: (patch: Partial<WindowBreakerUnit>) => void; onRemove: () => void }) {
  const photos = unit.photoDataUrls ?? [];
  const maxPhotos = maxPhotosFor("window_breaker");
  const canAddMore = photos.length < maxPhotos;
  const inputId = useId();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const removePhoto = (i: number) => onChange({ photoDataUrls: photos.filter((_, idx) => idx !== i) });

  return (
    // Same bright highlight as a certification box (CertificationRow) — one item can carry
    // several of these units (extinguishers, window breakers, triangles), and a border-only box
    // was just as hard to tell apart from its neighbors as an uncertified certification row was.
    <div className="flex flex-col gap-2 rounded-lg border-2 border-sky-400 bg-sky-900/80 p-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <ZoomableThumb src={p} className="h-16 w-16 shrink-0 rounded object-cover" />
              <button type="button" onClick={() => removePhoto(i)} className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
                🗑️ Remove photo
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {canAddMore && (
          <>
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
                  const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
                  onChange({ photoDataUrls: [...photos, dataUrl] });
                }}
              />
            </label>
            <CameraPhotoButton
              onFile={async (file) => {
                const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
                onChange({ photoDataUrls: [...photos, dataUrl] });
              }}
              className="flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
            />
          </>
        )}
        {!confirmRemove ? (
          <button type="button" onClick={() => setConfirmRemove(true)} className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800">
            🗑️ Remove this tool
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRemove}
              className="rounded border border-red-500 bg-red-900 px-2 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-800"
            >
              🗑️ Confirm delete{photos.length > 0 ? ` (removes ${photos.length} photo${photos.length === 1 ? "" : "s"} too)` : ""}?
            </button>
            <button type="button" onClick={() => setConfirmRemove(false)} className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function WindowBreakerUnitList({ units, onChange }: { units: WindowBreakerUnit[]; onChange: (units: WindowBreakerUnit[]) => void }) {
  const updateUnit = (index: number, patch: Partial<WindowBreakerUnit>) => onChange(units.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  const removeUnit = (index: number) => onChange(units.filter((_, i) => i !== index));
  const addUnit = () => onChange([...units, newWindowBreakerUnit()]);

  return (
    <div className="flex flex-col gap-2">
      {units.map((unit, i) => (
        <WindowBreakerUnitRow key={unit.key} unit={unit} onChange={(patch) => updateUnit(i, patch)} onRemove={() => removeUnit(i)} />
      ))}
      <button type="button" onClick={addUnit} className="self-start rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
        + Add {units.length > 0 ? "another tool" : "a tool"}
      </button>
    </div>
  );
}

// A warning triangle has one field a body can actually spec a minimum for (its side length) —
// unlike a fire extinguisher's several rating dimensions, so this only needs the one number input
// alongside the same per-unit photo handling.
function TriangleUnitRow({ unit, onChange, onRemove }: { unit: TriangleUnit; onChange: (patch: Partial<TriangleUnit>) => void; onRemove: () => void }) {
  const numeric = (raw: string): number | undefined => (raw === "" ? undefined : Number(raw));
  const photos = unit.photoDataUrls ?? [];
  const maxPhotos = maxPhotosFor("emergency_triangle");
  const canAddMore = photos.length < maxPhotos;
  const inputId = useId();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const removePhoto = (i: number) => onChange({ photoDataUrls: photos.filter((_, idx) => idx !== i) });

  return (
    // Same bright highlight as a certification box (CertificationRow) — one item can carry
    // several of these units (extinguishers, window breakers, triangles), and a border-only box
    // was just as hard to tell apart from its neighbors as an uncertified certification row was.
    <div className="flex flex-col gap-2 rounded-lg border-2 border-sky-400 bg-sky-900/80 p-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <ZoomableThumb src={p} className="h-16 w-16 shrink-0 rounded object-cover" />
              <button type="button" onClick={() => removePhoto(i)} className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
                🗑️ Remove photo
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
        {canAddMore && (
          <>
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
                const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
                onChange({ photoDataUrls: [...photos, dataUrl] });
              }}
            />
          </label>
          <CameraPhotoButton
            onFile={async (file) => {
              const dataUrl = await resizeImageToDataUrl(file, 1600, 0.85);
              onChange({ photoDataUrls: [...photos, dataUrl] });
            }}
            className="flex w-fit cursor-pointer items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
          />
          </>
        )}
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Side length (in)
          <input
            type="number"
            min={0}
            step="0.5"
            placeholder="e.g. 12"
            className={`${numberInputClass} w-24`}
            value={unit.sideLengthIn ?? ""}
            onChange={(e) => onChange({ sideLengthIn: numeric(e.target.value) })}
          />
        </label>
        {!confirmRemove ? (
          <button type="button" onClick={() => setConfirmRemove(true)} className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800">
            🗑️ Remove this triangle
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRemove}
              className="rounded border border-red-500 bg-red-900 px-2 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-800"
            >
              🗑️ Confirm delete{photos.length > 0 ? ` (removes ${photos.length} photo${photos.length === 1 ? "" : "s"} too)` : ""}?
            </button>
            <button type="button" onClick={() => setConfirmRemove(false)} className="rounded border border-neutral-600 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TriangleUnitList({ units, onChange }: { units: TriangleUnit[]; onChange: (units: TriangleUnit[]) => void }) {
  const updateUnit = (index: number, patch: Partial<TriangleUnit>) => onChange(units.map((u, i) => (i === index ? { ...u, ...patch } : u)));
  const removeUnit = (index: number) => onChange(units.filter((_, i) => i !== index));
  const addUnit = () => onChange([...units, newTriangleUnit()]);

  return (
    <div className="flex flex-col gap-2">
      {units.map((unit, i) => (
        <TriangleUnitRow key={unit.key} unit={unit} onChange={(patch) => updateUnit(i, patch)} onRemove={() => removeUnit(i)} />
      ))}
      <button type="button" onClick={addUnit} className="self-start rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
        + Add {units.length > 0 ? "another triangle" : "a triangle"}
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

// Presence-only categories with no other fields of their own (tow rope, first aid kit, kill
// switch, hood pins, spill kit, parachute) — the only way the user can indicate possession is a
// single checkbox. Fire extinguisher, window breaker, emergency triangle, tow hook, and rollover
// protection are presence-only too but have their own dedicated fields, so they're excluded here.
function isSimplePresenceCategory(category: EquipmentCategory): boolean {
  return (
    CATEGORY_META[category].presenceOnly === true &&
    category !== "fire_extinguisher" &&
    category !== "window_breaker" &&
    category !== "emergency_triangle" &&
    category !== "tow_hook" &&
    category !== "rollover_protection"
  );
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
  hideNotRequired,
  hideEmpty,
  showMediaLinks,
  sourceDocuments,
}: Props) {
  const groupOf = (c: EquipmentCategory): CategoryGroup =>
    occupant === "driver" && perOccupantAsDriverGroup && isPerOccupantCategory(c) ? "driver" : CATEGORY_META[c].group;
  // Filters by the *effective* group (post perOccupantAsDriverGroup reclassification), not each
  // category's raw CATEGORY_META group — otherwise a caller restricting activeGroups to just
  // {"driver"} (to render the driver-only section, with a codriver section slotted in after it)
  // would miss seat/belts/window net even though they're displaying as "driver" group right now.
  const visibleCategories = CATEGORY_ORDER.filter(
    (c) =>
      activeGroups.has(groupOf(c)) &&
      (occupant === "driver" || isPerOccupantCategory(c)) &&
      (!hideNotRequired || results?.[c]?.requirement === "required" || results?.[c]?.requirement === "conditional") &&
      (!hideEmpty || !isEntryEmpty(c, entries[c]))
  );

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
    const message =
      hideNotRequired && results
        ? "Nothing required in the sections checked above — uncheck “Hide Not Required Gear” to see the rest."
        : hideEmpty
          ? "No gear data available — Uncheck “Only check the equipment I have” to add some."
          : "No categories selected — check a safety gear section above.";
    const colorClass = hideEmpty ? "text-red-400" : "text-neutral-400";
    return <p className={`rounded-lg border border-neutral-700 p-4 text-sm ${colorClass}`}>{message}</p>;
  }

  const renderCard = (category: EquipmentCategory) => {
    const entry = entries[category] ?? { category };
    const result = results?.[category];
    return (
      <CategoryCard
        key={category}
        category={category}
        entry={entry}
        result={result}
        hasResultsContext={!!results}
        isNewGroup={false}
        groupOverride={groupOf(category)}
        occupant={occupant}
        showPhotoUpload={showPhotoUpload}
        showMediaLinks={showMediaLinks}
        sourceDocuments={sourceDocuments}
        onChange={onChange}
        onReportMissing={onReportMissing}
      />
    );
  };

  // The codriver's own list (driven from CodriverGearSection, which already wraps it in its own
  // collapsible "Codriver Safety Gear" header) is effectively a single group of personal gear —
  // no need to subdivide it again in here. Only the driver's own list, which spans Driver/Car/
  // Rollover at once, gets broken into per-group collapsible sections — with 20+ categories on
  // screen at once, being able to fold away a whole section (say, Rollover Protection) that isn't
  // relevant right now cuts down the scrolling a lot more than collapsing one card at a time.
  if (occupant !== "driver") {
    return <div className="flex flex-col gap-3">{orderedCategories.map(renderCard)}</div>;
  }

  const groupedSections: { group: CategoryGroup; categories: EquipmentCategory[] }[] = [];
  for (const category of orderedCategories) {
    const g = groupOf(category);
    const last = groupedSections[groupedSections.length - 1];
    if (last && last.group === g) last.categories.push(category);
    else groupedSections.push({ group: g, categories: [category] });
  }

  return (
    <div className="flex flex-col gap-4">
      {groupedSections.map(({ group, categories }) => (
        <details key={group} open className="group/section">
          <summary
            className={`mb-2 flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wide marker:content-none [&::-webkit-details-marker]:hidden ${GROUP_COLORS[group].text}`}
          >
            <span className="inline-block transition-transform group-open/section:rotate-90">▶</span>
            {GROUP_LABELS[group]}
            <span className="font-normal normal-case text-neutral-500">({categories.length})</span>
          </summary>
          <div className="flex flex-col gap-3">{categories.map(renderCard)}</div>
        </details>
      ))}
    </div>
  );
}

/**
 * One category's full card — icon/name/status header, hint text, item photo + certification (or
 * presence/dedicated-field) entry, and (when a result is available) its verdict. Used both by
 * EquipmentForm's per-category loop above and standalone by Buyer/Scrutineer mode, which render
 * exactly one card for whichever single category the user picked — hence every list-position
 * concern (grouping order, which category came before it) is the CALLER's job via `isNewGroup`/
 * `groupOverride`, not this component's.
 */
export function CategoryCard({
  category,
  entry,
  result,
  hasResultsContext = true,
  isNewGroup = true,
  groupOverride,
  occupant = "driver",
  showPhotoUpload,
  showMediaLinks,
  sourceDocuments,
  defaultOpen = false,
  open,
  onOpenChange,
  showResultRow = true,
  eligibilityBadge,
  expiryWarning,
  onChange,
  onReportMissing,
}: {
  category: EquipmentCategory;
  entry: EquipmentEntry;
  result?: CategoryResult;
  /** Whether a `results` object exists at all for this render (Option 2's single-ruleset check) — distinct from `result` itself, which is this one category's entry in it. Governs the "not required by this body" fallback pill shown when a results context exists but this particular category has no result. Default true (assume a results context) since standalone callers — Buyer/Scrutineer mode — always have one. */
  hasResultsContext?: boolean;
  /** Whether to show the group header (e.g. "DRIVER SAFETY GEAR") above this card — a list-position concern the caller decides. Defaults to true for standalone single-card usage. */
  isNewGroup?: boolean;
  /** Overrides which group's color/label this card uses — EquipmentForm's per-occupant-as-driver-group reclassification needs this; standalone callers can omit it to use the category's own plain group. */
  groupOverride?: CategoryGroup;
  occupant?: Occupant;
  showPhotoUpload?: boolean;
  showMediaLinks?: boolean;
  sourceDocuments?: SourceDocument[];
  /** Starts the card's <details> expanded — EquipmentForm's own multi-category lists default this closed (20 expanded cards would be overwhelming), but a standalone single-card caller (Buyer/Scrutineer mode) has no such space constraint and wants it open immediately. Ignored once `open` is provided (see below). */
  defaultOpen?: boolean;
  /**
   * Imperatively forces the <details> open/closed after it's already mounted — plain React state
   * can't do this for a native <details>, since React only treats its `open` attribute as an
   * initial value, not a controlled one (unlike, say, an <input>'s `value`). Scrutineer mode uses
   * this to auto-collapse the card the moment a verdict appears (more of the small screen shows
   * the verdict instead of the entry form), while `onOpenChange` still reports every native
   * toggle — including the user manually reopening it — so the caller's own state stays in sync.
   * Omit both to keep the plain uncontrolled `defaultOpen` behavior every other caller uses.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether to show the category's own result explanation (ResultRow: status pill, reason, citation) inside the card. Defaults to true; Scrutineer mode turns this off and renders the same ResultRow itself inside its verdict banner instead, so the explanation stays visible even once this card auto-collapses. */
  showResultRow?: boolean;
  /** Buyer mode only: overlays eligible/fail counts on the category icon's top-left/top-right corners, each jumping to that bucket in the results below when clicked. Omitted everywhere else — there's no "checked against every body at once" result to summarize. */
  eligibilityBadge?: { eligible: number; fail: number; onEligibleClick: () => void; onFailClick: () => void };
  /** Buyer mode only: the earliest "expires within the current year" date found among the currently-eligible rulesets (see expiringSoonDate in matcher.ts), and whether every one of them shares it — shown right in the summary row so the caveat ("eligible now, but only for a few more months") is visible without expanding the card. `universal: false` means only some of the eligible bodies are affected, so the badge says so rather than implying a blanket expiry. */
  expiryWarning?: { date: string; universal: boolean };
  onChange: (category: EquipmentCategory, entry: EquipmentEntry) => void;
  onReportMissing?: (category: EquipmentCategory, label: string) => void;
}) {
  const meta = CATEGORY_META[category];
  const update = (patch: Partial<EquipmentEntry>) => onChange(category, { ...entry, category, ...patch });
  const showCertList = !meta.presenceOnly && (!meta.hybrid || entry.mode === "certified");
  const Icon = CATEGORY_ICONS[category];
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (open !== undefined && detailsRef.current) detailsRef.current.open = open;
  }, [open]);
  const displayGroup = groupOverride ?? meta.group;
  const groupColor = occupant === "codriver" ? CODRIVER_COLOR : GROUP_COLORS[displayGroup];
  const domId = occupant === "driver" ? `category-${category}` : `category-${category}-${occupant}`;
  const isEmpty = isEntryEmpty(category, entry);
  const certBadges = showPhotoUpload ? summarizeEntryCerts(category, entry, result) : [];
  // With a result (Option 2, one ruleset selected): still needs attention while it's actually
  // required/conditional for this body and not yet accepted. With no result at all (Option 3,
  // checked against every body at once — there's no single "required" to judge against): just
  // whether anything's been entered yet.
  const needsAttention = result
    ? (result.requirement === "required" || result.requirement === "conditional") && result.status !== "ok"
    : isEmpty;

  return (
    <div key={category} id={domId} className="scroll-mt-4">
      {isNewGroup && <h3 className={`mb-1 text-xs font-semibold uppercase tracking-wide ${groupColor.text}`}>{GROUP_LABELS[displayGroup]}</h3>}
      <details
        ref={detailsRef}
        open={open ?? defaultOpen}
        onToggle={onOpenChange ? (e) => onOpenChange((e.currentTarget as HTMLDetailsElement).open) : undefined}
        className={`rounded-lg border p-4 ${groupColor.border}`}
      >
      <summary className="flex flex-wrap cursor-pointer list-none items-center gap-3 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {eligibilityBadge ? (
            <span className="relative inline-flex shrink-0">
              <Icon />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  eligibilityBadge.onEligibleClick();
                }}
                title="Jump to eligible rulesets"
                className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white ring-2 ring-neutral-950 hover:bg-emerald-500"
              >
                {eligibilityBadge.eligible}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  eligibilityBadge.onFailClick();
                }}
                title="Jump to rulesets this doesn't meet"
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold text-white ring-2 ring-neutral-950 hover:bg-red-600"
              >
                {eligibilityBadge.fail}
              </button>
            </span>
          ) : (
            <Icon />
          )}
          <span className="min-w-0">{meta.label}</span>
        </span>
        {showPhotoUpload &&
          (entry.photoDataUrls?.[0] ?? entry.extinguisherUnits?.[0]?.photoDataUrls?.[0] ?? entry.windowBreakerUnits?.[0]?.photoDataUrls?.[0] ?? entry.triangleUnits?.[0]?.photoDataUrls?.[0]) && (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided photo, not a static bundled asset
            <img
              src={
                entry.photoDataUrls?.[0] ??
                entry.extinguisherUnits?.[0]?.photoDataUrls?.[0] ??
                entry.windowBreakerUnits?.[0]?.photoDataUrls?.[0] ??
                entry.triangleUnits?.[0]?.photoDataUrls?.[0]
              }
              alt=""
              className="h-8 w-8 shrink-0 rounded object-cover"
            />
          )}
        {isEmpty && <NoDataBadge />}
        {expiryWarning && (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-700 bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-300">
            ⚠️ Expires {expiryWarning.date}
            {!expiryWarning.universal && " with some sanctioning bodies"}
          </span>
        )}
        {showMediaLinks && needsAttention && <CategoryMediaLinks category={category} className="flex shrink-0 gap-1" />}
        {result ? (
          <StatusPill status={result.status} requirement={result.requirement} />
        ) : (
          hasResultsContext && <StatusPill status="not_required" requirement="not_addressed" />
        )}
        {certBadges.length > 0 && (
          // w-full always forces this onto its own flex line, below the name/thumbnail/pill row —
          // sharing that row let a long category name wrap to two lines while this sat vertically
          // centered across the whole row's height, landing its text on top of the name's.
          <span className="flex w-full flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-normal">
            {certBadges.map((badge, badgeIndex) => (
              <span key={badge.key} className={badge.colorClass}>
                {badge.label}
                {badgeIndex < certBadges.length - 1 ? "," : ""}
              </span>
            ))}
          </span>
        )}
      </summary>
      <p className="mb-2 mt-2 text-xs text-neutral-400">{meta.hint}</p>
      {category === "hnr" && (
        <p className="mb-2 text-xs text-amber-400">
          Always check that your HNR tethers are compatible with the anchors on your helmet &mdash; PassTech
          only checks the device&rsquo;s own certification, not tether/anchor compatibility.
        </p>
      )}

      <div className="flex flex-col gap-2">
          {showPhotoUpload && category !== "fire_extinguisher" && category !== "window_breaker" && category !== "emergency_triangle" && (
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

          {category === "tow_hook" && (
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
                <input type="checkbox" checked={entry.towHookFront === true} onChange={(e) => update({ towHookFront: e.target.checked || undefined })} />
                Front
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
                <input type="checkbox" checked={entry.towHookRear === true} onChange={(e) => update({ towHookRear: e.target.checked || undefined })} />
                Rear
              </label>
            </div>
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

          {category === "helmet" && (
            <>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={entry.hasVisor ?? false}
                  onChange={(e) => update({ hasVisor: e.target.checked, ...(e.target.checked ? {} : { visorNote: undefined }) })}
                />
                Has a visor/face shield
              </label>
              {entry.visorNote && <p className="text-xs text-neutral-500">{entry.visorNote}</p>}
              <HelmetPhotoScan onApply={(patch) => update(patch)} />
            </>
          )}

          {category === "fire_extinguisher" &&
            (() => {
              // One-time reconciliation: a brief window before per-unit photos existed wrote
              // straight into the shared entry.photoDataUrls (the generic per-category photo
              // control, now hidden for this category). Fold any leftovers from that window
              // into the first unit here so they don't just vanish, and clear the shared field
              // once the user next edits anything so this doesn't keep re-merging.
              const strayPhotos = entry.photoDataUrls ?? [];
              const baseUnits = entry.extinguisherUnits ?? [];
              const units =
                strayPhotos.length === 0
                  ? baseUnits
                  : baseUnits.length > 0
                    ? baseUnits.map((u, i) => (i === 0 ? { ...u, photoDataUrls: [...(u.photoDataUrls ?? []), ...strayPhotos] } : u))
                    : [{ ...newExtinguisherUnit(), photoDataUrls: strayPhotos }];
              return (
                <ExtinguisherUnitList
                  units={units}
                  missingFieldsByUnit={result?.missingExtinguisherMountFields}
                  onChange={(extinguisherUnits) => update({ extinguisherUnits, photoDataUrls: [] })}
                />
              );
            })()}

          {category === "window_breaker" &&
            (() => {
              // Same one-time reconciliation as fire_extinguisher above: fold any photos left
              // over in the shared entry.photoDataUrls (from before per-tool units existed)
              // into the first tool instead of losing them.
              const strayPhotos = entry.photoDataUrls ?? [];
              const baseUnits = entry.windowBreakerUnits ?? [];
              const units =
                strayPhotos.length === 0
                  ? baseUnits
                  : baseUnits.length > 0
                    ? baseUnits.map((u, i) => (i === 0 ? { ...u, photoDataUrls: [...(u.photoDataUrls ?? []), ...strayPhotos] } : u))
                    : [{ ...newWindowBreakerUnit(), photoDataUrls: strayPhotos }];
              return <WindowBreakerUnitList units={units} onChange={(windowBreakerUnits) => update({ windowBreakerUnits, photoDataUrls: [] })} />;
            })()}

          {category === "emergency_triangle" &&
            (() => {
              // Same one-time reconciliation as fire_extinguisher/window_breaker above: fold
              // any photos left over in the shared entry.photoDataUrls (from before per-triangle
              // units existed) into the first triangle instead of losing them.
              const strayPhotos = entry.photoDataUrls ?? [];
              const baseUnits = entry.triangleUnits ?? [];
              const units =
                strayPhotos.length === 0
                  ? baseUnits
                  : baseUnits.length > 0
                    ? baseUnits.map((u, i) => (i === 0 ? { ...u, photoDataUrls: [...(u.photoDataUrls ?? []), ...strayPhotos] } : u))
                    : [{ ...newTriangleUnit(), photoDataUrls: strayPhotos }];
              return <TriangleUnitList units={units} onChange={(triangleUnits) => update({ triangleUnits, photoDataUrls: [] })} />;
            })()}

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

      {result && showResultRow && (
        <div className="mt-3">
          <ResultRow result={result} sourceDocuments={sourceDocuments} />
        </div>
      )}

      {showMediaLinks && !needsAttention && (
        <div className="mt-3 flex justify-end">
          <CategoryMediaLinks category={category} />
        </div>
      )}
      </details>
    </div>
  );
}
