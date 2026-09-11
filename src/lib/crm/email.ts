import nodemailer from "nodemailer";
import { explainMailFailure, isDeliverableEmail } from "@/lib/crm/emailAddress";

export { isDeliverableEmail } from "@/lib/crm/emailAddress";

export async function sendCrmInvoiceEmail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string | null;
  attachments?: Array<{
    filename: string;
    content: Buffer | Uint8Array;
    contentType?: string;
  }>;
}) {
  if (!isDeliverableEmail(options.to)) {
    return {
      ok: false as const,
      error: "Use a real customer mailbox. Test addresses like example.com are rejected by email providers.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Camz Cleaning" <${process.env.SMTP_USER}>`,
      to: options.to,
      replyTo: options.replyTo || undefined,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((file) => ({
        filename: file.filename,
        content: Buffer.from(file.content),
        contentType: file.contentType || "application/pdf",
      })),
    });

    return { ok: true as const, id: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email failed";
    console.error("CRM invoice email failed:", error);
    return { ok: false as const, error: explainMailFailure(message) };
  }
}
