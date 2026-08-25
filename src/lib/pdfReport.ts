import jsPDF from "jspdf";
import { CarBodyStyle, CategoryGroup, CategoryRule, EquipmentCategory, RequirementLevel, Ruleset, StandardAcceptance } from "@/data/types";
import { CATEGORY_META, CATEGORY_ORDER, GROUP_LABELS, filterCategoriesByGroups, isPerOccupantCategory } from "@/data/categoryMeta";
import { NOT_LISTED, logbookBodyLabel, standardLabel, standardsFor } from "@/data/standards";
import { CategoryResult, CategoryResults, EquipmentEntry, bodyStyleLabel, describeExtinguisherOptions, effectiveCategories, isPendingConditional, isViolation } from "@/lib/matcher";
import { CATEGORY_ICON_SPEC } from "@/components/icons/CategoryIcons";
import { BUILD_DATE } from "@/lib/version";

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ICON_SIZE = 6;
const ICON_GAP = 2;

/**
 * jsPDF's built-in "helvetica" (the standard 14 PDF font, no embedded font file) only renders a
 * narrow character set cleanly — em/en dashes, curly quotes, and ellipsis all come through fine,
 * but section signs, multiplication/degree/plus-minus signs, superscript digits, and bullets all
 * silently render as a replacement-character glyph instead of throwing. Since body rule text
 * (materialNote/notes/citation.section) is transcribed from real rulebooks and uses "§" and "×"
 * constantly, every string written to the PDF is routed through this first.
 */
const CHAR_REPLACEMENTS: [string, string][] = [
  ["§", "Sec. "],
  ["×", "x"],
  ["°", " deg"],
  ["½", "1/2"],
  ["¼", "1/4"],
  ["≥", ">="],
  ["≤", "<="],
  ["±", "+/-"],
  ["²", "^2"],
  ["•", "-"],
];

function sanitizeForPdf(value: string): string {
  let out = value;
  for (const [from, to] of CHAR_REPLACEMENTS) out = out.split(from).join(to);
  // Catch-all for anything else outside the safe set confirmed above — better a dropped character
  // than a "�" box in a downloaded report.
  return out.replace(/[^\x00-\x7F–—‘’“”…]/g, "");
}

type RGB = [number, number, number];

const COLOR = {
  text: [30, 30, 30] as RGB,
  muted: [110, 110, 110] as RGB,
  faint: [150, 150, 150] as RGB,
  accent: [180, 83, 9] as RGB, // amber-700-ish, ink-friendly on white
  green: [4, 120, 87] as RGB,
  red: [185, 28, 28] as RGB,
  amber: [161, 98, 7] as RGB,
  teal: [15, 118, 110] as RGB,
  pink: [190, 24, 93] as RGB,
};

const GROUP_COLOR: Record<CategoryGroup, RGB> = {
  driver: [30, 64, 175],
  car: COLOR.pink,
  rollcage: COLOR.teal,
};

const STATUS_LABEL: Record<CategoryResult["status"], string> = {
  ok: "OK",
  rejected: "Rejected",
  not_required: "Not required",
  recommended_only: "Recommended only",
  needs_info: "Needs info",
  unrecognized: "Unrecognized",
};

const REQUIREMENT_LABEL: Record<CategoryRule["requirement"], string> = {
  required: "Required",
  conditional: "Conditionally required",
  recommended: "Recommended",
  not_addressed: "Not addressed",
};

/** Mirrors ResultRow's statusLabel/statusStyle — a required/conditional item still awaiting data reads as a caveat rather than a neutral "needs info". */
function resultStatusLabel(status: CategoryResult["status"], requirement: CategoryResult["requirement"]): string {
  if (status === "needs_info" && requirement === "required") return "Required — missing";
  if (status === "needs_info" && requirement === "conditional") return "Conditional — unresolved";
  return STATUS_LABEL[status];
}

function resultStatusColor(status: CategoryResult["status"], requirement: CategoryResult["requirement"]): RGB {
  if (status === "needs_info" && requirement === "required") return COLOR.red;
  if (status === "needs_info" && requirement === "conditional") return COLOR.amber;
  if (status === "ok" || status === "recommended_only") return COLOR.green;
  if (status === "rejected" || status === "unrecognized") return COLOR.red;
  return COLOR.faint;
}

/** OK/green first, then required-and-missing/red, then conditional-and-unresolved/yellow, then not-required/gray last. */
function resultOrderRank(status: CategoryResult["status"], requirement: CategoryResult["requirement"]): number {
  const color = resultStatusColor(status, requirement);
  if (color === COLOR.green) return 0;
  if (color === COLOR.red) return 1;
  if (color === COLOR.amber) return 2;
  return 3;
}

