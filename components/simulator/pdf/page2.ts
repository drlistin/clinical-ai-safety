import type { PdfBuilder } from "./builder";
import { CLINICAL, NAVY, NAVY_MID, NAVY_SOFT } from "./types";

export function drawPage2(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;

  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Formal Hazard Log Entry", MARGIN, b.y);
  b.y += 22;

  if (report.hazardClassifications.length > 0) {
    b.sectionLabel("Classification", 14);
    drawClassificationChips(b, report.hazardClassifications);
    b.y += 6;
  }

  b.sectionLabel("Affected system", 14);
  drawSystemContext(b);
  b.y += 4;

  b.sectionLabel("Clinical safety requirement", 12);
  b.body(report.safetyRequirement);

  b.sectionLabel("Benefit justification", 12);
  b.body(report.benefitJustification);

  b.hrule();

  b.ink(NAVY_MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(
    "Cause, sequence of events, hazardous situation and harm are recorded separately as required by ISO 14971.",
    MARGIN,
    b.y,
  );
  b.y += 16;

  const labelW = 140;
  const rows: Array<[string, string]> = [
    ["Hazard", report.hazard],
    ["Cause / failure mode", report.causeFailureMode],
    ["Sequence of events", report.sequenceOfEvents],
    ["Hazardous situation", report.hazardousSituation],
    ["Potential harm", report.potentialHarm],
    ["Clinical consequence", report.clinicalConsequence],
  ];
  for (let i = 0; i < rows.length; i++) {
    b.labelValueRow(rows[i][0], rows[i][1], labelW, i % 2 === 0);
  }
  void CONTENT_W;
}

function drawClassificationChips(b: PdfBuilder, tags: string[]) {
  const { doc, MARGIN, CONTENT_W } = b;
  const padX = 8;
  const rowH = 22;
  const gap = 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  let x = MARGIN;
  for (const tag of tags) {
    const tw = doc.getTextWidth(tag);
    const w = tw + padX * 2;
    if (x + w > MARGIN + CONTENT_W) {
      x = MARGIN;
      b.y += rowH + gap;
    }
    b.fill([232, 240, 250]);
    b.stroke([180, 205, 235]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, b.y, w, rowH - 4, 4, 4, "FD");
    b.ink([37, 89, 153]);
    doc.text(tag, x + padX, b.y + 12, { charSpace: 0.4 });
    x += w + gap;
  }
  b.y += rowH + 4;
}

function drawSystemContext(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  const colGap = 12;
  const cols: Array<[string, string]> = [
    ["System / module", report.systemName],
    ["Software version", report.systemVersion || "Not specified"],
    ["Workflow step", report.workflowStep || "Not specified"],
  ];
  const colW = (CONTENT_W - colGap * 2) / 3;
  b.ensureRoom(40);
  for (let i = 0; i < cols.length; i++) {
    const [label, value] = cols[i];
    const x = MARGIN + i * (colW + colGap);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    b.ink(CLINICAL);
    doc.text(label.toUpperCase(), x, b.y, { charSpace: 1.4 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    b.ink(value && value !== "Not specified" ? NAVY : NAVY_SOFT);
    const lines = doc.splitTextToSize(value, colW);
    doc.text(lines.slice(0, 2), x, b.y + 14);
  }
  b.y += 36;
}
