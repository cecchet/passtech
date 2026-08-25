import { Ruleset } from "../types";
import { SCCA_TT_LEVEL2_CATEGORIES, SCCA_TT_LEVEL2_SOURCE } from "./scca-time-trial-base";

/**
 * Appalachian HillClimb Series (AHS) doesn't restate its own driver-equipment rules — every
 * class just cites "SCCA Level 2 Safety" or "SCCA Level 3 Safety" and defers to the base SCCA
 * Time Trial Rules. Safety Level 3 (required for AHS's Classic Stock Car/Outlaw/Special
 * Limited/Special Open classes) adds only a roll cage on top of Level 2 — no additional driver
 * gear — so it's driver-PPE-identical to Level 2 and doesn't need a second ruleset here, EXCEPT
 * for rollover_protection itself, where the Level 2 (roll bar) vs Level 3 (full cage) distinction
 * is real — see that category's own override below. This app doesn't have a confirmed full list
 * of AHS's other classes, so a formal `classes`/`classOverrides` split isn't introduced here;
 * the Level-3 upgrade is instead documented in the base rule's own notes.
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
  categories: {
    ...SCCA_TT_LEVEL2_CATEGORIES,
    rollover_protection: {
      ...SCCA_TT_LEVEL2_CATEGORIES.rollover_protection!,
      notes:
        SCCA_TT_LEVEL2_CATEGORIES.rollover_protection!.notes +
        " AHS specifically requires Safety Level 3 (the full roll cage, not just the Level 2 roll bar) for its Classic Stock Car, Outlaw, Special Limited, and Special Open classes — a driver in one of those classes should plan for a full cage, not just a roll bar, even though this app doesn't yet break AHS into its own per-class rollover_protection entries.",
    },
  },
};

export const appalachianRulesets: Ruleset[] = [hillClimb];
