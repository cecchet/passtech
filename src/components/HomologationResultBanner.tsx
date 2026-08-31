import { HomologationLookupResult } from "@/lib/fiaHomologation";

/** "FIA Technical List N", hyperlinked to the actual PDF on fia.com. */
export function FiaListLink({ listNumber, sourceUrl }: { listNumber: number; sourceUrl: string }) {
  return (
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
      FIA Technical List {listNumber}
    </a>
  );
}

/**
 * Status banner (plus, for FIA 8855-2021 seats, the mounting-bracket pairing warning) for one
 * homologation lookup result — shared between the manual entry field (EquipmentForm's
 * HomologationCheck) and the OCR tag-scan preview (TagCandidateList), so a number the user typed
 * in and a number read off a scanned photo explain themselves identically.
 */
export function HomologationResultBanner({ standardId, result }: { standardId: string; result?: HomologationLookupResult }) {
  if (!result) return null;

  const banner = (() => {
    switch (result.status) {
      case "revoked":
        return (
          <p className="rounded border border-red-700 bg-red-950 px-2 py-1 text-xs text-red-200">
            ⚠ REVOKED — <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} /> shows this homologation withdrawn
            {result.entry?.manufacturer ? ` (${result.entry.manufacturer}${result.entry.model ? " " + result.entry.model : ""})` : ""}. Not authorized to
            race regardless of the date on the tag.{result.entry?.revokedNote ? ` ${result.entry.revokedNote}` : ""}
          </p>
        );
      case "expired":
        return (
          <p className="rounded border border-amber-700 bg-amber-950 px-2 py-1 text-xs text-amber-200">
            ⚠ <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} /> lists this product valid only until{" "}
            {result.entry?.validUntil} — past that, it&rsquo;s no longer authorized regardless of physical condition.
          </p>
        );
      case "found_unverified_dates":
        return (
          <p className="rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
            Found on <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} />
            {result.entry?.manufacturer ? ` (${result.entry.manufacturer}${result.entry.model ? " " + result.entry.model : ""})` : ""}, but this app
            couldn&rsquo;t extract a validity date for it from the list — check the date printed on the label itself.
          </p>
        );
      case "valid":
        return (
          <p className="rounded border border-emerald-800 bg-emerald-950/40 px-2 py-1 text-xs text-emerald-300">
            ✓ Found on <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} />
            {result.entry?.manufacturer ? ` — ${result.entry.manufacturer}${result.entry.model ? " " + result.entry.model : ""}` : ""}
            {result.entry?.validUntil ? `, valid until ${result.entry.validUntil}` : ""}.
          </p>
        );
      case "not_found":
        return (
          <p className="rounded border border-amber-700 bg-amber-950 px-2 py-1 text-xs text-amber-200">
            ⚠ Not found on{" "}
            {result.listsChecked.map((l, i) => (
              <span key={l.listNumber}>
                {i > 0 && "/"}
                <FiaListLink listNumber={l.listNumber} sourceUrl={l.sourceUrl} />
              </span>
            ))}{" "}
            — double-check the number for typos. If it&rsquo;s correct as entered, this product may not be genuinely FIA-homologated.
          </p>
        );
      case "no_list_for_standard":
        return null;
    }
  })();

  // FIA 8855-2021 is the first seat standard to homologate the seat together with a specific
  // mounting bracket — a bracket is no longer a free installer choice like it was for older seat
  // standards. Surfaced separately from `banner` above since it's a different kind of warning
  // (a pairing requirement, not the seat's own validity) that still matters even when the seat
  // itself checks out fine; skipped once the seat is already known non-compliant (revoked) or
  // isn't found at all, where it would just be noise.
  const bracketNote =
    standardId === "fia-8855-2021" && result.status !== "revoked" && result.status !== "not_found" && result.status !== "no_list_for_standard" ? (
      <p className="rounded border border-amber-800 bg-amber-950/40 px-2 py-1 text-xs text-amber-300">
        ⚠ FIA 8855-2021 homologates this seat together with a specific mounting bracket — the bracket is not a free installer choice under this standard.{" "}
        {result.entry?.approvedBrackets?.length ? (
          <>
            <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} /> lists <b>{result.entry.approvedBrackets.join(", ")}</b> as the
            bracket(s) homologated with this seat. A different bracket is not authorized for it, regardless of the bracket&rsquo;s own certification.
          </>
        ) : (
          <>
            This app couldn&rsquo;t extract a specific approved bracket for this homologation — verify the bracket fitted against{" "}
            <FiaListLink listNumber={result.listNumber!} sourceUrl={result.sourceUrl!} /> yourself.
          </>
        )}
      </p>
    ) : null;

  return (
    <>
      {banner}
      {bracketNote}
    </>
  );
}
