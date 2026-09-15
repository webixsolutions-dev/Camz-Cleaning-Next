import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { sendCrmInvoiceEmail } from "@/lib/crm/email";

type SelectedTask = {
  category?: string;
  label?: string;
  quantity?: number;
  minutes_min?: number;
  minutes_max?: number;
  condition?: string;
};

type Estimate = {
  general_minutes_min?: number;
  general_minutes_max?: number;
  onsite_minutes_min?: number;
  onsite_minutes_max?: number;
  cleaner_count?: number;
  carpet_service_minutes_min?: number;
  carpet_service_minutes_max?: number;
  subtotal_min_cents?: number | null;
  subtotal_max_cents?: number | null;
  gst_min_cents?: number | null;
  gst_max_cents?: number | null;
  total_min_cents?: number | null;
  total_max_cents?: number | null;
  requires_manual_quote?: boolean;
  manual_quote_reasons?: string[];
};

export type CleaningConfirmationInput = {
  reference: string;
  mode: "time" | "price";
  customerName: string;
  email: string;
  phone: string;
  address: string;
  preferredDate?: string | null;
  preferredContact?: string | null;
  additionalNotes?: string | null;
  ifTimeAllows?: string | null;
  property: Record<string, unknown>;
  carpet: Record<string, unknown>;
  tasks: SelectedTask[];
  priorities: string[];
  estimate: Estimate;
};

const htmlEscape = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const label = (value: unknown) => String(value ?? "Not provided").replaceAll("_", " ");
const money = (value: unknown) => `$${(Number(value || 0) / 100).toFixed(2)}`;
const moneyRange = (min: unknown, max: unknown) => Number(min) === Number(max) ? money(min) : `${money(min)} - ${money(max)}`;
const duration = (value: unknown) => {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours} hr` : ""}${hours && remainder ? " " : ""}${remainder ? `${remainder} min` : ""}` || "0 min";
};
const durationRange = (min: unknown, max: unknown) => Number(min) === Number(max) ? duration(min) : `${duration(min)} - ${duration(max)}`;

