/**
 * INTERNAL expert-reference hazard/interaction comparison v0.1.1.
 *
 * Never discovers clinical hazards from keywords, never interprets negations,
 * and never concludes that the assessed hazard set is complete. A reviewed
 * reference case can highlight missing *documented mappings* only.
 */
import type {
  ExpertReferenceCase,
  HazardMapping,
  ReferenceChallengeFinding,
  ReferenceChallengeInput,
  ReferenceChallengeResult,
  ReferenceInteractionExpectation,
  ReviewedConditionObservation,
  InteractionTrace,
} from "./reference-contracts";

export const REFERENCE_CHALLENGE_RULESET_VERSION = "0.1.1" as const;

const has = (x: string | null | undefined): x is string =>
  typeof x === "string" && x.trim().length > 0;

const unique = (xs: string[]): boolean => xs.length === new Set(xs).size;

function isReviewed(ref: ExpertReferenceCase): boolean {
  return ref.status === "expert-reviewed" && has(ref.reviewerId) && has(ref.reviewedAt);
}

function isObservedPresent(
  conditionId: string,
  observations: Map<string, ReviewedConditionObservation>,
  evidence: Set<string>,
): boolean {
  const obs = observations.get(conditionId);
  return Boolean(
    obs &&
    obs.state === "present" &&
    has(obs.reviewedBy) &&
    has(obs.reviewedAt) &&
    obs.observedEvidenceIds.length > 0 &&
    obs.observedEvidenceIds.every((id) => evidence.has(id)),
  );
}

function isApplicable(
  ids: string[],
  observations: Map<string, ReviewedConditionObservation>,
  evidence: Set<string>,
): boolean {
  return ids.length > 0 && ids.every((id) => isObservedPresent(id, observations, evidence));
}

function finding(
  criterionId: ReferenceChallengeFinding["criterionId"],
  status: ReferenceChallengeFinding["status"],
  referenceId: string,
  rationale: string,
  requiredAction: string,
  evidenceIds: string[] = [],
): ReferenceChallengeFinding {
  return { criterionId, status, referenceId, rationale, requiredAction, evidenceIds };
}

function selectedHazardMapping(
  referenceId: string,
  mappings: HazardMapping[],
  hazardIds: Set<string>,
  evidence: Set<string>,
): HazardMapping | undefined {
  return mappings.find(
    (mapping) =>
      mapping.referenceHazardId === referenceId &&
      hazardIds.has(mapping.assessmentHazardId) &&
      has(mapping.reviewerId) &&
      has(mapping.reviewedAt) &&
      mapping.evidenceIds.length > 0 &&
      mapping.evidenceIds.every((id) => evidence.has(id)),
  );
}

function checkInteraction(
  interaction: ReferenceInteractionExpectation,
  traces: InteractionTrace[],
  mappings: HazardMapping[],
  hazardIds: Set<string>,
  controls: Map<string, { id: string; hazardIds: string[] }>,
  evidence: Set<string>,
  findings: ReferenceChallengeFinding[],
): void {
  const trace = traces.find((entry) => entry.referenceInteractionId === interaction.id);
  if (!trace) {
    findings.push(finding(
      "SDC-06", "potential-concern", interaction.id,
      "An expert-reviewed reference interaction is applicable, but no interaction trace is documented in the assessment. This is not proof the interaction was clinically overlooked.",
      "Ask the clinical safety reviewer to document how the combined failure conditions and mitigations were assessed.",
      interaction.evidenceIds,
    ));
    return;
  }
  const mappedHazards = interaction.referenceHazardIds
    .map((id) => selectedHazardMapping(id, mappings, hazardIds, evidence))
    .filter((mapping): mapping is HazardMapping => Boolean(mapping))
    .map((mapping) => mapping.assessmentHazardId);

  const validTrace =
    has(trace.reviewerId) &&
    has(trace.reviewedAt) &&
    has(trace.rationale) &&
    trace.evidenceIds.length > 0 &&
    trace.evidenceIds.every((id) => evidence.has(id)) &&
    mappedHazards.length === interaction.referenceHazardIds.length &&
    mappedHazards.every((id) => trace.assessmentHazardIds.includes(id)) &&
    trace.controlIds.length > 0 &&
    trace.controlIds.every((id) => {
      const control = controls.get(id);
      return control && mappedHazards.some((hazardId) => control.hazardIds.includes(hazardId));
    });

  if (!validTrace) {
    findings.push(finding(
      "SDC-06", "evidence-insufficient", interaction.id,
      "The documented interaction trace is incomplete or lacks reviewed hazard/control links. This check does not establish that the listed controls are effective.",
      "Confirm the interaction mechanism, referenced hazards, control linkage, evidence provenance and reviewer decision.",
      trace.evidenceIds,
    ));
  }
}

