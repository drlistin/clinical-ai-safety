/**
 * Clinical Safety Hazard Log Report, branded PDF export.
 * 4 pages aligned to ISO 14971, DCB0129, DCB0160. jsPDF loaded via dynamic
 * import. Logo fetched once and reused across pages.
 */

import { PdfBuilder } from "./pdf/builder";
import { drawPage1 } from "./pdf/page1";
import { drawPage2 } from "./pdf/page2";
import { drawPage3 } from "./pdf/page3";
import { drawPage4 } from "./pdf/page4";

export type {
  ActionEntry,
  ControlEntry,
  HazardLogReport,
} from "./pdf/types";
import type { HazardLogReport } from "./pdf/types";

async function loadLogo(): Promise<{ data: string; aspect: number } | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/logo-navbar.png", { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const aspect = await new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width / img.height || 3.77);
      img.onerror = () => resolve(3.77);
      img.src = data;
    });
    return { data, aspect };
  } catch {
    return null;
  }
}

export async function exportHazardLogPdf(
  report: HazardLogReport,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const logo = await loadLogo();
  const builder = new PdfBuilder(
    doc,
    report,
    logo?.data ?? null,
    logo?.aspect ?? 3.77,
  );

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
