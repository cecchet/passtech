import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const performanceRally: Ruleset = {
  id: "ara-performance-rally",
  bodyId: "ara",
  bodyName: "American Rally Association (ARA)",
  disciplineName: "Performance Rally",
  disciplineGroup: "Rally",
  supportsCodriver: true,
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "ARA Rally Technical Rules",
      version: "2026 Edition, through Bulletin 2026-8",
      section: "1. Competitor Personal Safety Equipment",
      url: "https://www.americanrallyassociation.org/rulesandbulletins",
    },
  ],
  techSheet: { url: "/tech-sheets/ara-tech-form.jpg", format: "JPEG" },
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
      materialNote: "Must cover the entire foot; leather or approved fireproof material.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "1.3.4" },
      confidence: "medium",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Socks may not be synthetic fiber except Nomex or similar FR material.",
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
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      seatRailsForbidden: true,
      acceptedStandards: [{ standardId: "fia-8855-1999" }, { standardId: "fia-8862-2009" }],
      materialNote:
        "RTR 2.3.1.a: 'The use of hinged-back and OEM seats is prohibited.' This is an explicit, unambiguous ban — unlike some other bodies where a stock seat is merely implied-out by a belt-routing or construction requirement, ARA names OEM seats outright as disallowed. materialOnlyAccepted is false for that reason: there is no stock/OEM path here. RTR 2.3.1.b: 'All the occupants' seats must be homologated by FIA Standards 8855-1999 or 8862-2009, or be specifically designed for motor racing. All non-FIA seats are subject to acceptance by the Chief Scrutineer.' So the accepted paths are (1) FIA-homologated, or (2) a purpose-built racing seat without FIA homologation, admitted at the Chief Scrutineer's discretion — not modeled as a separate standards entry since it's a discretionary call rather than a named certification.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition, through Bulletin 2026-8", section: "2.3.1–2.3.2" },
      confidence: "high",
      notes:
        "Seat mounting (RTR 2.3.2): 'Seats must be securely attached to the structure of the vehicle in such a manner as to prevent the movement of the seat in case of an accident. Seats may not be mounted with sliders.' Verified verbatim against the actual 2026 RTR PDF (rulebooks/ara-rally-technical-rules-2026.pdf, distributed via the ARA/Sportity app rather than a plain download link) — this file's earlier '2026 Edition' citations had been carried forward from a stale, differently-sourced 2023 PDF without being re-verified against the real 2026 document; this category is now confirmed against the genuine 2026 text.",
    },
    belts_harness: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8853-98" },
        { standardId: "fia-8853-2016" },
        { standardId: "sfi-16.1" },
        { standardId: "sfi-16.5" },
      ],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.3" },
      confidence: "medium",
      notes:
        "A five-, six-, or seven-point unmodified harness of proprietary manufacture is required for both crew members — stock/OEM belts are not an accepted alternative. Standard must currently appear as valid on the applicable FIA Technical List or SFI manufacturer list (sfi-16.6 is not cited by ARA and is omitted here). RTR 2.3.3.e: 'Safety harnesses may not be used after their expiration date' — this refers to whatever date is printed on the label itself (ARA doesn't impose a separate numeric validity window); for dual FIA/SFI-certified harnesses the later of the two dates governs. Installation requirements (anchorage points, reinforcement plates, etc.) are in RTR 2.3.4.",
    },
    window_net: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "fia-8863-2015",
          note: "RTR text cites 'FIA article 253' rather than a numbered net standard. FIA's window-net homologation spec under Article 253 is FIA Standard 8863-2015 — mapped here since that's the only FIA window-net standard in this app's registry.",
        },
        { standardId: "sfi-27.1" },
      ],
      materialNote:
        "RTR 2.2.6.d: 'Window safety nets must be used in lieu of having windows rolled-up during stages... All window nets must meet FIA article 253 or SFI 27.1 certification.' A plain, uncertified net is not offered as an accepted alternative — certification is mandatory.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.2.6.c, 2.2.6.d" },
      confidence: "medium",
      notes:
        "RTR 2.2.6.c: side windows in the driver's and co-driver's doors may not be rolled down more than 1 inch during stages; 2.2.6.d then requires a certified window net over those same door openings 'in lieu of having windows rolled-up' during stages. Read together, the net is standard fitment for any car with roll-up door glass while on stage, not an optional/alternative piece of equipment. Distinct from — NOT interchangeable with — the driver-worn arm restraint: ARA's arm_restraint category is 'not_addressed' (no rulebook language anywhere defines a driver-worn arm restraint), so satisfiedByAlternative is intentionally omitted on both categories here. ARA's window net is purely vehicle-fitted safety equipment, never offered as a substitute for something the driver wears — this matches the existing arm_restraint note, which already flags window nets as 'the closest related control, but... vehicle equipment, not driver-worn PPE.' Sourced from the full text of the 2023 Edition RTR PDF (through Bulletin 2023-8) — the fullest downloadable RTR text found; the current '2026 Edition, through Bulletin 2026-8' is distributed only via the ARA/Sportity app (see the helmet/seat notes elsewhere in this file for the same caveat). Section 2.2.6 numbering matches sections already relied on elsewhere in this file from the same source (2.2.5 master switch, 2.2.9 tow hooks, 2.3.5 fire extinguishers, 2.3.6 first aid kit all match exactly), suggesting no renumbering since 2023. Saved locally at rulebooks/ara-rally-technical-rules.pdf.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [
        { quantity: 2, minBcRating: 10 },
        { quantity: 1, minBcRating: 20 },
      ],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.5" },
      confidence: "medium",
      notes:
        "RTR 2.3.5.a).ii): two hand-held extinguishers rated at least 10-B:C each, or one rated at least 20-B:C. Listed clean-agent equivalents for one 10-B:C unit: AFFF 2.4L, FX G-TEC 2.0kg, Viro3 2.0kg, Novec 1230 2.0kg, or 4Fire 2.0L. Units must be secured with a metal strap, show a visible fill/charge gauge, be DOT/US Coast Guard/SFI/FIA-approved, and bear service certification (annual or per FIA/SFI requirements) from a certified inspector; one extinguisher must be within easy reach of the driver or co-driver when seated, and an exterior label must mark the nearest access point. This is in addition to — not a substitute for — the mandatory on-board fire suppression system (see fire_suppression, RTR 2.3.5.a).i)).",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [{ standardId: "sfi-17.1" }, { standardId: "fia-8865-2015" }],
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.5" },
      confidence: "medium",
      notes:
        "RTR 2.3.5.a).i): an on-board fire suppression system (manual or automatic activation) is mandatory for all competition vehicles, with nozzles discharging into both the engine compartment and cockpit. Accepted standards are SFI 17.1, FIA 8865-2015, or a system currently listed as homologated for Rally on FIA Technical List n°16 — the fia-8865-2015 entry above covers that third path too, since List 16 is the FIA's own homologation register for that standard (same registry, just named by list number in this rule's text) and this app now has List 16's real homologation numbers parsed, so a number entered here IS checked against it. This app can't verify the rule's own 'listed for Rally' caveat specifically (no per-discipline flag exists in the parsed list data), only that the number appears on List 16 at all. Bottles must be secured with a metal strap, show a visible fill gauge, have an activation point within easy reach of both crew members, and be identified with 2 circular 'E' decals (at the release point and on the exterior bodywork).",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-28.1" },
        { standardId: "sfi-28.3" },
        { standardId: "fia-ft3-1999" },
        { standardId: "fia-ft3.5-1999" },
        { standardId: "fia-ft5-1999" },
      ],
      materialNote:
        "RTR 2.2.8.c: the original/OEM fuel tank may be used provided it remains in the OEM location, secured by the original mounting systems. RTR 2.2.8.d: if replaced, only an FIA- or SFI-approved fuel cell may be used, vented to outside the vehicle, with a spill outlet if located in the luggage compartment. Supplementary fuel tanks are prohibited (2.2.8.e); there's no restriction on tank size. ARA doesn't cite a specific FIA/SFI fuel-cell spec number — all currently registered SFI/FIA fuel-cell standards are offered here so drivers can match their tag.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.2.8" },
      confidence: "medium",
    },
    kill_switch: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.2.5" },
      confidence: "medium",
      notes:
        "A spark-proof master electrical disconnect switch capable of killing all electrical circuits (including alternator and engine) must be mounted in the passenger compartment, operable by either crew member or by persons outside the vehicle through either front door. Must be marked with a label showing a red spark in a white-edged blue triangle with a base length of at least 4 inches.",
    },
    tow_hook: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.2.9" },
      confidence: "medium",
      notes:
        "Towing eyes required at front and rear, painted yellow, red, or orange; if mounted under the car, the location must be identified with a fluorescent arrow. It is 'highly recommended' (not mandatory) that tow points be rated to double the car's weight, since they may be used to recover the vehicle.",
    },
    tow_rope: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.8" },
      confidence: "medium",
      notes: "A tow rope or winch with cable must be carried; all parts of the tow rope must remain inside the competition vehicle at all times while not in use.",
    },
    emergency_triangle: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.7" },
      confidence: "medium",
      notes:
        "Three self-supporting, light-reflecting, daylight-visible triangular warning devices, minimum 12 inches per side, must be carried; one must be located within easy reach of the driver or co-driver when seated. Devices must be permanently marked with the crew's assigned car number.",
    },
    first_aid_kit: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.6" },
      confidence: "medium",
      notes:
        "A comprehensive first aid kit must be carried in the passenger compartment — easily accessible, clearly identified, and quickly removable by hand (recommended accessible from both sides and from the seated position). An exterior label marking the nearest access point is required.",
    },
    window_breaker: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition", section: "2.3.10" },
      confidence: "medium",
      notes:
        "One or more belt cutters and glass breakers must be carried within reach of both driver and co-driver while harnesses are worn; the seat belt cutter must be designed specifically for cutting seat belts. Related: RTR 2.2.6.b requires one or more window-breakers accessible to driver and co-driver for vehicles with glass side windows, and 2.2.6.d requires window nets (FIA Art. 253 or SFI 27.1) in lieu of rolled-up windows during stages.",
    },
    hood_pins: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition, through Bulletin 2026-8", section: "2.2.18" },
      confidence: "medium",
      notes:
        "RTR §2.2.18 ('Engine Covers'): 'Engine covers shall be fixed closed accessible from the outside and accessible without the use of tools. Other fastening devices (inside or outside) shall be rendered inoperative, except for the secondary catch, which may be retained.' The rule never uses the words 'hood' or 'pin' — a plain text search for 'pin'/'pins' finds nothing — but this is functionally the same fastener requirement other bodies title outright as 'hood pins' (compare SCCNH Gravel Trials Rule 9.9, nearly word-for-word identical: fixed closed, accessible from outside without tools, other fasteners disabled except a secondary catch). 'Engine cover' is this rulebook's term for what other bodies call the hood/bonnet. Confidence is medium rather than high because ARA itself never uses hood-pin terminology, so this is an interpretation of a rule written in different words, not a rule that names hood pins directly.",
    },
    spill_kit: {
      requirement: "required",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition, through Bulletin 2026-8", section: "2.3.11" },
      confidence: "high",
      notes:
        "RTR 2.3.11 ('Spill Kit'): 'All vehicles in ARA events must carry a spill kit consisting of at least: a minimum of 2 - 15\" x 19\" (standard) absorbent pads, 1 - 3\" x 48\" hydrocarbon absorbent sock, and a 13 gallon plastic bag. All items will be contained in a heavy duty plastic bag that is re-sealable.'",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionLogbookCutoffYear: 2009,
      rolloverProtectionRequiresLogbook: true,
      rolloverProtectionAcceptedLogbookBodies: ["ara", "cars", "nasa-rallysport", "scca-prorally", "rally-america", "fia"],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionRequiresForwardHoopPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      condition:
        "Vehicles logbooked before 1/1/2009 with a cage built to the 2006 Rally America roll cage specifications remain valid for competition 'until further notice' (§2.2.2.c.3) — no upgrade to full FIA Article 253 compliance is required. Non-homologated 2006 RA-spec cages need 4 specific retrofit elements: a sill bar plus at least one additional door bar per side; diagonals to each corner of the top of the main hoop (in the main hoop's plane or as rear stays); a windscreen support on each side (from the front cage foot, within 4\", to within 6\" of the transverse windshield bar); and a minimum 1.5\"×0.095\" tube size for these added elements. A cage logbook is required either way — ARA, CARS, NASA RallySport, SCCA ProRally, Rally America (legacy), and other recognized ASN logbooks are all accepted per §5.2.6.",
      citation: { title: "ARA Rally Technical Rules", version: "2026 Edition, through Bulletin 2026-8", section: "2.2.2" },
      confidence: "high",
      notes:
        "Built to FIA Appendix J Article 253 (CDS steel, or DOM/Docol R8 alternates at named minimums: 1.75\"×0.095\" DOM or 1.75\"×0.083\" DOCOL R8 for main/front/lateral bars and door bars, 1.5\"×0.095\"/0.083\" elsewhere), or a fully FIA-homologated cage with original certification documentation. No convertible/open-top path — ARA rally cars are closed-body only. Cage must be entered in the ARA Vehicle Log Book, issued only by an ARA-authorized Technical Inspector; homologated cages may not be modified. RTR 2.2.2.c.4: 'All roll cages must be fully welded at all joints. Cages with bolt together design members will not be allowed regardless of homologation status.' Verified against the genuine 2026 RTR PDF (rulebooks/ara-rally-technical-rules-2026.pdf, via the ARA/Sportity app link) — footplates themselves may still be welded directly to the chassis per 2.2.2.c.2.b, which this app doesn't yet separately track from tube-joint welding. Padding (§2.2.3): all tubing forward of and including the main hoop in the roofline must be padded, plus any other tubing that may contact the helmet while seated — padding must comply with FIA 8857-2001 Type A (FIA Technical List n°23) or SFI 45.1.",
    },
  },
};

export const araRulesets: Ruleset[] = [performanceRally];
