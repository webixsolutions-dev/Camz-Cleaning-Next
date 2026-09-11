import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { centsToDollars } from "@/lib/crm/money";
import type { CompanyLike, InvoiceAddress, InvoiceLike } from "@/lib/crm/pdf";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const NAVY = rgb(0.075, 0.149, 0.227);
const MUTED = rgb(0.29, 0.333, 0.408);
const RULE = rgb(0.54, 0.6, 0.67);
const VOID_RED = rgb(0.88, 0.11, 0.28);

function money(cents?: number | null) {
  return `$${centsToDollars(cents)}`;
}

function formatDate(value?: string | null, long = false) {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: long ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });
}

function paymentLabel(method?: string | null) {
  const key = String(method || "").toLowerCase();
  if (key === "e_transfer") return "Transfer";
  if (key === "card") return "Card";
  if (key === "cash") return "Cash";
  if (key === "cheque") return "Cheque";
  return method ? method.replaceAll("_", " ") : "Other";
}

function addressLines(address?: InvoiceAddress | null) {
  if (!address) return [] as string[];
  return [
    address.line1,
    address.line2,
    [address.city, address.province].filter(Boolean).join("  "),
    address.postal_code,
  ].filter(Boolean) as string[];
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
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
    if (src.startsWith("data:")) {
      const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) return null;
      mime = match[1].toLowerCase();
      bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
    } else if (src.startsWith("http://") || src.startsWith("https://")) {
      const response = await fetch(src);
      if (!response.ok) return null;
      mime = (response.headers.get("content-type") || "").toLowerCase();
      bytes = new Uint8Array(await response.arrayBuffer());
      if (!mime) {
        if (src.includes(".png")) mime = "image/png";
        else if (src.includes(".jpg") || src.includes(".jpeg")) mime = "image/jpeg";
      }
    } else {
      return null;
    }
    if (mime.includes("png")) return doc.embedPng(bytes);
    if (mime.includes("jpeg") || mime.includes("jpg")) return doc.embedJpg(bytes);
    return null;
  } catch (error) {
    console.error("CRM invoice logo embed skipped:", error);
    return null;
  }
}