function sortByResultRank(categories: EquipmentCategory[], results: CategoryResults): EquipmentCategory[] {
  return [...categories].sort((a, b) => resultOrderRank(results[a]!.status, results[a]!.requirement) - resultOrderRank(results[b]!.status, results[b]!.requirement));
}

/** Mirrors EquipmentForm's CERT_BADGE_COLOR — a cert's own status colors its badge independent of the category's overall requirement (unlike resultStatusColor, which folds in "needs_info + required" specially). */
const CERT_BADGE_COLOR: Record<CategoryResult["status"], RGB> = {
  ok: COLOR.green,
  recommended_only: COLOR.green,
  rejected: COLOR.red,
  unrecognized: COLOR.red,
  needs_info: COLOR.amber,
  not_required: COLOR.faint,
};

interface CertBadge {
  label: string;
  color: RGB;
}

/** Mirrors EquipmentForm's summarizeEntryCerts — the short, individually-colored cert label(s) shown in the collapsed card header on-screen (e.g. "Snell SA2015, FIA 8859-2015"), reused here so the PDF reads the same way. */
function summarizeEntryCerts(category: EquipmentCategory, entry: EquipmentEntry, result: CategoryResult | undefined): CertBadge[] {
  const meta = CATEGORY_META[category];
  if (meta.hybrid && entry.mode === "material_only") {
    const label = meta.materialOnlyLabel ?? "Material only";
    return [{ label, color: result ? CERT_BADGE_COLOR[result.status] : COLOR.faint }];
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
    return [{ label, color: status ? CERT_BADGE_COLOR[status] : COLOR.faint }];
  });
}

/** Required first (green), then conditional/recommended (amber), then not addressed last (gray) — same 3-color scheme as the evaluated reports, applied to requirement level instead of pass/fail status. */
function referenceOrderRank(requirement: CategoryRule["requirement"]): number {
  if (requirement === "required") return 0;
  if (requirement === "not_addressed") return 2;
  return 1; // conditional, recommended
}

function referenceRequirementColor(requirement: CategoryRule["requirement"]): RGB {
  if (requirement === "required") return COLOR.green;
  if (requirement === "not_addressed") return COLOR.faint;
  return COLOR.amber; // conditional, recommended
}

function acceptanceDetail(acceptance: StandardAcceptance): string {
  const parts: string[] = [];
  if (acceptance.noExpiration) parts.push("no expiration");
  else if (acceptance.expiresOn) parts.push(`accepted through ${acceptance.expiresOn}`);
  else if (acceptance.validityYearsFromLabel) parts.push(`valid ${acceptance.validityYearsFromLabel} yrs from label date`);
  if (acceptance.note) parts.push(acceptance.note);
  return parts.join(" — ");
}

function formatCitation(citation: CategoryRule["citation"], confidence: CategoryRule["confidence"]): string {
  let line = citation.title;
  if (citation.version) line += `, ${citation.version}`;
  if (citation.section) line += ` — ${citation.section}`;
  if (confidence !== "high") line += ` (confidence: ${confidence})`;
  return line;
}

// ---------------------------------------------------------------------------
// Icon loading — category mascot art embedded as small square thumbnails.
// Cached at module scope (keyed by category) so re-generating a report, or
// generating a second report right after, doesn't re-fetch/re-encode the same
// handful of images.
// ---------------------------------------------------------------------------

const iconDataUrlCache = new Map<EquipmentCategory, string | null>();

function loadIconDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 96;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        // Center-crop cover-fit into a square, mirroring the on-screen object-cover treatment.
        const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function preloadCategoryIcons(categories: readonly EquipmentCategory[]): Promise<void> {
  const need = categories.filter((c) => !iconDataUrlCache.has(c));
  await Promise.all(
    need.map(async (c) => {
      iconDataUrlCache.set(c, await loadIconDataUrl(CATEGORY_ICON_SPEC[c].src));
    })
  );
}

interface LogoImage {
  dataUrl: string;
  aspect: number;
}

let logoCache: LogoImage | null | undefined; // undefined = not yet attempted

/**
 * The brand logo at the top of every report — a dedicated white-background version
 * (frog-racing-logo.png is transparent/dark, made for the on-screen dark theme, and looks wrong
 * on a white PDF page) so a printed page still reads as the same app without the mismatch.
 * Optional file (a failed load just means no logo, not a broken report).
 */
async function loadLogo(): Promise<LogoImage | null> {
  if (logoCache !== undefined) return logoCache;
  logoCache = await new Promise<LogoImage | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/png"), aspect: img.naturalWidth / img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = "/passtech-whitebackground.jpg";
  });
  return logoCache;
}

