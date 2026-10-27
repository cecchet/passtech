"use client";

import { useEffect, useState } from "react";
import { EquipmentCategory } from "@/data/types";
import { CATEGORY_META, maxPhotosFor } from "@/data/categoryMeta";
import { QrIcon } from "@/components/icons/QrIcon";
import { ENTRY_PHOTO_KEYS, EquipmentEntry } from "@/lib/matcher";
import { dataUrlToBytes, sha256Hex, stripEntryPhotos } from "@/lib/techSheet";
import { downscaleDataUrl } from "@/lib/imageResize";
import { downloadTechSheetPhoto, getSession, onAuthChange, uploadTechSheetPhoto } from "@/lib/techSheetServer";
import {
  StickerApplication,
  StickerBody,
  StickerView,
  applicationIsFor,
  fetchMyStickerApplications,
  fetchSticker,
  fetchStickerBodies,
  formatStickerCode,
  stickerEntry,
  stickerMismatch,
  stickerStatusLine,
  submitStickerApplication,
  withdrawStickerApplication,
} from "@/lib/stickers";
import { StickerScan } from "@/components/StickerScan";
import { TechSheetSignIn } from "@/components/TechSheetSignIn";
import type { ScannedPhoto } from "@/components/EquipmentForm";

const smallButton = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50";

/** The item's photos for an application, with their role: its pictures (and the pants') as the whole
 * item, its tag pictures as the tag. An extinguisher's are on its units, the first of each the whole
 * unit and the others its label -- those the driver can re-mark (`fixed` false). */
function applicationPhotos(category: EquipmentCategory, entry: EquipmentEntry): { url: string; kind: "item" | "tag"; fixed: boolean }[] {
  if (category === "fire_extinguisher") {
    return (entry.extinguisherUnits ?? []).flatMap((u) => (u.photoDataUrls ?? []).map((url, i) => ({ url, kind: i === 0 ? ("item" as const) : ("tag" as const), fixed: false })));
  }
  const as = (urls: string[] | undefined, kind: "item" | "tag") => (urls ?? []).map((url) => ({ url, kind, fixed: true }));
  return [...as(entry.photoDataUrls, "item"), ...as(entry.pantsPhotoDataUrls, "item"), ...as(entry.tagPhotoDataUrls, "tag"), ...as(entry.pantsTagPhotoDataUrls, "tag")];
}

/** Whether the item has the photos an application needs: one of the whole item, one of its tag. */
function photosReady(category: EquipmentCategory, entry: EquipmentEntry): boolean {
  const photos = applicationPhotos(category, entry);
  return photos.some((p) => p.kind === "item") && photos.some((p) => p.kind === "tag");
}

/** What a sticker says about the gear, as a patch for this item (its details, not its photos). */
function detailsFrom(v: StickerView): Partial<EquipmentEntry> {
  const e = stickerEntry(v)?.entry;
  if (!e) return {};
  const rest: Partial<EquipmentEntry> = { ...e };
  delete rest.category;
  ENTRY_PHOTO_KEYS.forEach((k) => delete rest[k]);
  return rest;
}

/** The item's photos with the sticker's added -- the whole item's to its pictures, the tag's to its
 * tag pictures (an extinguisher's all to its first unit, the whole unit first), none twice, up to the
 * category's limit. Returns the patch for the entry. */
async function withStickerPhotos(category: EquipmentCategory, entry: EquipmentEntry, photos: ScannedPhoto[]): Promise<Partial<EquipmentEntry>> {
  const units = entry.extinguisherUnits ?? [];
  const unitWise = category === "fire_extinguisher";
  if (unitWise && units.length === 0) return {};
  const all = unitWise ? units[0].photoDataUrls ?? [] : ENTRY_PHOTO_KEYS.flatMap((k) => entry[k] ?? []);
  const seen = new Set(await Promise.all(all.map((u) => sha256Hex(dataUrlToBytes(u)))));
  // The new photos among `from` added to a list.
  const add = async (list: string[], from: ScannedPhoto[]) => {
    const next = [...list];
    for (const p of from) {
      if (next.length >= maxPhotosFor(category)) break;
      const sha = await sha256Hex(dataUrlToBytes(p.dataUrl));
      if (seen.has(sha)) continue;
      seen.add(sha);
      next.push(p.dataUrl);
    }
    return next;
  };
  const items = photos.filter((x) => x.kind !== "tag");
  const tags = photos.filter((x) => x.kind === "tag");
  if (unitWise) {
    const next = await add(units[0].photoDataUrls ?? [], [...items, ...tags]);
    return { extinguisherUnits: units.map((u, i) => (i === 0 ? { ...u, photoDataUrls: next } : u)) };
  }
  return { photoDataUrls: await add(entry.photoDataUrls ?? [], items), tagPhotoDataUrls: await add(entry.tagPhotoDataUrls ?? [], tags) };
}

