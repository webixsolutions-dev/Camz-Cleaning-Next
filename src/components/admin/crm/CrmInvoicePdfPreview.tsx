"use client";

import { useEffect, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

export default function CrmInvoicePdfPreview({ invoiceId }: { invoiceId: string }) {
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
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/crm/invoices/pdf/?id=${invoiceId}&download=1`, { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Could not download the PDF.");
      }
      const blob = await response.blob();
      const header = response.headers.get("Content-Disposition") || "";
      const match = header.match(/filename="([^"]+)"/);
      const name = match?.[1] || filename;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]">
      <div className="sticky top-0 z-10 flex flex-col items-stretch justify-end gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
        <button
          type="button"
          disabled={loading || downloading || !sheetHtml}
          onClick={() => void downloadPdf()}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[13px] font-bold text-white disabled:opacity-50 sm:w-auto sm:px-5"
        >
          {downloading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>
      {error ? <p className="px-4 py-3 text-[13px] text-rose-700 sm:px-6">{error}</p> : null}
      {loading ? <p className="px-4 py-8 text-[13px] text-slate-500 sm:px-6">Generating invoice preview...</p> : null}
      <style>{css}</style>
      <div className="page overflow-x-hidden" dangerouslySetInnerHTML={{ __html: sheetHtml }} />
    </div>
  );
}
