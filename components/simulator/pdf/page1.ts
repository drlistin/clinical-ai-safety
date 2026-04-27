import type { PdfBuilder } from "./builder";
import {
  CLINICAL,
  NAVY,
  NAVY_BG,
  NAVY_LIGHT,
  NAVY_MID,
  STATUS_PALETTES,
  TEXT_BODY,
  WHITE,
} from "./types";

export function drawPage1(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;

  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Clinical Safety Hazard Log Report", MARGIN, b.y);
  b.y += 24;

  b.ink(NAVY_MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const subtitle = report.systemName
    ? report.scenarioName + ", " + report.systemName + (report.systemVersion ? " (" + report.systemVersion + ")" : "")
    : report.scenarioName;
  doc.text(doc.splitTextToSize(subtitle, CONTENT_W), MARGIN, b.y);
  b.y += 18;

  b.hrule();

  b.sectionLabel("Document control", 18);
  drawDocumentControl(b);

  b.y += 4;
  b.hrule();

  b.sectionLabel("Governance validation", 16);
  drawGovernanceValidation(b);

  b.y += 4;
  b.hrule();

  b.sectionLabel("Risk summary", 16);
  drawRiskSummary(b);

  if (report.governanceConcernRationale) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    b.ink(NAVY_MID);
    const lines = doc.splitTextToSize(
      "Governance concern, " + report.governanceConcernRationale,
      CONTENT_W,
    );
    b.ensureRoom(lines.length * 12 + 6);
    doc.text(lines, MARGIN, b.y);
    b.y += lines.length * 12 + 14;
  }

  b.sectionLabel("Workflow status", 14);
  drawWorkflowStrip(b);
}

