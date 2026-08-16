import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const gravelTrials: Ruleset = {
  id: "sccnh-gravel-trials",
  bodyId: "sccnh",
  bodyName: "SCCNH",
  disciplineName: "Gravel Trials",
  disciplineGroup: "Rally",
  lastReviewed: "2026-08-15",
  sourceDocuments: [
    {
      title: "2026 SCCNH Gravel Trials Rules",
      version: "Rev 1, 12/2025",
      url: "https://drive.google.com/file/d/1_amv00NYUuAPriUGi6P5owtz8c5BZzrg/view?usp=sharing",
      section: "12. Required Personal Safety Equipment",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Rule 13.1.1: SA2015 expires at the end of the 2026 season." },
        { standardId: "snell-ea2016", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.1" },
      confidence: "high",
      notes:
        "Required for both driver and co-driver. New this year (2026 rulebook): Snell SA2025 and FIA 8859-2024 added to the accepted list, and FIA-homologated helmets now carry an explicit 10-years-from-manufacture-date validity window (§13.1.2) — previously undated in the app. Rule 13.1.3: for helmets with dual FIA/Snell certification, the later expiration date takes precedence — enter whichever certification is more favorable if the helmet has both.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old." },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.2" },
      confidence: "high",
      notes: "Required for all competitors (driver and co-driver), no lower-tier exception.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.4-5", note: "Rulebook writes this as 'SFI 3-4A/5.'" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear." },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.3" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Confirmed real gap in the 2026 rulebook too: gloves still do not appear anywhere in the document. Consider defaulting to a conservative SFI/FIA-rated expectation or contacting the club directly.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Confirmed real gap in the 2026 rulebook too: no shoe requirement in this document, unlike NEHA which has one.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only if using an SFI 3.2A/1 driving suit (no specific standard number given for the underwear itself in this document).",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Document just says 'approved fire resistant underwear' when required — no standard number attached.",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.3.6" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Re-checked the complete 2026 document (all numbered sections 1-35 plus Appendix A) — 'arm restraint' and 'window net' still do not appear anywhere. Plausible for closed rally cars, but the rulebook is silent rather than explicitly exempting them.",
    },
  },
};

export const sccnhRulesets: Ruleset[] = [gravelTrials];
