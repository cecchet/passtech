import { ExtinguisherUnit } from "@/lib/matcher";

/** Raw shape of a /api/analyze-extinguisher response. */
export interface ExtinguisherVisionResult {
  classARating: number;
  bcRating: number;
  weightLbs: number;
  manufactureDate: string;
  certificationDate: string;
  certificationDueDate: string;
  hasMetalBracket: "yes" | "no" | "unclear";
  metalStrapCount: number;
  hasAntiTorpedoTabs: "yes" | "no" | "unclear";
  confidence: "high" | "medium" | "low";
  notes: string;
}

/**
 * Maps a raw vision result onto an ExtinguisherUnit patch — shared by every caller
 * (ExtinguisherLabelScan, QuickItemScan, TagOnlyScan) so the yes/no/unclear and 0-as-sentinel
 * handling lives in exactly one place. "unclear" and 0 both mean "not answered by this photo" and
 * are left out of the patch entirely, same as an unanswered field the user hasn't gotten to yet.
 */
export function extinguisherPatchFromVision(result: ExtinguisherVisionResult): Partial<Omit<ExtinguisherUnit, "photoDataUrls" | "key">> {
  return {
    ...(result.classARating ? { classARating: result.classARating } : {}),
    ...(result.bcRating ? { bcRating: result.bcRating } : {}),
    ...(result.weightLbs ? { weightLbs: result.weightLbs } : {}),
    ...(result.manufactureDate ? { manufactureDate: result.manufactureDate } : {}),
    ...(result.certificationDate ? { certificationDate: result.certificationDate } : {}),
    ...(result.certificationDueDate ? { certificationDueDate: result.certificationDueDate } : {}),
    ...(result.hasMetalBracket !== "unclear" ? { hasMetalBracket: result.hasMetalBracket === "yes" } : {}),
    ...(result.metalStrapCount ? { metalStrapCount: result.metalStrapCount } : {}),
    ...(result.hasAntiTorpedoTabs !== "unclear" ? { hasAntiTorpedoTabs: result.hasAntiTorpedoTabs === "yes" } : {}),
  };
}

/** Short human-readable summary of everything a vision result actually found, for display before the user applies it. */
export function extinguisherVisionSummary(result: ExtinguisherVisionResult): string {
  return [
    result.classARating || result.bcRating ? `${result.classARating ? `${result.classARating}-A:` : ""}${result.bcRating ? `${result.bcRating}-B:C` : ""}` : null,
    result.weightLbs ? `${result.weightLbs} lb` : null,
    result.manufactureDate ? `mfg ${result.manufactureDate}` : null,
    result.certificationDate ? `serviced ${result.certificationDate}` : null,
    result.certificationDueDate ? `due ${result.certificationDueDate}` : null,
    result.hasMetalBracket !== "unclear" ? `${result.hasMetalBracket === "yes" ? "metal" : "non-metal"} bracket` : null,
    result.metalStrapCount ? `${result.metalStrapCount} strap${result.metalStrapCount === 1 ? "" : "s"}` : null,
    result.hasAntiTorpedoTabs !== "unclear" ? `anti-torpedo tabs: ${result.hasAntiTorpedoTabs}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}
