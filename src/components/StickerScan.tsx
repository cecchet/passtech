"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/data/categoryMeta";
import { NOT_LISTED, standardLabel } from "@/data/standards";
import { StickerView, fetchSticker, formatStickerCode, stickerCodeFrom, stickerPageUrl, stickerPhotoUrl } from "@/lib/stickers";

type ScanStage = { type: "idle" } | { type: "camera" } | { type: "typing" } | { type: "loading"; code: string } | { type: "error"; message: string };

/**
 * "Has it a tech sticker?" -- No (the caller goes on to scanning the item itself), or its QR code
 * read live from the camera, from a photo, or its code typed in; hands back what the server says
 * about it (see lib/stickers.ts).
 */
export function StickerScan({
  onScanned,
  onNo,
  title = "Has it a tech sticker?",
  bare,
}: {
  onScanned: (v: StickerView) => void;
  /** The "No" answer; without it there's no No button (scanning on demand: My gear, a tech sheet line). */
  onNo?: () => void;
  title?: string;
  /** No box around it (inside another card). */
  bare?: boolean;
}) {
  const [stage, setStage] = useState<ScanStage>({ type: "idle" });
  const [typed, setTyped] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<{ reset: () => void } | null>(null);

  const stopCamera = () => {
    readerRef.current?.reset();
    readerRef.current = null;
  };
  useEffect(() => stopCamera, []);

  const lookUp = async (text: string) => {
    stopCamera();
    const code = stickerCodeFrom(text);
    if (!code) {
      setStage({ type: "error", message: "That QR code isn't a tech sticker." });
      return;
    }
    setStage({ type: "loading", code });
    try {
      const v = await fetchSticker(code);
      if (!v) {
        setStage({ type: "error", message: `There's no sticker ${formatStickerCode(code)} -- check the code printed under the QR code.` });
        return;
      }
      setStage({ type: "idle" });
      onScanned(v);
    } catch (e) {
      setStage({ type: "error", message: e instanceof Error ? e.message : String(e) });
    }
  };

  // The camera: the video starts once its element is on screen.
  useEffect(() => {
    if (stage.type !== "camera" || !videoRef.current) return;
    let cancelled = false;
    void (async () => {
      const { BrowserQRCodeReader } = await import("@zxing/library");
      if (cancelled || !videoRef.current) return;
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;
      try {
        await reader.decodeFromConstraints({ video: { facingMode: "environment" } }, videoRef.current, (result) => {
          if (result && !cancelled) {
            cancelled = true;
            void lookUp(result.getText());
          }
        });
      } catch {
        if (!cancelled) setStage({ type: "error", message: "Couldn't open the camera -- allow it for this site, or use a photo of the sticker." });
      }
    })();
    return () => {
      cancelled = true;
    };
    // lookUp only changes identity per render; the camera runs once per "camera" stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.type]);

  const fromPhoto = async (file: File) => {
    stopCamera();
    const url = URL.createObjectURL(file);
    try {
      const { BrowserQRCodeReader } = await import("@zxing/library");
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      await lookUp(result.getText());
    } catch {
      setStage({ type: "error", message: "No QR code found in that photo -- get closer, or type the code printed under it." });
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={bare ? "text-sm" : "mb-4 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-sm"}>
      {title && <p className="mb-2 font-medium text-neutral-200">{title}</p>}
      {stage.type === "camera" ? (
        <div className="flex flex-col gap-2">
          <video ref={videoRef} className="max-h-72 w-full rounded bg-black object-cover" muted playsInline />
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setStage({ type: "idle" });
            }}
            className="rounded border border-neutral-600 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800"
          >
            Stop the camera
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {onNo && (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onNo();
              }}
              className="rounded bg-white px-3 py-1.5 font-medium text-black"
            >
              No
            </button>
          )}
          <button type="button" onClick={() => setStage({ type: "camera" })} className="rounded border border-neutral-600 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800">
            Scan a QR code
          </button>
          <label className="cursor-pointer rounded border border-neutral-600 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800">
            Photo of a QR code
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void fromPhoto(f);
              }}
            />
          </label>
          <button type="button" onClick={() => setStage({ type: "typing" })} className="rounded border border-neutral-600 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800">
            Tech sticker code lookup
          </button>
        </div>
      )}
      {stage.type === "typing" && (
        <form
          className="mt-2 flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) void lookUp(typed);
          }}
        >
          <input
            value={typed}
            autoFocus
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Code under the QR code, e.g. K7Q3-M9XD"
            className="w-64 rounded border border-neutral-600 bg-neutral-950 px-2 py-1.5 text-neutral-100 placeholder:text-neutral-500"
          />
          <button type="submit" className="rounded border border-neutral-600 px-2 py-1.5 text-neutral-200 hover:bg-neutral-800">
            Look up
          </button>
        </form>
      )}
      {stage.type === "loading" && <p className="mt-2 text-neutral-400">Looking up sticker {formatStickerCode(stage.code)}…</p>}
      {stage.type === "error" && <p className="mt-2 text-red-300">{stage.message}</p>}
    </div>
  );
}

const fmtDate = (d?: string | null) => (d ? new Date(d.length === 10 ? `${d}T12:00:00` : d).toLocaleDateString() : "");