function drawDocumentControl(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  const colGap = 18;
  const colW = (CONTENT_W - colGap * 2) / 3;
  const dateFmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const meta: Array<[string, string]> = [
    ["Document ID", report.hazardId],
    ["Version", report.version],
    ["Status", report.status],
    ["Date created", dateFmt(report.dateCreated)],
    ["Last reviewed", dateFmt(report.lastReviewed)],
    ["Next review", dateFmt(report.reviewDate)],
    ["Author", report.author || "(to be assigned)"],
    ["Reviewer", report.reviewer || "(to be assigned)"],
    ["Approver", report.approver || "(to be assigned)"],
  ];

  for (let row = 0; row < 3; row++) {
    b.ensureRoom(40);
    for (let col = 0; col < 3; col++) {
      const [label, value] = meta[row * 3 + col];
      const x = MARGIN + col * (colW + colGap);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      b.ink(CLINICAL);
      doc.text(label.toUpperCase(), x, b.y, { charSpace: 1.4 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      b.ink(NAVY);
      const lines = doc.splitTextToSize(value, colW);
      doc.text(lines.slice(0, 2), x, b.y + 14);
    }
    b.y += 38;
  }
}

function drawGovernanceValidation(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  const palette = STATUS_PALETTES[report.governanceStatus] ?? STATUS_PALETTES["Needs review"];
  b.ensureRoom(32);
  b.statusChip(report.governanceStatus, palette, MARGIN, b.y + 14, 9, 12, 5);
  b.y += 28;

  if (report.criticalWarnings.length > 0) drawIssueList(b, "Critical warnings", report.criticalWarnings, [156, 28, 60]);
  if (report.requiredImprovements.length > 0) drawIssueList(b, "Required improvements", report.requiredImprovements, [121, 85, 0]);
  if (report.criticalWarnings.length === 0 && report.requiredImprovements.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    b.ink(TEXT_BODY);
    doc.text("No automated issues detected. Take to the Clinical Safety Group for review.", MARGIN, b.y);
    b.y += 18;
  }
  void CONTENT_W;
}

function drawIssueList(b: PdfBuilder, label: string, items: string[], accent: [number, number, number]) {
  const { doc, MARGIN, CONTENT_W } = b;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  b.ink(NAVY);
  doc.text(label.toUpperCase(), MARGIN, b.y, { charSpace: 1.2 });
  b.y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  b.ink(TEXT_BODY);
  for (const item of items) {
    const lines = doc.splitTextToSize(item, CONTENT_W - 14);
    b.ensureRoom(lines.length * 13 + 8);
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(MARGIN, b.y - 7, 3, 3, "F");
    doc.text(lines, MARGIN + 12, b.y);
    b.y += lines.length * 13 + 4;
  }
  b.y += 8;
}

function drawRiskSummary(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;

  // Row of 5 cards: user-entered initial, governance-adjusted initial,
  // residual, governance concern, overall acceptability.
  const userScoreSub =
    "Severity " +
    report.initialSeverity +
    " x Likelihood " +
    report.initialLikelihood;
  // Adjusted-score sub-text reflects WHICH direction the correction went so
  // a reviewer can see at a glance whether the user under- or over-scored.
  const dir = report.scoreAdjustmentDirection;
  const adjustedSuffix =
    dir === "upward"
      ? " (reference values applied, upward correction)"
      : dir === "downward"
        ? " (credible-impact ceiling applied, downward correction)"
        : dir === "mixed"
          ? " (governance correction applied)"
          : "";
  const adjustedSub =
    "Severity " +
    report.adjustedSeverity +
    " x Likelihood " +
    report.adjustedLikelihood +
    adjustedSuffix;
  const challenged =
    report.severityChallenged || report.likelihoodChallenged;

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    band?: string;
    challenged?: boolean;
  }> = [
    {
      label: "User-entered risk score",
      value: String(report.initialRiskScore),
      sub: userScoreSub,
      band: report.initialRiskBand,
      challenged,
    },
    {
      label: "Governance-adjusted score",
      value: String(report.adjustedRiskScore),
      sub: adjustedSub,
      band: report.adjustedRiskBand,
    },
    {
      label: "Residual risk score",
      value: String(report.residualRiskScore),
      sub:
        "Severity " +
        report.residualSeverity +
        " x Likelihood " +
        report.residualLikelihood,
      band: report.residualRiskBand,
    },
    {
      label: "Governance concern",
      value: report.governanceConcern,
      sub:
        dir === "downward"
          ? "follows credible workflow impact"
          : dir === "upward"
            ? "follows worst-credible severity"
            : dir === "mixed"
              ? "follows governance-corrected severity"
              : "follows submitted severity",
      band: report.governanceConcern,
    },
    {
      label: "Overall acceptability",
      value: report.overallAcceptability,
      sub: "",
    },
  ];

  const cellGap = 6;
  const cellW = (CONTENT_W - cellGap * (cards.length - 1)) / cards.length;
  const cellH = 88;
  b.ensureRoom(cellH + 8);
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const x = MARGIN + i * (cellW + cellGap);
    b.stroke(NAVY_LIGHT);
    doc.setLineWidth(0.5);
    b.fill(WHITE);
    doc.roundedRect(x, b.y, cellW, cellH, 4, 4, "FD");
    if (card.challenged) {
      b.fill([156, 28, 60]);
    } else {
      b.fill(CLINICAL);
    }
    doc.rect(x, b.y, 3, cellH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    b.ink(CLINICAL);
    const labelLines = doc.splitTextToSize(
      card.label.toUpperCase(),
      cellW - 18,
    );
    doc.text(labelLines.slice(0, 2), x + 10, b.y + 14, { charSpace: 1.1 });

    if (card.label === "Governance concern") {
      b.bandChip(card.value, x + 10, b.y + 50, 9, 9, 4);
    } else if (card.label === "Overall acceptability") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      b.ink(NAVY);
      const lines = doc.splitTextToSize(card.value, cellW - 18);
      doc.text(lines.slice(0, 3), x + 10, b.y + 40);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      b.ink(NAVY);
      doc.text(card.value, x + 10, b.y + 50);
      const band = card.band;
      if (band) {
        const numW = doc.getTextWidth(card.value);
        b.bandChip(band, x + 10 + numW + 6, b.y + 48, 6.5, 5, 3);
      }
      if (card.challenged) {
        const badgeX = x + 10;
        const badgeY = b.y + 56;
        const badgeText = "CHALLENGED";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        const tw = doc.getTextWidth(badgeText);
        b.fill([255, 235, 238]);
        b.stroke([244, 143, 177]);
        doc.setLineWidth(0.4);
        doc.roundedRect(badgeX, badgeY, tw + 8, 9, 2, 2, "FD");
        b.ink([156, 28, 60]);
        doc.text(badgeText, badgeX + 4, badgeY + 6.5, { charSpace: 0.6 });
      }
    }

    if (card.sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      b.ink(NAVY_MID);
      const subLines = doc.splitTextToSize(card.sub, cellW - 16);
      doc.text(subLines.slice(0, 3), x + 10, b.y + cellH - 18);
    }
  }
  b.y += cellH + 16;
}

function drawWorkflowStrip(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  const steps = [
    "Hazard identified",
    "Cause identified",
    "Initial risk assessed",
    "Controls identified",
    "Residual risk assessed",
    report.approver ? "Sign-off approved" : "Sign-off pending",
  ];
  const completed = report.approver ? steps.length : steps.length - 1;
  const stepGap = 6;
  const stepW = (CONTENT_W - stepGap * (steps.length - 1)) / steps.length;
  const stepH = 30;
  b.ensureRoom(stepH + 6);
  for (let i = 0; i < steps.length; i++) {
    const x = MARGIN + i * (stepW + stepGap);
    const done = i < completed;
    if (done) { b.fill([232, 245, 233]); b.stroke([165, 214, 167]); }
    else { b.fill(NAVY_BG); b.stroke(NAVY_LIGHT); }
    doc.setLineWidth(0.5);
    doc.roundedRect(x, b.y, stepW, stepH, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    b.ink(done ? [27, 94, 32] : NAVY_MID);
    const lines = doc.splitTextToSize(steps[i].toUpperCase(), stepW - 12);
    doc.text(lines, x + 6, b.y + (lines.length === 1 ? 18 : 13), { charSpace: 1.1 });
  }
  b.y += stepH + 8;
}