/**
 * An item's tech sticker (a season sticker from a sanctioning body, see lib/stickers.ts): link one
 * by scanning its QR code -- an empty item takes its details from it -- and, in My gear, apply
 * for an annual sticker with the item's details and photos.
 *   onChange(patch, photos): the patch for the entry; photos (scanPhotos only): the sticker's own
 *   photos, for a tech sheet line to keep.
 */
export function GearSticker({
  category,
  entry,
  onChange,
  allowApply,
  scanPhotos,
}: {
  category: EquipmentCategory;
  entry: EquipmentEntry;
  onChange: (patch: Partial<EquipmentEntry>, photos?: ScannedPhoto[]) => void;
  allowApply?: boolean;
  scanPhotos?: boolean;
}) {
  const code = entry.stickerCode;
  const [view, setView] = useState<StickerView | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  // The driver's applications for this kind of gear (My gear, signed in).
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [mine, setMine] = useState<StickerApplication[]>([]);
  const loadMine = () =>
    fetchMyStickerApplications().then(
      (list) => setMine(list.filter((a) => a.category === category)),
      () => {}
    );
  useEffect(() => {
    if (!allowApply) return;
    getSession().then((s) => setSignedIn(!!s), () => setSignedIn(false));
    return onAuthChange((s) => setSignedIn(!!s));
  }, [allowApply]);
  useEffect(() => {
    if (allowApply && signedIn) loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowApply, signedIn]);

  useEffect(() => {
    let live = true;
    if (code) fetchSticker(code).then((v) => live && setView(v), () => live && setView(null));
    return () => {
      live = false;
    };
  }, [code]);

  const hasDetails = (entry.certifications ?? []).some((c) => c.standardId) || (entry.extinguisherUnits ?? []).length > 0;
  // An annual sticker's application needs the item's details and a photo of the whole item and one of
  // its tag: until then, what's missing instead of the button.
  const missing = [
    hasDetails ? null : category === "fire_extinguisher" ? "the extinguisher's details" : "its certification",
    photosReady(category, entry) ? null : "a picture of the whole item and one of its certification tag",
  ].filter(Boolean);
  const canApply = allowApply && missing.length === 0;
  const link = async (v: StickerView, useDetails: boolean) => {
    const wrong = stickerMismatch(v, category);
    if (wrong) {
      setMessage(wrong);
      return;
    }
    setScanning(false);
    setMessage(null);
    setView(v);
    let photos: ScannedPhoto[] | undefined;
    if (scanPhotos || useDetails) {
      photos = [];
      for (const p of v.snapshot.photos ?? []) {
        const dataUrl = await downloadTechSheetPhoto(p.sha256);
        if (dataUrl) photos.push({ dataUrl, kind: p.kind === "tag" ? "tag" : "item" });
      }
    }
    const patch: Partial<EquipmentEntry> = { ...(useDetails ? detailsFrom(v) : {}), stickerCode: v.code };
    // Using its details in My gear: the sticker's photos come onto the item too (a tech sheet line
    // keeps them as the line's own -- scanPhotos).
    if (useDetails && !scanPhotos && photos?.length) Object.assign(patch, await withStickerPhotos(category, { ...entry, ...patch }, photos));
    onChange(patch, scanPhotos ? photos : undefined);
  };

  return (
    <div className="flex flex-col gap-2 rounded border border-dashed border-neutral-600 p-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-neutral-300">Tech sticker:</span>
        {code ? (
          <>
            <span className={`rounded-full border px-2 py-0.5 ${view?.status === "valid" ? "border-emerald-700 text-emerald-300" : view ? "border-red-700 text-red-300" : "border-neutral-600 text-neutral-300"}`}>
              {formatStickerCode(code)}
              {view ? ` · ${stickerStatusLine(view)}` : ""}
            </span>
            {view && hasDetails && (
              <button type="button" className={smallButton} onClick={() => link(view, true)} title="Replace this item's details with the sticker's, and add its photos">
                Use its details
              </button>
            )}
            <button type="button" className={smallButton} onClick={() => onChange({ stickerCode: undefined })}>
              Unlink
            </button>
          </>
        ) : (
          <button type="button" className={smallButton} onClick={() => setScanning(!scanning)}>
            {scanning ? (
              "Cancel"
            ) : (
              <span className="inline-flex items-center gap-1">
                <QrIcon /> Scan its tech sticker
              </span>
            )}
          </button>
        )}
        {canApply && (
          <button type="button" className={smallButton} onClick={() => setApplying(!applying)}>
            {applying ? "Close the application" : "Apply for an annual tech sticker"}
          </button>
        )}
      </div>
      {allowApply && !code && missing.length > 0 && <p className="text-neutral-500">To apply for an annual tech sticker, add {missing.join(" and ")}.</p>}
      {scanning && !code && <StickerScan bare title="" onScanned={(v) => link(v, !hasDetails)} />}
      {message && <p className="text-red-300">{message}</p>}
      {applying && canApply ? (
        <ApplyForSticker category={category} entry={entry} signedIn={signedIn} mine={mine} loadMine={loadMine} onLink={(v) => link(v, false)} />
      ) : (
        // (The application closed, or the item no longer complete: this item's applications stay listed.)
        allowApply && (
          <ApplicationList
            list={mine.filter((a) => applicationIsFor(a, entry) || (!!a.stickerCode && a.stickerCode === code))}
            entry={entry}
            reload={loadMine}
            onLink={(v) => link(v, false)}
          />
        )
      )}
    </div>
  );
}

