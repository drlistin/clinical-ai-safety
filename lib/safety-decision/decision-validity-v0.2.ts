/**
 * INTERNAL research-only v0.2 decision-validity checks.
 *
 * Deterministic consistency and document-claim challenges ONLY. These rules
 * cannot independently establish that a control works, a hazard set is
 * complete, that a risk band is correct, or that deployment is authorised.
 */
import type {
  CandidateFindingV02, ControlRiskEffectV02, DecisionChallengeResultV02,
  DecisionChallengeV02, DecisionContextV02, EvidenceKindV02,
  EvidenceV02, SafeguardV02,
} from "./decision-validity-types-v0.2";

export const DECISION_VALIDITY_RULESET = "0.2.0-proposal" as const;

const has = (s: string | null | undefined): s is string =>
  typeof s === "string" && s.trim().length > 0;

const isoDay = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s));

type FindingDraft = Omit<CandidateFindingV02, "id" | "reviewerDisposition">;

function finding(
  criterionId: CandidateFindingV02["criterionId"],
  status: CandidateFindingV02["status"],
  subjectIds: string[],
  reason: string,
  requiredAction: string,
  evidenceIds: string[] = [],
): FindingDraft {
  return {
    criterionId, status, subjectIds, reason, requiredAction, evidenceIds,
    uncertainty: "Documented links and assertions have been checked only. Actual applicability, clinical materiality, control effectiveness and authority require qualified review.",
  };
}

function adequatelyReferenced(e: EvidenceV02 | undefined, ctx: DecisionContextV02): boolean {
  return Boolean(e && has(e.sourceId) && has(e.sourceVersion) &&
    has(e.reviewerId) && has(e.reviewedAt) && isoDay(e.reviewedAt) &&
    e.reviewedAt <= ctx.asOfDate &&
    (!e.sourceDate || (isoDay(e.sourceDate) && e.sourceDate <= ctx.asOfDate)));
}

function matchesLocalContext(e: EvidenceV02, ctx: DecisionContextV02): boolean {
  const s = e.appliesTo;
  return has(s.productVersion) && s.productVersion === ctx.productVersion &&
    s.modelVersion === ctx.modelVersion &&
    has(s.careSetting) && s.careSetting === ctx.careSetting &&
    has(s.population) && s.population === ctx.population &&
    has(s.workflowId) && s.workflowId === ctx.workflowId;
}

function supports(
  e: EvidenceV02 | undefined,
  kind: EvidenceKindV02,
  ctx: DecisionContextV02,
): boolean {
  if (!e || e.kind !== kind || !adequatelyReferenced(e, ctx)) return false;
  if (kind === "local-implementation" || kind === "local-effectiveness") {
    if (!matchesLocalContext(e, ctx)) return false;
  }
  if (kind === "local-effectiveness") {
    // Method and denominator *presence*, NOT credibility/adequacy verification.
    return has(e.methodDescription) && has(e.outcomeDefinition) &&
      has(e.denominatorDefinition);
  }
  return true;
}

function anySupports(
  ids: string[],
  kind: EvidenceKindV02,
  refs: Map<string, EvidenceV02>,
  ctx: DecisionContextV02,
): boolean {
  return ids.some((id) => supports(refs.get(id), kind, ctx));
}

function validateContext(input: DecisionChallengeV02, results: FindingDraft[]): void {
  const ctx = input.context;
  const dims = new Map(ctx.contextDimensions.map((d) => [d.id, d]));
  if (!has(ctx.id) || !has(ctx.asOfDate) || !isoDay(ctx.asOfDate) ||
    !has(ctx.deploymentOrganisation) || !has(ctx.productVersion) ||
    !has(ctx.careSetting) || !has(ctx.population) || !has(ctx.workflowId) ||
    !has(ctx.intendedUse) || !has(ctx.proposedDecision)) {
    results.push(finding("SDC-01", "evidence-insufficient", [ctx.id],
      "The proposed decision lacks required basic scope, identity or date information.",
      "Provide a dated intended-use and local workflow boundary."));
  }
  if (ctx.materialContextDimensionIds.length === 0) {
    results.push(finding("SDC-01", "requires-qualified-review", [ctx.id],
      "No scenario-specific material context dimensions have been identified.",
      "Have a qualified reviewer establish which workflow facts are decision-critical."));
  }
  for (const id of new Set(ctx.materialContextDimensionIds)) {
    const d = dims.get(id);
    if (!d || d.status === "unknown" || (d.status === "known" && !has(d.description)) ||
      (d.status === "not-applicable" && !has(d.applicabilityReason))) {
      results.push(finding("SDC-01", "evidence-insufficient", [ctx.id, id],
        "A context dimension declared material to this decision is unknown, missing, or lacks a reason for exclusion.",
        "Document the relevant workflow detail or provide a reviewed not-applicable rationale."));
    }
  }
}