function formatSourceLine(ruleset: Ruleset): string {
  const docs = ruleset.sourceDocuments.map((d) => `${d.title}${d.version ? ` (${d.version})` : ""}`).join("; ");
  return `Source: ${docs} — last reviewed ${ruleset.lastReviewed}`;
}

interface TextOpts {
  size?: number;
  color?: RGB;
  bold?: boolean;
  italic?: boolean;
  indent?: number;
}

/** Thin cursor-tracking wrapper around jsPDF — the library itself has no auto-wrap or auto-pagination, so every report builder needs this same bookkeeping. */
class PdfReportWriter {
  doc: jsPDF;
  y: number = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
  }

  ensureSpace(needed: number) {
    if (this.y + needed > PAGE_HEIGHT - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  text(value: string, opts: TextOpts = {}) {
    const size = opts.size ?? 10;
    const indent = opts.indent ?? 0;
    this.doc.setFont("helvetica", opts.bold ? "bold" : opts.italic ? "italic" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...(opts.color ?? COLOR.text));
    const clean = sanitizeForPdf(value);
    const maxWidth = CONTENT_WIDTH - indent;
    // Only used to work out how tall this block is for pagination — the actual write below hands
    // the whole string to jsPDF's own maxWidth wrapping in one call. Splitting it ourselves and
    // writing line-by-line (the obvious approach) intermittently corrupts the PDF's text-object
    // syntax on certain punctuation runs (observed with an apostrophe immediately before an em
    // dash at a wrap boundary) — a jsPDF escaping edge case, not something worth working around
    // line-by-line when the single-call form sidesteps it entirely.
    const lineCount = (this.doc.splitTextToSize(clean, maxWidth) as string[]).length;
    const lineHeight = size * 0.42;
    this.ensureSpace(lineCount * lineHeight + 1);
    this.doc.text(clean, MARGIN + indent, this.y, { maxWidth });
    this.y += lineCount * lineHeight;
  }

  bullet(value: string, opts: TextOpts = {}) {
    this.text(`•  ${value}`, { indent: 3, ...opts });
  }

  heading(value: string, opts: TextOpts = {}) {
    this.spacer(3);
    this.text(value, { size: 13, bold: true, color: COLOR.accent, ...opts });
    this.spacer(1.5);
  }

  subheading(value: string, color: RGB) {
    this.spacer(2);
    this.text(value.toUpperCase(), { size: 9.5, bold: true, color });
    this.spacer(0.5);
  }

  /**
   * A category name/status line with its mascot icon (when it loaded successfully) to the left,
   * and — mirroring the collapsed card header on-screen — the driver's own reference photo of the
   * item (first of up to 3, if any were uploaded) at the right edge of the line.
   */
  iconHeading(category: EquipmentCategory, value: string, opts: TextOpts = {}, photoDataUrl?: string, certBadges?: CertBadge[]) {
    this.spacer(1.5);
    const icon = iconDataUrlCache.get(category);
    const textX = MARGIN + (icon ? ICON_SIZE + ICON_GAP : 0);
    this.ensureSpace(ICON_SIZE);
    if (icon) {
      try {
        this.doc.addImage(icon, "PNG", MARGIN, this.y - 4.2, ICON_SIZE, ICON_SIZE);
      } catch {
        // A malformed data URL shouldn't take the whole report down — just skip this one icon.
      }
    }

    // Cert badges sit just to the left of the photo (or the right margin, with no photo) — same
    // relative order as the on-screen collapsed card header. Measure them first at their own font
    // so the label/status text on the left knows how much width to leave for them.
    const certSize = 8;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(certSize);
    const segments = (certBadges ?? []).map((b, i) => ({
      text: sanitizeForPdf(b.label) + (i < certBadges!.length - 1 ? "," : ""),
      color: b.color,
    }));
    const segmentWidths = segments.map((s) => this.doc.getTextWidth(s.text));
    const certsWidth = segmentWidths.length > 0 ? segmentWidths.reduce((a, b) => a + b, 0) + (segments.length - 1) * 1.2 : 0;

    const rightReserve = (certsWidth > 0 ? certsWidth + ICON_GAP : 0) + (photoDataUrl ? ICON_SIZE + ICON_GAP : 0);
    const maxWidth = Math.max(CONTENT_WIDTH - (textX - MARGIN) - rightReserve, 20);

    const size = opts.size ?? 10;
    this.doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...(opts.color ?? COLOR.text));
    this.doc.text(sanitizeForPdf(value), textX, this.y, { maxWidth });

    if (segments.length > 0) {
      let cx = PAGE_WIDTH - MARGIN - (photoDataUrl ? ICON_SIZE + ICON_GAP : 0) - certsWidth;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(certSize);
      segments.forEach((s, i) => {
        this.doc.setTextColor(...s.color);
        this.doc.text(s.text, cx, this.y);
        cx += segmentWidths[i] + 1.2;
      });
    }

    if (photoDataUrl) {
      try {
        this.doc.addImage(photoDataUrl, "JPEG", PAGE_WIDTH - MARGIN - ICON_SIZE, this.y - 4.2, ICON_SIZE, ICON_SIZE);
      } catch {
        // A photo the browser accepted but jsPDF can't decode shouldn't take the whole report down.
      }
    }
    this.y += Math.max(ICON_SIZE - 1, size * 0.42) + 0.8;
  }

  hr() {
    this.ensureSpace(4);
    this.doc.setDrawColor(210, 210, 210);
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    this.spacer(4);
  }

  spacer(mm = 3) {
    this.y += mm;
  }

  citation(citation: CategoryRule["citation"], confidence: CategoryRule["confidence"], indent = 3) {
    this.text(formatCitation(citation, confidence), { size: 7.5, color: COLOR.faint, italic: true, indent });
  }

  /** The "Source: ..." callout shown on-screen as a light-blue box (see SourceLine) — same treatment here. */
  sourceBox(value: string) {
    const size = 8.5;
    const padding = 2.5;
    const maxWidth = CONTENT_WIDTH - padding * 2;
    const clean = sanitizeForPdf(value);
    const lines = this.doc.splitTextToSize(clean, maxWidth) as string[];
    const lineHeight = size * 0.42;
    const boxHeight = lines.length * lineHeight + padding * 2;
    this.ensureSpace(boxHeight + 2);
    this.doc.setFillColor(224, 242, 254);
    this.doc.setDrawColor(125, 211, 252);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_WIDTH, boxHeight, 1.5, 1.5, "FD");
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(3, 105, 161);
    this.doc.text(clean, MARGIN + padding, this.y + padding + lineHeight * 0.75, { maxWidth });
    this.y += boxHeight + 3;
  }

  /** The car's own reference photo/note (Garage's carPhotoDataUrl/carNote), shown once near the top of the report — not tied to any one category. */
  carInfo(carPhotoDataUrl: string | undefined, carNote: string | undefined) {
    if (!carPhotoDataUrl && !carNote) return;
    const photoSize = 18;
    const padding = 2.5;
    const textX = MARGIN + padding + (carPhotoDataUrl ? photoSize + 3 : 0);
    const maxWidth = CONTENT_WIDTH - padding * 2 - (carPhotoDataUrl ? photoSize + 3 : 0);
    const size = 9;
    const clean = carNote ? sanitizeForPdf(carNote) : "";
    const lines = clean ? (this.doc.splitTextToSize(clean, maxWidth) as string[]) : [];
    const lineHeight = size * 0.42;
    const textHeight = Math.max(lines.length, 1) * lineHeight;
    const boxHeight = Math.max(carPhotoDataUrl ? photoSize : 0, textHeight) + padding * 2;
    this.ensureSpace(boxHeight + 2);
    this.doc.setDrawColor(80, 80, 80);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_WIDTH, boxHeight, 1.5, 1.5, "D");
    if (carPhotoDataUrl) {
      try {
        this.doc.addImage(carPhotoDataUrl, "JPEG", MARGIN + padding, this.y + padding, photoSize, photoSize);
      } catch {
        // A photo the browser accepted but jsPDF can't decode shouldn't take the whole report down.
      }
    }
    if (clean) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(size);
      this.doc.setTextColor(...COLOR.text);
      this.doc.text(clean, textX, this.y + padding + lineHeight * 0.75, { maxWidth });
    } else {
      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(size);
      this.doc.setTextColor(...COLOR.muted);
      this.doc.text("The car", textX, this.y + padding + lineHeight * 0.75, { maxWidth });
    }
    this.y += boxHeight + 3;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

