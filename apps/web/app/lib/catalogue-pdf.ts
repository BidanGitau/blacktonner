import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND } from "~/lib/brand";
import type { CatalogueItem } from "~/store/catalogue";

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatKES(value: number) {
  return `KES ${value.toLocaleString()}`;
}

export async function exportCataloguePdf({
  items,
  preparedFor,
  notes,
}: {
  items: CatalogueItem[];
  preparedFor?: string;
  notes?: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const today = new Date();
  const docNumber = `BT-${today.getFullYear()}-${String(today.getTime()).slice(-6)}`;

  // Header — logo + wordmark + Blacktoner contact line
  const logoData = await loadLogoDataUrl();
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", margin, 36, 36, 36);
    } catch {
      /* ignore */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20);
  doc.text(BRAND.name, margin + 48, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("TECH CATALOGUE", margin + 48, 70, { charSpace: 1.5 });
  doc.text(`${BRAND.phone}  ·  ${BRAND.email}`, margin + 48, 82);

  // Right meta block
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("DOCUMENT NO.", pageWidth - margin, 50, { align: "right", charSpace: 1.5 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(docNumber, pageWidth - margin, 64, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("DATE", pageWidth - margin, 80, { align: "right", charSpace: 1.5 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(
    today.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
    pageWidth - margin,
    93,
    { align: "right" },
  );

  // Divider
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(margin, 110, pageWidth - margin, 110);

  // Prepared-for row
  let infoBottom = 115;
  if (preparedFor) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("PREPARED FOR", margin, 128, { charSpace: 1.5 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(preparedFor, margin, 143);
    infoBottom = 160;
  }

  // Items table
  const startY = infoBottom;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const body: any[] = [];
  items.forEach((item, index) => {
    body.push([
      String(index + 1).padStart(2, "0"),
      `${item.product.name}\n${item.product.brand}`,
      item.product.sku,
      String(item.quantity),
      formatKES(item.product.price),
      formatKES(item.product.price * item.quantity),
    ]);

    const specs = item.product.specs ?? [];
    if (specs.length) {
      body.push([
        {
          content: "",
          styles: { cellPadding: 0, lineWidth: 0 },
        },
        {
          content:
            "SPECIFICATIONS\n" +
            specs.map((s) => `•  ${s.label}: ${s.value}`).join("\n"),
          colSpan: 5,
          styles: {
            fontSize: 7.5,
            textColor: [110, 110, 110],
            fillColor: [250, 250, 249],
            cellPadding: { top: 6, right: 8, bottom: 8, left: 8 },
            lineWidth: { bottom: 0.5 },
            lineColor: [235, 235, 235],
          },
        },
      ]);
    }
  });

  autoTable(doc, {
    startY,
    head: [["#", "Item", "SKU", "Qty", "Unit Price", "Total"]],
    body,
    theme: "plain",
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [40, 40, 40],
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
      lineColor: [230, 230, 230],
      lineWidth: 0,
    },
    headStyles: {
      fillColor: [245, 245, 244],
      textColor: [120, 120, 120],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
      lineWidth: { bottom: 0.75 },
      lineColor: [20, 20, 20],
    },
    bodyStyles: {
      lineWidth: { bottom: 0.5 },
      lineColor: [235, 235, 235],
    },
    columnStyles: {
      0: { cellWidth: 28, textColor: [150, 150, 150] },
      1: { cellWidth: "auto" },
      2: { cellWidth: 90, font: "courier", fontSize: 8, textColor: [120, 120, 120] },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 75, halign: "right" },
      5: { cellWidth: 80, halign: "right", fontStyle: "bold" },
    },
  });

  const tableEndY = (doc as any).lastAutoTable.finalY ?? startY + 40;

  // Totals block
  const totalsY = tableEndY + 16;
  doc.setDrawColor(20);
  doc.setLineWidth(1.2);
  doc.line(pageWidth - margin - 200, totalsY, pageWidth - margin, totalsY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("ESTIMATED TOTAL", pageWidth - margin - 200, totalsY + 18, { charSpace: 1.5 });

  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text(formatKES(subtotal), pageWidth - margin, totalsY + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Prices valid for 7 days · Excludes delivery & taxes",
    pageWidth - margin,
    totalsY + 36,
    { align: "right" },
  );

  // Notes
  if (notes?.trim()) {
    const notesY = totalsY + 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("NOTES", margin, notesY, { charSpace: 1.5 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40);
    const split = doc.splitTextToSize(notes.trim(), pageWidth - margin * 2);
    doc.text(split, margin, notesY + 14);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 36;
  doc.setDrawColor(230);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 18, pageWidth - margin, footerY - 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60);
  doc.text(
    `${BRAND.name}  ·  ${BRAND.address}`,
    margin,
    footerY - 4,
  );
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(
    `${BRAND.phone}  ·  ${BRAND.email}  ·  ${BRAND.domain}`,
    margin,
    footerY + 8,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Page 1`, pageWidth - margin, footerY + 8, { align: "right" });

  const filename = `Blacktoner-Catalogue-${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