function validateReference(input: ReferenceChallengeInput): string[] {
  const ref = input.reference;
  const blockers: string[] = [];
  if (!isReviewed(ref)) blockers.push("Reference case has not been approved by an identified reviewer.");
  if (!has(ref.id) || !has(ref.version) || ref.intendedContextId !== input.contextId) {
    blockers.push("Reference case identity, version or intended deployment context does not match.");
  }
  const evidence = new Set(input.evidence.map((item) => item.id));
  if (ref.referenceEvidenceIds.length === 0 || !ref.referenceEvidenceIds.every((id) => evidence.has(id))) {
    blockers.push("Reference-case approval evidence is missing.");
  }
  const allHazardIds = ref.expectedHazards.map((h) => h.id);
  const allInteractionIds = ref.expectedInteractions.map((i) => i.id);
  const conditionIds = new Set(input.observations.map((c) => c.conditionId));
  if (!unique(allHazardIds) || !unique(allInteractionIds) ||
      !unique(input.observations.map((o) => o.conditionId)) ||
      !unique(input.hazards.map((h) => h.id)) ||
      !unique(input.controls.map((c) => c.id))) {
    blockers.push("Duplicate reference, observation, hazard or control identifiers prevent reliable comparison.");
  }
  for (const h of ref.expectedHazards) {
    if (h.appliesWhenAllConditions.length === 0 || !h.appliesWhenAllConditions.every((id) => conditionIds.has(id)) ||
        h.evidenceIds.length === 0 || !h.evidenceIds.every((id) => evidence.has(id))) {
      blockers.push(`Hazard expectation ${h.id} is missing condition/evidence provenance.`);
    }
  }
  for (const item of ref.expectedInteractions) {
    if (item.conditionIds.length < 2 || !item.conditionIds.every((id) => conditionIds.has(id)) ||
        item.referenceHazardIds.length === 0 || !item.referenceHazardIds.every((id) => allHazardIds.includes(id)) ||
        item.evidenceIds.length === 0 || !item.evidenceIds.every((id) => evidence.has(id))) {
      blockers.push(`Interaction expectation ${item.id} has incomplete condition, hazard or evidence references.`);
    }
  }
  return blockers;
}

/** Only structural challenges; no inference of safety, hazard coverage or effectiveness. */
export function evaluateReferenceChallenges(input: ReferenceChallengeInput): ReferenceChallengeResult {
  const blockers = validateReference(input);
  if (blockers.length) {
    return {
      ruleSetVersion: REFERENCE_CHALLENGE_RULESET_VERSION,
      comparisonStatus: "blocked",
      coverageConclusion: "not-determined",
      findings: [],
      blockers,
    };
  }

  const evidence = new Set(input.evidence.map((item) => item.id));
  const hazards = new Set(input.hazards.map((item) => item.id));
  const controls = new Map(input.controls.map((item) => [item.id, item]));
  const observed = new Map(input.observations.map((item) => [item.conditionId, item]));
  const findings: ReferenceChallengeFinding[] = [];

  for (const h of input.reference.expectedHazards) {
    if (!isApplicable(h.appliesWhenAllConditions, observed, evidence)) continue;
    if (!selectedHazardMapping(h.id, input.hazardMappings, hazards, evidence)) {
      findings.push(finding(
        "SDC-02", "potential-concern", h.id,
        "An applicable expert-reviewed reference hazard has no documented, reviewed mapping to the assessment. Equivalent hazards may exist under different wording.",
        "Ask the qualified reviewer to confirm whether the hazard is already represented, add a traceable mapping, or record a justified exclusion.",
        h.evidenceIds,
      ));
    }
  }

  for (const interaction of input.reference.expectedInteractions) {
    if (!isApplicable(interaction.conditionIds, observed, evidence)) continue;
    checkInteraction(interaction, input.interactionTraces, input.hazardMappings, hazards, controls, evidence, findings);
  }

  return {
    ruleSetVersion: REFERENCE_CHALLENGE_RULESET_VERSION,
    comparisonStatus: "requires-review",
    coverageConclusion: "not-determined",
    findings,
    blockers: [],
  };
}
