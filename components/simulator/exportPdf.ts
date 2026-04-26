/**
 * Branded PDF export for a completed Hazard Log entry.
 *
 * jsPDF is loaded via dynamic import so the simulator's initial bundle stays
 * small — the import only fires when the user clicks Export.
 */

export type HazardLogReport = {
  scenarioName: string;
  generatedAt: Date;
  hazard: string;
  cause: string;
  consequence: string;
  severity: number;
  likelihood: number;
  initialRisk: number;
  riskBand: string;
  preventative: string[];
  detective: string[];
  corrective: string[];
  residualRisk: string;
  monitoringTrigger: string;
  owner: string;
};

type RGB = readonly [number, number, number];

const NAVY_DARK: RGB = [5, 13, 28];
const NAVY: RGB = [10, 25, 48];
const NAVY_MID: RGB = [45, 69, 99];
const NAVY_LIGHT: RGB = [180, 195, 215];
const CLINICAL: RGB = [37, 89, 153];
const TEXT_BODY: RGB = [30, 49, 80];

const DISCLAIMER =
  "Educational simulation only. Not a substitute for local clinical safety sign-off or organisational risk assessment.";

export async function exportHazardLogPdf(
  report: HazardLogReport,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const ink = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  let pageIndex = 0;
  let y = 0;

  function drawHeader() {
    fill(NAVY_DARK);
    doc.rect(0, 0, pageWidth, 72, "F");

    ink([255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Clinical AI Safety", margin, 32);

    ink(NAVY_LIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("clinicalaisafety.co.uk", margin, 50);

    // top-right eyebrow
    ink([255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const eyebrow = "HAZARD LOG REPORT";
    const ew = doc.getTextWidth(eyebrow);
    doc.text(eyebrow, pageWidth - margin - ew, 41);
  }

  function drawFooter() {
    const fy = pageHeight - 56;
    stroke(NAVY_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(margin, fy, pageWidth - margin, fy);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    ink(NAVY_MID);
    const lines = doc.splitTextToSize(DISCLAIMER, contentWidth - 80);
    doc.text(lines, margin, fy + 14);

    // page number / brand on the right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    ink(NAVY_MID);
    const right = `clinicalaisafety.co.uk  ·  Page ${pageIndex + 1}`;
    const rw = doc.getTextWidth(right);
    doc.text(right, pageWidth - margin - rw, fy + 14);
  }

  function startPage(isFirst: boolean) {
    if (!isFirst) {
      doc.addPage();
      pageIndex++;
    }
    drawHeader();
    drawFooter();
    y = 110;
  }

  function ensureRoom(needed: number) {
    // Reserve ~80pt for the footer area
    if (y + needed > pageHeight - 80) {
      startPage(false);
    }
  }

  function drawSectionLabel(label: string) {
    ensureRoom(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    ink(CLINICAL);
    doc.text(label.toUpperCase(), margin, y, { charSpace: 1.2 });
    y += 14;
  }

  function drawBody(text: string) {
    if (!text || !text.trim()) {
      drawMuted("(not provided)");
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    ink(TEXT_BODY);
    const lines = doc.splitTextToSize(text, contentWidth);
    ensureRoom(lines.length * 14 + 8);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 18;
  }

  function drawMuted(text: string) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    ink(NAVY_MID);
    ensureRoom(20);
    doc.text(text, margin, y);
    y += 22;
  }

  function drawList(items: string[]) {
    if (items.length === 0) {
      drawMuted("(no entries)");
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const item of items) {
      const lines = doc.splitTextToSize(item, contentWidth - 18);
      ensureRoom(lines.length * 14 + 6);
      // small clinical-blue square as bullet
      fill(CLINICAL);
      doc.rect(margin, y - 7.5, 3.5, 3.5, "F");
      ink(TEXT_BODY);
      doc.text(lines, margin + 14, y);
      y += lines.length * 14 + 6;
    }
    y += 12;
  }

  function drawTitleBlock() {
    ink(NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Hazard Log Report", margin, y);
    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    ink(NAVY_MID);
    doc.text(`Scenario  ·  ${report.scenarioName}`, margin, y);
    y += 16;

    const dateStr = report.generatedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(9);
    doc.text(`Generated  ·  ${dateStr}`, margin, y);
    y += 24;

    stroke(NAVY_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 26;
  }

  function drawStats() {
    ensureRoom(76);
    const cells = [
      { label: "SEVERITY", value: String(report.severity), sub: "of 5" },
      { label: "LIKELIHOOD", value: String(report.likelihood), sub: "of 5" },
      { label: "INITIAL RISK", value: String(report.initialRisk), sub: "score" },
      { label: "RISK BAND", value: report.riskBand, sub: "" },
    ];
    const gap = 8;
    const cellWidth = (contentWidth - gap * 3) / 4;
    const cellHeight = 60;

    for (let i = 0; i < cells.length; i++) {
      const x = margin + i * (cellWidth + gap);
      stroke(NAVY_LIGHT);
      doc.setLineWidth(0.5);
      doc.rect(x, y, cellWidth, cellHeight, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      ink(CLINICAL);
      doc.text(cells[i].label, x + 12, y + 16, { charSpace: 1.2 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      ink(NAVY);
      doc.text(cells[i].value, x + 12, y + 42);

      if (cells[i].sub) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        ink(NAVY_MID);
        doc.text(cells[i].sub, x + 12, y + 54);
      }
    }
    y += cellHeight + 28;
  }

  // Render
  startPage(true);
  drawTitleBlock();

  drawSectionLabel("Hazard");
  drawBody(report.hazard);

  drawSectionLabel("Cause / failure mechanism");
  drawBody(report.cause);

  drawSectionLabel("Clinical consequence");
  drawBody(report.consequence);

  drawStats();

  drawSectionLabel("Preventative controls");
  drawList(report.preventative);

  drawSectionLabel("Detective controls");
  drawList(report.detective);

  drawSectionLabel("Corrective controls");
  drawList(report.corrective);

  drawSectionLabel("Residual risk");
  drawBody(report.residualRisk);

  drawSectionLabel("Monitoring trigger");
  drawBody(report.monitoringTrigger);

  drawSectionLabel("Owner / responsible team");
  drawBody(report.owner);

  doc.save("hazard-log-report.pdf");
}