/** Mirrors the on-screen header (logo + "PassTech" + page title + source-of-truth callout) so a downloaded report reads like a printout of the page it came from. */
function header(w: PdfReportWriter, logo: LogoImage | null, reportTitle: string, subtitle: string, sourceLine?: string) {
  const logoH = 12;
  if (logo) {
    const logoW = logoH * logo.aspect;
    w.doc.addImage(logo.dataUrl, "PNG", MARGIN, w.y - 1, logoW, logoH);
    w.doc.setFont("helvetica", "bold");
    w.doc.setFontSize(17);
    w.doc.setTextColor(...COLOR.text);
    w.doc.text("PassTech", MARGIN + logoW + 3, w.y + 7.5);
    w.y += logoH + 2;
  } else {
    w.text("PassTech", { size: 17, bold: true });
  }
  w.spacer(1.5);
  w.text(reportTitle, { size: 13, bold: true, color: COLOR.accent });
  w.spacer(1);
  w.text(subtitle, { size: 11, color: COLOR.muted });
  w.spacer(1);
  w.text(`Generated ${new Date().toLocaleString()} — PassTech ${BUILD_DATE} (frogracing.us)`, { size: 8, color: COLOR.faint });
  w.spacer(2);
  w.text(
    "This is a pre-screening tool, not a certification. It checks the standard number and dates entered against each sanctioning body's published rules as of the \"last reviewed\" date shown per item. A tech inspector/scrutineer still makes the final call at the event — always verify against the current official rulebook before you rely on this.",
    { size: 7.5, color: COLOR.faint, italic: true }
  );
  if (sourceLine) {
    w.spacer(2);
    w.sourceBox(sourceLine);
  }
  w.spacer(2);
  w.hr();
}

