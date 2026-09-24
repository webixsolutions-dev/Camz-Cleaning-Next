import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { centsToDollars } from "@/lib/crm/money";
import type { CompanyLike, InvoiceAddress, InvoiceLike } from "@/lib/crm/pdf";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BLUE = rgb(0.059, 0.361, 0.659);
const NAVY = rgb(0.09, 0.125, 0.20);
const TEXT = rgb(0.20, 0.25, 0.32);
const MUTED = rgb(0.42, 0.47, 0.55);
const LIGHT = rgb(0.90, 0.93, 0.96);
const PALE_BLUE = rgb(0.95, 0.98, 1.0);
const WHITE = rgb(1, 1, 1);
const RED = rgb(0.78, 0.17, 0.27);

function money(cents?: number | null) {
  return `$${centsToDollars(cents)}`;
}

function formatQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return "0";
  return String(Math.max(0, Math.round(quantity)));
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function publicDiscountReason(value?: string | null) {
  const raw = String(value || "");
  return raw.startsWith("public:") ? raw.slice(7).trim() : "";
}

function addressLines(address?: InvoiceAddress | null) {
  if (!address) return [] as string[];
  return [
    address.line1,
    address.line2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];
}

function wrap(font: PDFFont, value: string, size: number, maxWidth: number) {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function embedLogo(doc: PDFDocument, src?: string | null): Promise<PDFImage | null> {
  if (!src) return null;

  try {
    let bytes: Uint8Array;
    let mime = "";
    const cleanSrc = src.split("?")[0];

    if (src.startsWith("data:")) {
      const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) return null;
      mime = match[1].toLowerCase();
      bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
    } else if (src.startsWith("http://") || src.startsWith("https://")) {
      const response = await fetch(src, { cache: "no-store" });
      if (!response.ok) return null;
      mime = (response.headers.get("content-type") || "").toLowerCase();
      bytes = new Uint8Array(await response.arrayBuffer());
    } else {
      // The HTML preview can resolve `/logo.png` in the browser, but pdf-lib runs
      // on the server and cannot fetch a relative URL. Read the same asset from
      // Next.js' public directory so the downloaded PDF gets the real logo too.
      const relativePath = decodeURIComponent(cleanSrc).replace(/^\/+/, "").replace(/^public\//, "");
      if (!relativePath || relativePath.includes("..")) return null;
      const publicPath = path.join(process.cwd(), "public", relativePath);
      bytes = new Uint8Array(await readFile(publicPath));
    }

    const lowerSrc = cleanSrc.toLowerCase();
    if (!mime) {
      if (lowerSrc.endsWith(".png")) mime = "image/png";
      else if (lowerSrc.endsWith(".jpg") || lowerSrc.endsWith(".jpeg")) mime = "image/jpeg";
    }

    if (mime.includes("png")) return doc.embedPng(bytes);
    if (mime.includes("jpeg") || mime.includes("jpg")) return doc.embedJpg(bytes);

    console.warn("CRM invoice logo format is not supported by pdf-lib:", src);
    return null;
  } catch (error) {
    console.error("CRM invoice logo embed skipped:", src, error);
    return null;
  }
}

function statusLabel(invoice: InvoiceLike) {
  if (invoice.is_void) return "CANCELLED";
  const status = String(invoice.status || "draft").toLowerCase();
  if (status === "draft") return "DRAFT";
  if (status === "issued" || status === "overdue") return "UNPAID";
  if (status === "partially_paid") return "PARTIALLY PAID";
  if (status === "paid") return "PAID";
  if (status === "void" || status === "cancelled") return "CANCELLED";
  return status.replaceAll("_", " ").toUpperCase();
}

export async function buildInvoicePdfBytes(options: {
  invoice: InvoiceLike;
  company?: CompanyLike;
  logoSrc?: string | null;
}) {
  const invoice = options.invoice;
  const company = options.company || {};
  const number = invoice.invoice_number || "DRAFT";
  const companyName = company.trade_name || "Camz Cleaning";
  const legalName = company.legal_name || "Camzio Professional Services Inc.";
  const companyEmail = company.email || "info@camzcleaning.com";
  const companyPhone = company.phone || "587-837-1977";
  const companyWebsite = company.website || "www.camzcleaning.com";
  const companyAddress = [
    company.address_line1 || "4 Saddlecreek Terrace NE",
    company.address_line2,
    [company.city || "Calgary", company.province || "AB", company.postal_code || "T3J 4A5"]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean) as string[];

  const customer = invoice.crm_customers;
  const billingAddress = invoice.billing_address || customer?.crm_customer_addresses?.[0] || null;
  const serviceAddress = invoice.service_address || billingAddress || null;
  const items = invoice.crm_invoice_items || [];
  const serviceType = invoice.service_type || invoice.service_name || items[0]?.description || "Cleaning Service";
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const discount = Number(invoice.discount_cents || 0);
  const discountReason = publicDiscountReason(invoice.discount_reason);
  const balance = Number(invoice.balance_cents || 0);
  const status = statusLabel(invoice);

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = (await embedLogo(doc, options.logoSrc)) || (await embedLogo(doc, "/camz-invoice-logo.png"));

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const footerReserve = 52;

  const drawText = (
    target: PDFPage,
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont = regular,
    color = TEXT,
  ) => {
    target.drawText(String(value ?? ""), { x, y: top - size, size, font, color });
  };

  const drawRight = (
    target: PDFPage,
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont = regular,
    color = TEXT,
  ) => {
    const width = font.widthOfTextAtSize(value, size);
    drawText(target, value, x - width, top, size, font, color);
  };

  const drawLine = (target: PDFPage, yPos: number, color = LIGHT, thickness = 1) => {
    target.drawLine({ start: { x: MARGIN, y: yPos }, end: { x: PAGE_W - MARGIN, y: yPos }, color, thickness });
  };

  const addPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const ensure = (need: number) => {
    if (y - need < MARGIN + footerReserve) addPage();
  };

  // Header: larger logo with company name and subtitle directly underneath.
  let logoBottom = y - 74;
  if (logo) {
    const scaled = logo.scaleToFit(142, 74);
    page.drawImage(logo, { x: MARGIN, y: y - scaled.height, width: scaled.width, height: scaled.height });
    logoBottom = y - scaled.height;
  } else {
    page.drawRectangle({ x: MARGIN, y: y - 66, width: 66, height: 66, color: PALE_BLUE, borderColor: LIGHT, borderWidth: 1 });
    drawText(page, "C", MARGIN + 23, y - 16, 27, bold, BLUE);
    logoBottom = y - 66;
  }

  const brandX = MARGIN;
  const brandNameTop = logoBottom - 10;
  drawText(page, companyName, brandX, brandNameTop, 16, bold, BLUE);
  drawText(page, "Professional Cleaning Services", brandX, brandNameTop - 20, 8.2, bold, MUTED);
  drawText(page, `Operated by ${legalName}`, brandX, brandNameTop - 39, 8.3, bold, TEXT);
  let companyY = brandNameTop - 53;
  for (const line of companyAddress) {
    drawText(page, line, brandX, companyY, 8.2, regular, MUTED);
    companyY -= 11;
  }
  drawText(page, `${companyPhone} | ${companyEmail} | ${companyWebsite}`, brandX, companyY, 8.2, regular, MUTED);

  drawRight(page, "INVOICE", PAGE_W - MARGIN, y + 1, 29, bold, NAVY);
  const metaX = PAGE_W - MARGIN - 182;
  const metaW = 182;
  const metaTop = y - 37;
  page.drawRectangle({ x: metaX, y: metaTop - 76, width: metaW, height: 76, color: PALE_BLUE, borderColor: LIGHT, borderWidth: 1 });
  const metaRows: Array<[string, string]> = [
    ["Invoice #", number],
    ["Invoice Date", formatDate(invoice.invoice_date || invoice.issue_date || invoice.issued_at) || "—"],
    ["Due Date", formatDate(invoice.due_date) || "—"],
    ["Status", status],
  ];
  metaRows.forEach(([label, value], index) => {
    const rowTop = metaTop - 8 - index * 18;
    drawText(page, label, metaX + 10, rowTop, 8.2, regular, MUTED);
    drawRight(page, value, metaX + metaW - 10, rowTop, 8.4, bold, status === "CANCELLED" ? RED : NAVY);
  });

  y -= 170;
  page.drawRectangle({ x: MARGIN, y: y, width: CONTENT_W, height: 4, color: BLUE });
  y -= 24;

  // Bill to + service address
  const gap = 16;
  const boxW = (CONTENT_W - gap) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + gap;
  const boxH = 112;
  page.drawRectangle({ x: leftX, y: y - boxH, width: boxW, height: boxH, borderColor: LIGHT, borderWidth: 1 });
  page.drawRectangle({ x: rightX, y: y - boxH, width: boxW, height: boxH, borderColor: LIGHT, borderWidth: 1 });
  drawText(page, "BILL TO", leftX + 12, y - 12, 8.5, bold, BLUE);
  drawText(page, customer?.display_name || "Customer", leftX + 12, y - 31, 10.5, bold, NAVY);
  let ly = y - 48;
  for (const value of [customer?.email, customer?.phone, ...addressLines(billingAddress)].filter(Boolean) as string[]) {
    const lines = wrap(regular, value, 8.6, boxW - 24);
    for (const line of lines) {
      drawText(page, line, leftX + 12, ly, 8.6, regular, MUTED);
      ly -= 11;
    }
  }

  drawText(page, "SERVICE ADDRESS", rightX + 12, y - 12, 8.5, bold, BLUE);
  let ry = y - 31;
  const serviceLines = addressLines(serviceAddress);
  if (!serviceLines.length) serviceLines.push("Not provided");
  for (const value of serviceLines) {
    const lines = wrap(regular, value, 8.6, boxW - 24);
    for (const line of lines) {
      drawText(page, line, rightX + 12, ry, 8.6, regular, MUTED);
      ry -= 11;
    }
  }
  ry -= 4;
  drawText(page, `Service Date: ${formatDate(invoice.service_date) || "—"}`, rightX + 12, ry, 8.5, bold, TEXT);
  ry -= 13;
  for (const line of wrap(bold, `Service Type: ${serviceType}`, 8.5, boxW - 24)) {
    drawText(page, line, rightX + 12, ry, 8.5, bold, TEXT);
    ry -= 11;
  }

  y -= boxH + 26;

  // Items table header
  ensure(50);
  const qtyRight = 398;
  const rateRight = 482;
  const amountRight = PAGE_W - MARGIN;
  page.drawRectangle({ x: MARGIN, y: y - 22, width: CONTENT_W, height: 22, color: BLUE });
  drawText(page, "SERVICE / DESCRIPTION", MARGIN + 8, y - 6, 8.2, bold, WHITE);
  drawRight(page, "QTY", qtyRight, y - 6, 8.2, bold, WHITE);
  drawRight(page, "RATE", rateRight, y - 6, 8.2, bold, WHITE);
  drawRight(page, "AMOUNT", amountRight - 6, y - 6, 8.2, bold, WHITE);
  y -= 32;

  if (!items.length) {
    drawText(page, "No line items", MARGIN + 8, y, 9, regular, MUTED);
    y -= 24;
    drawLine(page, y);
    y -= 12;
  }

  for (const item of items) {
    const lineTotal = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
    const description = item.details ? `${item.description} — ${item.details}` : item.description;
    const descLines = wrap(regular, description, 9.2, qtyRight - MARGIN - 54);
    const rowHeight = Math.max(32, descLines.length * 12 + 10);
    ensure(rowHeight + 12);
    descLines.forEach((line, index) => drawText(page, line, MARGIN + 8, y - index * 12, 9.2, index === 0 ? bold : regular, TEXT));
    drawRight(page, formatQuantity(item.quantity), qtyRight, y, 9.2, regular, TEXT);
    drawRight(page, money(item.unit_cents), rateRight, y, 9.2, regular, TEXT);
    drawRight(page, money(lineTotal), amountRight - 6, y, 9.2, bold, NAVY);
    y -= rowHeight;
    drawLine(page, y);
    y -= 10;
  }

  // Notes + totals
  ensure(180);
  const totalsW = 218;
  const notesW = CONTENT_W - totalsW - 24;
  const totalsX = PAGE_W - MARGIN - totalsW;
  const blockTop = y;

  drawText(page, "SERVICE NOTES", MARGIN, blockTop, 8.5, bold, BLUE);
  let notesY = blockTop - 18;
  const notesText = invoice.notes || "No additional service notes.";
  for (const line of wrap(regular, notesText, 8.8, notesW)) {
    drawText(page, line, MARGIN, notesY, 8.8, regular, MUTED);
    notesY -= 12;
  }
  notesY -= 8;
  drawText(page, "Thank you for choosing Camz Cleaning.", MARGIN, notesY, 8.8, bold, BLUE);

  const totals: Array<[string, string, "normal" | "grand" | "balance"]> = [
    ["Subtotal", money(invoice.subtotal_cents), "normal"],
  ];
  if (discount > 0) {
    totals.push([`Discount${discountReason ? ` · ${discountReason}` : ""}`, `-${money(discount)}`, "normal"]);
  }
  if (invoice.tax_enabled !== false && tax > 0) {
    totals.push([`GST / Tax${invoice.tax_rate_bps ? ` (${Number(invoice.tax_rate_bps) / 100}%)` : ""}`, money(tax), "normal"]);
  }
  totals.push(["TOTAL", money(total), "grand"]);
  totals.push(["Amount Paid", money(paid), "normal"]);
  totals.push(["BALANCE DUE", money(balance), "balance"]);

  let totalsY = blockTop;
  for (const [label, value, kind] of totals) {
    const h = kind === "normal" ? 22 : 28;
    const bg = kind === "balance" ? BLUE : kind === "grand" ? PALE_BLUE : WHITE;
    page.drawRectangle({ x: totalsX, y: totalsY - h, width: totalsW, height: h, color: bg, borderColor: LIGHT, borderWidth: 1 });
    const size = kind === "normal" ? 8.5 : 10.5;
    const color = kind === "balance" ? WHITE : TEXT;
    drawText(page, label, totalsX + 9, totalsY - 6, size, kind === "normal" ? regular : bold, color);
    drawRight(page, value, totalsX + totalsW - 9, totalsY - 6, size, bold, color);
    totalsY -= h;
  }
  y = Math.min(notesY - 18, totalsY - 18);

  // E-transfer box
  ensure(94);
  const transferBody =
    company.e_transfer_instructions ||
    `Send e-transfer to: ${companyEmail}\nPlease include the invoice number and customer name in the transfer message.\nPayment is recorded manually after the e-transfer is received.`;
  const transferLines = transferBody.split(/\n+/).flatMap((line) => wrap(regular, line, 8.6, CONTENT_W - 32));
  const transferH = 32 + transferLines.length * 12;
  page.drawRectangle({ x: MARGIN, y: y - transferH, width: CONTENT_W, height: transferH, color: PALE_BLUE, borderColor: rgb(0.72, 0.84, 0.96), borderWidth: 1 });
  page.drawRectangle({ x: MARGIN, y: y - transferH, width: 4, height: transferH, color: BLUE });
  drawText(page, "PAY BY E-TRANSFER", MARGIN + 14, y - 10, 8.5, bold, BLUE);
  let transferY = y - 28;
  for (const line of transferLines) {
    drawText(page, line, MARGIN + 14, transferY, 8.6, regular, TEXT);
    transferY -= 12;
  }
  y -= transferH + 16;

  if (company.invoice_footer_text) {
    ensure(30);
    for (const line of wrap(regular, company.invoice_footer_text, 8.2, CONTENT_W)) {
      drawText(page, line, MARGIN, y, 8.2, regular, MUTED);
      y -= 11;
    }
  }

  if (invoice.is_void) {
    ensure(42);
    const label = "CANCELLED";
    const size = 28;
    const width = bold.widthOfTextAtSize(label, size);
    drawText(page, label, (PAGE_W - width) / 2, y - 4, size, bold, RED);
  }

  const pages = doc.getPages();
  pages.forEach((pdfPage, index) => {
    const footerY = 28;
    pdfPage.drawLine({ start: { x: MARGIN, y: footerY + 13 }, end: { x: PAGE_W - MARGIN, y: footerY + 13 }, thickness: 0.7, color: LIGHT });
    pdfPage.drawText(`${companyName} | Calgary, Alberta | ${companyPhone} | ${companyWebsite}`, {
      x: MARGIN,
      y: footerY,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
    const pageText = `Page ${index + 1} of ${pages.length}`;
    pdfPage.drawText(pageText, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(pageText, 7.5),
      y: footerY,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  });

  doc.setTitle(`Invoice ${number}`);
  doc.setAuthor(companyName);
  doc.setCreator("Camz Cleaning Invoice CRM");
  return doc.save();
}

export function invoicePdfFilename(invoiceNumber?: string | null) {
  const safe = String(invoiceNumber || "draft").replace(/[^\w.-]+/g, "-");
  return `Invoice-${safe}.pdf`;
}