function checkEvidence(
  input: DecisionChallengeV02,
  results: FindingDraft[],
): void {
  const ctx = input.context;
  const seen = new Set<string>();
  for (const e of input.evidence) {
    if (seen.has(e.id)) {
      results.push(finding("SDC-09", "identified-inconsistency", [e.id],
        "Evidence identifier is duplicated; references are ambiguous.",
        "Provide distinct, stable evidence identifiers.", [e.id]));
    }
    seen.add(e.id);
    if ((has(e.sourceDate) && (!isoDay(e.sourceDate) || e.sourceDate > ctx.asOfDate)) ||
      (has(e.reviewedAt) && (!isoDay(e.reviewedAt) || e.reviewedAt > ctx.asOfDate))) {
      results.push(finding("SDC-09", "identified-inconsistency", [e.id],
        "An evidence source or review record is dated after the proposed decision, or its date is malformed.",
        "Correct the evidence timeline or remove hindsight information.", [e.id]));
    }
  }
}

function checkControl(
  c: SafeguardV02,
  refs: Map<string, EvidenceV02>,
  input: DecisionChallengeV02,
  results: FindingDraft[],
): void {
  const ids = new Set(input.hazards.map((h) => h.id));
  if (c.hazardIds.length === 0 || c.hazardIds.some((id) => !ids.has(id))) {
    results.push(finding("SDC-10", "evidence-insufficient", [c.id],
      "The purported safeguard has no valid link to the hazard it is expected to address.",
      "Document the specific hazard link and proposed interruption mechanism."));
  }
  if (c.role === "safeguard" &&
    (c.mechanism === "none" || !has(c.mechanismExplanation))) {
    results.push(finding("SDC-10", "potential-concern", [c.id],
      "The record labels an activity as a safeguard without describing a risk-interruption mechanism.",
      "Have a qualified reviewer establish the preventive, detection, mitigation or recovery pathway."));
  }
  if (c.role === "workflow-activity" && c.mechanism !== "none") {
    results.push(finding("SDC-10", "potential-concern", [c.id],
      "A workflow activity is also claimed to have a control mechanism without separating the underlying hazardous activity from its safeguard.",
      "Clarify whether a genuinely distinct risk-reducing action exists."));
  }
  if (!has(c.accountableOwner) && c.role === "safeguard") {
    results.push(finding("SDC-03", "evidence-insufficient", [c.id],
      "No accountable owner is recorded for the purported safeguard.",
      "Document who owns operational implementation, effectiveness and escalation."));
  }
  if (c.status !== "proposed" &&
    !anySupports(c.implementationEvidenceIds, "local-implementation", refs, input.context)) {
    results.push(finding("SDC-04", "evidence-insufficient", [c.id],
      "An implemented safeguard is claimed, but no applicable reviewed local implementation record is referenced.",
      "Supply genuine local implementation evidence and verify relevance to this workflow.",
      c.implementationEvidenceIds));
  }
  if (c.status === "effectiveness-claimed" &&
    !anySupports(c.effectivenessEvidenceIds, "local-effectiveness", refs, input.context)) {
    results.push(finding("SDC-05", "evidence-insufficient", [c.id],
      "Effectiveness is claimed without a locally applicable reviewed evaluation containing defined method, outcome and denominator.",
      "Obtain and independently appraise control-specific detection/effectiveness evidence.",
      c.effectivenessEvidenceIds));
  }
  for (const id of new Set([...c.implementationEvidenceIds, ...c.effectivenessEvidenceIds])) {
    if (!refs.has(id)) {
      results.push(finding("SDC-09", "identified-inconsistency", [c.id, id],
        "Referenced control evidence is absent from the assessment.",
        "Supply the referenced record or correct the evidence link.", [id]));
    } else if (refs.get(id)?.kind.startsWith("local-") &&
      !matchesLocalContext(refs.get(id)!, input.context)) {
      results.push(finding("SDC-09", "evidence-insufficient", [c.id, id],
        "The linked local evidence metadata does not match this product, model, setting, population and workflow.",
        "Verify transferability or obtain evidence from the intended local configuration.", [id]));
    }
  }
}

