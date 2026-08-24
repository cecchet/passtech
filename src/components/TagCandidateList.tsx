import { NOT_LISTED, standardLabel } from "@/data/standards";
import { TagCandidate } from "@/lib/useTagScanner";

export function TagCandidateList({
  candidates,
  notes,
  added,
  onAdd,
}: {
  candidates: TagCandidate[];
  notes: string | null;
  added: Set<number>;
  onAdd: (c: TagCandidate, i: number) => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      {notes && <p className="text-neutral-400">{notes}</p>}
      {candidates.length === 0 && <p className="text-neutral-400">No certification recognized in the photo.</p>}
      {candidates.map((c, i) => (
        <div key={i} className={`rounded border p-2 ${c.categoryMismatch ? "border-red-600 bg-red-950" : "border-neutral-600"}`}>
          {c.categoryMismatch && (
            <p className="mb-1 flex items-center gap-1 font-semibold text-red-300">
              <span aria-hidden>⚠️</span>
              Wrong item? This looks like a {c.detectedCategory || "different"} tag, not this category.
            </p>
          )}
          <p className={c.categoryMismatch ? "text-red-200" : "text-neutral-200"}>
            {c.standardId === NOT_LISTED ? `"${c.rawText}"` : standardLabel(c.standardId)}
            <span className="ml-1 text-neutral-500">({c.confidence} confidence)</span>
          </p>
          {(c.labelDate || c.tagExpirationDate) && (
            <p className="text-neutral-500">
              {c.labelDate && `Label date: ${c.labelDate} `}
              {c.tagExpirationDate && `Expires: ${c.tagExpirationDate}`}
            </p>
          )}
          <button
            type="button"
            disabled={added.has(i)}
            onClick={() => onAdd(c, i)}
            className={
              c.categoryMismatch
                ? "mt-1 rounded border border-red-700 bg-red-900 px-2 py-1 text-red-200 hover:bg-red-800 disabled:opacity-50"
                : "mt-1 rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-200 hover:bg-emerald-900 disabled:opacity-50"
            }
          >
            {added.has(i) ? "Added" : c.categoryMismatch ? "Add anyway" : "Use this — add as a certification"}
          </button>
        </div>
      ))}
    </div>
  );
}