function StickerPhoto({ sha256, tag }: { sha256: string; tag: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void stickerPhotoUrl(sha256).then((u) => {
      if (live) setUrl(u);
    });
    return () => {
      live = false;
    };
  }, [sha256]);
  return (
    <a href={url ?? undefined} target="_blank" rel="noopener noreferrer" className={`relative block h-24 w-32 overflow-hidden rounded bg-neutral-800 ${tag ? "ring-2 ring-sky-500" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- an object URL from storage */}
      {url && <img src={url} alt={tag ? "Tag photo" : "Photo"} className="h-full w-full object-cover" />}
      {tag && <span className="absolute bottom-1 left-1 rounded-full bg-sky-600 px-1.5 text-[10px] text-white">tag</span>}
    </a>
  );
}

/** What a scanned sticker vouches for: valid or void, its photos and certifications, who inspected it and when. */
export function StickerCard({ sticker, onClear }: { sticker: StickerView; onClear: () => void }) {
  const s = sticker.snapshot;
  const valid = sticker.status === "valid";
  const certs = (s.gear?.certifications ?? []).filter((c) => c.standardId);
  const results = sticker.sheet?.results ?? {};
  const counts = Object.values(results).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r]: (acc[r] ?? 0) + 1 }), {});
  return (
    <div className={`mb-4 rounded-lg border p-3 text-sm ${valid ? "border-emerald-700 bg-emerald-950/40" : "border-red-700 bg-red-950/60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`font-semibold ${valid ? "text-emerald-300" : "text-red-300"}`}>
          {valid ? "VALID" : sticker.status === "expired" ? "EXPIRED" : "VOID"} sticker {formatStickerCode(sticker.code)}
          {sticker.kind === "gear" && sticker.season
            ? ` — ${[sticker.bodyName || (sticker.body ?? "").toUpperCase(), sticker.disciplineName].filter(Boolean).join(" ")} ${sticker.season} season`
            : ""}
          {sticker.status === "expired" && <span className="font-normal"> — its season is over</span>}
          {sticker.status === "void" && (
            <span className="font-normal">
              {" "}
              — {sticker.voidReason === "replaced" && sticker.replacedBy ? `replaced by sticker ${formatStickerCode(sticker.replacedBy)}` : sticker.voidReason || "voided"}: don&rsquo;t accept it
            </span>
          )}
        </p>
        <button type="button" onClick={onClear} className="rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">
          Clear
        </button>
      </div>

      {sticker.kind === "gear" && (
        <p className="mt-1 text-neutral-200">
          {s.category ? CATEGORY_META[s.category]?.label : "Gear"}
          {s.occupant === "codriver" ? " — co-driver" : s.occupant === "driver" ? " — driver" : ""}
          {s.carNumber ? `, car #${s.carNumber}` : ""}
          {s.driver ? ` · ${s.driver}` : ""}
        </p>
      )}
      {sticker.kind === "car" && (
        <p className="mt-1 text-neutral-200">
          Car #{s.carNumber} {sticker.sheet?.status === "passed" ? "passed tech" : `tech: ${sticker.sheet?.status ?? "?"}`}
          {s.class ? ` — class ${s.class}` : ""} · {[s.year, s.make, s.model].filter(Boolean).join(" ")}
          {counts.pass ? ` · ${counts.pass} pass` : ""}
          {counts.fail ? ` · ${counts.fail} fail` : ""}
          {counts.na ? ` · ${counts.na} N/A` : ""}
        </p>
      )}
      {sticker.kind === "logbook" && <p className="mt-1 text-neutral-200">Logbook {sticker.logbook?.digitalNumber ?? s.digitalNumber}</p>}

      {(s.photos ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(s.photos ?? []).map((p) => (
            <StickerPhoto key={p.sha256} sha256={p.sha256} tag={p.kind === "tag"} />
          ))}
        </div>
      )}

      {certs.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {certs.map((c, i) => (
            <li key={i} className="rounded border border-neutral-700 px-2 py-1">
              <span className="font-medium text-neutral-100">{c.standardId === NOT_LISTED ? c.customStandardLabel || "Not listed" : standardLabel(c.standardId!)}</span>
              <span className="text-neutral-400">
                {[
                  c.homologationNumber && ` · homologation ${c.homologationNumber}`,
                  c.serialNumber && ` · serial ${c.serialNumber}`,
                  c.labelDate && ` · label ${c.labelDate}`,
                  c.tagExpirationDate && ` · tag expires ${c.tagExpirationDate}`,
                ]
                  .filter(Boolean)
                  .join("")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {sticker.kind === "gear" && <p className="mt-2 text-neutral-400">Check the photos and serial number against the item in hand — the verdict below is for the ruleset picked above.</p>}

      <p className="mt-2 text-neutral-400">
        {sticker.inspector?.name ? `Inspected by ${sticker.inspector.name}${sticker.inspector.license ? ` (${sticker.inspector.license})` : ""}` : "Issued"}
        {sticker.bodyName ? ` · ${sticker.bodyName}` : ""} · {fmtDate(sticker.issuedAt)}
        {sticker.event?.name ? ` · ${sticker.event.name}${sticker.event.location ? `, ${sticker.event.location}` : ""}` : ""}
      </p>
      {sticker.kind !== "gear" && (
        <a href={stickerPageUrl(sticker.code)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sky-400 underline">
          {sticker.kind === "car" ? "Open the tech sheet results" : "Open the logbook"}
        </a>
      )}
    </div>
  );
}
