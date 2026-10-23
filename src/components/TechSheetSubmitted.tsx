"use client";

import { useCallback, useEffect, useState } from "react";
import { expandLines } from "@/lib/techSheet";
import { fetchMyTechSheets, MyTechSheet, resubmitState, TechSheetStatus } from "@/lib/techSheetServer";

export const SHEET_STATUS_STYLE: Record<TechSheetStatus, string> = {
  submitted: "bg-neutral-900 text-neutral-300 border-neutral-600",
  inspecting: "bg-amber-950 text-amber-300 border-amber-700",
  passed: "bg-emerald-950 text-emerald-300 border-emerald-700",
  failed: "bg-red-950 text-red-300 border-red-700",
};

export const SHEET_STATUS_LABEL: Record<TechSheetStatus, string> = {
  submitted: "Submitted — waiting for tech",
  inspecting: "Being inspected",
  passed: "Passed tech",
  failed: "Failed tech",
};

const RESULT_STYLE = {
  pass: "text-emerald-300",
  fail: "text-red-300",
  na: "text-neutral-400",
} as const;

const RESULT_LABEL = { pass: "Pass", fail: "Fail", na: "N/A" } as const;

const RESUBMIT_HINT = {
  open: "You can edit the sheet and re-submit it until tech gives its verdict.",
  locked: "A scrutineer has your sheet open right now — re-submit once they're done.",
  failed: "Fix what failed (new gear, details, photos) and re-submit: the failed lines go back to tech to be inspected again.",
  final: "Passed — the sheet is final.",
} as const;

function SheetCard({ sheet }: { sheet: MyTechSheet }) {
  const [open, setOpen] = useState(sheet.status === "failed");
  const inspected = !!sheet.inspection?.items && Object.keys(sheet.inspection.items).length > 0;
  const groups = sheet.template ? expandLines(sheet.template, sheet.variant ?? null) : [];
  const failures = Object.entries(sheet.inspection?.items ?? {}).filter(([, r]) => r.result === "fail");

  return (
    <li className="rounded-lg border border-neutral-700 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-100">
            {sheet.eventName ?? "Event"} — car #{sheet.carNumber}
          </p>
          <p className="text-xs text-neutral-500">
            {sheet.template?.title}
            {sheet.submittedAt ? ` · submitted ${new Date(sheet.submittedAt).toLocaleString()}` : ""}
          </p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs ${SHEET_STATUS_STYLE[sheet.status] ?? SHEET_STATUS_STYLE.submitted}`}>
          {SHEET_STATUS_LABEL[sheet.status] ?? sheet.status}
        </span>
      </div>

      <p className="mt-1 text-xs text-neutral-400">{RESUBMIT_HINT[resubmitState(sheet)]}</p>
      {(sheet.inspection?.history ?? []).map((h, i) => (
        <p key={i} className="mt-1 text-xs text-neutral-500">
          Failed {h.at ? new Date(h.at).toLocaleString() : ""}
          {h.corrections ? ` — ${h.corrections}` : ""}; re-submitted {h.resubmittedAt ? new Date(h.resubmittedAt).toLocaleString() : ""}.
        </p>
      ))}
      {sheet.inspection?.corrections && (
        <div className="mt-2 rounded border border-red-800 bg-red-950/60 p-2 text-sm text-red-200">
          <span className="font-semibold">Corrections required: </span>
          {sheet.inspection.corrections}
        </div>
      )}
      {failures.length > 0 && !open && (
        <p className="mt-2 text-xs text-red-300">
          {failures.length} line{failures.length === 1 ? "" : "s"} failed.
        </p>
      )}

      {inspected && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300">
          {open ? "Hide line results" : "Show line results"}
        </button>
      )}
      {open && inspected && (
        <div className="mt-2 space-y-3">
          {groups.map((group) => {
            const lines = group.lines.filter((l) => sheet.inspection?.items?.[l.key]);
            if (lines.length === 0) return null;
            return (
              <div key={group.sectionId}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{group.title}</p>
                <ul className="space-y-1">
                  {lines.map((line) => {
                    const r = sheet.inspection!.items![line.key];
                    return (
                      <li key={line.key} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                        <span className="text-neutral-200">{line.label}</span>
                        <span className={`text-xs font-semibold ${r.result ? RESULT_STYLE[r.result] : "text-neutral-500"}`}>
                          {r.result ? RESULT_LABEL[r.result] : r.teamUpdatedAt ? "Re-submitted" : "—"}
                        </span>
                        {r.note && <span className="w-full text-xs text-neutral-400">{r.note}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** The signed-in competitor's submitted sheets, with the scrutineer's results once inspected. */
export function TechSheetSubmitted({ refreshKey }: { refreshKey?: number }) {
  const [sheets, setSheets] = useState<MyTechSheet[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSheets(await fetchMyTechSheets());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches the server's list on mount / after a submit
    load();
  }, [load, refreshKey]);

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-100">My submitted sheets</h3>
        <button type="button" onClick={load} disabled={loading} className="rounded border border-neutral-600 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50">
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">Couldn&apos;t load your sheets: {error}</p>}
      {sheets && sheets.length === 0 && <p className="text-sm text-neutral-500">Nothing submitted yet.</p>}
      {sheets && sheets.length > 0 && (
        <ul className="space-y-2">
          {sheets.map((s) => (
            <SheetCard key={s.id} sheet={s} />
          ))}
        </ul>
      )}
    </section>
  );
}