export function buildCleaningConfirmationEmail(input: CleaningConfirmationInput) {
  const taskRows = input.tasks.map((task) => `
    <tr>
      <td style="padding:9px;border-bottom:1px solid #e5e7eb">${htmlEscape(task.label || "Cleaning task")}</td>
      <td style="padding:9px;border-bottom:1px solid #e5e7eb;text-align:center">${htmlEscape(task.quantity || 1)}</td>
      <td style="padding:9px;border-bottom:1px solid #e5e7eb;text-align:right">${htmlEscape(durationRange((task.minutes_min || 0) * (task.quantity || 1), (task.minutes_max || 0) * (task.quantity || 1)))}</td>
    </tr>`).join("");

  const pricing = input.mode === "price" ? `
    <div style="margin-top:20px;padding:16px;border-radius:10px;background:#eef7ff">
      <h3 style="margin:0 0 10px;color:#0B4E9B">Price estimate</h3>
      <p style="margin:4px 0"><strong>Subtotal:</strong> ${htmlEscape(moneyRange(input.estimate.subtotal_min_cents, input.estimate.subtotal_max_cents))}</p>
      <p style="margin:4px 0"><strong>GST:</strong> ${htmlEscape(moneyRange(input.estimate.gst_min_cents, input.estimate.gst_max_cents))}</p>
      <p style="margin:4px 0;font-size:18px"><strong>Estimated total:</strong> ${htmlEscape(moneyRange(input.estimate.total_min_cents, input.estimate.total_max_cents))}</p>
    </div>` : "";

  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937">
    <div style="max-width:680px;margin:0 auto;padding:24px">
      <div style="border-radius:14px 14px 0 0;background:#0B4E9B;padding:24px;color:white">
        <h1 style="margin:0;font-size:25px">CAMZ Cleaning Plan</h1>
        <p style="margin:8px 0 0">Reference ${htmlEscape(input.reference)}</p>
      </div>
      <div style="border:1px solid #dbe4ee;border-top:0;border-radius:0 0 14px 14px;background:white;padding:24px">
        <p>Hello ${htmlEscape(input.customerName)},</p>
        <p>Your ${input.mode === "price" ? "time-and-price" : "time-only"} cleaning checklist has been received. Your PDF copy is attached.</p>
        <p><strong>Property:</strong> ${htmlEscape(input.address)}<br><strong>Preferred date:</strong> ${htmlEscape(input.preferredDate || "Not selected")}<br><strong>Estimated labour:</strong> ${htmlEscape(durationRange(input.estimate.general_minutes_min, input.estimate.general_minutes_max))}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px">
          <thead><tr style="background:#f1f5f9"><th style="padding:9px;text-align:left">Selected task</th><th style="padding:9px">Qty</th><th style="padding:9px;text-align:right">Estimated time</th></tr></thead>
          <tbody>${taskRows}</tbody>
        </table>
        ${pricing}
        ${input.estimate.requires_manual_quote ? `<p style="margin-top:18px;padding:12px;border-radius:8px;background:#fff7ed;color:#9a3412"><strong>Assessment required:</strong> ${htmlEscape((input.estimate.manual_quote_reasons || []).join(", "))}</p>` : ""}
        <p style="margin-top:22px;font-size:13px;color:#64748b">This is an estimate based on the submitted scope. CAMZ Cleaning will confirm availability and any assessment items before service.</p>
      </div>
    </div>
  </body></html>`;
}

const pdfSafe = (value: unknown) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[^\x20-\x7E]/g, "")
  .trim();

export async function buildCleaningConfirmationPdf(input: CleaningConfirmationInput) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 612;
  const height = 792;
  const margin = 46;
  let page: PDFPage;
  let y = 0;

  const newPage = () => {
    page = pdf.addPage([width, height]);
    page.drawRectangle({ x: 0, y: height - 78, width, height: 78, color: rgb(0.043, 0.306, 0.608) });
    page.drawText("CAMZ CLEANING", { x: margin, y: height - 45, size: 20, font: bold, color: rgb(1, 1, 1) });
    page.drawText(pdfSafe(input.reference), { x: width - margin - 190, y: height - 43, size: 11, font: bold, color: rgb(1, 1, 1) });
    y = height - 105;
  };

  const wrap = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    const words = pdfSafe(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
      else { if (current) lines.push(current); current = word; }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  };

  const draw = (text: unknown, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) => {
    const font = options.font || regular;
    const size = options.size || 10;
    const indent = options.indent || 0;
    const lineHeight = size + 4;
    const lines = wrap(String(text ?? ""), font, size, width - (margin * 2) - indent);
    for (const line of lines) {
      if (y < 55) newPage();
      page.drawText(line, { x: margin + indent, y, size, font, color: options.color || rgb(0.12, 0.18, 0.25) });
      y -= lineHeight;
    }
    y -= options.gap ?? 3;
  };

  const section = (title: string) => {
    if (y < 95) newPage();
    y -= 4;
    draw(title.toUpperCase(), { size: 11, font: bold, color: rgb(0.043, 0.306, 0.608), gap: 6 });
  };

  newPage();
  draw(input.mode === "price" ? "Cleaning checklist with time and price" : "Cleaning checklist without price", { size: 16, font: bold, gap: 10 });
  draw(`Submitted for: ${input.customerName}`);
  draw(`Email: ${input.email}  |  Phone: ${input.phone}`);
  draw(`Property: ${input.address}`);
  draw(`Preferred date: ${input.preferredDate || "Not selected"}`);

  section("Property details");
  draw(`Type: ${label(input.property.type)}  |  Size: ${label(input.property.size)}  |  Condition: ${label(input.property.condition)}`);
  draw(`Bedrooms: ${label(input.property.bedrooms)}  |  Full baths: ${label(input.property.fullBaths)}  |  Half baths: ${label(input.property.halfBaths)}  |  Cleaning team: ${label(input.property.cleaners)}`);
  draw(`Cleaning purpose: ${label(input.property.purpose)}  |  Basement: ${label(input.property.basement)}  |  Frequency: ${label(input.property.frequency)}`);

  section("Estimated time");
  draw(`General labour: ${durationRange(input.estimate.general_minutes_min, input.estimate.general_minutes_max)}`, { font: bold });
  draw(`Likely on-site duration with ${input.estimate.cleaner_count || 1} cleaner(s): ${durationRange(input.estimate.onsite_minutes_min, input.estimate.onsite_minutes_max)}`);
  if (Number(input.estimate.carpet_service_minutes_max || 0) > 0) draw(`Carpet steam service: ${durationRange(input.estimate.carpet_service_minutes_min, input.estimate.carpet_service_minutes_max)}`);

  section("Selected checklist");
  input.tasks.forEach((task, index) => {
    const taskTime = durationRange((task.minutes_min || 0) * (task.quantity || 1), (task.minutes_max || 0) * (task.quantity || 1));
    draw(`${index + 1}. ${task.label || "Cleaning task"} - Qty ${task.quantity || 1} - ${taskTime}`, { indent: 4, gap: 1 });
  });

  if (input.priorities.length) {
    section("Customer priorities");
    draw(input.priorities.map((item, index) => `${index + 1}. ${label(item)}`).join("  |  "));
  }

  if (input.mode === "price") {
    section("Price estimate");
    draw(`Subtotal: ${moneyRange(input.estimate.subtotal_min_cents, input.estimate.subtotal_max_cents)}`);
    draw(`GST: ${moneyRange(input.estimate.gst_min_cents, input.estimate.gst_max_cents)}`);
    draw(`Estimated total: ${moneyRange(input.estimate.total_min_cents, input.estimate.total_max_cents)}`, { size: 13, font: bold });
  }

  if (input.estimate.requires_manual_quote) {
    section("Assessment required");
    draw((input.estimate.manual_quote_reasons || ["Selected specialty scope requires confirmation."]).join("; "), { color: rgb(0.62, 0.25, 0.05) });
  }

  if (input.ifTimeAllows || input.additionalNotes) {
    section("Customer notes");
    if (input.ifTimeAllows) draw(`If time allows: ${input.ifTimeAllows}`);
    if (input.additionalNotes) draw(`Special instructions: ${input.additionalNotes}`);
  }

  y -= 8;
  draw("This estimate is based on the submitted selections. CAMZ Cleaning will confirm availability and any assessment items before service.", { size: 8, color: rgb(0.35, 0.42, 0.5) });
  return pdf.save();
}

export async function emailCleaningConfirmation(input: CleaningConfirmationInput, pdfBytes: Uint8Array) {
  const adminEmail = process.env.CUSTOM_CLEANING_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER || null;
  return sendCrmInvoiceEmail({
    to: input.email,
    bcc: adminEmail,
    replyTo: adminEmail,
    subject: `CAMZ cleaning plan ${input.reference}`,
    html: buildCleaningConfirmationEmail(input),
    attachments: [{ filename: `CAMZ-Cleaning-Plan-${input.reference}.pdf`, content: pdfBytes, contentType: "application/pdf" }],
  });
}
