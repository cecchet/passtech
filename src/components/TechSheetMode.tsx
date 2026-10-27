"use client";

import { useEffect, useRef, useState } from "react";
import { getRuleset } from "@/data";
import { TechSheetTemplate } from "@/data/techSheetTypes";
import { deleteTechSheetDraft, GarageProfile, loadGarage, loadTechSheetDrafts, saveTechSheetDraft, UserPreferences } from "@/lib/garage";
import { createDraft, defaultRulesetFor, draftFromSubmitted, TechSheetDraft } from "@/lib/techSheet";
import { downloadTechSheetPhoto, eventTemplates, fetchPublicTechSheets, fetchTechSheetEvents, getSession, onAuthChange, PublicTechSheet, signOut, TechSheetEvent, templateChoiceLabel, templateForClass } from "@/lib/techSheetServer";
import { TechSheetEditor } from "@/components/TechSheetEditor";
import { TechSheetSignIn } from "@/components/TechSheetSignIn";
import { TechSheetSubmitted } from "@/components/TechSheetSubmitted";

const inputClass = "w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-base text-neutral-100 sm:text-sm";
const primaryButtonClass = "rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50";

type View = { kind: "home" } | { kind: "new" } | { kind: "edit"; id: string };

function formatDates(ev: TechSheetEvent): string {
  const start = ev.startsOn ?? "";
  const end = ev.endsOn && ev.endsOn !== ev.startsOn ? ` – ${ev.endsOn}` : "";
  return `${start}${end}`;
}

/** The preferred Public sheet: the one serving the user's preferred ruleset, else the first. */
function preferredPublicSheet(sheets: PublicTechSheet[], preferences: UserPreferences): PublicTechSheet | undefined {
  const pref = preferences.preferredRulesetId;
  return (pref && sheets.find((t) => t.definition.passtechRulesetIds?.includes(pref))) || sheets[0];
}

