/**
 * PdfBuilder — encapsulates jsPDF state + shared drawing helpers.
 *
 * Each page module receives a builder instance and operates on it. This
 * shape exists primarily so the PDF generator can be split across files
 * without losing access to the y-cursor and shared chrome routines.
 */

import type jsPDF from "jspdf";
import {
  BAND_PALETTES,
  CLINICAL,
  DISCLAIMER_LEFT,
  FRAMEWORK_LINE,
  type HazardLogReport,
  NAVY,
  NAVY_BG,
  NAVY_DARK,
  NAVY_LIGHT,
  NAVY_MID,
  NAVY_SOFT,
  type RGB,
  TEXT_BODY,
  WHITE,
} from "./types";

export class PdfBuilder {
  doc: jsPDF;
  report: HazardLogReport;

  pageWidth: number;
  pageHeight: number;
  MARGIN = 48;
  HEADER_H = 64;
  FOOTER_H = 60;
  CONTENT_TOP: number;
  CONTENT_BOTTOM: number;
  CONTENT_W: number;

  y: number;
  isFirstPage = true;

  constructor(doc: jsPDF, report: HazardLogReport) {
    this.doc = doc;
    this.report = report;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.CONTENT_TOP = this.HEADER_H + 28;
    this.CONTENT_BOTTOM = this.pageHeight - this.FOOTER_H - 16;
    this.CONTENT_W = this.pageWidth - this.MARGIN * 2;
    this.y = this.CONTENT_TOP;
  }

  fill = (c: RGB) => this.doc.setFillColor(c[0], c[1], c[2]);
  stroke = (c: RGB) => this.doc.setDrawColor(c[0], c[1], c[2]);
  ink = (c: RGB) => this.doc.setTextColor(c[0], c[1], c[2]);

  drawHeaderBar() {
    const { doc, pageWidth, MARGIN, HEADER_H, report } = this;
    this.fill(NAVY_DARK);
    doc.rect(0, 0, pageWidth, HEADER_H, "F");

    this.ink(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Clinical AI Safety", MARGIN, 30);

    this.ink(NAVY_LIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("clinicalaisafety.co.uk", MARGIN, 46);

    this.ink(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const eyebrow = "CLINICAL SAFETY HAZARD LOG REPORT";
    doc.text(eyebrow, pageWidth - MARGIN - doc.getTextWidth(eyebrow), 30, {
      charSpace: 1.4,
    });

    this.ink(NAVY_LIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const hid = `${report.hazardId}  ·  v${report.version}`;
    doc.text(hid, pageWidth - MARGIN - doc.getTextWidth(hid), 46);

    this.fill(CLINICAL);
    doc.rect(0, HEADER_H, pageWidth, 2, "F");
  }

  drawFooterBar() {
    const { doc, pageWidth, pageHeight, MARGIN, FOOTER_H, CONTENT_W } = this;
    const fy = pageHeight - FOOTER_H;
    this.stroke(NAVY_LIGHT);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, fy, pageWidth - MARGIN, fy);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    this.ink(NAVY_MID);
    doc.text(
      doc.splitTextToSize(DISCLAIMER_LEFT, CONTENT_W * 0.55),
      MARGIN,
      fy + 14,
    );

    doc.setFont("helvetica", "normal");
    this.ink(NAVY_MID);
    doc.text(
      FRAMEWORK_LINE,
      pageWidth - MARGIN - doc.getTextWidth(FRAMEWORK_LINE),
      fy + 14,
    );
  }

  startPage() {
    if (!this.isFirstPage) this.doc.addPage();
    this.isFirstPage = false;
    this.drawHeaderBar();
    this.drawFooterBar();
    this.y = this.CONTENT_TOP;
  }

  ensureRoom(needed: number) {
    if (this.y + needed > this.CONTENT_BOTTOM) this.startPage();
  }

  sectionLabel(label: string, gap = 14) {
    this.ensureRoom(28);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.ink(CLINICAL);
    this.doc.text(label.toUpperCase(), this.MARGIN, this.y, { charSpace: 1.4 });
    this.y += gap;
  }

  hrule() {
    this.ensureRoom(12);
    this.stroke(NAVY_LIGHT);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.MARGIN,
      this.y,
      this.pageWidth - this.MARGIN,
      this.y,
    );
    this.y += 16;
  }

  body(text: string) {
    if (!text || !text.trim()) {
      this.muted("(not provided)");
      return;
    }
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10.5);
    this.ink(TEXT_BODY);
    const lines = this.doc.splitTextToSize(text, this.CONTENT_W);
    this.ensureRoom(lines.length * 14 + 6);
    this.doc.text(lines, this.MARGIN, this.y);
    this.y += lines.length * 14 + 14;
  }

  muted(text: string) {
    this.doc.setFont("helvetica", "italic");
    this.doc.setFontSize(10);
    this.ink(NAVY_SOFT);
    this.ensureRoom(20);
    this.doc.text(text, this.MARGIN, this.y);
    this.y += 20;
  }

  bandChip(
    band: string,
    x: number,
    yPos: number,
    fontSize = 9,
    paddingX = 8,
    paddingY = 4,
  ) {
    const palette =
      BAND_PALETTES[band] ?? { bg: NAVY_BG, fg: NAVY, border: NAVY_LIGHT };
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(fontSize);
    const tw = this.doc.getTextWidth(band.toUpperCase());
    const w = tw + paddingX * 2;
    const h = fontSize + paddingY * 2;
    this.fill(palette.bg);
    this.stroke(palette.border);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, yPos - h + paddingY, w, h, 3, 3, "FD");
    this.ink(palette.fg);
    this.doc.text(band.toUpperCase(), x + paddingX, yPos, { charSpace: 1 });
  }

  stampPageNumbers() {
    const total = this.doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      this.doc.setPage(p);
      const fy = this.pageHeight - this.FOOTER_H;
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.ink(NAVY);
      const txt = `Page ${p} of ${total}`;
      this.doc.text(
        txt,
        this.pageWidth - this.MARGIN - this.doc.getTextWidth(txt),
        fy + 28,
      );
    }
  }
}
