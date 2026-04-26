/**
 * Scenario registry. Future scenarios append to `scenarios` and become
 * available to the simulator via getScenarioById(). Nothing else changes.
 */

import type { Scenario } from "./types";
import { cancerReferralTriage } from "./cancerReferralTriage";

export const scenarios: Scenario[] = [cancerReferralTriage];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

/** Default scenario surfaced when the simulator loads with no explicit selection. */
export const defaultScenario: Scenario = cancerReferralTriage;

export type { Scenario } from "./types";