function NewSheetSetup({
  preferences,
  profiles,
  previous,
  onCreated,
  onOpenGarage,
}: {
  preferences: UserPreferences;
  profiles: GarageProfile[];
  previous?: TechSheetDraft;
  onCreated: (draft: TechSheetDraft) => void;
  onOpenGarage?: () => void;
}) {
  const [events, setEvents] = useState<TechSheetEvent[] | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  // An event's sheet, or a body's Public one (its generic sheet, no event: exported as a file).
  const [source, setSource] = useState<"event" | "public">("event");
  const [eventId, setEventId] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [publicSheets, setPublicSheets] = useState<PublicTechSheet[] | null>(null);
  const [publicId, setPublicId] = useState("");
  const [variant, setVariant] = useState<string | null>(null);
  const [profileId, setProfileId] = useState(() => (previous?.gearProfileId && profiles.some((p) => p.id === previous.gearProfileId) ? previous.gearProfileId : profiles[0]?.id ?? ""));
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTechSheetEvents()
      .then((list) => {
        if (cancelled) return;
        setEvents(list);
        const usable = list.filter((e) => eventTemplates(e).length > 0);
        if (usable.length === 0) setSource("public");
        else setEventId(usable[0].id);
      })
      .catch((e) => {
        if (cancelled) return;
        setEventsError(e instanceof Error ? e.message : String(e));
        setSource("public");
      });
    fetchPublicTechSheets()
      .then((list) => {
        if (!cancelled) setPublicSheets(list);
      })
      .catch(() => {
        if (!cancelled) setPublicSheets([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const usableEvents = (events ?? []).filter((e) => eventTemplates(e).length > 0);
  const event = source === "event" ? usableEvents.find((e) => e.id === eventId) : undefined;
  // An event can use several sheets, one per group of classes: the one listing the competitor's
  // preferred class is picked unless they pick another, else the first.
  const sheets = eventTemplates(event);
  const preferredClassLabel = getRuleset(preferences.preferredRulesetId ?? "")?.classes?.find((c) => c.id === preferences.preferredClassId)?.label;
  const sheet = sheets.find((t) => t.id === sheetId) ?? templateForClass(sheets, preferredClassLabel) ?? sheets[0];
  const publicSheet = (publicSheets ?? []).find((t) => t.id === publicId) ?? preferredPublicSheet(publicSheets ?? [], preferences);
  const template: TechSheetTemplate | undefined = source === "event" ? sheet?.definition : publicSheet?.definition;
  const variants = template?.variants ?? [];
  const activeVariant = variants.length === 0 ? null : variants.some((v) => v.id === variant) ? variant : variants[0].id;
  const profile = profiles.find((p) => p.id === profileId);

  const create = async () => {
    if (!template) return;
    setCreating(true);
    try {
      const rulesetId = defaultRulesetFor(template, activeVariant, preferences.preferredRulesetId);
      const rs = rulesetId ? getRuleset(rulesetId) : undefined;
      const classLabel = rs?.classes?.find((c) => c.id === preferences.preferredClassId)?.label;
      const draft = await createDraft({
        template,
        templateVersion: event ? sheet?.version : publicSheet?.version,
        templateId: event ? sheet?.id : undefined,
        event: event ? { id: event.id, name: event.name } : undefined,
        variant: activeVariant,
        rulesetId,
        profile,
        previous,
        classLabel,
      });
      onCreated(draft);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">1. Which sheet?</h3>
        <div className="mb-2 flex flex-col gap-2">
          <label className="flex items-start gap-2 text-sm text-neutral-200">
            <input type="radio" name="ts-source" checked={source === "event"} onChange={() => setSource("event")} disabled={usableEvents.length === 0} className="mt-0.5 h-4 w-4 accent-amber-500" />
            <span>
              An upcoming event
              {events === null && !eventsError && <span className="ml-2 text-xs text-neutral-500">loading events…</span>}
              {eventsError && <span className="ml-2 block text-xs text-neutral-500">Couldn&apos;t load the event list ({eventsError}) — use a sanctioning body&apos;s sheet below and export the file.</span>}
              {events !== null && usableEvents.length === 0 && <span className="ml-2 block text-xs text-neutral-500">No upcoming events take tech sheets online yet.</span>}
            </span>
          </label>
          {source === "event" && usableEvents.length > 0 && (
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
              {usableEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} — {formatDates(ev)}
                  {ev.location ? ` · ${ev.location}` : ""}
                </option>
              ))}
            </select>
          )}
          {source === "event" && event && sheet && (
            <p className="text-xs text-neutral-500">
              {event.bodyName ? `${event.bodyName} · ` : ""}
              {sheets.length > 1 ? `${sheets.length} tech sheets, by class` : sheet.title}
              {event.scrutineeringStartsOn ? ` · tech opens ${event.scrutineeringStartsOn}` : ""}
            </p>
          )}
          {source === "event" && sheet && sheets.length > 1 && (
            <fieldset className="rounded-lg border border-neutral-700 p-2">
              <legend className="px-1 text-xs font-medium text-neutral-300">Which tech sheet?</legend>
              <div className="flex flex-col gap-1.5">
                {sheets.map((t) => (
                  <label key={t.id} className="flex items-start gap-2 text-sm text-neutral-200">
                    <input type="radio" name="ts-sheet" checked={t.id === sheet.id} onChange={() => setSheetId(t.id)} className="mt-0.5 h-4 w-4 accent-amber-500" />
                    <span>{templateChoiceLabel(t)}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-neutral-500">The event uses a different sheet for some classes — pick the one for your car&apos;s class (you can switch later).</p>
            </fieldset>
          )}
          <label className="flex items-start gap-2 text-sm text-neutral-200">
            <input
              type="radio"
              name="ts-source"
              checked={source === "public"}
              onChange={() => setSource("public")}
              disabled={publicSheets !== null && publicSheets.length === 0}
              className="mt-0.5 h-4 w-4 accent-amber-500"
            />
            <span>
              A sanctioning body&apos;s tech sheet (no event — export it as a file)
              {publicSheets === null && <span className="ml-2 text-xs text-neutral-500">loading…</span>}
              {publicSheets !== null && publicSheets.length === 0 && (
                <span className="ml-2 block text-xs text-neutral-500">No sanctioning body has published a tech sheet for this yet — pick an event above.</span>
              )}
            </span>
          </label>
          {source === "public" && publicSheet && (
            <select value={publicSheet.id} onChange={(e) => setPublicId(e.target.value)} className={inputClass}>
              {(publicSheets ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.bodyName} — {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
        {variants.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-300">Car class</span>
            <select value={activeVariant ?? ""} onChange={(e) => setVariant(e.target.value)} className={inputClass}>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">2. Pre-fill from My gear</h3>
        {profiles.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No gear sets in My gear on this device yet — you can still fill the sheet by hand
            {onOpenGarage ? (
              <>
                , or{" "}
                <button type="button" onClick={onOpenGarage} className="text-amber-400 underline hover:text-amber-300">
                  add your gear in My gear
                </button>{" "}
                first and come back.
              </>
            ) : (
              <>, or add your gear first in &quot;My gear&quot;.</>
            )}
          </p>
        ) : (
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)} className={inputClass}>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.hasCodriver ? " (with co-driver gear)" : ""}
              </option>
            ))}
            <option value="">Don&apos;t pre-fill — fill it by hand</option>
          </select>
        )}
        {profile?.carNote && <p className="mt-1 text-xs text-neutral-500">Car: {profile.carNote}</p>}
      </section>

      <button type="button" onClick={create} disabled={!template || creating} className={`${primaryButtonClass} w-full sm:w-auto`}>
        {creating ? "Preparing the sheet…" : "Start the sheet"}
      </button>
    </div>
  );
}

export function TechSheetMode({ preferences, onOpenGarage }: { preferences: UserPreferences; onOpenGarage?: () => void }) {
  const [drafts, setDrafts] = useState<TechSheetDraft[] | null>(null);
  const [profiles, setProfiles] = useState<GarageProfile[]>([]);
  const [view, setView] = useState<View>({ kind: "home" });
  const [email, setEmail] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  // "Submitted to …" after a sheet closes on its submission, until another one is opened.
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);
  const dirty = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadTechSheetDrafts<TechSheetDraft>(), loadGarage()]).then(([d, g]) => {
      if (cancelled) return;
      setDrafts(d);
      setProfiles(g);
    });
    getSession()
      .then((s) => !cancelled && setEmail(s?.user.email ?? null))
      .catch(() => undefined);
    const unsubscribe = onAuthChange((s) => setEmail(s?.user.email ?? null));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Debounced save of whichever drafts changed.
  useEffect(() => {
    if (!drafts || dirty.current.size === 0) return;
    const timer = setTimeout(async () => {
      const ids = [...dirty.current];
      dirty.current.clear();
      for (const id of ids) {
        const d = drafts.find((x) => x.id === id);
        if (!d) continue;
        const ok = await saveTechSheetDraft(d);
        setSaveError(ok ? null : "Couldn't save — browser storage is full. Remove some photos or old drafts.");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [drafts]);

  // Leaving the mode within the debounce window still saves the last edits.
  const latestDrafts = useRef<TechSheetDraft[] | null>(null);
  useEffect(() => {
    latestDrafts.current = drafts;
  }, [drafts]);
  useEffect(() => {
    const pending = dirty.current;
    return () => {
      for (const id of pending) {
        const d = latestDrafts.current?.find((x) => x.id === id);
        if (d) saveTechSheetDraft(d);
      }
      pending.clear();
    };
  }, []);

  const patchDraft = (id: string, patch: Partial<TechSheetDraft>) => {
    dirty.current.add(id);
    setDrafts((prev) => (prev ?? []).map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)));
  };

  const active = view.kind === "edit" ? drafts?.find((d) => d.id === view.id) : undefined;
  // Same object across renders (find returns the stored profile), so the editor's memoized check stays cached.
  const activeProfile = active?.gearProfileId ? profiles.find((p) => p.id === active.gearProfileId) : undefined;

  const header = (
    <>
      <h2 className="mb-2 flex items-center gap-3 text-xl font-semibold text-amber-400">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
        <img src="/logbook.jpg" alt="" className="h-12 w-12 shrink-0 rounded-lg bg-neutral-800 object-cover" />
        Pre-fill my tech sheet
      </h2>
      <p className="mb-4 text-sm text-neutral-400">
        Fill in your car&apos;s tech inspection sheet before the event — your gear lines come from My gear, with photos — then submit it to the event or export the file for the scrutineer.
      </p>
    </>
  );

  if (drafts === null) {
    return (
      <section>
        {header}
        <p className="text-sm text-neutral-500">Loading…</p>
      </section>
    );
  }

  if (view.kind === "new") {
    return (
      <section>
        {header}
        <button type="button" onClick={() => setView({ kind: "home" })} className="mb-4 text-xs text-amber-400 hover:text-amber-300">
          ← My tech sheets
        </button>
        <NewSheetSetup
          preferences={preferences}
          profiles={profiles}
          previous={drafts[0]}
          onOpenGarage={onOpenGarage}
          onCreated={async (draft) => {
            setDrafts([draft, ...drafts]);
            const ok = await saveTechSheetDraft(draft);
            setSaveError(ok ? null : "Couldn't save — browser storage is full. Remove some photos or old drafts.");
            setView({ kind: "edit", id: draft.id });
          }}
        />
      </section>
    );
  }

  if (view.kind === "edit" && active) {
    return (
      <section>
        {header}
        <button type="button" onClick={() => setView({ kind: "home" })} className="mb-4 text-xs text-amber-400 hover:text-amber-300">
          ← My tech sheets
        </button>
        <TechSheetEditor
          draft={active}
          profile={activeProfile}
          profiles={profiles}
          onOpenGarage={onOpenGarage}
          signedInEmail={email}
          saveError={saveError}
          onChange={(patch) => patchDraft(active.id, patch)}
          onSubmitted={() => {
            setSubmittedNotice(`Submitted to ${active.event?.name ?? "the event"}${typeof active.header.car_number === "string" && active.header.car_number ? ` — car #${active.header.car_number}` : ""}.`);
            setView({ kind: "home" });
          }}
          onDelete={async () => {
            await deleteTechSheetDraft(active.id);
            setDrafts(drafts.filter((d) => d.id !== active.id));
            setView({ kind: "home" });
          }}
        />
      </section>
    );
  }

  return (
    <section>
      {header}
      {submittedNotice && (
        <p className="mb-4 rounded-lg border border-emerald-700 bg-emerald-950 p-3 text-sm text-emerald-200">
          {submittedNotice} Its status is under My submitted sheets below.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          setSubmittedNotice(null);
          setView({ kind: "new" });
        }}
        className={`${primaryButtonClass} mb-5 w-full sm:w-auto`}
      >
        + Start a new tech sheet
      </button>

      <h3 className="mb-2 text-base font-semibold text-neutral-100">Drafts on this device</h3>
      {drafts.length === 0 ? (
        <p className="text-sm text-neutral-500">No drafts yet.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => {
            const car = typeof d.header.car_number === "string" && d.header.car_number ? ` — car #${d.header.car_number}` : "";
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedNotice(null);
                    setView({ kind: "edit", id: d.id });
                  }}
                  className="w-full rounded-lg border border-neutral-700 p-3 text-left hover:border-neutral-400 hover:bg-neutral-900"
                >
                  <span className="block text-sm font-semibold text-neutral-100">
                    {d.event?.name ?? d.template.title}
                    {car}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {d.event ? d.template.title : "No event (export)"}
                    {d.gearProfileName ? ` · ${d.gearProfileName}` : ""} · edited {new Date(d.updatedAt).toLocaleDateString()}
                    {d.submittedAt ? " · submitted" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        {email ? (
          <>
            <p className="text-xs text-neutral-500">
              Signed in as {email} ·{" "}
              <button type="button" onClick={() => signOut()} className="text-amber-400 hover:text-amber-300">
                Sign out
              </button>
            </p>
            <TechSheetSubmitted
              onEdit={async (sheet) => {
                // This device's draft of it, else one rebuilt from what the event received.
                setSubmittedNotice(null);
                const local = drafts.find((d) => d.submittedSheetId === sheet.id);
                if (local) {
                  setView({ kind: "edit", id: local.id });
                  return;
                }
                const draft = await draftFromSubmitted(sheet, downloadTechSheetPhoto);
                setDrafts([draft, ...drafts]);
                const ok = await saveTechSheetDraft(draft);
                setSaveError(ok ? null : "Couldn't save — browser storage is full. Remove some photos or old drafts.");
                setView({ kind: "edit", id: draft.id });
              }}
            />
          </>
        ) : showSignIn ? (
          <TechSheetSignIn intro="Sign in to see the sheets you submitted and the scrutineer's results." onSignedIn={() => setShowSignIn(false)} />
        ) : (
          <button type="button" onClick={() => setShowSignIn(true)} className="text-xs text-amber-400 hover:text-amber-300">
            Sign in to see my submitted sheets
          </button>
        )}
      </div>
    </section>
  );
}