function checkControlRiskEffect(
  effect: ControlRiskEffectV02,
  hazardId: string,
  controls: Map<string, SafeguardV02>,
  refs: Map<string, EvidenceV02>,
  ctx: DecisionContextV02,
  results: FindingDraft[],
): void {
  const c = controls.get(effect.controlId);
  if (!c || !c.hazardIds.includes(hazardId)) {
    results.push(finding("SDC-07", "identified-inconsistency",
      [hazardId, effect.controlId],
      "The risk-reduction claim references a missing or unrelated control.",
      "Relink the risk effect to a control addressing this hazard."));
    return;
  }
  if (!effect.reductionClaimed) return;
  if (c.role !== "safeguard" || c.mechanism === "none" ||
    !has(c.mechanismExplanation)) {
    results.push(finding("SDC-10", "potential-concern",
      [hazardId, c.id],
      "Risk reduction is credited to an activity without a substantiated hazard-interruption mechanism.",
      "Reclassify workflow steps separately from safeguards and obtain qualified causal review."));
  }
  if (effect.assertedEffectOn === "none" || !has(effect.rationale)) {
    results.push(finding("SDC-07", "identified-inconsistency", [hazardId, c.id],
      "A reduction is claimed without explaining which risk component changes and why.",
      "Specify the claimed likelihood/severity effect and its hazard-specific rationale."));
  }
  const evidenceIds = effect.effectEvidenceIds;
  if (c.status !== "effectiveness-claimed" ||
    !anySupports(evidenceIds, "local-effectiveness", refs, ctx) ||
    !anySupports(c.effectivenessEvidenceIds, "local-effectiveness", refs, ctx)) {
    results.push(finding("SDC-07", "evidence-insufficient", [hazardId, c.id],
      "The claimed risk reduction lacks linked and applicable local effectiveness evidence for this specific safeguard.",
      "Do not credit a quantified risk reduction until the evidence and its relevance are reviewed.",
      [...new Set([...evidenceIds, ...c.effectivenessEvidenceIds])]));
  }
}

function checkRisk(
  input: DecisionChallengeV02,
  controls: Map<string, SafeguardV02>,
  refs: Map<string, EvidenceV02>,
  results: FindingDraft[],
): void {
  const riskByHazard = new Map(input.riskArguments.map((r) => [r.hazardId, r]));
  const knownHazards = new Set(input.hazards.map((h) => h.id));
  for (const r of input.riskArguments) {
    if (!knownHazards.has(r.hazardId)) {
      results.push(finding("SDC-07", "identified-inconsistency", [r.hazardId],
        "A risk argument refers to a hazard missing from the assessment.",
        "Link the risk argument to a defined applicable hazard."));
    }
    if (!has(r.riskMethodEvidenceId) ||
      !supports(refs.get(r.riskMethodEvidenceId ?? ""), "organisation-risk-method", input.context)) {
      results.push(finding("SDC-07", "evidence-insufficient", [r.hazardId],
        "The claimed risk assessment lacks an applicable reviewed and versioned organisational method reference.",
        "Supply the applicable approved methodology and criteria; review the actual document.",
        r.riskMethodEvidenceId ? [r.riskMethodEvidenceId] : []));
    }
    if (!has(r.initial.category) || !has(r.initial.reasoning) ||
      !has(r.residual.category) || !has(r.residual.reasoning)) {
      results.push(finding("SDC-07", "evidence-insufficient", [r.hazardId],
        "Initial or residual assessment category and its rationale are incomplete.",
        "Record both risk assessments under the relevant approved method; do not invent a category."));
    }
    for (const effect of r.controlEffects) {
      checkControlRiskEffect(effect, r.hazardId, controls, refs, input.context, results);
    }
  }
  for (const h of input.hazards) {
    if (!riskByHazard.has(h.id)) {
      results.push(finding("SDC-07", "evidence-insufficient", [h.id],
        "An identified hazard has no documented initial-to-residual risk argument.",
        "Record the hazard-specific assessments and unresolved risk treatment."));
    }
  }
}

