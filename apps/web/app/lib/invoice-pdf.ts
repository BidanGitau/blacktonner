import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND } from "~/lib/brand";
import type { Invoice } from "~/types";

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

const fmt = (n: number) => `KES ${Number(n).toLocaleString()}`;

export async function exportInvoicePdf(invoice: Invoice) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Header — logo + wordmark
  const logo = await loadLogoDataUrl();
  if (logo) { try { doc.addImage(logo, "PNG", margin, 36, 36, 36); } catch {} }

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(20);
  doc.text(BRAND.name, margin + 48, 56);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("INVOICE", margin + 48, 70, { charSpace: 1.5 });
  doc.text(`${BRAND.phone}  ·  ${BRAND.email}`, margin + 48, 82);

  // Right meta
  doc.setFontSize(8).setTextColor(120);
  doc.text("INVOICE NO.", pageWidth - margin, 50, { align: "right", charSpace: 1.5 });
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(20);
  doc.text(invoice.number, pageWidth - margin, 66, { align: "right" });

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("DATE", pageWidth - margin, 82, { align: "right", charSpace: 1.5 });
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(20);
  doc.text(
    new Date(invoice.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
    pageWidth - margin, 95, { align: "right" },
  );

  // Divider
  doc.setDrawColor(220).setLineWidth(0.5);
  doc.line(margin, 110, pageWidth - margin, 110);

  // Bill-to / due
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("BILL TO", margin, 130, { charSpace: 1.5 });
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
  doc.text(invoice.customer?.name ?? "", margin, 145);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(80);
  let yCursor = 158;
  if (invoice.customer?.company) { doc.text(invoice.customer.company, margin, yCursor); yCursor += 12; }
  if (invoice.customer?.phone)   { doc.text(invoice.customer.phone, margin, yCursor); yCursor += 12; }
  if (invoice.customer?.email)   { doc.text(invoice.customer.email, margin, yCursor); yCursor += 12; }
  if (invoice.customer?.address) {
    const split = doc.splitTextToSize(invoice.customer.address, 220);
    doc.text(split, margin, yCursor); yCursor += split.length * 12;
  }

  if (invoice.dueDate) {
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
    doc.text("DUE DATE", pageWidth - margin, 130, { align: "right", charSpace: 1.5 });
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
    doc.text(
      new Date(invoice.dueDate).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
      pageWidth - margin, 145, { align: "right" },
    );
  }

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
  doc.text("STATUS", pageWidth - margin, 168, { align: "right", charSpace: 1.5 });
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(20);
  doc.text(invoice.status.toUpperCase(), pageWidth - margin, 181, { align: "right" });

  // Items table
  const startY = Math.max(yCursor + 16, 200);
  autoTable(doc, {
    startY,
    head: [["#", "Item", "Qty", "Unit", "Total"]],
    body: (invoice.items ?? []).map((it, i) => [
      String(i + 1).padStart(2, "0"),
      it.sku ? `${it.description}\n${it.sku}` : it.description,
      String(it.quantity),
      fmt(Number(it.unitPrice)),
      fmt(Number(it.total)),
    ]),
    theme: "plain",
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [40, 40, 40],
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
    },
    headStyles: {
      fillColor: [245, 245, 244],
      textColor: [120, 120, 120],
      fontStyle: "bold",
      fontSize: 8,
      lineWidth: { bottom: 0.75 },
      lineColor: [20, 20, 20],
    },
    bodyStyles: { lineWidth: { bottom: 0.5 }, lineColor: [235, 235, 235] },
    columnStyles: {
      0: { cellWidth: 28, textColor: [150, 150, 150] },
      1: { cellWidth: "auto" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 90, halign: "right", fontStyle: "bold" },
    },
  });

  const tableEndY = (doc as any).lastAutoTable.finalY ?? startY + 40;
  let totalsY = tableEndY + 16;

  const totalsLeft = pageWidth - margin - 200;
  const totalsRight = pageWidth - margin;

  function totalsRow(label: string, value: string, opts: { bold?: boolean; rule?: boolean } = {}) {
    if (opts.rule) {
      doc.setDrawColor(20).setLineWidth(1.2);
      doc.line(totalsLeft, totalsY, totalsRight, totalsY);
      totalsY += 6;
    }
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.bold ? 12 : 10);
    doc.setTextColor(opts.bold ? 20 : 100);
    doc.text(label, totalsLeft, totalsY + 12);
    doc.setFontSize(opts.bold ? 14 : 11);
    doc.setTextColor(20);
    doc.text(value, totalsRight, totalsY + 12, { align: "right" });
    totalsY += opts.bold ? 22 : 18;
  }

  totalsRow("Subtotal", fmt(Number(invoice.subtotal)));
  if (Number(invoice.taxAmount) > 0) {
    totalsRow(`Tax (${Number(invoice.taxRate)}%)`, fmt(Number(invoice.taxAmount)));
  }
  totalsRow("Total", fmt(Number(invoice.total)), { bold: true, rule: true });
  if (Number(invoice.paidAmount) > 0) {
    totalsRow("Paid", `- ${fmt(Number(invoice.paidAmount))}`);
    totalsRow("Balance", fmt(Number(invoice.total) - Number(invoice.paidAmount)), { bold: true });
  }

  // Notes
  if (invoice.notes) {
    const notesY = totalsY + 24;
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(120);
    doc.text("NOTES", margin, notesY, { charSpace: 1.5 });
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40);
    const split = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(split, margin, notesY + 14);
  }

  // Footer
  const footerY = pageHeight - 36;
  doc.setDrawColor(230).setLineWidth(0.5);
  doc.line(margin, footerY - 18, pageWidth - margin, footerY - 18);
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(60);
  doc.text(`${BRAND.name}  ·  ${BRAND.address}`, margin, footerY - 4);
  doc.setFont("helvetica", "normal").setTextColor(120);
  doc.text(`${BRAND.phone}  ·  ${BRAND.email}  ·  ${BRAND.domain}`, margin, footerY + 8);
  doc.text("Thank you for your business.", pageWidth - margin, footerY + 8, { align: "right" });

  doc.save(`${invoice.number}.pdf`);
}