function groupTitle(ruleset: Ruleset, group: CategoryGroup): string {
  return group === "driver" && ruleset.supportsCodriver ? "Driver & Codriver Safety Gear" : GROUP_LABELS[group];
}

// ---------------------------------------------------------------------------
// Option 1 — "Check the rules" reference report
// ---------------------------------------------------------------------------

function writeReferenceCategory(w: PdfReportWriter, category: EquipmentCategory, rule: CategoryRule) {
  const meta = CATEGORY_META[category];
  w.iconHeading(category, `${meta.label}  —  ${REQUIREMENT_LABEL[rule.requirement]}`, { bold: true, size: 10.5, color: referenceRequirementColor(rule.requirement) });

  if (rule.condition) w.bullet(`Condition: ${rule.condition}`, { size: 9 });

  if (category === "helmet" && rule.fullFaceRequirement) {
    const base = rule.fullFaceRequirement === "required" ? "Full-face helmet required." : "Full-face helmet required in some cases.";
    w.bullet(`${base}${rule.fullFaceCondition ? ` ${rule.fullFaceCondition}` : ""}`, { size: 9 });
  }

  if (meta.hybrid && rule.materialOnlyAccepted) {
    const base = meta.materialOnlyDescription ?? "Plain fire-resistant material accepted, no certification required.";
    w.bullet(`${base}${rule.materialNote ? ` ${rule.materialNote}` : ""}`, { size: 9 });
  } else if (!meta.hybrid && rule.materialNote) {
    w.bullet(rule.materialNote, { size: 9 });
  }

  if (category === "seat" && rule.seatRailsForbidden) {
    w.bullet("Seat rails/sliders aren't allowed — the seat must be fixed-mounted.", { size: 9 });
  }

  if (category === "fire_extinguisher" && rule.fireExtinguisherOptions) {
    w.bullet(`Needs ${describeExtinguisherOptions(rule.fireExtinguisherOptions)}.`, { size: 9 });
  }

  if (category === "rollover_protection") {
    if (rule.rolloverProtectionByBodyStyle) {
      (Object.entries(rule.rolloverProtectionByBodyStyle) as [CarBodyStyle, RequirementLevel][]).forEach(([style, level]) => {
        w.bullet(`${bodyStyleLabel(style)}: ${REQUIREMENT_LABEL[level]}`, { size: 9 });
      });
    }
    if (rule.rolloverProtectionFactoryExempt) {
      w.bullet("A convertible with OEM/factory-installed rollover protection is exempt from needing an aftermarket cage/bar.", { size: 9 });
    }
    if (rule.rolloverProtectionRequiresFullCage) w.bullet("A rollbar/half-cage isn't accepted — a full multi-point cage is required.", { size: 9 });
    if (rule.rolloverProtectionRequiresWelded) w.bullet("Bolt-together tube joints aren't accepted — welded joints are required.", { size: 9 });
    if (rule.rolloverProtectionRequiresWeldedPlates) {
      w.bullet("Bolted mounting/foot plates aren't accepted — plates must be welded to the chassis.", { size: 9 });
    }
    if (rule.rolloverProtectionRequiresLogbook) {
      const issuers = rule.rolloverProtectionAcceptedLogbookBodies;
      w.bullet(`A cage logbook is required.${issuers && issuers.length > 0 ? ` Recognized issuers: ${issuers.map(logbookBodyLabel).join(", ")}.` : ""}`, {
        size: 9,
      });
    } else if (rule.rolloverProtectionAcceptedLogbookBodies && rule.rolloverProtectionAcceptedLogbookBodies.length > 0) {
      w.bullet(`Recognized logbook issuers: ${rule.rolloverProtectionAcceptedLogbookBodies.map(logbookBodyLabel).join(", ")}.`, { size: 9 });
    }
    if (rule.rolloverProtectionTubingSpec && rule.rolloverProtectionTubingSpec.length > 0) {
      rule.rolloverProtectionTubingSpec.forEach((tier) => {
        const sizes = tier.minSizes.map((s) => `${s.outerDiameterIn}"×${s.wallThicknessIn}"`).join(" or ");
        const label = tier.underWeightLbs ? `Under ${tier.underWeightLbs} lbs` : "At and above the heaviest bracket";
        w.bullet(`${label}: ${sizes}${tier.materialNote ? ` (${tier.materialNote})` : ""}`, { size: 9 });
      });
    }
    if (rule.rolloverProtectionLogbookCutoffYear) {
      w.bullet(
        `Cages logbooked/built ${rule.rolloverProtectionLogbookCutoffYear} or later (or FIA-homologated) are accepted as-is; older cages typically need a retrofit/grandfathering step.`,
        { size: 9 }
      );
    }
  }

  if (rule.acceptedStandards && rule.acceptedStandards.length > 0) {
    w.text("Accepted certifications:", { size: 9, color: COLOR.muted, indent: 3 });
    rule.acceptedStandards.forEach((a) => {
      const detail = acceptanceDetail(a);
      w.bullet(`${standardLabel(a.standardId)}${detail ? ` (${detail})` : ""}`, { size: 8.5, indent: 6 });
    });
  }

  if (rule.requirement !== "not_addressed") {
    const accepted = new Set((rule.acceptedStandards ?? []).map((a) => a.standardId));
    const notAccepted = standardsFor(category).filter((s) => !accepted.has(s.id));
    if (notAccepted.length > 0) {
      w.bullet(`Not accepted: ${notAccepted.map((s) => s.label).join(", ")}`, { size: 8, color: COLOR.faint });
    }
  }

  if (rule.notes) w.bullet(rule.notes, { size: 8.5, color: COLOR.muted });

  w.citation(rule.citation, rule.confidence);
}

