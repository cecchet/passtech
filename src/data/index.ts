import { Ruleset } from "./types";
import { sccaRulesets } from "./bodies/scca";
import { araRulesets } from "./bodies/ara";
import { carsRulesets } from "./bodies/cars";
import { sccnhRulesets } from "./bodies/sccnh";
import { nehaRulesets } from "./bodies/neha";
import { nasaRulesets } from "./bodies/nasa";
import { pikespeakRulesets } from "./bodies/pikespeak";
import { phaRulesets } from "./bodies/pha";
import { appalachianRulesets } from "./bodies/appalachian";
import { lemonsRulesets } from "./bodies/lemons";
import { champcarRulesets } from "./bodies/champcar";
import { aerRulesets } from "./bodies/aer";
import { wrlRulesets } from "./bodies/wrl";
import { scdaRulesets } from "./bodies/scda";
import { pcaRulesets } from "./bodies/pca";
import { hookedOnDrivingRulesets } from "./bodies/hookedOnDriving";
import { neqRulesets } from "./bodies/neq";
import { masstuningRulesets } from "./bodies/masstuning";
import { northeastGTRulesets } from "./bodies/northeastgt";
import { amecRulesets } from "./bodies/amec";
import { gridlifeRulesets } from "./bodies/gridlife";
import { bmwccaRulesets } from "./bodies/bmwcca";
import { nhraRulesets } from "./bodies/nhra";
import { wdraRulesets } from "./bodies/wdra";
import { ihraRulesets } from "./bodies/ihra";
import { pdraRulesets } from "./bodies/pdra";

export const ALL_RULESETS: Ruleset[] = [
  ...sccaRulesets,
  ...nasaRulesets,
  ...araRulesets,
  ...carsRulesets,
  ...sccnhRulesets,
  ...nehaRulesets,
  ...pikespeakRulesets,
  ...phaRulesets,
  ...appalachianRulesets,
  ...lemonsRulesets,
  ...champcarRulesets,
  ...aerRulesets,
  ...wrlRulesets,
  ...northeastGTRulesets,
  ...scdaRulesets,
  ...pcaRulesets,
  ...hookedOnDrivingRulesets,
  ...neqRulesets,
  ...masstuningRulesets,
  ...amecRulesets,
  ...gridlifeRulesets,
  ...bmwccaRulesets,
  ...nhraRulesets,
  ...wdraRulesets,
  ...ihraRulesets,
  ...pdraRulesets,
];

export function getRuleset(id: string): Ruleset | undefined {
  return ALL_RULESETS.find((r) => r.id === id);
}

export * from "./types";
export * from "./standards";
