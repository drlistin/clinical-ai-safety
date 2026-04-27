import type { PdfBuilder } from "./builder";
import {
  CLINICAL,
  type ControlEntry,
  NAVY,
  NAVY_LIGHT,
  NAVY_MID,
  NAVY_SOFT,
  TEXT_BODY,
} from "./types";

function summariseControls(controls: ControlEntry[]): string {
  if (controls.length === 0) return "(none recorded)";
  const top = controls.slice(0, 3).map((c) => c.text);
  if (controls.length > 3) return top.join("; ") + "; plus " + (controls.length - 3) + " more";
  return top.join("; ");
}

function summariseVerification(controls: ControlEntry[]): string {
  if (controls.length === 0) return "Not applicable";
  const v = controls.filter((c) => c.verificationStatus === "Verified").length;
  const p = controls.filter((c) => c.verificationStatus === "Planned").length;
  const n = controls.filter((c) => c.verificationStatus === "Not verified").length;
  const parts: string[] = [];
  if (v) parts.push(v + " verified");
  if (p) parts.push(p + " planned");
  if (n) parts.push(n + " not verified");
  return parts.join(", ") || "No verification recorded";
}

function drawSignOffBlock(b: PdfBuilder, role: string, name: string): void {
  const { doc, MARGIN, CONTENT_W } = b;
  const blockH = 68;
  b.ensureRoom(blockH + 4);

  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, blockH, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  b.ink(CLINICAL);
  doc.text(role.toUpperCase(), MARGIN + 14, b.y + 14, { charSpace: 1.2 });

  const inner = CONTENT_W - 28;
  const colGap = 16;
  const colW = (inner - colGap * 2) / 3;
  const baseY = b.y + 50;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  b.ink(NAVY_MID);
  doc.text("NAME / ROLE", MARGIN + 14, b.y + 28, { charSpace: 1.2 });
  doc.text("SIGNATURE", MARGIN + 14 + colW + colGap, b.y + 28, { charSpace: 1.2 });
  doc.text("DATE", MARGIN + 14 + (colW + colGap) * 2, b.y + 28, { charSpace: 1.2 });

  b.stroke(NAVY_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 14, baseY, MARGIN + 14 + colW, baseY);
  doc.line(MARGIN + 14 + colW + colGap, baseY, MARGIN + 14 + colW * 2 + colGap, baseY);
  doc.line(MARGIN + 14 + (colW + colGap) * 2, baseY, MARGIN + 14 + (colW + colGap) * 2 + colW, baseY);

  if (name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    b.ink(TEXT_BODY);
    const nameLines = doc.splitTextToSize(name, colW);
    doc.text(nameLines.slice(0, 1), MARGIN + 14, baseY - 4);
  }

  b.y += blockH + 8;
}

function drawTraceabilityTable(b: PdfBuilder) {
  const { CONTENT_W, report } = b;
  const headers = ["Hazard ID", "Safety requirement", "Mitigation / Control", "Verification method", "Residual risk"];
  const widths = [CONTENT_W * 0.13, CONTENT_W * 0.24, CONTENT_W * 0.3, CONTENT_W * 0.18, CONTENT_W * 0.15];
  b.tableHeader(headers, widths);
  const cells = [
    report.hazardId,
    report.safetyRequirement,
    summariseControls(report.controls),
    summariseVerification(report.controls),
    report.residualRiskBand + " (" + report.residualRiskScore + ")",
  ];
  b.tableRow(cells, widths, 0);
  b.y += 8;
}

function drawActionTracker(b: PdfBuilder) {
  const { CONTENT_W, report } = b;
  if (report.actions.length === 0) {
    b.muted("No actions recorded.");
    return;
  }
  const headers = ["Action", "Owner", "Due date", "Status"];
  const widths = [CONTENT_W * 0.46, CONTENT_W * 0.22, CONTENT_W * 0.18, CONTENT_W * 0.14];
  b.tableHeader(headers, widths);
  for (let i = 0; i < report.actions.length; i++) {
    const a = report.actions[i];
    b.tableRow([a.action, a.owner, a.dueDate, a.status], widths, i);
  }
  b.y += 8;
}

function drawRecommendationBlock(b: PdfBuilder) {
  const { doc, MARGIN, CONTENT_W, report } = b;
  type Pal = { bg: [number, number, number]; fg: [number, number, number]; border: [number, number, number] };
  const palette: Pal =
    report.recommendation === "Not acceptable pending mitigation"
      ? { bg: [255, 235, 238], fg: [156, 28, 60], border: [244, 143, 177] }
      : report.recommendation === "Proceed to governance review"
      ? { bg: [255, 248, 225], fg: [121, 85, 0], border: [255, 213, 79] }
      : { bg: [232, 245, 233], fg: [27, 94, 32], border: [165, 214, 167] };

  b.ensureRoom(60);
  b.fill(palette.bg);
  b.stroke(palette.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, b.y, CONTENT_W, 56, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  b.ink(palette.fg);
  doc.text("RECOMMENDED NEXT STEP", MARGIN + 14, b.y + 14, { charSpace: 1.2 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  b.ink(NAVY);
  doc.text(report.recommendation, MARGIN + 14, b.y + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  b.ink(TEXT_BODY);
  const lines = doc.splitTextToSize(report.recommendationNote, CONTENT_W - 28);
  doc.text(lines.slice(0, 2), MARGIN + 14, b.y + 48);
  b.y += 66;
}

export function drawPage4(b: PdfBuilder): void {
  const { doc, MARGIN, CONTENT_W, report } = b;
  b.ink(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Monitoring, Traceability and Governance", MARGIN, b.y);
  b.y += 22;
  b.hrule();

  b.sectionLabel("Monitoring framework", 14);
  const monitoringRows: Array<[string, string]> = [
    ["Monitoring metric / KPI", report.monitoringMetric],
    ["Trigger threshold", report.triggerThreshold],
    ["Review frequency", report.reviewFrequency],
    ["Actions required / CAPA", report.capa],
  ];
  for (const [label, value] of monitoringRows) {
    const safe = value && value.trim() ? value : "(to be defined)";
    const lines = doc.splitTextToSize(safe, CONTENT_W - 16);
    const blockH = lines.length * 12 + 26;
    b.ensureRoom(blockH + 4);

    b.fill(CLINICAL);
    doc.rect(MARGIN, b.y, 2, blockH - 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    b.ink(CLINICAL);
    doc.text(label.toUpperCase(), MARGIN + 12, b.y + 10, { charSpace: 1.2 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    b.ink(value && value.trim() ? TEXT_BODY : NAVY_SOFT);
    doc.text(lines, MARGIN + 12, b.y + 24);

    b.y += blockH;
  }

  if (report.stakeholders) {
    b.sectionLabel("Stakeholders", 12);
    b.body(report.stakeholders);
  }
  if (report.assumptions) {
    b.sectionLabel("Assumptions and limitations", 12);
    b.body(report.assumptions);
  }

  b.hrule();
  b.sectionLabel("Traceability matrix", 14);
  drawTraceabilityTable(b);

  b.hrule();
  b.sectionLabel("Action tracker", 14);
  drawActionTracker(b);

  b.hrule();
  b.sectionLabel("Governance recommendation", 14);
  drawRecommendationBlock(b);

  b.hrule();
  b.sectionLabel("Sign-off", 14);
  drawSignOffBlock(b, "Prepared by", report.author);
  drawSignOffBlock(b, "Reviewed by", report.reviewer);
  drawSignOffBlock(b, "Approved by", report.approver);
}