function checkIndependence(input: DecisionChallengeV02, results: FindingDraft[]): void {
  const controls = new Map(input.controls.map((c) => [c.id, c]));
  for (const claim of input.independenceClaims) {
    if (claim.assertion !== "independent") continue;
    const selected = claim.controlIds.map((id) => controls.get(id));
    if (selected.length < 2 || selected.some((c) => !c)) {
      results.push(finding("SDC-06", "evidence-insufficient", claim.controlIds,
        "The independence claim has fewer than two identifiable safeguards.",
        "Confirm the controls and any asserted independence."));
      continue;
    }
    const shared = selected.reduce<string[]>(
      (acc, c, index) => index === 0 ? [...c!.dependencyIds] :
        acc.filter((id) => c!.dependencyIds.includes(id)),
      [],
    );
    if (shared.length) {
      results.push(finding("SDC-06", "potential-concern", claim.controlIds,
        "Safeguards described as independent share documented dependency or failure conditions.",
        "Review the common-cause mechanism and substantiate or revise the independence claim."));
    }
  }
}

function checkGovernance(
  input: DecisionChallengeV02,
  refs: Map<string, EvidenceV02>,
  results: FindingDraft[],
): void {
  const g = input.governance;
  const ctx = input.context;
  const checks: { label: string; person: string | null; evidence: string | null }[] = [
    { label: "Clinical Safety Officer review", person: g.csoIdentifier, evidence: g.csoReviewEvidenceId },
    { label: "Organisation risk acceptance", person: g.riskAcceptanceAuthority, evidence: g.riskAcceptanceEvidenceId },
    { label: "Deployment authorisation", person: g.deploymentAuthority, evidence: g.deploymentAuthorisationEvidenceId },
  ];
  for (const item of checks) {
    if (!has(item.person) || !has(item.evidence) ||
      !supports(refs.get(item.evidence ?? ""), "governance-decision", ctx)) {
      results.push(finding("SDC-08", "requires-qualified-review", [item.label],
        item.label + " lacks a named authority/reviewer or a relevant, reviewed decision record.",
        "Obtain documentary confirmation of scope and actual delegated authority; do not infer an approval.",
        item.evidence ? [item.evidence] : []));
    }
  }
  if (!has(g.monitoringPlanEvidenceId) ||
    !adequatelyReferenced(refs.get(g.monitoringPlanEvidenceId ?? ""), ctx)) {
    results.push(finding("SDC-08", "evidence-insufficient", ["monitoring-plan"],
      "No dated, reviewed monitoring-plan reference is documented.",
      "Specify monitoring, escalation and stop/reassessment conditions under accountable governance.",
      g.monitoringPlanEvidenceId ? [g.monitoringPlanEvidenceId] : []));
  }
}

/** Candidate document-claim findings; does not calculate or accept clinical risk. */
export function evaluateDecisionValidityV02(input: DecisionChallengeV02): DecisionChallengeResultV02 {
  const results: FindingDraft[] = [];
  const refs = new Map(input.evidence.map((e) => [e.id, e]));
  const controls = new Map(input.controls.map((c) => [c.id, c]));
  validateContext(input, results);
  checkEvidence(input, results);
  for (const c of input.controls) checkControl(c, refs, input, results);
  checkRisk(input, controls, refs, results);
  checkIndependence(input, results);
  checkGovernance(input, refs, results);
  return {
    ruleSetVersion: DECISION_VALIDITY_RULESET,
    reviewStatus: "unadjudicated",
    deploymentApproval: "not-assessed",
    residualRiskClassification: "not-determined",
    findings: results.map((f, n) => ({
      ...f, id: "V02-F-" + String(n + 1).padStart(3, "0"),
      reviewerDisposition: null,
    })),
  };
}
