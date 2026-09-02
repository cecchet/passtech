import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS, SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "ChampCar Endurance Series — Basic Club & Competition Rules (BCCR)",
  version: "2026 BCCR v1.4 (updated 12/17/2025)",
  url: "https://champcar.org/web/pdf/2026_BCCR/2026_BCCR_V1_4.pdf",
};

const endurance: Ruleset = {
  id: "champcar-endurance",
  bodyId: "champcar",
  bodyName: "ChampCar Endurance Series",
  disciplineName: "Endurance Road Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "3.10-3.12 Driver Safety Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "snell-sa2015",
          expiresOn: "2026-12-31",
          note: "Rulebook: 'All helmets expire 11 years after the date of certification' — but Snell certification tags don't print a date (unlike SFI/FIA), so this is computed as 11 years from the SA2015 standard's own release year rather than a per-item label date.",
        },
        { standardId: "snell-sa2020", expiresOn: "2031-12-31", note: "Same 11-years-from-generation-year computation as SA2015 above." },
        { standardId: "snell-sa2025", expiresOn: "2036-12-31", note: "Same 11-years-from-generation-year computation as SA2015 above." },
        {
          standardId: "fia-8859-2015",
          validityYearsFromLabel: 11,
          note: "BCCR §3.10.1 just says '...or FIA certification is required' without naming an exact spec number. Inferred here as the FIA 8859 full-face road-racing helmet family; not confirmed against an exact FIA spec number in the rulebook text — flag for spot-check.",
        },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
        { standardId: "fia-8859-2024-abp", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "3.10.1-3.10.2" },
      confidence: "medium",
      notes:
        "Rule text: 'An undamaged full-face helmet, displaying Snell Type SA2015, SA2020, SA2025, or FIA certification is required... All helmets expire 11 years after the date of certification.' Snell Type M (motorcycle) and other non-SA helmets explicitly barred as not fire-rated. Altered/counterfeit Snell stickers result in an event ban. An annual ChampCar helmet inspection decal is also required (§3.13.2) but isn't modeled here. Confidence is medium because the FIA helmet standard/spec number isn't named explicitly.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the BCCR, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-38.1",
          validityYearsFromLabel: 5,
          note: "BCCR §3.11.2: 'Devices must be recertified every 5 years per SFI 38.1.'",
        },
        {
          standardId: "fia-8858-2010",
          noExpiration: true,
          note: "BCCR §3.11.3: 'FIA devices do not require recertification; however, FIA guidance per Standard 8858-2010 must be followed.'",
        },
      ],
      citation: { ...sourceDoc, section: "3.11" },
      confidence: "high",
      notes: "An undamaged FIA and/or SFI-approved racing neck restraint system is mandatory for every driver.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", noExpiration: true },
        {
          standardId: "sfi-3.2a-3",
          noExpiration: true,
          note: "Cited verbatim by ChampCar as a single-layer tier ('SFI 3.2/A1 or 3.2/A3').",
        },
        { standardId: "sfi-3.2a-5", noExpiration: true },
        { standardId: "sfi-3.2a-10", noExpiration: true },
        { standardId: "sfi-3.2a-15", noExpiration: true },
        { standardId: "sfi-3.2a-20", noExpiration: true },
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "3.12.2" },
      confidence: "high",
      notes:
        "Rule text (§3.12.2.1-2): 'An FIA and/or SFI-certified racing suit is required. All driver suits possessing a valid FIA and/or SFI certification shall be allowed, regardless of the date of certification or manufacture' — i.e. suits genuinely never expire under ChampCar rules, unlike most other bodies. See undergarment category for the single- vs multi-layer condition.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId, noExpiration: true })).concat([
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ]),
      materialNote:
        "Rule text (§3.12.3.1-2): 'Fire-retardant FIA and/or SFI-certified gloves, socks, and shoes are required... shall be allowed, regardless of the date of certification or manufacture.' No specific tier/spec number is named, but a certified item is required.",
      citation: { ...sourceDoc, section: "3.12.3" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId, noExpiration: true })).concat([
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ]),
      materialNote:
        "Same sentence as gloves (§3.12.3.1): 'Fire-retardant FIA and/or SFI-certified gloves, socks, and shoes are required,' valid regardless of certification/manufacture date.",
      citation: { ...sourceDoc, section: "3.12.3" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId, noExpiration: true })).concat([
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ]),
      materialNote:
        "Rule text (§3.12.3.1-2): 'Fire-retardant FIA and/or SFI-certified gloves, socks, and shoes are required... shall be allowed, regardless of the date of certification or manufacture.' No specific tier/spec number is named, but a certified item is required.",
      citation: { ...sourceDoc, section: "3.12.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required only when wearing a single-layer SFI 3.2/A1 or 3.2/A3 suit — fire-retardant SFI- or FIA-certified undergarments are then mandatory. Multilayer suits rated SFI 3.2/A5 or higher are highly recommended and may be worn without undergarments.",
      undergarmentTriggerStandards: ["sfi-3.2a-1", "sfi-3.2a-3"],
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Must be a certified FIA- or SFI-rated undergarment, not just fire-resistant material, when required. No expiration is stated specifically for undergarments — the 'regardless of date' language in §3.12.2.2 is scoped to 'driver suits,' not explicitly extended to undergarments, so no expiration field is asserted here.",
      citation: { ...sourceDoc, section: "3.12.2.3" },
      confidence: "medium",
      notes: "Confidence is medium specifically on the expiration question — the requirement/condition text itself is unambiguous.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Roof nets OR SFI-certified arm restraints are required in all open (convertible) cars and/or cars with t-tops or sunroof openings (§3.5.2). Drivers of such cars without a roof net must pass an arm-extension test at pit-out confirming their hands don't extend above the roll cage 'halo's' lowest bar (§3.5.2.2) — failing or skipping it draws a penalty.",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-3.3-1",
          validityYearsFromLabel: 4,
          note: "BCCR §3.5.2.1: 'SFI restraints list a year of manufacture, and ChampCar will accept them until December 31st, four years from that year.' Modeled here as an approximate 4-year validity window from the label year; the real cutoff is always Dec 31 regardless of the exact manufacture month.",
        },
        { standardId: "sfi-3.3-5", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        { standardId: "sfi-3.3-10", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        { standardId: "sfi-3.3-20", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        {
          standardId: "fia-8856-2000",
          note: "BCCR §3.5.2.1: FIA-labeled restraints 'expire on December 31st of the year of expiration sewn into the item' — check the label directly; not modeled here as a fixed year offset.",
        },
        { standardId: "fia-8856-2018", note: "Same labeled-expiration rule as fia-8856-2000 above." },
      ],
      citation: { ...sourceDoc, section: "3.5.1-3.5.2" },
      confidence: "high",
      notes:
        "Separately, an SFI-approved window net mounted to the cage is mandatory in ALL competition cars regardless of body style (§3.5.1) — window nets aren't one of this app's seven tracked categories, so that blanket requirement isn't modeled here; it exists independently of the conditional arm-restraint/roof-net requirement above. materialOnlyAccepted is false because the rule explicitly requires an SFI- or FIA-certified item, not plain material.",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "BCCR §3.3.2: 'One or two-piece SFI or FIA-rated competition seats are recommended. OEM seats are NOT allowed.' The SFI/FIA certification itself is only 'recommended,' not mandated by name/spec-level (hence the generic accepted-standards list, since the BCCR never names an exact SFI 39.x or FIA 8855/8862 sub-version) — but the specific 'stock/OEM seat, no certification' path this app's material-only mode represents is explicitly barred, so materialOnlyAccepted is false and the category as a whole is modeled as required. Note this app's binary certified/stock-only model can't perfectly represent ChampCar's actual middle tier: a non-OEM aftermarket competition seat with no SFI/FIA tag at all is technically compliant too, provided it meets §3.3.1 (seatback above mid-helmet height), §3.3.3 (secure floor/cage mounting), §3.3.4 (braced/fixed seatback), and §3.3.5 (within 3\" of the harness/main-hoop bar, or a compliant seatback support) — so a driver running that kind of uncertified-but-non-OEM seat would be flagged here even though the BCCR itself would pass them.",
      citation: { ...sourceDoc, section: "3.3" },
      confidence: "high",
      notes:
        "Seat sliders ARE allowed: §3.3.3 requires 'All seats or seat sliders must be securely mounted to the floor or roll cage... a minimum 2-inch diameter or larger steel plate or load washers are required when mounting to sheet metal,' with SAE Grade 8/Metric Class 10.9+ hardware — i.e. a fixed mount is not required, but a slider must be robustly secured. Non-SFI/FIA seats must additionally sit within 3\" of the shoulder harness bar/diagonal main-hoop bar (furthest forward position) or use a seatback support meeting minimum size/thickness specs (§3.3.5-3.3.5.3); two-piece seats must have a permanently attached seatback support (§3.3.5.3). Passenger seats must be removed for racing (§3.3.5.4). No expiration/validity language is stated for seats in the BCCR, so no expiration fields are asserted here.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          note: "BCCR §3.4.2: 'SFI Harnesses must display an in-date conformance label.' No fixed years-from-label interval is stated in the BCCR text itself — the label's own valid-through date governs.",
        },
        { standardId: "sfi-16.5", note: "Same in-date-conformance-label requirement as sfi-16.1 above." },
        { standardId: "sfi-16.6", note: "Same in-date-conformance-label requirement as sfi-16.1 above." },
        {
          standardId: "fia-8853-2016",
          note: "BCCR §3.4.2: 'FIA harnesses expire on December 31st of the expiration year tag sewn into the harness.' Check the label directly; not modeled here as a fixed year offset.",
        },
        { standardId: "fia-8853-98", note: "Same labeled-expiration rule as fia-8853-2016 above." },
      ],
      materialNote:
        "BCCR §3.4.2: 'All driver restraint systems shall meet SFI or FIA specifications. The certification indicated by an SFI label or FIA label must be present.' No stock/OEM belts option is offered — a certified harness is mandatory. 'The latest expiration may be used for harnesses with both FIA and SFI certification labels.' Any attempt to modify the date(s) on any belt is grounds for immediate team disqualification, without recourse or refund.",
      citation: { ...sourceDoc, section: "3.4" },
      confidence: "high",
      notes:
        "A minimum 5-point restraint harness is required; 6- or 7-point systems are highly recommended (§3.4.1). Harnesses may use 2\" or 3\" shoulder belts — the driver's neck restraint device must be matched to whichever belt width is used. Must be installed per manufacturer recommendations (§3.4.3).",
    },
    window_net: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-27.1",
          validityYearsFromLabel: 4,
          note: "BCCR §3.5.1.1: 'SFI nets list a year of manufacture, and ChampCar will accept them until December 31st of the fourth year from the year of manufacture.' Modeled here as an approximate 4-year validity window from the label year; the real cutoff is always Dec 31 regardless of the exact manufacture month — same pattern used for the arm_restraint SFI 3.3 entries. The BCCR text itself just says 'SFI-approved window net' without naming an exact spec number; sfi-27.1 is the standard SFI window-net spec and is inferred here, consistent with how this app already handles the ChampCar helmet FIA inference above.",
        },
        {
          standardId: "fia-8863-2015",
          note: "BCCR §3.5.1.1: 'FIA nets expire on December 31st of the year of expiration sewn into net' — check the label directly; not modeled here as a fixed year offset. Exact FIA spec number likewise not named in the BCCR text; fia-8863-2015 is the standard FIA window-net spec and is inferred here.",
        },
      ],
      citation: { ...sourceDoc, section: "3.5.1-3.5.1.2" },
      confidence: "high",
      notes:
        "Rule text (§3.5.1): 'All competition cars must have an SFI-approved window net mounted to the cage of the car only. All window nets must be installed so that the front edge intersects the plane created by the steering wheel... Cars with nets that have extensive openings, as defined solely by ChampCar officials, will NOT be allowed on track.' This is mandatory on EVERY competition car regardless of body style (open, closed, t-top, sunroof, convertible) — confirmed directly against the rulebook, matching the prior research hint left in the arm_restraint notes. It is genuinely independent of, and stacks with, the driver's arm-restraint situation: §3.5.2 separately requires 'ROOF NETS or SFI-CERTIFIED ARM RESTRAINTS' specifically for open/convertible/t-top/sunroof cars, and the BCCR consistently calls that alternative item a 'roof net' (a distinct, differently-named piece of equipment from this window net covering the door window opening) — see the arm_restraint category, where that conditional pairing is already modeled. No satisfiedByAlternative is set on this category because the text never frames window_net and arm_restraint as interchangeable; a car can owe both simultaneously. §3.5.1.1 requires a clear SFI Date-of-Manufacture or FIA Date-of-Expiration label; tampering with the date(s) is grounds for immediate team disqualification without recourse or refund. §3.5.1.2 separately allows a small (80 sq in or less, 1/8 inch or less thick) deformable transparent polycarbonate screen over the driver's-side window area left exposed by the net, without value-add — not a net-standard question, so not modeled as a field here. materialOnlyAccepted is false because the rule explicitly requires an SFI- or FIA-certified net, not plain mesh.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3.9 / 8.1.2.1" },
      confidence: "high",
      notes:
        "BCCR §3.9 is titled 'ONBOARD FIRE EXTINGUISHER' but its actual requirement (§3.9.1) is for a self-contained push-button or pull-handle fire SUPPRESSION system with SFI/FIA certification, dual nozzles, etc. — that requirement is modeled under the fire_suppression category instead, since it's genuinely a suppression system rather than a handheld extinguisher. Separately, §8.1.2.1 requires each team to keep 'a ten (10) pound dry chemical or 3kg NOVEC fire extinguisher having a minimum UL 60 BC or ABC rating' ready while in the pits, but that's pit/paddock equipment for the team's pit stall, not a unit carried in or mounted on the competition vehicle — so it isn't modeled here as an onboard fire_extinguisher requirement. No distinct handheld-extinguisher-in-the-car requirement was found anywhere in the BCCR.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-17.1",
          note: "BCCR §3.9.1.4: maximum field service life of 6 years (SFI) from the original installation date, with recertification/inspection required at least every 2 years (or per the certifying manufacturer). Not modeled as validityYearsFromLabel since the BCCR bases this on install date, not a label date.",
        },
        {
          standardId: "fia-8865-2015",
          note: "BCCR §3.9.1.4: maximum field service life of 10 years (FIA) from the original installation date, with the same 2-year recertification/inspection cadence.",
        },
      ],
      citation: { ...sourceDoc, section: "3.9.1" },
      confidence: "high",
      notes:
        "Rule text (§3.9.1): 'ALL CHAMPCAR COMPETITION VEHICLES MUST HAVE A SELF-CONTAINED PUSH-BUTTON OR PULL-HANDLE FIRE SUPPRESSION SYSTEM INSTALLED,' with SFI or FIA certification required (§3.9.1.1). Minimum 5 lb or 2-liter bottle capacity, using ABF/AFFF/FE-36/NOVEC 1230 agent (§3.9.1.2). Minimum two nozzles required: one centered on the top of the engine, one in the driver's seating area with an unobstructed path to the driver's body (§3.9.1.3). Infield recertification is permitted only by the original manufacturer or its authorized agent; mailing certification labels to customers is strictly prohibited (§3.9.1.4). The activation point for the automatic system must be marked with a circle 'E' decal (§3.9.2, decals available at Tech); arriving at pit-in or pit-out with the arming pin not removed draws a 5-minute penalty (§3.9.3). Teams using the 'ESS Fire Bottle' must remove it and bring it to Tech for weighing/inspection at every event (§3.9.1.5). Note: this BCCR section is titled 'ONBOARD FIRE EXTINGUISHER' despite describing a suppression system — see the fire_extinguisher category notes for why no separate handheld-extinguisher requirement is modeled there.",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "sfi-28.1",
          note: "BCCR §9.10.5.1: 'Fuel cells expire, as outlined in the FIA/SFI certification provided by the manufacturer' — no fixed BCCR-stated interval; defer to the manufacturer's own certification/expiration on the cell.",
        },
        { standardId: "sfi-28.3", note: "Same manufacturer-deferred expiration rule as sfi-28.1 above." },
        { standardId: "fia-ft3-1999", note: "Same manufacturer-deferred expiration rule as sfi-28.1 above." },
        { standardId: "fia-ft3.5-1999", note: "Same manufacturer-deferred expiration rule as sfi-28.1 above." },
        { standardId: "fia-ft5-1999", note: "Same manufacturer-deferred expiration rule as sfi-28.1 above." },
      ],
      materialNote:
        "BCCR §9.10.4.1-2: 'Stock fuel tanks in stock locations OR approved fuel cells are the only fuel sources allowed for competition... NON-OEM REPLACEMENT OR SWAPPED FUEL TANKS ARE NOT ALLOWED. It's either stock, in the stock location, or an approved fuel cell with the proper installation.' A stock/OEM tank in its stock location, unaltered from OEM specifications (no cutting, hammering, ballooning — vent lines/fill necks may be relocated per §9.10.4.1.1-2), is fully accepted with no certification. Total fuel capacity (all fillers/overflows) may not exceed OEM-stated capacity + 2 gallons; vehicles with under 13 gallons OEM capacity may upgrade to 15 gallons via a fuel cell installation (§9.10.2, §9.10.2.2).",
      citation: { ...sourceDoc, section: "9.10.4-9.10.5" },
      confidence: "high",
      notes:
        "If a fuel cell is installed instead of the stock tank, extensive installation rules apply: ball-check/sealable breather valves on all vents, roll-over 'flapper' valves at the fuel inlet, full metal canister enclosure, a metal bulkhead separating the cell/fuel components from the driver compartment, metal or conduit-protected lines through the cabin, and (if rotary-molded/plastic) foam-filling and full metal encasement (§9.10.5.2-9.10.5.6). Protective tubular structures around the cell are allowed but must not tie into suspension pickup points or add chassis rigidity (§9.10.5.8). Passenger-floor mounting is allowed for 2-seaters under specific conditions (full NASCAR-type passenger door bars, full metal canister + separate bulkhead, 1\" square steel mounting frame tied into the roll cage) per §9.10.5.9.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No handheld window-breaker or seatbelt-cutter tool requirement was found anywhere in the BCCR. (Not to be confused with the SFI-approved window net required by §3.5.1, modeled under this app's arm_restraint category — that's a net covering the window opening, a different piece of equipment from a glass-breaking or belt-cutting tool.)",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "3.15" },
      confidence: "high",
      notes:
        "Rule text (§3.15.1): 'All cars must have a racing-type master electrical kill switch securely mounted in a location accessible to and by the driver while he/she is secured in the driving seat by all seat belts and harnesses.' The control/key should be red with a clearly indicated OFF position; both the main battery circuit and ignition circuit must be interrupted; the switch must be identified by the international lightning bolt symbol (decals available at Tech). A second switch may be wired in series elsewhere on the car — interrupting either independently must kill all power and vehicle operations (§3.15.2). All kill-switch terminals must be treated as 'hot' and insulated (§3.15.3). Function is tested at tech inspection by revving to approximately 1500 RPM and confirming the engine shuts off immediately upon switching off (§3.15.4). Separately, the kill switch must be in the OFF position during the entire fueling process (§8.2.7).",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      citation: { ...sourceDoc, section: "3.16" },
      confidence: "high",
      notes:
        "Rule text (§3.16.1): 'All cars must be equipped with a suitable front and rear tow hook (or chain or strap), constructed of materials and installed so that they are capable of withstanding the tension required to extract your car. Minimum 2\" diameter opening and easily accessible. Tow point must be clearly marked on car. Rigid tow hooks that protrude beyond the bumper are not permitted.' Tow marking decals are available free of charge at Tech Inspection. Note this rule explicitly allows a chain or strap in place of a rigid hook at the mounted tow point — see the tow_rope category notes for why that isn't the same as a separate carried tow rope/strap requirement.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3.16" },
      confidence: "high",
      notes:
        "The BCCR does not require teams to carry a separate tow rope/strap as recovery equipment. §3.16.1 does allow the car's mounted front/rear tow point itself to be constructed as 'a suitable front and rear tow hook (or chain or strap)' rather than a rigid hook — that's a construction option for the fixed tow point (see the tow_hook category), not a requirement to carry a loose towing rope/strap.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "No warning-triangle or roadside-emergency-triangle requirement was found anywhere in the BCCR.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No first aid kit requirement was found anywhere in the BCCR. §1.3.4 requires competitors to carry personal health/medical insurance, but that's an insurance mandate, not an equipment requirement for a first aid kit.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "9.5.1" },
      confidence: "medium",
      notes:
        "No hood-pin-specific requirement found. §9.5.1 (Body Panels): 'All operable components of the vehicle's body (e.g. - hood, doors, hatch or trunk lid) shall have a latching mechanism or be securely fastened.' This is a general body-panel rule satisfied by a functioning stock latch alone (it's phrased as latch OR secure fastening, not a mandate to go beyond the stock latch), so it isn't modeled as a hood_pins requirement — flagged here since a driver adding hood pins would obviously also satisfy it.",
    },
    spill_kit: {
      requirement: "required",
      citation: { ...sourceDoc, section: "8.1.2.2" },
      confidence: "high",
      notes:
        "Rule text (§8.1.2): 'While in the pits, each team entered in the event is REQUIRED to have ready a minimum of one (1) each: ... 8.1.2.2. Ten (10) pound bag of grease sweep, kitty litter or other absorbent for oil leaks and/or fuel spillage in their fuel storage area.' This is pit/paddock-area team equipment (kept at the fuel storage area) rather than something mounted in the car itself, but it is an explicit, mandatory absorbent spill-containment kit every team must have on hand. Separately, §8.1.2.3 requires a metal or chemical-resistant fueling catch pan (≥3\" deep, ≥1 gal capacity) — related but distinct fueling equipment, not modeled here since it has no absorbent-material component of its own.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: false,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 2500, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }] },
        { minSizes: [{ outerDiameterIn: 1.75, wallThicknessIn: 0.095 }, { outerDiameterIn: 1.5, wallThicknessIn: 0.12 }], materialNote: "For over 2500 lbs (as raced, without fuel and driver)." },
      ],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      citation: { ...sourceDoc, section: "3.1.1, 3.2.1-3.2.15" },
      confidence: "high",
      notes:
        "§3.1.1: 'A quality, well-fabricated, full roll cage is required' for every car — weld-in or bolt-in, but design/construction must maintain typical SCCA/NASA standards. Requires: full-width main hoop (one continuous tube, 3/16\" tech-inspection hole, as close as possible to the roof/B-pillars on closed cars); a halo hoop; two driver-side door bars (NASCAR or Double-V style recommended, X-design acceptable with reinforcement) plus at least one passenger-side door/sill/floor bar; main-hoop rear back-stays near 45°; one main-hoop diagonal; a shoulder-harness bar; a dash bar (the factory dash support bar doesn't qualify); complete 360° welds; DOM mild steel strongly recommended over ERW. Limited to 8 body/frame mounting points (with some exclusions for seat sub-frames, welded tabs, and pedal-box bracing). The driver's helmet must not extend above the main hoop's centerline when belted in, for every driver on the team. Padding: high-density roll bar padding wherever a driver's extremity may contact a tube, SFI 45.1-rated padding specifically wherever a helmet may contact the cage.",
    },
  },
};

export const champcarRulesets: Ruleset[] = [endurance];
