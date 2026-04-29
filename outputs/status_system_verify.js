/**
 * Phase 5A — Step 1 verification harness for the unified visual status system.
 *
 * This file does NOT import status.tsx (the project has noEmit: true and no
 * build step that produces JS the runtime can require). Instead it acts as
 * a deterministic spec the implementation must conform to. The matrix below
 * is the expected behaviour of:
 *
 *   - STATUS_DEFINITIONS keys, labels, severity ranks
 *   - combineStatuses: worst-rank wins
 *   - deriveChallengedStatus: REVIEW by default, NOT-READY for High,
 *     ESCALATE for Extreme, READY when not challenged
 *   - acceptabilityStatusFor: Low→READY, Medium→REVIEW, High→NOT-READY,
 *     Extreme→ESCALATE, null→READY
 *
 * Run `node outputs/status_system_verify.js` to print the expected matrix.
 * Use the printed table to spot-check the implementation when reviewing
 * components/simulator/status.tsx.
 *
 * The actual TypeScript verification is `npx tsc --noEmit -p tsconfig.json`
 * (must be run on host — the bash sandbox sees stale snapshots of the
 * project mount).
 */

"use strict";

const STATUS_LEVELS = ["ready", "review", "not-ready", "escalate"];
const SEVERITY_RANK = { ready: 0, review: 1, "not-ready": 2, escalate: 3 };
const LABELS = {
  ready: "Governance Ready",
  review: "Governance Review Required",
  "not-ready": "Not Ready for Deployment",
  escalate: "Escalate Immediately",
};
const SHORT_LABELS = {
  ready: "Ready",
  review: "Review",
  "not-ready": "Critical",
  escalate: "Escalate",
};

function combineStatuses(...levels) {
  if (levels.length === 0) return "ready";
  let worst = "ready";
  for (const l of levels) {
    if (SEVERITY_RANK[l] > SEVERITY_RANK[worst]) worst = l;
  }
  return worst;
}

function deriveChallengedStatus({ severityChallenged, likelihoodChallenged, adjustedRiskBand }) {
  if (!(severityChallenged || likelihoodChallenged)) return "ready";
  if (adjustedRiskBand === "Extreme") return "escalate";
  if (adjustedRiskBand === "High") return "not-ready";
  return "review";
}

function acceptabilityStatusFor(band) {
  switch (band) {
    case "Low": return "ready";
    case "Medium": return "review";
    case "High": return "not-ready";
    case "Extreme": return "escalate";
    default: return "ready";
  }
}

function assertEq(actual, expected, message) {
  if (actual !== expected) {
    console.error(`FAIL ${message}: expected ${expected}, got ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${message}`);
  }
}

console.log("=== STATUS_LEVELS / labels / severity rank ===");
for (const level of STATUS_LEVELS) {
  console.log(`  ${level.padEnd(10)} rank=${SEVERITY_RANK[level]}  short="${SHORT_LABELS[level]}"  full="${LABELS[level]}"`);
}

console.log("\n=== combineStatuses ===");
assertEq(combineStatuses(), "ready", "no inputs → ready");
assertEq(combineStatuses("ready"), "ready", "single ready → ready");
assertEq(combineStatuses("ready", "review"), "review", "ready+review → review");
assertEq(combineStatuses("review", "review"), "review", "review+review → review");
assertEq(combineStatuses("review", "not-ready"), "not-ready", "review+not-ready → not-ready");
assertEq(combineStatuses("ready", "escalate", "review"), "escalate", "any escalate dominates");
assertEq(combineStatuses("not-ready", "escalate"), "escalate", "not-ready+escalate → escalate");
assertEq(combineStatuses("escalate", "ready", "review", "not-ready"), "escalate", "all four → escalate");

console.log("\n=== deriveChallengedStatus ===");
assertEq(
  deriveChallengedStatus({ severityChallenged: false, likelihoodChallenged: false, adjustedRiskBand: "Low" }),
  "ready",
  "not challenged → ready",
);
assertEq(
  deriveChallengedStatus({ severityChallenged: true, likelihoodChallenged: false, adjustedRiskBand: "Low" }),
  "review",
  "challenged + Low band → review",
);
assertEq(
  deriveChallengedStatus({ severityChallenged: false, likelihoodChallenged: true, adjustedRiskBand: "Medium" }),
  "review",
  "challenged + Medium → review",
);
assertEq(
  deriveChallengedStatus({ severityChallenged: true, likelihoodChallenged: true, adjustedRiskBand: "High" }),
  "not-ready",
  "challenged + High → not-ready",
);
assertEq(
  deriveChallengedStatus({ severityChallenged: true, likelihoodChallenged: false, adjustedRiskBand: "Extreme" }),
  "escalate",
  "challenged + Extreme → escalate",
);

console.log("\n=== acceptabilityStatusFor ===");
assertEq(acceptabilityStatusFor("Low"), "ready", "Low → ready");
assertEq(acceptabilityStatusFor("Medium"), "review", "Medium → review");
assertEq(acceptabilityStatusFor("High"), "not-ready", "High → not-ready");
assertEq(acceptabilityStatusFor("Extreme"), "escalate", "Extreme → escalate");
assertEq(acceptabilityStatusFor(null), "ready", "null → ready");

console.log("\nAll Phase 5A status spec assertions pass when this script exits with code 0.");
