import { Confidence, SourceDocument } from "@/data/types";

/**
 * Per-category citations (CategoryRule.citation) almost never set their own `url` — that's only
 * ever populated at the ruleset level (`Ruleset.sourceDocuments`, the same list the page's "Source:"
 * line reads from). So the citation line falls back to that list here: match by title first (a
 * ruleset with multiple source documents, e.g. separate helmet/harness/logbook rulebooks, should
 * still link to the *right* one), then fall back to the first source document if nothing matches.
 */
function resolveCitationUrl(citation: SourceDocument, sourceDocuments?: SourceDocument[]): string | undefined {
  if (citation.url) return citation.url;
  if (!sourceDocuments || sourceDocuments.length === 0) return undefined;
  return sourceDocuments.find((d) => d.title === citation.title)?.url ?? sourceDocuments[0].url;
}

export function CitationLine({
  citation,
  confidence,
  sourceDocuments,
  className = "mt-2 text-[11px] text-neutral-500",
}: {
  citation: SourceDocument;
  confidence: Confidence;
  /** The current ruleset's own source documents — used to link the citation when it has no url of its own (the common case). See resolveCitationUrl. */
  sourceDocuments?: SourceDocument[];
  className?: string;
}) {
  const url = resolveCitationUrl(citation, sourceDocuments);
  return (
    <p className={className}>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {citation.title}
        </a>
      ) : (
        citation.title
      )}
      {citation.version ? `, ${citation.version}` : ""}
      {citation.section ? ` — ${citation.section}` : ""}
      {confidence !== "high" ? ` (confidence: ${confidence})` : ""}
    </p>
  );
}
