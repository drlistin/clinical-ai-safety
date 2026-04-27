import type { PdfBuilder } from "./builder";
import {
  CLINICAL,
  type ControlEntry,
  NAVY,
  NAVY_BG,
  NAVY_LIGHT,
  NAVY_MID,
  TEXT_BODY,
  WHITE,
} from "./types";

function drawScorePanel(
  b: PdfBuilder,
  label: string,
  score: number,
  rationale: string,
  evidence: string[],
  x: number,
  yPos: number,
  width: number,
  challenged?: boolean,
  adjustedScore?: number,
) {
  const { doc } = b;
  const rationaleLines = rationale ? doc.splitTextToSize(rationale, width - 24) : [];
  const evLine = evidence.length > 0 ? evidence.join(", ") : "";
  const evLines = evLine ? doc.splitTextToSize(evLine, width - 24) : [];
  const rationaleH = rationaleLines.length * 12;
  const evH = evLines.length > 0 ? evLines.length * 11 + 14 : 0;
  const challengedH = challenged ? 14 : 0;
  const panelH = 56 + rationaleH + evH + challengedH;

  b.fill(WHITE);
  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, yPos, width, panelH, 4, 4, "FD");

  b.fill(challenged ? [156, 28, 60] : CLINICAL);
  doc.rect(x, yPos, 3, panelH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  b.ink(CLINICAL);
  doc.text(label.toUpperCase(), x + 12, yPos + 14, { charSpace: 1.2 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  b.ink(NAVY);
  doc.text(String(score), x + 12, yPos + 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  b.ink(NAVY_MID);
  doc.text("of 5", x + 12 + doc.getTextWidth(String(score)) + 6, yPos + 42);

  // Challenged badge + governance-adjusted value
  if (challenged) {
    const badgeText = "CHALLENGED";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    const tw = doc.getTextWidth(badgeText);
    const numW = doc.getTextWidth(String(score));
    const badgeX = x + 12 + numW + 6 + doc.getTextWidth("of 5") + 8;
    const badgeY = yPos + 34;
    b.fill([255, 235, 238]);
    b.stroke([244, 143, 177]);
    doc.setLineWidth(0.4);
    doc.roundedRect(badgeX, badgeY, tw + 8, 9, 2, 2, "FD");
    b.ink([156, 28, 60]);
    doc.text(badgeText, badgeX + 4, badgeY + 6.5, { charSpace: 0.6 });

    if (typeof adjustedScore === "number") {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      b.ink([156, 28, 60]);
      doc.text(
        "Governance-adjusted: " + adjustedScore + " of 5",
        x + 12,
        yPos + 56,
      );
    }
  }

  let cy = yPos + 58 + challengedH;
  if (rationaleLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    b.ink(TEXT_BODY);
    doc.text(rationaleLines, x + 12, cy);
    cy += rationaleH + 6;
  }
  if (evLines.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    b.ink(CLINICAL);
    doc.text("EVIDENCE BASIS", x + 12, cy, { charSpace: 1.1 });
    cy += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    b.ink(NAVY_MID);
    doc.text(evLines, x + 12, cy);
  }
}

type AdjustedScores = {
  challenged1: boolean;
  challenged2: boolean;
  adjusted1: number;
  adjusted2: number;
  adjustedRiskScore: number;
  adjustedRiskBand: string;
  direction: "upward" | "downward" | "mixed" | "none";
};

function drawScoreBlock(
  b: PdfBuilder,
  label1: string,
  score1: number,
  rationale1: string,
  evidence1: string[],
  label2: string,
  score2: number,
  rationale2: string,
  evidence2: string[],
  riskScore: number,
  band: string,
  sharedRationale?: string,
  acceptability?: string,
  adjusted?: AdjustedScores,
) {
  const { doc, MARGIN, CONTENT_W, pageWidth } = b;
  const colGap = 16;
  const colW = (CONTENT_W - colGap) / 2;

  const r1Lines = rationale1 ? doc.splitTextToSize(rationale1, colW - 24).length : 0;
  const r2Lines = rationale2 ? doc.splitTextToSize(rationale2, colW - 24).length : 0;
  const ev1Extra = evidence1.length > 0 ? doc.splitTextToSize(evidence1.join(", "), colW - 24).length * 11 + 14 : 0;
  const ev2Extra = evidence2.length > 0 ? doc.splitTextToSize(evidence2.join(", "), colW - 24).length * 11 + 14 : 0;
  const challenged1 = !!adjusted?.challenged1;
  const challenged2 = !!adjusted?.challenged2;
  const ch1Extra = challenged1 ? 14 : 0;
  const ch2Extra = challenged2 ? 14 : 0;
  const panelH = Math.max(
    56 + r1Lines * 12 + ev1Extra + ch1Extra,
    56 + r2Lines * 12 + ev2Extra + ch2Extra,
  );

  b.ensureRoom(panelH + 70);
  drawScorePanel(b, label1, score1, rationale1, evidence1, MARGIN, b.y, colW, challenged1, adjusted?.adjusted1);
  drawScorePanel(b, label2, score2, rationale2, evidence2, MARGIN + colW + colGap, b.y, colW, challenged2, adjusted?.adjusted2);
  b.y += panelH + 10;

  const showAdjusted = !!adjusted && (adjusted.challenged1 || adjusted.challenged2);
  const blockH = showAdjusted ? 52 : 32;
  b.ensureRoom(blockH + 6);
  b.fill(NAVY_BG);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, blockH, 4, 4, "F");
  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, blockH, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  b.ink(CLINICAL);
  doc.text(showAdjusted ? "USER-ENTERED RISK SCORE" : "RISK SCORE", MARGIN + 14, b.y + 14, { charSpace: 1.2 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  b.ink(NAVY);
  doc.text(score1 + " x " + score2 + " = " + riskScore, MARGIN + 14, b.y + 27);

  b.bandChip(band, pageWidth - MARGIN - 80, b.y + 22, 9, 10, 5);

  if (showAdjusted && adjusted) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    b.ink([156, 28, 60]);
    const adjHeader =
      adjusted.direction === "downward"
        ? "GOVERNANCE-ADJUSTED SCORE (DOWNWARD CORRECTION)"
        : adjusted.direction === "upward"
          ? "GOVERNANCE-ADJUSTED SCORE (UPWARD CORRECTION)"
          : "GOVERNANCE-ADJUSTED SCORE";
    doc.text(adjHeader, MARGIN + 14, b.y + 38, { charSpace: 1.2 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    b.ink(NAVY);
    doc.text(adjusted.adjusted1 + " x " + adjusted.adjusted2 + " = " + adjusted.adjustedRiskScore, MARGIN + 14, b.y + 49);
    b.bandChip(adjusted.adjustedRiskBand, pageWidth - MARGIN - 80, b.y + 42, 9, 9, 4);
  }
  b.y += blockH + 10;

  if (sharedRationale) {
    b.sectionLabel("Residual rationale", 10);
    b.body(sharedRationale);
  }
  if (acceptability) {
    b.sectionLabel("Overall acceptability", 10);
    b.body(acceptability);
  }
}

function drawConcernBanner(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  b.ensureRoom(48);
  b.fill([255, 248, 245]);
  b.stroke([255, 213, 179]);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, 40, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  b.ink(CLINICAL);
  doc.text("GOVERNANCE CONCERN", MARGIN + 14, b.y + 14, { charSpace: 1.2 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  b.ink(NAVY);
  doc.text(report.governanceConcern, MARGIN + 14, b.y + 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  b.ink(TEXT_BODY);
  const lines = doc.splitTextToSize(report.governanceConcernRationale, CONTENT_W - 130 - 14);
  doc.text(lines.slice(0, 2), MARGIN + 130, b.y + 18);
  b.y += 52;
}

function drawControlsTable(b: PdfBuilder, controls: ControlEntry[]): void {
  const { doc, MARGIN, CONTENT_W, CONTENT_BOTTOM } = b;
  if (controls.length === 0) {
    b.muted("No controls recorded.");
    return;
  }
  const headers = ["Control", "Type", "Origin", "Status", "Verification"];
  const widths = [CONTENT_W * 0.42, CONTENT_W * 0.13, CONTENT_W * 0.13, CONTENT_W * 0.16, CONTENT_W * 0.16];
  b.tableHeader(headers, widths);
  for (let i = 0; i < controls.length; i++) {
    const c = controls[i];
    const cells = [c.text, c.type, c.origin, c.implementationStatus, c.verificationStatus];
    const wrapped = cells.map((cell, idx) => doc.splitTextToSize(cell, widths[idx] - 16));
    const rowH = Math.max(...wrapped.map((w) => w.length)) * 12 + 14;
    if (b.y + rowH > CONTENT_BOTTOM) {
      b.startPage();
      b.ink(NAVY_MID);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Risk and Controls Matrix (continued)", MARGIN, b.y);
      b.y += 16;
      b.tableHeader(headers, widths);
    }
    b.tableRow(cells, widths, i);
  }
  b.y += 12;
}

export function drawPage3(b: PdfBuilder): void {
  const { doc, MARGIN, report } = b;
  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Risk and Controls Matrix", MARGIN, b.y);
  b.y += 22;
  b.hrule();

  drawConcernBanner(b);

  b.sectionLabel("Initial risk assessment", 14);
  drawScoreBlock(
    b,
    "Severity", report.initialSeverity, report.severityRationale, report.severityEvidence,
    "Likelihood", report.initialLikelihood, report.likelihoodRationale, report.likelihoodEvidence,
    report.initialRiskScore, report.initialRiskBand,
    undefined,
    undefined,
    {
      challenged1: report.severityChallenged,
      challenged2: report.likelihoodChallenged,
      adjusted1: report.adjustedSeverity,
      adjusted2: report.adjustedLikelihood,
      adjustedRiskScore: report.adjustedRiskScore,
      adjustedRiskBand: report.adjustedRiskBand,
      direction: report.scoreAdjustmentDirection,
    },
  );
  b.y += 4;

  drawScoreBlock(
    b,
    "Residual severity", report.residualSeverity, "", [],
    "Residual likelihood", report.residualLikelihood, "", [],
    report.residualRiskScore, report.residualRiskBand,
    report.residualRationale, report.overallAcceptability,
  );
  b.y += 8;

  b.sectionLabel("Controls register", 14);
  drawControlsTable(b, report.controls);
}