/** Option 1 ("Check the rules") — the requirements for every category of a body/class, with no user equipment involved. */
export async function downloadReferenceReport(ruleset: Ruleset, classId: string | undefined, activeGroups: ReadonlySet<CategoryGroup>) {
  const effective = effectiveCategories(ruleset, classId);
  const categories = filterCategoriesByGroups(CATEGORY_ORDER.filter((c) => effective[c]), activeGroups);
  const [, logo] = await Promise.all([preloadCategoryIcons(categories), loadLogo()]);

  const w = new PdfReportWriter();
  header(w, logo, "Sanctioning Body Requirements", `${ruleset.bodyName} — ${ruleset.disciplineName}`, formatSourceLine(ruleset));

  const sections: { group: CategoryGroup; categories: EquipmentCategory[] }[] = [];
  categories.forEach((category) => {
    const group = CATEGORY_META[category].group;
    const last = sections[sections.length - 1];
    if (last && last.group === group) last.categories.push(category);
    else sections.push({ group, categories: [category] });
  });

  sections.forEach(({ group, categories: cats }) => {
    w.subheading(groupTitle(ruleset, group), GROUP_COLOR[group]);
    const sorted = [...cats].sort((a, b) => referenceOrderRank(effective[a]!.requirement) - referenceOrderRank(effective[b]!.requirement));
    sorted.forEach((category) => writeReferenceCategory(w, category, effective[category]!));
  });

  w.save(`passtech-reference-${ruleset.id}.pdf`);
}

// ---------------------------------------------------------------------------
// Shared: one category's evaluated result, driver or codriver
// ---------------------------------------------------------------------------

function writeCategoryResult(w: PdfReportWriter, result: CategoryResult, entry?: EquipmentEntry) {
  const meta = CATEGORY_META[result.category];
  const color = resultStatusColor(result.status, result.requirement);
  const certBadges = entry ? summarizeEntryCerts(result.category, entry, result) : [];
  w.iconHeading(
    result.category,
    `${meta.label}  —  ${resultStatusLabel(result.status, result.requirement)}`,
    { bold: true, size: 10, color },
    entry?.photoDataUrls?.[0],
    certBadges
  );
  w.text(result.reason, { size: 8.5, color: COLOR.muted, indent: 3 });
  result.certBreakdown?.forEach((c) => {
    w.bullet(`${c.label}: ${STATUS_LABEL[c.status]} — ${c.reason}`, { size: 8, indent: 6, color: COLOR.faint });
  });
  result.pieceBreakdown?.forEach((p) => {
    w.bullet(`${p.label}: ${STATUS_LABEL[p.status]} — ${p.reason}`, { size: 8, indent: 6, color: COLOR.faint });
  });
  w.citation(result.citation, result.confidence);
}

