import { CATEGORY_META } from "@/data/categoryMeta";
import { CitationLine } from "@/components/CitationLine";
import { CategoryResult } from "@/lib/matcher";

export const STATUS_STYLE: Record<CategoryResult["status"], string> = {
  ok: "bg-emerald-950 text-emerald-300 border-emerald-700",
  rejected: "bg-red-950 text-red-300 border-red-700",
  not_required: "bg-neutral-900 text-neutral-400 border-neutral-700",
  recommended_only: "bg-blue-950 text-blue-300 border-blue-700",
  needs_info: "bg-amber-950 text-amber-300 border-amber-700",
  unrecognized: "bg-orange-950 text-orange-300 border-orange-700",
};

export const STATUS_LABEL: Record<CategoryResult["status"], string> = {
  ok: "OK",
  rejected: "Rejected",
  not_required: "Not required",
  recommended_only: "Recommended only",
  needs_info: "Needs info",
  unrecognized: "Unrecognized",
};

const CONDITIONAL_STYLE = "bg-yellow-950 text-yellow-300 border-yellow-700";

/**
 * A required item that's still "needs_info" (nothing entered, or explicitly marked as not
 * owned) is a real tech-inspection failure, not just missing paperwork — surface it with the
 * same red "Required" treatment as an outright rejection instead of the neutral amber default.
 * A conditional item that's still "needs_info" isn't a failure (it may not even apply), but it's
 * also not just generic missing info — call it out as "Conditional" (yellow) instead.
 */
export function statusLabel(status: CategoryResult["status"], requirement: CategoryResult["requirement"]): string {
  if (status === "needs_info" && requirement === "required") return "Required";
  if (status === "needs_info" && requirement === "conditional") return "Conditional";
  return STATUS_LABEL[status];
}

export function statusStyle(status: CategoryResult["status"], requirement: CategoryResult["requirement"]): string {
  if (status === "needs_info" && requirement === "required") return STATUS_STYLE.rejected;
  if (status === "needs_info" && requirement === "conditional") return CONDITIONAL_STYLE;
  return STATUS_STYLE[status];
}

export function ResultRow({ result }: { result: CategoryResult }) {
  return (
    <div className={`rounded-lg border p-3 text-sm ${statusStyle(result.status, result.requirement)}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{CATEGORY_META[result.category].label}</span>
        <span className="rounded-full border px-2 py-0.5 text-xs">{statusLabel(result.status, result.requirement)}</span>
      </div>
      <p className="mt-1 text-xs opacity-90">{result.reason}</p>
      {result.certBreakdown && (
        <ul className="mt-1 space-y-0.5 text-[11px] opacity-80">
          {result.certBreakdown.map((c, i) => (
            <li key={i}>
              • {c.label}: {STATUS_LABEL[c.status]} — {c.reason}
            </li>
          ))}
        </ul>
      )}
      {result.pieceBreakdown && (
        <ul className="mt-1 space-y-0.5 text-[11px] opacity-80">
          {result.pieceBreakdown.map((p, i) => (
            <li key={i}>
              • {p.label}: {STATUS_LABEL[p.status]} — {p.reason}
            </li>
          ))}
        </ul>
      )}
      <CitationLine citation={result.citation} confidence={result.confidence} className="mt-1 text-[11px] opacity-60" />
    </div>
  );
}
