# Rulebook archive

Local copies of the sanctioning-body rulebook PDFs used to research this app's data
(`src/data/bodies/*.ts`), so future research passes (new equipment categories, periodic
re-checks) don't have to re-fetch and re-download the same documents from scratch.

## Convention

One file per source document, named `<bodyId>-<short-slug>.pdf`, matching the `bodyId` used
in `src/data/bodies/*.ts` (e.g. `pha-hillclimb-supplementary-regs.pdf`, `bmwcca-club-racing.pdf`,
`bmwcca-driving-events.pdf`). If a body's ruleset file cites more than one source document,
save each one separately with a slug that distinguishes them.

The authoritative URL and version/edition for each document is still recorded in the
`sourceDoc`/`citation` objects inside the corresponding `src/data/bodies/*.ts` file — this
folder is a convenience cache of the PDF bytes, not a replacement for that citation metadata.
If a rulebook is re-fetched later (e.g. to research a new equipment category or a new season's
edition), overwrite the file here and update `version`/`lastReviewed` in the `.ts` file to match.

Not committed to git by default (see `.gitignore`) — these are large binary reference files,
not application code; ask before changing that if you want them versioned.