/** categories present in `results`, ordered OK → required/missing → conditional/unresolved → not required. */
function sortedResultCategories(results: CategoryResults): EquipmentCategory[] {
  return sortByResultRank(
    CATEGORY_ORDER.filter((c) => results[c]),
    results
  );
}

function writeResultsByGroup(
  w: PdfReportWriter,
  ruleset: Ruleset,
  results: CategoryResults,
  perOccupantAsDriverGroup: boolean,
  entries?: Partial<Record<EquipmentCategory, EquipmentEntry>>
) {
  const groupFor = (category: EquipmentCategory): CategoryGroup =>
    perOccupantAsDriverGroup && isPerOccupantCategory(category) ? "driver" : CATEGORY_META[category].group;

  const sections: { group: CategoryGroup; categories: EquipmentCategory[] }[] = [];
  CATEGORY_ORDER.forEach((category) => {
    const result = results[category];
    if (!result) return;
    const group = groupFor(category);
    const last = sections[sections.length - 1];
    if (last && last.group === group) last.categories.push(category);
    else sections.push({ group, categories: [category] });
  });

  sections.forEach(({ group, categories }) => {
    w.subheading(groupTitle(ruleset, group), GROUP_COLOR[group]);
    sortByResultRank(categories, results).forEach((category) => writeCategoryResult(w, results[category]!, entries?.[category]));
  });
}

/** Every category actually present in a report, across the driver/codriver result sets — used to preload only the icons a given report will actually draw. */
function categoriesIn(...resultSets: (CategoryResults | undefined)[]): EquipmentCategory[] {
  const set = new Set<EquipmentCategory>();
  resultSets.forEach((results) => {
    if (!results) return;
    (Object.keys(results) as EquipmentCategory[]).forEach((c) => set.add(c));
  });
  return [...set];
}

// ---------------------------------------------------------------------------
// Option 2 — "Will my equipment pass tech?" report
// ---------------------------------------------------------------------------

/** The on-screen PassTech verdict box, as a PDF section: which specific items are causing a Fail or Conditional verdict, grouped the same way as the full breakdown below it. */
function writeVerdictSummary(
  w: PdfReportWriter,
  ruleset: Ruleset,
  results: CategoryResults,
  codriverResults: CategoryResults | undefined,
  perOccupantAsDriverGroup: boolean
) {
  const toEntries = (r: CategoryResults, isCodriver: boolean) =>
    (Object.keys(r) as EquipmentCategory[]).map((category) => ({ category, result: r[category]!, isCodriver }));
  const entries = [...toEntries(results, false), ...toEntries(codriverResults ?? {}, true)];
  const violations = entries.filter(({ result }) => isViolation(result));
  const pending = entries.filter(({ result }) => isPendingConditional(result));
  const list = violations.length > 0 ? violations : pending.length > 0 ? pending : [];
  if (list.length === 0) return;

  const driverGroupFor = (category: EquipmentCategory): CategoryGroup =>
    perOccupantAsDriverGroup && isPerOccupantCategory(category) ? "driver" : CATEGORY_META[category].group;

  const driverList = list.filter((i) => !i.isCodriver);
  const codriverList = list.filter((i) => i.isCodriver);

  const sections = [
    { label: groupTitle(ruleset, "driver"), color: GROUP_COLOR.driver, items: driverList.filter((i) => driverGroupFor(i.category) === "driver") },
    ...(codriverList.length > 0 ? [{ label: "Codriver Safety Gear", color: COLOR.teal, items: codriverList }] : []),
    { label: GROUP_LABELS.car, color: GROUP_COLOR.car, items: driverList.filter((i) => driverGroupFor(i.category) === "car") },
    { label: GROUP_LABELS.rollcage, color: GROUP_COLOR.rollcage, items: driverList.filter((i) => driverGroupFor(i.category) === "rollcage") },
  ].filter((s) => s.items.length > 0);

  w.heading(violations.length > 0 ? "Items causing the FAIL verdict" : "Items pending / conditional", { color: violations.length > 0 ? COLOR.red : COLOR.amber });
  sections.forEach(({ label, color, items }) => {
    w.subheading(label, color);
    items.forEach(({ category, result }) => {
      w.bullet(`${CATEGORY_META[category].label}: ${result.reason}`, { size: 9 });
    });
  });
  w.spacer(2);
  w.hr();
}

