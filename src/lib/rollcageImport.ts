import { maxPhotosFor } from "@/data/categoryMeta";
import { NOT_LISTED } from "@/data/standards";
import { downscaleDataUrl } from "@/lib/imageResize";
import type { EquipmentEntry } from "@/lib/matcher";

/**
 * A rollcage file -- exported from the Rollcage assessment tool (rollcage.frogracing.us) or from
 * Digital logbooks (logbook.frogracing.us), the same JSON format in both -- read into a car's
 * rollover protection entry: what the cage's checklist answers tell PassTech (full cage or roll
 * bar, welded joints and feet, the primary tubing, FIA homologation, the car's weight), its
 * logbook if it has one, the car itself, and a few of its pictures.
 */

/** Rollcage app sanctioning body keys (vehicle.org) -> ROLLOVER_LOGBOOK_BODIES ids. */
const LOGBOOK_BODY_BY_ORG: Record<string, string> = {
  fia: "fia",
  "fia-passport": "fia",
  ara: "ara",
  cars: "cars",
  "cars-rally-sprint": "cars",
  nasa: "nasa-rallysport",
  "nasa-road-racing": "nasa",
  "scca-prorally": "scca-prorally",
  "scca-road-racing": "scca",
  "rally-america": "rally-america",
};

/** The rollover protection photos kept, at most. */
const MAX_CAGE_PHOTOS = maxPhotosFor("rollover_protection");

interface RollcageAnswer {
  value?: unknown;
}
interface RollcageFile {
  exportedFrom?: string;
  vehicle?: { name?: string; org?: string; logbookDate?: string; server?: { digitalNumber?: string } };
  answers?: Record<string, RollcageAnswer>;
  pictures?: { id?: string; category?: string }[];
  vehiclePhotos?: { front?: { id?: string } | null; rear?: { id?: string } | null };
  images?: Record<string, { photo?: string }>;
}

export interface RollcageImport {
  /** The fields it sets on the rollover protection entry. */
  patch: Partial<EquipmentEntry>;
  /** The car's 3/4 front photo, if the file has one. */
  carPhotoDataUrl?: string;
  /** What was read, for the person to check. */
  found: string[];
}

function dimInches(d: unknown): number | undefined {
  const dim = d as { val?: string | number; unit?: string } | undefined;
  const v = dim ? parseFloat(String(dim.val ?? "")) : NaN;
  if (isNaN(v) || v <= 0) return undefined;
  return +(dim!.unit === "mm" ? v / 25.4 : v).toFixed(3);
}

