import { Confidence, SourceDocument } from "@/data/types";

export function CitationLine({
  citation,
  confidence,
  className = "mt-2 text-[11px] text-neutral-500",
}: {
  citation: SourceDocument;
  confidence: Confidence;
  className?: string;
}) {
  return (
    <p className={className}>
      {citation.url ? (
        <a href={citation.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
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
