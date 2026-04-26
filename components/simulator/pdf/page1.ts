/**
 * Page 1 — Executive Summary.
 * Title, scenario, document metadata grid, risk summary cards, summary line.
 */

import type { PdfBuilder } from "./builder";
import { CLINICAL, NAVY, NAVY_LIGHT, NAVY_MID, NAVY_BG, WHITE } from "./types";

export function drawPage1(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;

  // Title
  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Clinical Safety Hazard Log Report", MARGIN, b.y);
  b.y += 28;

  // Subtitle (scenario name)
  b.ink(NAVY_MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Scenario  ·  ${report.scenarioName}`, MARGIN, b.y);
  b.y += 18;

  b.hrule();

  // Document metadata grid
  b.sectionLabel("Document metadata", 18);

  const colGap = 24;
  const colW = (CONTENT_W - colGap) / 2;
  const dateFmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const meta: Array<[string, string, string, string]> = [
    ["Hazard ID", report.hazardId, "Version", report.version],
    [
      "Date created",
      dateFmt(report.dateCreated),
      "Last reviewed",
      dateFmt(report.lastReviewed),
    ],
    ["Status", report.status, "Owner", report.owner || "(to be assigned)"],
    [
      "Reviewer",
      report.reviewer || "(to be assigned)",
      "Approver",
      report.approver || "(to be assigned)",
    ],
  ];

  for (const [l1, v1, l2, v2] of meta) {
    b.ensureRoom(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    b.ink(CLINICAL);
    doc.text(l1.toUpperCase(), MARGIN, b.y, { charSpace: 1.4 });
    doc.text(l2.toUpperCase(), MARGIN + colW + colGap, b.y, { charSpace: 1.4 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    b.ink(NAVY);
    const v1Lines = doc.splitTextToSize(v1, colW);
    const v2Lines = doc.splitTextToSize(v2, colW);
    doc.text(v1Lines, MARGIN, b.y + 14);
    doc.text(v2Lines, MARGIN + colW + colGap, b.y + 14);
    b.y += Math.max(v1Lines.length, v2Lines.length) * 13 + 18;
  }

  b.y += 6;
  b.hrule();

  // Risk summary cards
  b.sectionLabel("Risk summary", 18);

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    band?: string;
  }> = [
    {
      label: "Initial risk",
      value: String(report.initialRiskScore),
      sub: `Severity ${report.initialSeverity} × Likelihood ${report.initialLikelihood}`,
      band: report.initialRiskBand,
    },
    {
      label: "Residual risk",
      value: String(report.residualRiskScore),
      sub: `Severity ${report.residualSeverity} × Likelihood ${report.residualLikelihood}`,
      band: report.residualRiskBand,
    },
    {
      label: "Risk band",
      value: report.residualRiskBand,
      sub: "after controls",
    },
    {
      label: "Overall acceptability",
      value: report.overallAcceptability,
      sub: "",
    },
  ];

  const cellGap = 8;
  const cellW = (CONTENT_W - cellGap * 3) / 4;
  const cellH = 84;
  b.ensureRoom(cellH + 8);

  for (let i = 0; i < cards.length; i++) {
    const x = MARGIN + i * (cellW + cellGap);

    b.stroke(NAVY_LIGHT);
    doc.setLineWidth(0.5);
    b.fill(WHITE);
    doc.roundedRect(x, b.y, cellW, cellH, 4, 4, "FD");

    b.fill(CLINICAL);
    doc.rect(x, b.y, 3, cellH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    b.ink(CLINICAL);
    doc.text(cards[i].label.toUpperCase(), x + 12, b.y + 16, { charSpace: 1.2 });

    if (cards[i].label === "Risk band") {
      b.bandChip(cards[i].value, x + 12, b.y + 44, 10, 10, 5);
    } else if (cards[i].label === "Overall acceptability") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      b.ink(NAVY);
      const lines = doc.splitTextToSize(cards[i].value, cellW - 24);
      doc.text(lines, x + 12, b.y + 38);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      b.ink(NAVY);
      doc.text(cards[i].value, x + 12, b.y + 46);
      if (cards[i].band) {
        const numW = doc.getTextWidth(cards[i].value);
        b.bandChip(cards[i].band as string, x + 12 + numW + 8, b.y + 44, 7, 6, 3);
      }
    }

    if (cards[i].sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      b.ink(NAVY_MID);
      const subLines = doc.splitTextToSize(cards[i].sub, cellW - 24);
      doc.text(subLines, x + 12, b.y + cellH - 12);
    }
  }
  b.y += cellH + 18;

  // Summary paragraph
  b.sectionLabel("Summary", 14);
  b.body(
    `This report documents the hazard log entry for "${report.scenarioName}". ` +
      `The hazard has been assessed using a 5×5 severity-likelihood matrix in line with ISO 14971. ` +
      `Initial risk is recorded as ${report.initialRiskScore} (${report.initialRiskBand}). ` +
      `After the specified preventative, detective and corrective controls, residual risk is ${report.residualRiskScore} (${report.residualRiskBand}) — ${report.overallAcceptability.toLowerCase()}.`,
  );

  // Suppress unused-import warning for NAVY_BG (kept available for future card variants).
  void NAVY_BG;
}