export async function downloadBodyFirstReport(
  ruleset: Ruleset,
  results: CategoryResults,
  hasCodriver: boolean,
  codriverResults: CategoryResults | undefined,
  perOccupantAsDriverGroup: boolean,
  entries?: Partial<Record<EquipmentCategory, EquipmentEntry>>,
  codriverEntries?: Partial<Record<EquipmentCategory, EquipmentEntry>>,
  carPhotoDataUrl?: string,
  carNote?: string
) {
  const [, logo] = await Promise.all([preloadCategoryIcons(categoriesIn(results, codriverResults)), loadLogo()]);

  const w = new PdfReportWriter();
  header(w, logo, "Will My Equipment Pass Tech?", `${ruleset.bodyName} — ${ruleset.disciplineName}`, formatSourceLine(ruleset));
  w.carInfo(carPhotoDataUrl, carNote);

  const resultValues = [
    ...(Object.values(results) as CategoryResult[]),
    ...(Object.values(codriverResults ?? {}) as CategoryResult[]),
  ];
  const violations = resultValues.filter(isViolation);
  const pending = resultValues.filter(isPendingConditional);
  const verdict = violations.length > 0 ? "Fail — required equipment is missing or non-compliant" : pending.length > 0 ? "Conditional — some items depend on your car/class" : "Pass";
  const verdictColor = violations.length > 0 ? COLOR.red : pending.length > 0 ? COLOR.amber : COLOR.green;
  w.text(`PassTech verdict: ${verdict}`, { size: 12, bold: true, color: verdictColor });
  w.spacer(3);

  writeVerdictSummary(w, ruleset, results, codriverResults, perOccupantAsDriverGroup);

  w.heading("Driver & Car Safety Gear");
  writeResultsByGroup(w, ruleset, results, perOccupantAsDriverGroup, entries);

  if (hasCodriver && codriverResults && Object.keys(codriverResults).length > 0) {
    w.heading("Codriver Safety Gear", { color: COLOR.teal });
    sortedResultCategories(codriverResults).forEach((category) => writeCategoryResult(w, codriverResults[category]!, codriverEntries?.[category]));
  }

  w.save(`passtech-tech-check-${ruleset.id}.pdf`);
}

// ---------------------------------------------------------------------------
// Option 3 — "Where can my equipment race?" report
// ---------------------------------------------------------------------------

export interface EquipmentFirstReportItem {
  rs: Ruleset;
  results: CategoryResults;
  codriverResults?: CategoryResults;
  status: "eligible" | "eligible_conditional" | "not_eligible";
  needsMoreGear?: boolean;
}

const ELIGIBILITY_SECTION: { status: EquipmentFirstReportItem["status"]; title: string; color: RGB }[] = [
  { status: "eligible", title: "Eligible", color: COLOR.green },
  { status: "eligible_conditional", title: "Eligible under condition", color: COLOR.amber },
  { status: "not_eligible", title: "Does not meet the requirements", color: COLOR.red },
];

/** Option 3 ("Where can my equipment race?") — every ruleset's eligibility for the one set of equipment entered, grouped the same way as the on-screen results. */
export async function downloadEquipmentFirstReport(
  items: EquipmentFirstReportItem[],
  onlyHaveEquipment: boolean,
  entries?: Partial<Record<EquipmentCategory, EquipmentEntry>>,
  codriverEntries?: Partial<Record<EquipmentCategory, EquipmentEntry>>,
  carPhotoDataUrl?: string,
  carNote?: string
) {
  const allCategories = new Set<EquipmentCategory>();
  items.forEach((i) => categoriesIn(i.results, i.codriverResults).forEach((c) => allCategories.add(c)));
  const [, logo] = await Promise.all([preloadCategoryIcons([...allCategories]), loadLogo()]);

  const w = new PdfReportWriter();
  header(w, logo, "Where Can My Equipment Race?", onlyHaveEquipment ? "Checked against the equipment you have entered only" : "Checked against every category, entered or not");
  w.carInfo(carPhotoDataUrl, carNote);

  ELIGIBILITY_SECTION.forEach(({ status, title, color }) => {
    const group = items.filter((i) => i.status === status);
    if (group.length === 0) return;
    w.heading(`${title} (${group.length})`, { color });
    group.forEach(({ rs, results, codriverResults, needsMoreGear }) => {
      w.spacer(2);
      w.text(`${rs.bodyName} — ${rs.disciplineName}${needsMoreGear ? "  [additional equipment required to compete]" : ""}`, {
        bold: true,
        size: 10.5,
      });
      w.text(formatSourceLine(rs), { size: 7.5, color: COLOR.faint, italic: true });
      writeResultsByGroup(w, rs, results, false, entries);
      if (codriverResults && Object.keys(codriverResults).length > 0) {
        w.subheading("Codriver", COLOR.teal);
        sortedResultCategories(codriverResults).forEach((category) => writeCategoryResult(w, codriverResults[category]!, codriverEntries?.[category]));
      }
      w.hr();
    });
  });

  w.save("passtech-eligibility-report.pdf");
}
