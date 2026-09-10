// Some certification tags (notably SFI Foundation labels, common on HANS/head-and-neck restraints
// and other SFI-spec items) don't print the manufacture/recertification date as plain digits at
// all -- they print two small grids and mark the actual date by physically punching a hole clean
// THROUGH the paper over one cell in each grid, completely destroying whatever character was
// printed there (it reads as a ragged, irregular-edged void showing the dark background behind the
// tag -- NOT a solid ink dot sitting on top of still-legible text). Confirmed by example (a real
// tag, photographed): a 2-column x 3-row year grid, each column read top-to-bottom then moving to
// the next column right (e.g. column 1 = 19/20/21, column 2 = 22/23/24 for a tag spanning
// 2019-2024) -- the hole fell in column 1's bottom cell, destroying "21" entirely, leaving 19, 20,
// 22, 23, 24 all still legible with a gap where 21 used to be. Separately, a 4-column x 3-row month
// grid (column 1 = JAN/FEB/MAR top-to-bottom, column 2 = APR/MAY/JUN, column 3 = JUL/AUG/SEP,
// column 4 = OCT/NOV/DEC) works the same way -- on that same tag the hole destroyed "FEB". A vision
// model naturally looks for printed digits in something like "MM/DD/YYYY" form and can miss this
// entirely, which is why this needs calling out explicitly: look for a missing/destroyed character
// breaking an otherwise-consecutive, otherwise-complete sequence, not for a mark drawn on top of
// legible text. Read off the year and month whose characters are missing (day is never encoded
// this way -- use "01" for the day) and report it as labelDate in YYYY-MM-01 format.
//
// The same tags also print two row labels, "Manuf. Date" and "Recertification" (one directly above
// the other), and the SAME punch-through convention picks between them -- on the example tag above,
// the hole destroyed the leading "R" of "Recertification" while "Manuf. Date" stayed fully intact,
// so that tag's date was a recertification date, not the original manufacture date. Check which of
// the two labels has a chunk physically missing and report that as dateType.
export const GRID_DATE_PROMPT_HINT = `Some tags (especially SFI Foundation labels) don't print their date as plain digits -- they print two grids and mark the date by punching a hole clean THROUGH the paper over one cell in each: a hole completely destroys the printed character there, leaving a ragged round void (the dark background shows through) rather than a mark drawn on top of legible text. Look for a character MISSING from an otherwise consecutive/complete sequence, not for an overlaid dot. One grid is a short list of 2-digit years arranged in columns of 3, read top-to-bottom then column-by-column left to right (e.g. a tag spanning 2019-2024 prints column 1 as 19/20/21 top-to-bottom, then column 2 as 22/23/24) -- the hole falls in exactly one cell, destroying that year's digits entirely while the rest of the sequence stays legible. The other grid is all 12 months arranged the same way in 4 columns of 3 (column 1 = JAN/FEB/MAR top-to-bottom, column 2 = APR/MAY/JUN, column 3 = JUL/AUG/SEP, column 4 = OCT/NOV/DEC) -- again, exactly one month is destroyed by a hole. Read off the destroyed year and month (day is never encoded this way -- use "01" for the day) and report it as labelDate in YYYY-MM-01 format. These same tags also print two row labels, "Manuf. Date" and "Recertification" (one above the other) -- the same punch-through convention picks between them, destroying part of whichever one applies (e.g. eating the leading "R" off "Recertification") while leaving the other fully intact; report which one is damaged as dateType.`;

export const LABEL_DATE_SCHEMA_PROPERTY = {
  type: "string" as const,
  description:
    'Date printed OR marked on the tag (manufacture date, conformance date, homologation date, or a grid-marked date -- see the grid/punch-hole convention described above) in YYYY-MM-DD format. If only a month+year is determinable (e.g. a grid-marked date with no day), use "01" as the day. Empty string if no date is visible/markable or you can\'t determine it at all.',
};

export const DATE_TYPE_SCHEMA_PROPERTY = {
  type: "string" as const,
  enum: ["manufacture", "recertification", ""],
  description:
    'Only meaningful when labelDate came from a grid/punch-hole tag with separate "Manuf. Date" and "Recertification" row labels (see above): which of those two rows has the hole/mark next to it. "manufacture" or "recertification" accordingly. Empty string for an ordinary printed date with no such row labels, or if you can\'t tell.',
};

// The model self-reported "high confidence" on a grid/punch-hole date read that turned out wrong
// (a real tag, tested repeatedly) -- despite the prompt already saying "be conservative", it
// doesn't reliably self-downgrade for this specific failure mode. Rather than keep tuning prompt
// wording and hoping, force it here: any candidate whose date came from the grid/punch-hole
// convention (dateType set) gets its confidence capped at "low" regardless of what the model
// reported, since this exact read (the year especially) has been shown to be wrong even when the
// model was confident.
export function capGridDateConfidence<T extends { dateType: string; confidence: "high" | "medium" | "low" }>(candidate: T): T {
  return candidate.dateType ? { ...candidate, confidence: "low" } : candidate;
}

// Shown next to the tag-photo upload controls (not the whole-item photo ones) -- side-by-side
// testing against a real SFI grid/punch-hole tag showed a wide shot of the whole item reading the
// date wrong almost every time, while a genuine close-up of just the tag got 2 of 3 fields
// (month, date type) right consistently -- the year (smallest print on the tag) remained the
// hardest part even close-up, which is why the copy below also points at the manual date-type
// dropdown as the fallback rather than promising close-ups will always nail it.
export const GRID_DATE_UI_HINT =
  "Tip: SFI-style tags encode their date with a punched hole in a grid, not printed digits — a close-up photo of just the tag reads it more reliably than a wide shot. Double-check the date against the physical tag either way.";
