/**
 * Page 3 — Risk and Controls Matrix.
 * Initial assessment, residual assessment, controls table.
 */

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
  x: number,
  yPos: number,
  width: number,
) {
  const { doc } = b;
  const rationaleLines = rationale
    ? doc.splitTextToSize(rationale, width - 24)
    : [];
  const panelH = rationale ? 60 + rationaleLines.length * 12 : 56;

  b.fill(WHITE);
  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, yPos, width, panelH, 4, 4, "FD");

  b.fill(CLINICAL);
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

  if (rationale) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    b.ink(TEXT_BODY);
    doc.text(rationaleLines, x + 12, yPos + 58);
  }
}

function drawScoreBlock(
  b: PdfBuilder,
  label1: string,
  score1: number,
  rationale1: string,
  label2: string,
  score2: number,
  rationale2: string,
  riskScore: number,
  band: string,
  sharedRationale?: string,
  acceptability?: string,
) {
  const { doc, MARGIN, CONTENT_W, pageWidth } = b;
  const colGap = 16;
  const colW = (CONTENT_W - colGap) / 2;

  const r1Lines = rationale1
    ? doc.splitTextToSize(rationale1, colW - 24).length
    : 0;
  const r2Lines = rationale2
    ? doc.splitTextToSize(rationale2, colW - 24).length
    : 0;
  const panelH =
    Math.max(r1Lines, r2Lines) * 12 + (rationale1 || rationale2 ? 70 : 56);

  b.ensureRoom(panelH + 50);

  drawScorePanel(b, label1, score1, rationale1, MARGIN, b.y, colW);
  drawScorePanel(
    b,
    label2,
    score2,
    rationale2,
    MARGIN + colW + colGap,
    b.y,
    colW,
  );
  b.y += panelH + 10;

  b.ensureRoom(38);
  b.fill(NAVY_BG);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, 32, 4, 4, "F");
  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, 32, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  b.ink(CLINICAL);
  doc.text("RISK SCORE", MARGIN + 14, b.y + 14, { charSpace: 1.2 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  b.ink(NAVY);
  doc.text(`${score1} × ${score2} = ${riskScore}`, MARGIN + 14, b.y + 27);

  b.bandChip(band, pageWidth - MARGIN - 80, b.y + 22, 9, 10, 5);

  b.y += 42;

  if (sharedRationale) {
    b.sectionLabel("Residual rationale", 10);
    b.body(sharedRationale);
  }
  if (acceptability) {
    b.sectionLabel("Overall acceptability", 10);
    b.body(acceptability);
  }
}

function drawControlsTable(b: PdfBuilder, controls: ControlEntry[]): void {
  const { doc, MARGIN, CONTENT_W, CONTENT_BOTTOM } = b;

  if (controls.length === 0) {
    b.muted("No controls recorded.");
    return;
  }

  const headers = ["Control", "Type", "Owner", "Status"];
  const colWidths = [
    CONTENT_W * 0.46,
    CONTENT_W * 0.16,
    CONTENT_W * 0.22,
    CONTENT_W * 0.16,
  ];
  const padX = 10;
  const padY = 8;

  function drawHeaderRow() {
    b.ensureRoom(28);
    b.fill(NAVY);
    doc.rect(MARGIN, b.y, CONTENT_W, 24, "F");
    b.ink(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    let x = MARGIN;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i].toUpperCase(), x + padX, b.y + 16, {
        charSpace: 1.2,
      });
      x += colWidths[i];
    }
    b.y += 24;
  }

  drawHeaderRow();

  for (let i = 0; i < controls.length; i++) {
    const c = controls[i];
    const cells = [c.text, c.type, c.owner, c.status];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const wrapped = cells.map((cell, idx) =>
      doc.splitTextToSize(cell, colWidths[idx] - padX * 2),
    );
    const rowH = Math.max(...wrapped.map((w) => w.length)) * 12 + padY * 2;

    if (b.y + rowH > CONTENT_BOTTOM) {
      b.startPage();
      b.ink(NAVY_MID);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Risk & Controls Matrix (continued)", MARGIN, b.y);
      b.y += 16;
      drawHeaderRow();
    }

    if (i % 2 === 0) {
      b.fill(NAVY_BG);
      doc.rect(MARGIN, b.y, CONTENT_W, rowH, "F");
    }
    b.stroke(NAVY_LIGHT);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, b.y + rowH, MARGIN + CONTENT_W, b.y + rowH);

    b.ink(TEXT_BODY);
    let x = MARGIN;
    for (let j = 0; j < wrapped.length; j++) {
      doc.text(wrapped[j], x + padX, b.y + padY + 9);
      x += colWidths[j];
    }
    b.y += rowH;
  }
  b.y += 12;
}

export function drawPage3(b: PdfBuilder): void {
  const { doc, MARGIN, report } = b;

  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Risk & Controls Matrix", MARGIN, b.y);
  b.y += 24;
  b.hrule();

  b.sectionLabel("Initial risk assessment", 16);
  drawScoreBlock(
    b,
    "Severity",
    report.initialSeverity,
    report.severityRationale,
    "Likelihood",
    report.initialLikelihood,
    report.likelihoodRationale,
    report.initialRiskScore,
    report.initialRiskBand,
  );

  b.y += 4;

  b.sectionLabel("Residual risk assessment", 16);
  drawScoreBlock(
    b,
    "Residual severity",
    report.residualSeverity,
    "",
    "Residual likelihood",
    report.residualLikelihood,
    "",
    report.residualRiskScore,
    report.residualRiskBand,
    report.residualRationale,
    report.overallAcceptability,
  );

  b.y += 8;

  b.sectionLabel("Controls", 16);
  drawControlsTable(b, report.controls);
}
