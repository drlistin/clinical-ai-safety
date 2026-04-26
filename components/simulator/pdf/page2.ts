/**
 * Page 2 — Formal Hazard Log Entry.
 * 6-row labelled table separating cause, sequence, hazardous situation and harm.
 */

import type { PdfBuilder } from "./builder";
import { CLINICAL, NAVY, NAVY_BG, NAVY_MID, NAVY_SOFT, TEXT_BODY } from "./types";

export function drawPage2(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;

  // Title
  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Formal Hazard Log Entry", MARGIN, b.y);
  b.y += 24;

  // Subtitle
  b.ink(NAVY_MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Structured per ISO 14971 — separating cause, sequence of events, hazardous situation and harm.",
    MARGIN,
    b.y,
  );
  b.y += 22;
  b.hrule();

  const rows: Array<[string, string]> = [
    ["Hazard", report.hazard],
    ["Cause / failure mode", report.causeFailureMode],
    ["Sequence of events", report.sequenceOfEvents],
    ["Hazardous situation", report.hazardousSituation],
    ["Potential harm", report.potentialHarm],
    ["Clinical consequence", report.clinicalConsequence],
  ];

  const labelW = 150;
  const valueW = CONTENT_W - labelW - 16;

  for (let i = 0; i < rows.length; i++) {
    const [label, value] = rows[i];
    const safeValue = value && value.trim() ? value : "(not provided)";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const valueLines = doc.splitTextToSize(safeValue, valueW);
    const rowH = Math.max(40, valueLines.length * 13 + 18);
    b.ensureRoom(rowH + 4);

    if (i % 2 === 0) {
      b.fill(NAVY_BG);
      doc.rect(MARGIN, b.y - 2, CONTENT_W, rowH, "F");
    }

    b.fill(CLINICAL);
    doc.rect(MARGIN, b.y - 2, 2, rowH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    b.ink(CLINICAL);
    doc.text(label.toUpperCase(), MARGIN + 12, b.y + 12, { charSpace: 1.2 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    b.ink(value && value.trim() ? TEXT_BODY : NAVY_SOFT);
    doc.text(valueLines, MARGIN + labelW + 16, b.y + 12);

    b.y += rowH;
  }
}
