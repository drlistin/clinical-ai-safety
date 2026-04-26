/**
 * Page 4 — Monitoring & Governance + sign-off blocks.
 */

import type { PdfBuilder } from "./builder";
import {
  CLINICAL,
  NAVY,
  NAVY_LIGHT,
  NAVY_MID,
  NAVY_SOFT,
  TEXT_BODY,
} from "./types";

function drawSignOffBlock(b: PdfBuilder, role: string, name: string): void {
  const { doc, MARGIN, CONTENT_W } = b;
  const blockH = 76;
  b.ensureRoom(blockH + 4);

  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, blockH, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  b.ink(CLINICAL);
  doc.text(role.toUpperCase(), MARGIN + 14, b.y + 16, { charSpace: 1.2 });

  const inner = CONTENT_W - 28;
  const colGap = 16;
  const colW = (inner - colGap * 2) / 3;
  const baseY = b.y + 56;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  b.ink(NAVY_MID);
  doc.text("NAME / ROLE", MARGIN + 14, b.y + 30, { charSpace: 1.2 });
  doc.text("SIGNATURE", MARGIN + 14 + colW + colGap, b.y + 30, {
    charSpace: 1.2,
  });
  doc.text("DATE", MARGIN + 14 + (colW + colGap) * 2, b.y + 30, {
    charSpace: 1.2,
  });

  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 14, baseY, MARGIN + 14 + colW, baseY);
  doc.line(
    MARGIN + 14 + colW + colGap,
    baseY,
    MARGIN + 14 + colW * 2 + colGap,
    baseY,
  );
  doc.line(
    MARGIN + 14 + (colW + colGap) * 2,
    baseY,
    MARGIN + 14 + (colW + colGap) * 2 + colW,
    baseY,
  );

  if (name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    b.ink(TEXT_BODY);
    const nameLines = doc.splitTextToSize(name, colW);
    doc.text(nameLines.slice(0, 1), MARGIN + 14, baseY - 4);
  }

  b.y += blockH + 10;
}

export function drawPage4(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;

  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Monitoring & Governance", MARGIN, b.y);
  b.y += 24;
  b.hrule();

  b.sectionLabel("Monitoring framework", 16);

  const monitoringRows: Array<[string, string]> = [
    ["Monitoring metric / KPI", report.monitoringMetric],
    ["Trigger threshold", report.triggerThreshold],
    ["Review frequency", report.reviewFrequency],
    ["Actions required / CAPA", report.capa],
  ];

  for (const [label, value] of monitoringRows) {
    const safe = value && value.trim() ? value : "(to be defined)";
    const lines = doc.splitTextToSize(safe, CONTENT_W - 18);
    const blockH = lines.length * 13 + 32;
    b.ensureRoom(blockH + 8);

    b.fill(CLINICAL);
    doc.rect(MARGIN, b.y, 2, blockH - 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    b.ink(CLINICAL);
    doc.text(label.toUpperCase(), MARGIN + 12, b.y + 12, { charSpace: 1.2 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    b.ink(value && value.trim() ? TEXT_BODY : NAVY_SOFT);
    doc.text(lines, MARGIN + 12, b.y + 28);

    b.y += blockH;
  }

  b.y += 8;
  b.hrule();
  b.sectionLabel("Governance & sign-off", 16);

  drawSignOffBlock(b, "Prepared by", report.owner || "");
  drawSignOffBlock(b, "Reviewed by", report.reviewer || "");
  drawSignOffBlock(b, "Approved by", report.approver || "");
}
