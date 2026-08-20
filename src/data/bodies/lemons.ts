import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const sourceDoc = {
  title: "24 Hours of Lemons — Prices & Rules",
  version: "Rules page, site-reported last modified 3/25/2026",
  url: "https://24hoursoflemons.com/prices-rules/",
};

const endurance: Ruleset = {
  id: "lemons-endurance",
  bodyId: "lemons",
  bodyName: "24 Hours of Lemons",
  disciplineName: "Endurance Road Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "3. Safety / 3.2 Mandatory Safety Gear" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "snell-sa2015",
          expiresOn: "2027-01-01",
          note: "Rule text (§3.2.1): 'Lemons will accept SA2015 helmets through 1/1/2027.'",
        },
        { standardId: "snell-sa2020", noExpiration: true, note: "Accepted as 'SA2015 or newer'; no cutoff date has been published yet for this generation." },
        { standardId: "snell-sa2025", noExpiration: true, note: "Accepted as 'SA2015 or newer'; no cutoff date has been published yet for this generation." },
        {
          standardId: "fia-8860-2000",
          noExpiration: true,
          note: "Cited verbatim in the rulebook as 'FIA 8860-2000 certification is also acceptable.' This exact spec/year combination is NOT in the app's standards registry — the real-world FIA 8860 generations are 2004/2010/2018/2024, so this may be a typo in Lemons' own rulebook (possibly meaning an early 8860 generation). Flagged for reconciliation; not mapped to an existing registry ID.",
        },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "3.2.1" },
      confidence: "high",
      notes:
        "Rule text: 'Undamaged, full-face Type SA helmet, Snell SA2015 or newer, mandatory... No open-face or hybrid helmets allowed.' Type M (motorcycle) helmets and other non-SA helmets explicitly barred as not fire-rated. Visor must be complete, closable, and intact. See notes on the FIA 8860-2000 citation above.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the rules page, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-38.1",
          noExpiration: true,
          note: "Lemons sets no body-level expiration; devices must be inspected/recertified/replaced on the manufacturer's own schedule. Rule text: 'The schedule for bodies and tethers is typically but not always once every five years.'",
        },
        { standardId: "fia-8858-2002", noExpiration: true, note: "Rule cites 'FIA 8858-rated' generically without a year; both FIA 8858 generations in the registry are offered." },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "3.2.2" },
      confidence: "high",
      notes:
        "Foam collars and any other non-SFI/FIA-rated device are explicitly disallowed. Multiple drivers may share a single unit provided fit, adjustment, mounting, and connections are correct for each driver.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1" },
        { standardId: "sfi-3.2a-3", note: "Cited verbatim by Lemons as a single-layer tier ('SFI 3.2A/1 or 3.2A/3')." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
      ],
      citation: { ...sourceDoc, section: "3.2.3" },
      confidence: "high",
      notes:
        "Rule text: 'Full SFI 3.2A-; or SFI 3.4-; or FIA 8856-2000; or FIA 8856-2018-certified fire-retardant driving suits must be worn by all drivers at all times while inside the car.' No suit age/expiration limit is stated anywhere in the rulebook (unlike the helmet's SA2015 cutoff). Military-spec and firefighter suits are explicitly rejected even though 'they may very well be superior' — only FIA/SFI-rated suits qualify. See undergarment category for the single- vs multi-layer underwear condition.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Rule text (§3.2.3): 'Fire-retardant FIA- or SFI-rated racing gloves, shoes, and socks are required.' No specific tier/spec number is named, but a certified item is required — plain fire-resistant material with no certification does not satisfy this rule.",
      citation: { ...sourceDoc, section: "3.2.3" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Same sentence as gloves (§3.2.3): 'Fire-retardant FIA- or SFI-rated racing gloves, shoes, and socks are required.' The rule also requires FR-rated socks, which is not modeled as a separate category in this app.",
      citation: { ...sourceDoc, section: "3.2.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required only when wearing a single-layer SFI 3.2A/1 or 3.2A/3 firesuit — fire-retardant SFI- or FIA-certified long underwear is then mandatory. Multilayer suits rated SFI 3.2A/5 or higher (including SFI 3.4/5) are highly recommended and may be worn without long underwear.",
      undergarmentTriggerStandards: ["sfi-3.2a-1", "sfi-3.2a-3"],
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Must be certified 'fire-retardant SFI- or FIA-certified long underwear,' not just fire-resistant material, when required. Separately (§3.2.4), non-fire-resistant synthetic undergarments (nylon, Orlon, Spandex, etc.) are strictly forbidden under the suit at all times, regardless of suit layer count, because they can melt to skin in a fire.",
      citation: { ...sourceDoc, section: "3.2.3-3.2.4" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required when driving an open T-top or convertible car (§3.2.6). Separately, §3.10.7 requires arm restraints for all drivers if a glass T-top or moonroof panel is removed and not replaced with sturdy non-breakable material or securely fixed mesh.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "No specific certification standard is named by Lemons for arm restraints themselves — a functional restraint is required; an SFI 3.3-rated device obviously qualifies.",
      citation: { ...sourceDoc, section: "3.2.6; 3.10.7-3.10.8" },
      confidence: "high",
      notes:
        "Window nets are explicitly NOT mandatory at Lemons (§3.6.4) — the rulebook even warns a net 'can also contribute to injury or death in a fire' — so arm restraints are not framed as an interchangeable alternative to a window net the way some other sanctioning bodies do; they are simply required outright for open-top cars.",
    },

    // Car safety gear
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Rule text (§3.6.1.1, re-verified against the live rules page): 'Driver's seatback must reach above middle of helmet or higher. One-piece, purpose-built racing seats with properly located, factory-provided shoulder-harness holes are mandatory. Molded plastic seats of ABS or similar material are not allowed.' No SFI/FIA seat certification label is named or required anywhere in the rulebook — materialOnlyAccepted is true on that basis, same as PHA's seat rule. This is NOT a green light for an unmodified stock/OEM daily-driver seat, though: Lemons still mandates a 'one-piece, purpose-built racing seat' with 'factory-provided shoulder-harness holes,' which a genuine stock bench or stock bucket seat generally won't have, especially once routing the mandatory 5-/6-point harness (§3.6.2.1) through it. A certified FIA/SFI seat obviously also satisfies this even though Lemons doesn't itself require a cert label — the generic seat standards list is offered on that basis.",
      citation: { ...sourceDoc, section: "3.6.1" },
      confidence: "high",
      notes:
        "Seat sliders/adjustable tracks are explicitly allowed (§3.6.1.4: 'including seats on adjustable tracks') provided there is 'minimal looseness and no back-and-forth free play' — not a fixed-mount-only requirement. All seats must be very securely mounted to the floor or cage; seatbacks must be restrained against rearward failure, either via a manufacturer-matched seatback brace (§3.6.1.2) or, if no brace is used, a shoulder-harness bar located within six inches of the seatback (§3.6.1.3). Headrest area must be strong enough not to bend in a heavy rear impact (§3.6.1.5).",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          validityYearsFromLabel: 2,
          note: "Rule text (§3.6.2.1): 'Harnesses with expiration dates are not valid after the expiration date. Harnesses with a manufacture date but no expiration date are acceptable for two years after manufacture.' The 2-year window modeled here applies only to the no-printed-expiration case; where the harness carries its own printed expiration date, that date governs instead.",
        },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
        { standardId: "sfi-16.6", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-98", validityYearsFromLabel: 2 },
      ],
      materialNote:
        "Rule text (§3.6.2.1): 'Five- or six-point harnesses are mandatory, including a fifth or fifth/sixth \"anti-submarine\" belt. All harnesses must be in excellent, near-new condition, properly mounted, and carry SFI or FIA approval tags.' Stock/OEM belts are not accepted — a certified harness is required outright. No specific SFI/FIA tier is named, so all currently-registered belts_harness standards are offered.",
      citation: { ...sourceDoc, section: "3.6.2" },
      confidence: "high",
      notes:
        "Shoulder harnesses must be two totally separate belts with separate mounting points — single-point Y-belts are not allowed — and, viewed from above, should be closer together at their mounting points than at their seat-entry points. Lap belts must be standard 2-inch or 3-inch width. Mounting hardware must be SAE Grade 8 / Metric Class 8.8 or better, with 2.5-inch-or-larger load washers required when mounting to sheet metal (§3.6.2.2).",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3.6.4" },
      confidence: "high",
      notes:
        "Rule text (§3.6.4, 'Window Nets and Driver Egress'): 'Window nets are not mandatory. While a window net can provide hand and arm protection in a rollover, it can also contribute to injury or death in a fire. If you decide to use one, it is critical that all of your drivers are well practiced at removing the net. It is also critical that they are well practiced at releasing belts, cooling tubes, radio wires, and any other attachments quickly. All drivers must be able to exit the car rapidly under potentially life-threatening conditions.' This is a deliberate driver-discretion tradeoff, not silence on the topic — a net is explicitly permitted but never required, and the rulebook actively warns about the fire-egress risk of fitting one, in ALL CAPS urging every team member to practice emergency escapes. Not framed as interchangeable with arm restraints: unlike bodies where satisfiedByAlternative applies between these two categories, Lemons requires arm restraints outright for open-top cars (§3.2.6, §3.10.7-3.10.8) regardless of whether a window net is also fitted, so no satisfiedByAlternative is set here.",
    },
    fire_extinguisher: {
      requirement: "conditional",
      condition:
        "Not a permanently car-mounted requirement — Lemons requires a fire extinguisher to be held ready by a crew member (not the driver) during hot-pit and paddock fueling stops only (§3.3.1.2: 'At least one team member must have a 2.5-lb (or larger) Type B-C (or better) fire extinguisher in hand, ready to shoot, aimed at the fueler(s).'). No extinguisher requirement is stated for the car itself outside of fueling, and fueling at a track's own permanent pumps (§3.3.1.3) doesn't trigger driver-safety-gear requirements for the fueler either.",
      fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
      citation: { ...sourceDoc, section: "3.3.1.2" },
      confidence: "high",
      notes:
        "Rule specifies a UL 'Type B-C (or better)' rating qualitatively but never gives a numeric B:C class (e.g. '5B:C' or '10B:C'), so no minBcRating is set here — only the stated 2.5 lb minimum weight.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-17.1" },
        {
          standardId: "fia-8865-2015",
          note: "Rule cites 'FIA 8865 Technical List 16- or Technical List 52-certified' — these are approved-product technical lists under the FIA 8865-2015 standard generation, not separate standard versions; both map to this single registry ID.",
        },
      ],
      citation: { ...sourceDoc, section: "3.6.3" },
      confidence: "high",
      notes:
        "Rule text: 'A fully charged, securely mounted SFI 17.1- or FIA 8865 Technical List 16- or Technical List 52-certified onboard fire-suppression system is mandatory. Minimum acceptable is a 3-liter or 2.25-kilo; larger volumes are recommended.' At least one activation mechanism must be within easy reach of the belted-in driver (an additional externally-accessible mechanism is strongly recommended, not mandatory); all activation mechanisms must carry the standard red-and-white 'E' symbol. The system must be serviced every two years by the manufacturer or an authorized agent, with an active service label showing the last-service and service-due dates. This is a mandatory onboard system, in addition to (not a substitute for) the handheld extinguisher required of fueling crew — see fire_extinguisher category.",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [{ standardId: "fia-ft3-1999" }, { standardId: "fia-ft3.5-1999" }, { standardId: "fia-ft5-1999" }],
      materialNote:
        "Rule text (§3.8.1, 3.8.3): OE fuel tanks are explicitly permitted and fuel cells are 'NOT mandatory' — 'Don't make the rookie mistake of assuming that anything billed as a \"fuel cell\" is safer than a sound OE fuel tank.' Maximum capacity (actual and manufacturer-stated) is 24 gallons. If a fuel cell is fitted, it must meet Lemons' own construction definition (§3.8.2) — a professionally made purpose-built metal container, deformable/puncture-resistant inner bladder, and fuel-resistant anti-splash foam — with no third-party SFI/FIA certification required for this general case; the OE tank must be removed if a cell is fitted (§3.8.4.5).",
      citation: { ...sourceDoc, section: "3.8.1-3.8.6" },
      confidence: "high",
      notes:
        "One narrow fallback case does require certification: if the fuel-container area can't be fully sealed off from the cockpit by metal panels, §3.8.6 requires 'a metal-encased, FIA-certified fuel cell with all related compliant fittings.' No specific FIA generation (FT3/FT3.5/FT5) is named for this case, so all three current FIA fuel-cell generations are offered — but not SFI, since §3.8.6 names FIA specifically, not 'SFI or FIA.' Fuel cell installations are also judged on 'overall execution and apparent safety' (§3.8.4), with placement/protection requirements (§3.8.4.1) and vent-line routing rules (§3.8.4.2).",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3. Safety" },
      confidence: "high",
      notes:
        "No window-breaker or seatbelt-cutter tool requirement was found anywhere in the rules page (full-text search for 'cutter'/'breaker' turned up nothing relevant). Window nets themselves are a related but distinct, separately-addressed item and are explicitly NOT mandatory at Lemons (§3.6.4) — see the arm_restraint category notes above.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "3.7.1" },
      confidence: "high",
      notes:
        "Rule text: 'All cars must have a racing-type master electrical kill switch easily turned both off and on by the belted-in driver... The control for this switch should be red; the OFF position should be clearly indicated; the switch should be easily accessible from outside the car; and the switch should be clearly marked by a three-inch or larger lightning-bolt symbol.' Must interrupt all electricity, including battery, charging, and ignition circuits. Exposed posts/connections must be insulated with electrical tape, rubber caps, or other non-conductive material — duct tape is explicitly NOT acceptable for terminal insulation (§3.7.2.2).",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...sourceDoc, section: "3.10.5" },
      confidence: "high",
      notes:
        "Rule text: 'Clearly marked, purpose-built, flexible tow straps that are easily visible without kneeling are required front and rear... Effective 3/1/2026, rigid hooks or eyes are NOT allowed: Only the flexible strap may be proud of the body.' Minimum opening size is 2.5 inches; mounting must be around solid components or with Grade 8-or-better fasteners; each tow point must be marked with the word 'TOW' and an arrow. Note this is the opposite convention from bodies that require a rigid hook — Lemons specifically bans a protruding rigid hook/eye as of 3/1/2026 in favor of a flexible strap.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3. Safety" },
      confidence: "high",
      notes:
        "No requirement to carry a separate tow rope/strap for vehicle recovery is stated. Don't confuse with §3.10.5 (mapped to the tow_hook category above), which mandates fixed, marked, flexible tow straps built into the car as tow points, not a stowed recovery rope.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3. Safety" },
      confidence: "high",
      notes: "No warning-triangle or roadside-emergency-marker requirement was found anywhere in the rules page.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3. Safety" },
      confidence: "high",
      notes:
        "No requirement for a car- or team-carried first aid kit was found in the rules page. An on-site ambulance crew is provided by Lemons as part of entry (per the Prices section), but that's an event service, not a car/team equipment requirement.",
    },
  },
};

export const lemonsRulesets: Ruleset[] = [endurance];