/** Throws (with a message to show) when the text isn't a rollcage file. */
export function parseRollcageFile(json: string): RollcageImport {
  let data: RollcageFile;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("This file isn't a rollcage file (it isn't JSON).");
  }
  if (!data || typeof data !== "object" || !data.answers || typeof data.answers !== "object") {
    throw new Error("This file isn't a rollcage file: export one from the Rollcage assessment tool or Digital logbooks (Export to a file).");
  }
  const answers = data.answers;
  const value = (id: string) => answers[id]?.value;
  const text = (id: string) => {
    const v = value(id);
    return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
  };
  const patch: Partial<EquipmentEntry> = {};
  const found: string[] = [];

  const car = [text("vehicle_year"), text("vehicle_manufacturer"), text("vehicle_model")].filter(Boolean).join(" ");
  const vin = text("vehicle_vin");
  if (car || vin) {
    patch.cageCar = { make: text("vehicle_manufacturer") || undefined, model: text("vehicle_model") || undefined, year: text("vehicle_year") || undefined, vin: vin || undefined };
    found.push([car || "The car", vin ? `VIN ${vin}` : ""].filter(Boolean).join(", "));
  }

  if (value("homologation_route") === "homologated") {
    patch.fiaHomologated = true;
    found.push("FIA/ASN homologated");
  } else if (value("homologation_route") === "fabricated") patch.fiaHomologated = false;

  const layout = value("main_structure_layout");
  if (layout) {
    patch.cageType = layout === "half-rollcage" ? "rollbar" : "full_cage";
    found.push(patch.cageType === "rollbar" ? "Roll bar / half cage" : "Full cage");
  }

  // Bolt-together joints: the bodies that ban them ask whether the cage is fully welded.
  const welded = ["no_bolt_together", "mounting_method"].map(value).filter(Boolean);
  if (welded.includes("yes")) patch.cageMountType = "welded";
  else if (welded.includes("no")) patch.cageMountType = "bolt_in";
  if (patch.cageMountType) found.push(patch.cageMountType === "welded" ? "Welded joints" : "Bolt-together joints");

  const feet = Object.keys(answers)
    .filter((k) => /^mounting_feet_design__.+__mount_type$/.test(k))
    .map((k) => value(k))
    .filter(Boolean);
  if (feet.includes("bolted")) patch.cagePlateMountType = "bolted";
  else if (feet.length && feet.every((t) => t === "welded")) patch.cagePlateMountType = "welded";
  if (patch.cagePlateMountType) found.push(`Mounting plates ${patch.cagePlateMountType}`);

  const tube = value("primary_tubing") as { diameter?: unknown; thickness?: unknown } | undefined;
  const od = dimInches(tube?.diameter), wall = dimInches(tube?.thickness);
  if (od && wall) {
    patch.cageTubeOuterDiameterIn = od;
    patch.cageTubeWallThicknessIn = wall;
    found.push(`Main structure tubing ${od}" x ${wall}"`);
  }

  const weight = value("vehicle_weight") as { value?: string | number; unit?: string } | undefined;
  const w = weight ? parseFloat(String(weight.value ?? "")) : NaN;
  if (!isNaN(w) && w > 0) {
    patch.carWeightLbs = Math.round(weight!.unit === "lb" ? w : w * 2.20462);
    found.push(`Car weight ${patch.carWeightLbs} lbs`);
  }

  // Its logbook: a logbook number, or a digital logbook's number.
  const number = text("vehicle_logbook_number");
  const digital = data.vehicle?.server?.digitalNumber;
  const org = data.vehicle?.org;
  if (number || digital) {
    if (org && org !== "none") {
      patch.cageLogbookBody = LOGBOOK_BODY_BY_ORG[org] ?? NOT_LISTED;
      if (patch.cageLogbookBody === NOT_LISTED) patch.cageLogbookBodyCustom = org;
    }
    if (number) patch.cageLogbookNumber = number;
    if (digital) patch.cageDigitalLogbook = digital;
    const year = parseInt((data.vehicle?.logbookDate ?? "").slice(0, 4), 10);
    if (year > 1900) patch.cageLogbookYear = year;
    found.push(["Logbook", number, digital ? `digital logbook ${digital}` : "", patch.cageLogbookYear ? `(${patch.cageLogbookYear})` : ""].filter(Boolean).join(" "));
  }

  // Pictures: the overview ones first, then the rest.
  const images = data.images ?? {};
  const pics = (data.pictures ?? []).slice().sort((a, b) => Number(b.category === "overview") - Number(a.category === "overview"));
  const photos = pics.map((p) => (p.id ? images[p.id]?.photo : undefined)).filter((p): p is string => typeof p === "string" && p.startsWith("data:image/"));
  if (photos.length) {
    patch.photoDataUrls = photos.slice(0, MAX_CAGE_PHOTOS);
    found.push(`${patch.photoDataUrls.length} rollcage picture${patch.photoDataUrls.length > 1 ? "s" : ""}`);
  }
  const front = data.vehiclePhotos?.front?.id;
  const carPhotoDataUrl = front && images[front]?.photo?.startsWith("data:image/") ? images[front].photo : undefined;

  patch.cageImport = { from: data.exportedFrom || "Rollcage assessment tool", name: data.vehicle?.name || car || undefined, importedAt: new Date().toISOString() };
  return { patch, carPhotoDataUrl, found };
}

/** A rollcage file read into `entry` (the car's rollover protection, if it has one yet): its
 * pictures shrunk and added after the entry's own, and a body style when the entry has none. */
export async function importRollcageFile(json: string, entry?: EquipmentEntry): Promise<RollcageImport> {
  const r = parseRollcageFile(json);
  const shrink = (p: string) => downscaleDataUrl(p, 1600, 0.82).catch(() => p);
  if (r.patch.photoDataUrls) {
    const small = await Promise.all(r.patch.photoDataUrls.map(shrink));
    r.patch.photoDataUrls = [...(entry?.photoDataUrls ?? []), ...small].slice(0, MAX_CAGE_PHOTOS);
  }
  if (r.carPhotoDataUrl) r.carPhotoDataUrl = await shrink(r.carPhotoDataUrl);
  // The rollcage file has no body style; a caged car is almost always closed-roof.
  if (!entry?.bodyStyle) {
    r.patch.bodyStyle = "closed_roof";
    r.found.push("Body style: closed roof (change it if not)");
  }
  return r;
}

/** Whether a file's text looks like a rollcage file rather than a PassTech export. */
export function isRollcageFile(json: string): boolean {
  try {
    const data = JSON.parse(json);
    return !!data && typeof data === "object" && !Array.isArray(data) && !!data.answers && typeof data.answers === "object";
  } catch {
    return false;
  }
}
