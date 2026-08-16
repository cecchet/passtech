import { Ruleset } from "../types";
import { SCCA_TT_LEVEL2_CATEGORIES, SCCA_TT_LEVEL2_SOURCE } from "./scca-time-trial-base";

/**
 * Appalachian HillClimb Series (AHS) doesn't restate its own driver-equipment rules — every
 * class just cites "SCCA Level 2 Safety" or "SCCA Level 3 Safety" and defers to the base SCCA
 * Time Trial Rules. Safety Level 3 (required for AHS's Classic Stock Car/Outlaw/Special
 * Limited/Special Open classes) adds only a roll cage on top of Level 2 — no additional driver
 * gear — so it's driver-PPE-identical to Level 2 and doesn't need a second ruleset here.
 */
const hillClimb: Ruleset = {
  id: "appalachian-hillclimb",
  bodyId: "appalachian",
  bodyName: "SCCA Time Trial — Appalachian HillClimb Series (AHS)",
  disciplineName: "Hillclimb",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-15",
  sourceDocuments: [
    {
      title: "Appalachian HillClimb Series — Competition Rules (Classing and Rules)",
      url: "https://www.appalachianhillclimb.com/#/rules-and-classes",
      section: "Class requirements (SCCA Level 2/3 Safety)",
    },
    SCCA_TT_LEVEL2_SOURCE,
  ],
  categories: SCCA_TT_LEVEL2_CATEGORIES,
};

export const appalachianRulesets: Ruleset[] = [hillClimb];
