import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const solo: Ruleset = {
  id: "scca-solo",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "Solo (Autocross)",
  disciplineGroup: "Autocross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA National Solo Rules",
      version: "2026 Edition, 53rd Printing (Jan 2026)",
      url: "https://www.scca.com/pages/solo-cars-and-rules",
      section: "4.3 Driver Safety Equipment",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        "snell-sa2025", "snell-sa2020", "snell-sa2015", "snell-sa2010", "snell-sah2010",
        "snell-m2025d", "snell-m2025r", "snell-m2020d", "snell-m2020r", "snell-m2015", "snell-m2010",
        "snell-k2025", "snell-k2020", "snell-k2015", "snell-k2010", "snell-ea2016",
        "sfi-31.1-2020", "sfi-31.1-2015", "sfi-31.1-2010",
        "sfi-41.1-2020", "sfi-41.1-2015", "sfi-41.1-2010",
        "fia-8859-2024", "fia-8859-2024-abp", "fia-8859-2020", "fia-8859-2015",
        "fia-8860-2018", "fia-8860-2018-abp", "fia-8860-2010",
      ].map((standardId) => ({ standardId, noExpiration: true })),
      fullFaceRequirement: "conditional",
      fullFaceCondition: "Required for open-wheel, formula, and kart cars — full-face or modular helmets only. Not required for other car classes.",
      citation: {
        title: "SCCA National Solo Rules",
        version: "2026 Edition",
        section: "4.3.1",
      },
      confidence: "high",
      notes:
        "Solo core rules state no expiration/sunset for any listed helmet rating — unusually permissive (still accepts Snell SA2010).",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required and not mentioned in core Solo rules.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required, not even recommended, in core Solo rules.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Must attach securely to the foot and not interfere with or obstruct pedal operation. No fire-resistance or certification requirement at all in core Solo — any secure, non-obstructive shoe qualifies.",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "4.3.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes:
        "Core Solo (pylon autocross) has no arm-restraint requirement. The separate, optional 'Solo Trials' sub-discipline (Appendix D) does require arm restraints on open cars, but that appendix is out of scope for this app (it's a distinct rally-style event within the same rulebook, not standard autocross).",
    },
  },
};

const rallycross: Ruleset = {
  id: "scca-rallycross",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "RallyCross",
  disciplineGroup: "RallyCross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA RallyCross Rules",
      version: "RX2026, 2026 Edition (Jan 2026)",
      url: "https://www.scca.com/pages/rallycross-cars-and-rules",
      section: "3.2 Vehicle/Driver Safety",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2010", noExpiration: true },
        { standardId: "snell-sah2010", noExpiration: true },
        { standardId: "snell-m2025d", noExpiration: true },
        { standardId: "snell-m2025r", noExpiration: true },
        { standardId: "snell-m2020d", noExpiration: true },
        { standardId: "snell-m2020r", noExpiration: true },
        { standardId: "snell-m2015", noExpiration: true },
        { standardId: "snell-m2010", noExpiration: true },
        { standardId: "snell-k2020", noExpiration: true },
        { standardId: "snell-k2015", noExpiration: true },
        { standardId: "snell-k2010", noExpiration: true },
        { standardId: "snell-ea2016", noExpiration: true },
        { standardId: "sfi-31.1-2020", expiresOn: "2026-12-31", note: "Older SFI ratings not valid after 12/31/2026 per SCCA RallyCross rules." },
        { standardId: "sfi-31.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-31.1-2010", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2020", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2010", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2020", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2010", expiresOn: "2026-12-31" },
        { standardId: "fia-8860-2024", noExpiration: true },
        { standardId: "fia-8860-2024-abp", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8860-2018-abp", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2010", noExpiration: true },
      ],
      citation: {
        title: "SCCA RallyCross Rules",
        version: "RX2026",
        section: "3.2.P",
      },
      confidence: "high",
      notes: "Required for all drivers and passengers. No DOT-only allowance.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
      notes: "Confirmed via full-document search — not required, not mentioned.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    gloves: {
      requirement: "conditional",
      condition:
        "Only required for open/no-windshield vehicles (e.g. Constructors/UTV-type builds lacking a full windshield, side glass, or window nets).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited — general requirement to wear gloves.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3 (vehicle construction), item 11.d" },
      confidence: "high",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required when: (1) the driver's window is down more than 1\" without a window net installed (§3.2.D); (2) in a UTV, any occupant's hands/arms can extend beyond the roll cage's plane without hardware-secured windows/nets/screens (item 11); or (3) in the Constructors (Exhibition Only) category, the vehicle lacks a full windshield/side windows (item 11.d/e). Must be anchored per the restraint manufacturer's specifications.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No certification standard cited — functional requirement only (anchored per manufacturer spec).",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.2.D; vehicle construction items 11, 11.d/e" },
      confidence: "high",
    },
  },
};

const roadRacing: Ruleset = {
  id: "scca-road-racing",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "Road Racing (Club Racing / GCR)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA General Competition Rules (GCR)",
      version: "2026 GCR, updated through Technical Bulletin 26-08 (Aug 2026)",
      url: "https://www.scca.com/pages/cars-and-rules",
      section: "9.3.18-9.3.19 Driver's Restraint System / Driver's Safety Equipment",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "GCR states 'SA2015 Helmets will be valid through 2026' — no exact month/day given; treated as end-of-year cutoff. Re-verify against the 2027 GCR once published." },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "sfi-31.1-2015", noExpiration: true, note: "SFI-labeled helmets must have a year printed on the label to be valid." },
        { standardId: "sfi-31.1-2020", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2010", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.2" },
      confidence: "high",
      notes:
        "Annual scrutineer sticker process applies (9.3.19.A). 'or newer' generations beyond what's listed here should also qualify — verify against current GCR if unsure.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "GCR: 'H&NR devices do not time out irrespective of any stated expiration date,' but must be undamaged and in acceptable condition." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.3" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", noExpiration: true, note: "GCR: FIA 8856-2018 suits do not expire regardless of manufacture date, provided undamaged." },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.1" },
      confidence: "high",
      notes: "One-piece suits highly recommended but not mandatory. Must cover neck to ankles/wrists.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Leather and/or accepted fire-resistant material, containing no holes. No specific SFI/FIA certification number cited by the GCR — a certified SFI 3.3 or FIA 8856 glove also satisfies this.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.4" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Uppers of leather and/or nonflammable material, covering at minimum the instep. Manufacturer ventilation pinholes allowed. No specific certification number cited by the GCR.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.9" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit itself is rated FIA 1986 Standard, FIA 8856-2000, or SFI 3.2A/5 or higher — in which case fire-resistant underwear becomes optional.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "GCR just says 'underwear of fire resistant material' when required — no specific SFI/FIA certification number cited, though SFI 3.3 or FIA 8856 obviously qualifies.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.1" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required on all open cars, including open Targa tops, sunroofs, and T-tops (§9.3.18). May be worn as an alternative to a window safety net in closed-cockpit Sports Racing cars (§9.3.56). Must not limit the driver's ability to signal other competitors.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No certification standard cited by the GCR.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.18; 9.3.56" },
      confidence: "high",
    },
  },
};

export const sccaRulesets: Ruleset[] = [solo, rallycross, roadRacing];
