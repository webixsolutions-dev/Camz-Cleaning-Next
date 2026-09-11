"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

export default function CrmInvoicePdfPreview({ invoiceId }: { invoiceId: string }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [css, setCss] = useState("");
  const [sheetHtml, setSheetHtml] = useState("");
  const [filename, setFilename] = useState("Invoice.pdf");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/crm/invoices/pdf/?id=${invoiceId}`, { cache: "no-store" });
        const html = await response.text();
        if (!response.ok) {
          try {
            const payload = JSON.parse(html) as { error?: string };
            setError(payload.error || "Unable to generate PDF preview.");
          } catch {
            setError("Unable to generate PDF preview.");
          }
          return;
        }
        const doc = new DOMParser().parseFromString(html, "text/html");
        const sheet = doc.getElementById("invoice-sheet");
        const style = doc.querySelector("style");
        if (!sheet) {
          setError("Invoice layout was missing from the preview.");
          return;
        }
        setCss(style?.textContent || "");
        setSheetHtml(sheet.outerHTML);
        const title = doc.title?.replace(/^Invoice\s+/i, "").trim() || "draft";
        setFilename(`Invoice-${title}.pdf`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to generate PDF preview.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [invoiceId]);

  const downloadPdf = async () => {
    const sheet = sheetRef.current?.querySelector("#invoice-sheet") as HTMLElement | null;
    if (!sheet) {
      setError("Invoice is still loading.");
      return;
    }
    setDownloading(true);
    setError("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const image = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let remaining = imgHeight;
      let offset = margin;

      pdf.addImage(image, "JPEG", margin, offset, imgWidth, imgHeight);
      remaining -= pageHeight - margin * 2;
      while (remaining > 0) {
        offset -= pageHeight - margin;
        pdf.addPage();
        pdf.addImage(image, "JPEG", margin, offset, imgWidth, imgHeight);
        remaining -= pageHeight - margin;
      }
      pdf.save(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6]">
      <div className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200 bg-white/95 px-6 py-4">
        <button
          type="button"
          disabled={loading || downloading || !sheetHtml}
          onClick={() => void downloadPdf()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#4A86F7] px-5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {downloading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>
      {error ? <p className="px-6 py-3 text-[13px] text-rose-700">{error}</p> : null}
      {loading ? <p className="px-6 py-8 text-[13px] text-slate-500">Generating invoice preview...</p> : null}
      <style>{css}</style>
      <div ref={sheetRef} className="page" dangerouslySetInnerHTML={{ __html: sheetHtml }} />
    </div>
  );
}