export async function buildInvoicePdfBytes(options: {
  invoice: InvoiceLike;
  company?: CompanyLike;
  logoSrc?: string | null;
}) {
  const invoice = options.invoice;
  const company = options.company || {};
  const number = invoice.invoice_number || "DRAFT";
  const companyName = company.trade_name || company.legal_name || "Camz Cleaning";
  const customer = invoice.crm_customers;
  const address = invoice.billing_address || customer?.crm_customer_addresses?.[0] || null;
  const items = invoice.crm_invoice_items || [];
  const payments = (invoice.crm_payments || []).filter((row) => !row.is_void);
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const balance = Number(invoice.balance_cents || 0);
  const fullyPaid = paid > 0 && balance <= 0 && !invoice.is_void;

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc, options.logoSrc);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensure = (need: number) => {
    if (y - need < MARGIN + 24) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const text = (
    target: PDFPage,
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont,
    color = NAVY,
  ) => {
    target.drawText(value, { x, y: top - size, size, font, color });
  };

  if (logo) {
    const size = 52;
    const scaled = logo.scaleToFit(size, size);
    page.drawImage(logo, { x: MARGIN, y: y - scaled.height, width: scaled.width, height: scaled.height });
  }

  const brandX = MARGIN + (logo ? 64 : 0);
  text(page, companyName, brandX, y, 13, bold);
  y -= 18;
  const contact = [company.email || "info@camzcleaning.com", company.phone || "(587) 837-1977"].join("  |  ");
  text(page, contact, brandX, y, 10, regular, MUTED);
  y -= 14;
  if (company.tax_number) {
    text(page, `GST ${company.tax_number}`, brandX, y, 10, regular, MUTED);
    y -= 14;
  }
  for (const line of [company.address_line1, company.address_line2, [company.city, company.province].filter(Boolean).join(" "), company.postal_code].filter(Boolean) as string[]) {
    text(page, line, brandX, y, 10, regular, MUTED);
    y -= 13;
  }

  const metaX = 390;
  let metaY = PAGE_H - MARGIN;
  text(page, `Invoice #${number}`, metaX, metaY, 11, bold);
  metaY -= 16;
  if (customer?.customer_code) {
    text(page, "Customer ID", metaX, metaY, 9, regular, MUTED);
    metaY -= 13;
    text(page, customer.customer_code, metaX, metaY, 11, bold);
    metaY -= 16;
  }
  const issueDate = formatDate(invoice.issue_date || invoice.issued_at);
  if (issueDate) {
    text(page, "Issue date", metaX, metaY, 9, regular, MUTED);
    metaY -= 13;
    text(page, issueDate, metaX, metaY, 11, regular);
  }

  y = Math.min(y, metaY) - 18;
  page.drawRectangle({ x: MARGIN, y: y - 8, width: PAGE_W - MARGIN * 2, height: 8, color: RULE });
  y -= 36;
  text(page, `Invoice #${number}`, MARGIN, y, 26, bold);
  y -= 22;

  const colW = (PAGE_W - MARGIN * 2) / 3;
  const summaryTop = y;
  text(page, "Customer", MARGIN, summaryTop, 11, bold);
  text(page, "Invoice details", MARGIN + colW, summaryTop, 11, bold);
  text(page, "Payment", MARGIN + colW * 2, summaryTop, 11, bold);

  const customerLines = [
    customer?.customer_code ? `Customer ID ${customer.customer_code}` : null,
    customer?.display_name || "Customer",
    customer?.email,
    customer?.phone,
    ...addressLines(address),
  ].filter(Boolean) as string[];
  const detailLines = [`PDF created ${formatDate(new Date().toISOString(), true)}`, money(total)];
  const dueDate = formatDate(invoice.due_date, true);
  const paymentLines = [dueDate ? `Due ${dueDate}` : "No due date", fullyPaid ? money(paid) : money(balance)];

  let blockH = 16;
  [customerLines, detailLines, paymentLines].forEach((lines) => {
    blockH = Math.max(blockH, 16 + lines.length * 13);
  });
  customerLines.forEach((line, index) => text(page, line, MARGIN, summaryTop - 16 - index * 13, 10, regular, MUTED));
  detailLines.forEach((line, index) => text(page, line, MARGIN + colW, summaryTop - 16 - index * 13, 10, regular, MUTED));
  paymentLines.forEach((line, index) => text(page, line, MARGIN + colW * 2, summaryTop - 16 - index * 13, 10, regular, MUTED));

  y = summaryTop - blockH - 18;

  const qtyX = 360;
  const priceX = 430;
  const amountX = PAGE_W - MARGIN;
  text(page, "Items", MARGIN, y, 11, bold);
  text(page, "Qty", qtyX, y, 11, bold);
  text(page, "Price", priceX, y, 11, bold);
  const amountHeader = "Amount";
  text(page, amountHeader, amountX - bold.widthOfTextAtSize(amountHeader, 11), y, 11, bold);
  y -= 20;

  const drawRight = (value: string, x: number, top: number, size = 10, font: PDFFont = regular) => {
    text(page, value, x - font.widthOfTextAtSize(value, size), top, size, font);
  };

  if (!items.length) {
    text(page, "No line items", MARGIN, y, 10, regular, MUTED);
    y -= 20;
  }

  for (const item of items) {
    const line = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
    const descLines = wrap(regular, item.description, 10, qtyX - MARGIN - 12);
    ensure(14 + descLines.length * 13);
    descLines.forEach((lineText, index) => text(page, lineText, MARGIN, y - index * 13, 10, regular));
    drawRight(String(item.quantity), qtyX + 24, y);
    drawRight(money(item.unit_cents), priceX + 40, y);
    drawRight(money(line), amountX, y);
    y -= Math.max(20, descLines.length * 13 + 8);
  }

  const totals: Array<{ label: string; value: string; strong?: boolean }> = [
    { label: "Subtotal", value: money(invoice.subtotal_cents) },
  ];
  if (tax > 0) totals.push({ label: "Tax", value: money(tax) });
  totals.push({ label: fullyPaid ? "Total paid" : "Total", value: money(fullyPaid ? paid : total), strong: true });
  if (!fullyPaid) {
    totals.push({ label: "Amount paid", value: money(paid) });
    totals.push({ label: "Balance due", value: money(balance), strong: true });
  }

  for (const row of totals) {
    ensure(28);
    const size = row.strong ? 16 : 11;
    const font = row.strong ? bold : regular;
    y -= row.strong ? 10 : 4;
    text(page, row.label, MARGIN, y, size, font);
    drawRight(row.value, amountX, y, size, font);
    y -= row.strong ? 24 : 18;
  }

  if (payments.length) {
    ensure(36);
    text(page, "Payments", MARGIN, y, 11, bold);
    y -= 16;
    for (const payment of payments) {
      const label = `${formatDate(payment.received_at)} (${paymentLabel(payment.method)})`;
      ensure(20);
      text(page, label, MARGIN, y, 10, regular, MUTED);
      drawRight(money(payment.amount_cents), amountX, y);
      y -= 16;
      if (payment.notes) {
        const noteLines = wrap(regular, payment.notes, 9, PAGE_W - MARGIN * 2 - 80);
        for (const note of noteLines) {
          ensure(14);
          text(page, note, MARGIN, y, 9, regular, MUTED);
          y -= 12;
        }
      }
    }
  }

  const notes = [
    invoice.notes ? { title: "Notes", body: invoice.notes } : null,
    company.e_transfer_instructions ? { title: "E-transfer", body: company.e_transfer_instructions } : null,
    company.invoice_footer_text ? { title: "", body: company.invoice_footer_text } : null,
  ].filter(Boolean) as Array<{ title: string; body: string }>;

  for (const note of notes) {
    ensure(40);
    y -= 8;
    if (note.title) {
      text(page, note.title, MARGIN, y, 11, bold);
      y -= 14;
    }
    for (const line of wrap(regular, note.body, 10, PAGE_W - MARGIN * 2)) {
      ensure(14);
      text(page, line, MARGIN, y, 10, regular, MUTED);
      y -= 13;
    }
  }

  if (invoice.is_void) {
    ensure(40);
    const label = "VOID";
    const size = 36;
    const width = bold.widthOfTextAtSize(label, size);
    text(page, label, (PAGE_W - width) / 2, y - 8, size, bold, VOID_RED);
  }

  doc.setTitle(`Invoice ${number}`);
  doc.setAuthor(companyName);
  doc.setCreator("Camz Cleaning Invoice CRM");
  return doc.save();
}

export function invoicePdfFilename(invoiceNumber?: string | null) {
  const safe = String(invoiceNumber || "draft").replace(/[^\w.-]+/g, "-");
  return `Invoice-${safe}.pdf`;
}
