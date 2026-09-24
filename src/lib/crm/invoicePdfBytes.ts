import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { centsToDollars } from "@/lib/crm/money";
import type { CompanyLike, InvoiceAddress, InvoiceLike } from "@/lib/crm/pdf";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
const NAVY = rgb(0.125, 0.149, 0.176);
const MUTED = rgb(0.38, 0.41, 0.45);
const RULE = rgb(0.57, 0.62, 0.66);
const LIGHT_RULE = rgb(0.80, 0.82, 0.84);
const VOID_RED = rgb(0.88, 0.11, 0.28);

function money(cents?: number | null) {
  return `$${centsToDollars(cents)}`;
}

function formatQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return "0";
  return String(Math.max(0, Math.round(quantity)));
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
  const companyEmail = company.email || "info@camzcleaning.com";
  const companyPhone = company.phone || "(587) 837-1977";
  const customer = invoice.crm_customers;
  const address = invoice.billing_address || customer?.crm_customer_addresses?.[0] || null;
  const serviceAddress = invoice.service_address || null;
  const showServiceAddress =
    serviceAddress && addressLines(serviceAddress).join("|") !== addressLines(address).join("|");
  const items = invoice.crm_invoice_items || [];
  const payments = (invoice.crm_payments || []).filter((row) => !row.is_void);
  const paid = Number(invoice.amount_paid_cents || 0);
  const total = Number(invoice.total_cents || 0);
  const tax = Number(invoice.tax_cents || 0);
  const discount = Number(invoice.discount_cents || 0);
  const discountReason = publicDiscountReason(invoice.discount_reason);
  const balance = Number(invoice.balance_cents || 0);
  const fullyPaid = paid > 0 && balance <= 0 && !invoice.is_void;

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc, options.logoSrc);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const footerReserve = 68;

  const text = (
    target: PDFPage,
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont,
    color = NAVY,
  ) => {
    target.drawText(String(value ?? ""), { x, y: top - size, size, font, color });
  };

  const drawRight = (
    value: string,
    x: number,
    top: number,
    size = 10,
    font: PDFFont = regular,
    color = NAVY,
  ) => {
    text(page, value, x - font.widthOfTextAtSize(value, size), top, size, font, color);
  };

  const line = (target: PDFPage, x1: number, yPos: number, x2: number, thickness = 1, color = LIGHT_RULE) => {
    target.drawLine({ start: { x: x1, y: yPos }, end: { x: x2, y: yPos }, thickness, color });
  };

  const ensure = (need: number) => {
    if (y - need < MARGIN + footerReserve) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  // Letterhead - intentionally compact to match the supplied reference invoice.
  if (logo) {
    const size = 54;
    const scaled = logo.scaleToFit(size, size);
    page.drawImage(logo, {
      x: MARGIN,
      y: y - scaled.height,
      width: scaled.width,
      height: scaled.height,
    });
  }

  const brandX = MARGIN + (logo ? 68 : 0);
  text(page, companyName, brandX, y - 1, 11, bold);
  const contactLine = [companyEmail, companyPhone].filter(Boolean).join(" | ");
  text(page, contactLine, brandX, y - 18, 9.5, regular);

  const metaRight = PAGE_W - MARGIN;
  const invoiceLabel = `Invoice #${number}`;
  drawRight(invoiceLabel, metaRight, y - 1, 10.5, bold);
  const issueDate = formatDate(invoice.invoice_date || invoice.issue_date || invoice.issued_at);
  if (issueDate) {
    drawRight("Issue date", metaRight, y - 30, 9.5, bold);
    drawRight(issueDate, metaRight, y - 47, 9.5, regular);
  }

  y -= 86;
  page.drawRectangle({ x: MARGIN, y: y, width: CONTENT_W, height: 5, color: RULE });
  y -= 38;
  text(page, `Invoice #${number}`, MARGIN, y, 25, bold);
  y -= 48;

  // Three-column summary with the short top rules from the supplied reference.
  const gap = 10;
  const colW = (CONTENT_W - gap * 2) / 3;
  const col1 = MARGIN;
  const col2 = MARGIN + colW + gap;
  const col3 = MARGIN + (colW + gap) * 2;
  line(page, col1, y, col1 + colW);
  line(page, col2, y, col2 + colW);
  line(page, col3, y, col3 + colW);

  const summaryHeadingTop = y - 17;
  text(page, "Customer", col1, summaryHeadingTop, 10.5, bold);
  text(page, "Invoice Details", col2, summaryHeadingTop, 10.5, bold);
  text(page, "Payment", col3, summaryHeadingTop, 10.5, bold);

  const customerLines = [
    customer?.display_name || "Customer",
    customer?.email,
    customer?.phone,
    ...addressLines(address),
    showServiceAddress ? "Service address" : null,
    ...(showServiceAddress ? addressLines(serviceAddress) : []),
  ].filter(Boolean) as string[];
  const detailLines = [
    `PDF created ${formatDate(new Date().toISOString(), true)}`,
    money(total),
  ];
  const dueDate = formatDate(invoice.due_date, true);
  const paymentLines = [dueDate ? `Due ${dueDate}` : "No due date", fullyPaid ? money(paid) : money(balance)];

  const summaryBodyTop = summaryHeadingTop - 18;
  const drawSummaryLines = (lines: string[], x: number, maxWidth: number) => {
    let offset = 0;
    lines.forEach((value) => {
      const wrapped = wrap(regular, value, 9.5, maxWidth);
      wrapped.forEach((part) => {
        text(page, part, x, summaryBodyTop - offset, 9.5, regular);
        offset += 13;
      });
    });
    return offset;
  };

  const customerH = drawSummaryLines(customerLines, col1, colW - 4);
  const detailH = drawSummaryLines(detailLines, col2, colW - 4);
  const paymentH = drawSummaryLines(paymentLines, col3, colW - 4);
  y = summaryBodyTop - Math.max(customerH, detailH, paymentH) - 18;

  const qtyRight = 398;
  const priceRight = 484;
  const amountRight = PAGE_W - MARGIN;

  line(page, MARGIN, y, PAGE_W - MARGIN);
  const tableHeadTop = y - 17;
  text(page, "Items", MARGIN, tableHeadTop, 10.5, bold);
  drawRight("Quantity", qtyRight, tableHeadTop, 10.5, bold);
  drawRight("Price", priceRight, tableHeadTop, 10.5, bold);
  drawRight("Amount", amountRight, tableHeadTop, 10.5, bold);
  y -= 34;
  line(page, MARGIN, y, PAGE_W - MARGIN);
  y -= 17;

  if (!items.length) {
    text(page, "No line items", MARGIN, y, 10, regular, MUTED);
    y -= 24;
    line(page, MARGIN, y, PAGE_W - MARGIN);
  }

  for (const item of items) {
    const lineTotal = item.line_total_cents ?? (item.quantity || 0) * (item.unit_cents || 0);
    const description = item.details ? `${item.description} - ${item.details}` : item.description;
    const descLines = wrap(regular, description, 10, qtyRight - MARGIN - 48);
    const rowHeight = Math.max(34, descLines.length * 13 + 12);
    ensure(rowHeight + 10);

    descLines.forEach((lineText, index) => text(page, lineText, MARGIN, y - index * 13, 10, regular));
    drawRight(formatQuantity(item.quantity), qtyRight, y, 10, regular);
    drawRight(money(item.unit_cents), priceRight, y, 10, regular);
    drawRight(money(lineTotal), amountRight, y, 10, regular);
    y -= rowHeight;
    line(page, MARGIN, y, PAGE_W - MARGIN);
    y -= 16;
  }

  const totals: Array<{ label: string; value: string; strong?: boolean }> = [
    { label: "Subtotal", value: money(invoice.subtotal_cents) },
  ];
  if (discount > 0) {
    totals.push({
      label: `Discount${discountReason ? ` - ${discountReason}` : ""}`,
      value: `-${money(discount)}`,
    });
  }
  if (tax > 0) {
    totals.push({
      label: `GST${invoice.tax_rate_bps ? ` (${Number(invoice.tax_rate_bps) / 100}%)` : ""}`,
      value: money(tax),
    });
  }
  totals.push({ label: fullyPaid ? "Total Paid" : "Total", value: money(fullyPaid ? paid : total), strong: true });
  if (!fullyPaid) {
    totals.push({ label: "Amount paid", value: money(paid) });
    totals.push({ label: "Balance due", value: money(balance), strong: true });
  }

  for (const row of totals) {
    const rowHeight = row.strong ? 43 : 30;
    ensure(rowHeight + 8);
    const size = row.strong ? 18 : 10.5;
    const font = row.strong ? bold : regular;
    const top = y;
    text(page, row.label, MARGIN, top, size, font);
    drawRight(row.value, amountRight, top, size, font);
    y -= rowHeight;
    line(page, MARGIN, y, PAGE_W - MARGIN);
    y -= row.strong ? 16 : 12;
  }

  if (payments.length) {
    ensure(50);
    text(page, "Payments", MARGIN, y, 10.5, bold);
    y -= 18;
    for (const payment of payments) {
      const label = `${formatDate(payment.received_at)} (${paymentLabel(payment.method)})`;
      ensure(28);
      text(page, label, MARGIN, y, 10, regular);
      drawRight(money(payment.amount_cents), amountRight, y, 10, regular);
      y -= 15;
      if (payment.notes) {
        const noteLines = wrap(regular, payment.notes, 9.5, CONTENT_W - 90);
        for (const note of noteLines) {
          ensure(13);
          text(page, note, MARGIN, y, 9.5, regular);
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
    ensure(44);
    y -= 10;
    if (note.title) {
      text(page, note.title, MARGIN, y, 10.5, bold);
      y -= 16;
    }
    for (const noteLine of wrap(regular, note.body, 9.5, CONTENT_W)) {
      ensure(14);
      text(page, noteLine, MARGIN, y, 9.5, regular, MUTED);
      y -= 13;
    }
  }

  if (invoice.is_void) {
    ensure(42);
    const label = "VOID";
    const size = 36;
    const width = bold.widthOfTextAtSize(label, size);
    text(page, label, (PAGE_W - width) / 2, y - 8, size, bold, VOID_RED);
  }

  // Footer and page numbering are added after all pages exist.
  const pages = doc.getPages();
  pages.forEach((pdfPage, index) => {
    const footerY = 39;
    const pageText = `Page ${index + 1} of ${pages.length}`;
    pdfPage.drawText(pageText, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(pageText, 9),
      y: footerY,
      size: 9,
      font: regular,
      color: RULE,
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
