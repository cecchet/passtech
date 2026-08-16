import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const performanceRally: Ruleset = {
  id: "ara-performance-rally",
  bodyId: "ara",
  bodyName: "American Rally Association (ARA)",
  disciplineName: "Performance Rally",
  disciplineGroup: "Rally",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "ARA Rally Technical Rules",
      version: "2026 Edition, through Bulletin 2026-8",
      section: "1. Competitor Personal Safety Equipment",
      url: "https://www.americanrallyassociation.org/rulesandbulletins",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "2026 ARA edition explicitly notes: 'SA 2015 expires December 31, 2026.'" },
        { standardId: "snell-ea2016", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8860-2010", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
      ],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.1.1" },
      confidence: "medium",
      notes:
        "Applies identically to driver and co-driver. Confidence is medium: the fullest available 2026 text was a third-party-hosted combined rulebook, cross-verified against ARA's own 2025 CDN document and Bulletin 2025-6 (content matched apart from expected year deltas). Recommend spot-checking the live ARA/Sportity app before treating as final. Helmet may not be modified from factory spec.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old." },
      ],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.2.1" },
      confidence: "medium",
      notes: "Required for every competitor, no exemption stated.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.4-5" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with approved fire-resistant underwear (FIA 8856-2000 or SFI 3.3)." },
      ],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.3.1" },
      confidence: "medium",
      notes: "Required at all times during the event. Suits with withdrawn homologation may not be worn.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition" },
      confidence: "medium",
      notes: "Not addressed anywhere in the rulebook — no requirement, no recommendation, no standard cited.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Must cover the entire foot; leather or approved fireproof material. Socks may not be synthetic fiber except Nomex or similar FR material.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.3.4" },
      confidence: "medium",
    },
    undergarment: {
      requirement: "recommended",
      condition:
        "Becomes mandatory if the driving suit itself is SFI 3.2A/1. Non-fire-resistant synthetic materials are prohibited under the suit regardless.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "RTR §1.3.3: 'Undergarments meeting SFI Spec 3.3, FIA 8856-2000, or FIA 8856-2018 are recommended to be worn' — no minimum level for SFI 3.3 named.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.3.3" },
      confidence: "medium",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition" },
      confidence: "medium",
      notes:
        "No dedicated arm-restraint requirement found anywhere in the ARA rulebook (checked GCR/RCR/RTR for 'arm restraint,' 'restraint,' 'sleeve,' 'window net,' 'convertible,' 'open car/top' — no hits define a driver-worn arm restraint). Window nets (FIA Article 253 or SFI 27.1) are the closest related control, but that's vehicle equipment, not driver-worn PPE.",
    },
  },
};

export const araRulesets: Ruleset[] = [performanceRally];
