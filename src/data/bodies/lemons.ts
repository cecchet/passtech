import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

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
        {
          standardId: "sfi-3.2a-3",
          note: "NOT YET IN REGISTRY — cited verbatim by Lemons as a single-layer tier ('SFI 3.2A/1 or 3.2A/3'). Flagged for reconciliation; the standards.ts registry currently only has SFI 3-2A tiers /1, /5, /10, /15, /20.",
        },
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
        "Rule text: 'Full SFI 3.2A-; or SFI 3.4-; or FIA 8856-2000; or FIA 8856-2018-certified fire-retardant driving suits must be worn by all drivers at all times while inside the car.' No suit age/expiration limit is stated anywhere in the rulebook (unlike the helmet's SA2015 cutoff). Military-spec and firefighter suits are explicitly rejected even though 'they may very well be superior' — only FIA/SFI-rated suits qualify. See undergarment category for the single- vs multi-layer underwear condition, and the flagged SFI 3.2A/3 tier above.",
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
  },
};

export const lemonsRulesets: Ruleset[] = [endurance];
