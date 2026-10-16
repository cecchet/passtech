// PassTech's gear checking, packaged for other apps: the Digital logbooks app's tech sheet uses it
// (as window.PassTechEngine, built by scripts/build-engine.mjs into ../logbook-app/passtech-engine.js)
// to judge each gear line the way PassTech does -- the same rulesets, standards and matcher.
export { ALL_RULESETS, getRuleset } from "@/data";
export { CATEGORY_META, CATEGORY_ORDER, PER_OCCUPANT_CATEGORIES } from "@/data/categoryMeta";
export { NOT_LISTED, standardLabel, standardsFor } from "@/data/standards";
export {
  effectiveCategories,
  evaluateCategory,
  evaluateRuleset,
  isEntryEmpty,
  newCertification,
  newExtinguisherUnit,
} from "@/lib/matcher";
