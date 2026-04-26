/**
 * Clinical Safety Hazard Log Report — branded PDF export.
 *
 * 4-page governance-grade report aligned to ISO 14971, DCB0129, DCB0160:
 *   1. Executive Summary       — pdf/page1.ts
 *   2. Formal Hazard Log Entry — pdf/page2.ts
 *   3. Risk & Controls Matrix  — pdf/page3.ts
 *   4. Monitoring & Governance — pdf/page4.ts
 *
 * Page chrome (header bar + framework footer) is stamped on every page.
 * Page numbers are added in a final pass once total page count is known.
 *
 * jsPDF is loaded via dynamic import so the simulator's initial bundle
 * stays small — the import only fires when the user clicks Export.
 */

import { PdfBuilder } from "./pdf/builder";
import { drawPage1 } from "./pdf/page1";
import { drawPage2 } from "./pdf/page2";
import { drawPage3 } from "./pdf/page3";
import { drawPage4 } from "./pdf/page4";

export type { ControlEntry, HazardLogReport } from "./pdf/types";
import type { HazardLogReport } from "./pdf/types";

export async function exportHazardLogPdf(
  report: HazardLogReport,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const builder = new PdfBuilder(doc, report);

  builder.startPage();
  drawPage1(builder);

  builder.startPage();
  drawPage2(builder);

  builder.startPage();
  drawPage3(builder);

  builder.startPage();
  drawPage4(builder);

  builder.stampPageNumbers();

  doc.save("hazard-log-report.pdf");
}