/** The driver's annual sticker applications (signed in): status, the sticker issued -- to link to the
 * item -- and withdrawing a pending one. */
function ApplicationList({ list, entry, reload, onLink }: { list: StickerApplication[]; entry: EquipmentEntry; reload: () => void; onLink: (v: StickerView) => void }) {
  if (list.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1">
      {list.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-2 text-neutral-300">
          <span>
            {a.bodyName ?? a.body}{a.disciplineName ? ` ${a.disciplineName}` : ""} {a.season} · sent {new Date(a.submittedAt).toLocaleDateString()} ·{" "}
            <span className={a.status === "issued" ? "text-emerald-300" : a.status === "declined" ? "text-red-300" : ""}>{a.status}</span>
            {a.stickerCode ? ` · sticker ${formatStickerCode(a.stickerCode)}` : ""}
            {a.note ? ` — ${a.note}` : ""}
          </span>
          {a.status === "pending" && (
            <button type="button" className={smallButton} onClick={() => withdrawStickerApplication(a.id).then(reload, () => {})}>
              Withdraw
            </button>
          )}
          {a.status === "issued" && a.stickerCode && a.stickerCode !== entry.stickerCode && (
            <button type="button" className={smallButton} onClick={() => fetchSticker(a.stickerCode!).then((v) => v && onLink(v), () => {})}>
              Link sticker {formatStickerCode(a.stickerCode)} to this item
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Applying for an annual sticker: the body and season, the item's details, and which of its photos
 * show the whole item and which its tag or label (the sticker needs one of each). */
function ApplyForSticker({
  category,
  entry,
  signedIn,
  mine,
  loadMine,
  onLink,
}: {
  category: EquipmentCategory;
  entry: EquipmentEntry;
  signedIn: boolean | null;
  mine: StickerApplication[];
  loadMine: () => Promise<void>;
  onLink: (v: StickerView) => void;
}) {
  const [bodies, setBodies] = useState<StickerBody[]>([]);
  const [body, setBody] = useState("");
  // The body's discipline (e.g. SCCNH Autocross), when it has them.
  const [discipline, setDiscipline] = useState("");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [owner, setOwner] = useState("");
  const photos = applicationPhotos(category, entry);
  // Each photo's role, keyed by the photo itself so adding or removing one never shifts the others;
  // a photo not marked yet is the whole item when it's the first, its tag otherwise.
  const [kinds, setKinds] = useState<Record<string, "item" | "tag">>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStickerBodies().then(setBodies, () => {});
  }, []);

  const kindOf = (i: number) => (photos[i].fixed ? photos[i].kind : kinds[photos[i].url] ?? photos[i].kind);
  const ready = photos.some((_, i) => kindOf(i) === "item") && photos.some((_, i) => kindOf(i) === "tag");
  const disciplines = bodies.find((b) => b.id === body)?.disciplines ?? [];
  // One pending application per item, body, discipline and season: the next one waits until it's processed.
  const pending = mine.find(
    (a) => a.status === "pending" && a.body === body && (a.discipline ?? "") === discipline && a.season === season && applicationIsFor(a, entry)
  );
  const submit = async () => {
    setError(null);
    if (!body) return setError("Pick the sanctioning body.");
    if (disciplines.length && !discipline) return setError("Pick the discipline: its stickers are good for its events.");
    if (pending) return;
    if (!ready) return setError("The sticker needs a photo of the whole item and one of its tag or label: add them to this item first, then mark which is which.");
    try {
      const refs: { sha256: string; kind: "item" | "tag" }[] = [];
      for (let i = 0; i < photos.length; i++) {
        setBusy(`Uploading photo ${i + 1} of ${photos.length}…`);
        const url = photos[i].url;
        const jpeg = url.startsWith("data:image/jpeg") ? url : await downscaleDataUrl(url, 1600, 0.85);
        const sha256 = await sha256Hex(dataUrlToBytes(jpeg));
        await uploadTechSheetPhoto(sha256, jpeg);
        refs.push({ sha256, kind: kindOf(i) });
      }
      setBusy("Sending…");
      await submitStickerApplication({
        body,
        discipline: discipline || undefined,
        season,
        category,
        owner: owner.trim() || undefined,
        gear: stripEntryPhotos(entry),
        photos: refs,
      });
      await loadMine();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  if (signedIn === false) return <TechSheetSignIn intro="Sign in to apply for an annual tech sticker — we'll email you a one-time code." />;
  const label = CATEGORY_META[category].label.toLowerCase();
  return (
    <div className="flex flex-col gap-2 rounded border border-neutral-700 p-2">
      <p className="text-neutral-400">
        A sanctioning body&apos;s scrutineers issue a season sticker for this {label} from what you send: its details above and its photos. Bring the {label} when
        you pick the sticker up -- they check it against the photos.
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            const ds = bodies.find((b) => b.id === e.target.value)?.disciplines ?? [];
            setDiscipline(ds.length === 1 ? ds[0].id : "");
          }}
          className="rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100"
        >
          <option value="">Sanctioning body…</option>
          {bodies.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {disciplines.length > 0 && (
          <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100">
            <option value="">Discipline…</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          value={season}
          onChange={(e) => setSeason(Number(e.target.value) || new Date().getFullYear())}
          className="w-24 rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100"
          title="Season"
        />
        <input
          type="text"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Owner's name (for the scrutineers)"
          className="min-w-[180px] flex-1 rounded border border-neutral-500 bg-neutral-900 p-1 text-neutral-100 placeholder:text-neutral-500"
        />
      </div>
      {photos.length === 0 ? (
        <p className="text-amber-300">Add photos to this item first: one of the whole {label} and one of its tag or label.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- a stored data URL */}
              <img src={p.url} alt="" className={`h-16 w-16 rounded object-cover ${kindOf(i) === "tag" ? "ring-2 ring-sky-500" : ""}`} />
              {p.fixed ? (
                <span className="text-neutral-400">{p.kind === "tag" ? "Tag" : "Item"}</span>
              ) : (
                <select
                  value={kindOf(i)}
                  onChange={(e) => setKinds((k) => ({ ...k, [p.url]: e.target.value as "item" | "tag" }))}
                  className="rounded border border-neutral-600 bg-neutral-900 p-0.5 text-neutral-200"
                >
                  <option value="item">Whole item</option>
                  <option value="tag">Tag / label</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-300">{error}</p>}
      {pending && (
        <p className="text-amber-300">
          This {label} already has an application pending with {pending.bodyName ?? pending.body}{pending.disciplineName ? ` ${pending.disciplineName}` : ""} for {pending.season}: wait until it&apos;s processed, or withdraw it to
          send a new one.
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!!busy || signedIn === null || !!pending}
          onClick={submit}
          className="rounded border border-emerald-700 bg-emerald-950 px-3 py-1 text-emerald-200 hover:bg-emerald-900 disabled:opacity-50"
        >
          Send the application
        </button>
        {busy && <span className="text-neutral-400">{busy}</span>}
      </div>
      <ApplicationList list={mine} entry={entry} reload={loadMine} onLink={onLink} />
    </div>
  );
}
