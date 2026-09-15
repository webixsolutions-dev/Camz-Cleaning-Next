"use client";

import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useRef,
  useState,
} from "react";
import {
  Download,
  ImagePlus,
  Images,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  optimizeImageForUpload,
  uploadImageToBucket,
} from "@/lib/images/upload";

export type BeforeAfterPair = {
  id: string;
  before_image_url: string;
  after_image_url: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  created_by_role: string | null;
};

type DraftImage = {
  file: File;
  preview: string;
};

type LoadedImage = {
  data: Uint8Array;
  width: number;
  height: number;
};

const pageWidth = 842;
const pageHeight = 595;

export default function BeforeAfterManagement({
  pairs = [],
}: {
  pairs?: BeforeAfterPair[];
}) {
  const router = useRouter();

  const beforeInput =
    useRef<HTMLInputElement>(null);

  const afterInput =
    useRef<HTMLInputElement>(null);

  const attachAfterInput =
    useRef<HTMLInputElement>(null);

  const [beforeFiles, setBeforeFiles] =
    useState<DraftImage[]>([]);

  const [afterFiles, setAfterFiles] =
    useState<DraftImage[]>([]);

  const [
    attachingPairId,
    setAttachingPairId,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    savingMessage,
    setSavingMessage,
  ] = useState("");

  const completedPairs =
    pairs.filter(
      (pair) =>
        Boolean(pair.after_image_url),
    ).length;

  const pendingPairs =
    pairs.length - completedPairs;

  const pickImage =
    (
      side: "before" | "after",
    ) =>
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const files = Array.from(
        event.target.files || [],
      );

      if (!files.length) return;

      const drafts = files.map(
        (file) => ({
          file,
          preview:
            URL.createObjectURL(file),
        }),
      );

      if (side === "before") {
        setBeforeFiles(
          (current) => [
            ...current,
            ...drafts,
          ],
        );
      } else {
        setAfterFiles(
          (current) => [
            ...current,
            ...drafts,
          ],
        );
      }

      event.target.value = "";
    };

  const clearDraft = () => {
    beforeFiles.forEach(
      (image) =>
        URL.revokeObjectURL(
          image.preview,
        ),
    );

    afterFiles.forEach(
      (image) =>
        URL.revokeObjectURL(
          image.preview,
        ),
    );

    setBeforeFiles([]);
    setAfterFiles([]);
    setError("");

    if (beforeInput.current) {
      beforeInput.current.value = "";
    }

    if (afterInput.current) {
      afterInput.current.value = "";
    }
  };

  const removeDraft = (
    side: "before" | "after",
    index: number,
  ) => {
    const source =
      side === "before"
        ? beforeFiles
        : afterFiles;

    const image = source[index];

    if (image) {
      URL.revokeObjectURL(
        image.preview,
      );
    }

    if (side === "before") {
      setBeforeFiles(
        (current) =>
          current.filter(
            (_, itemIndex) =>
              itemIndex !== index,
          ),
      );
    } else {
      setAfterFiles(
        (current) =>
          current.filter(
            (_, itemIndex) =>
              itemIndex !== index,
          ),
      );
    }
  };

  const uploadImage = async (
    file: File,
    side: "before" | "after",
  ) => {
    const supabase =
      createClient();

    const optimized =
      await optimizeImageForUpload(
        file,
      );

    const extension =
      optimized.name
        .split(".")
        .pop() || "jpg";

    const path =
      `before_after_gallery/${side}_${Date.now()}_${crypto.randomUUID()}.${extension}`;

    return uploadImageToBucket(
      supabase,
      "job-images",
      path,
      optimized,
    );
  };

  const saveImages = async () => {
    if (!beforeFiles.length) {
      setError(
        "Please add at least one before image.",
      );
      return;
    }

    if (
      afterFiles.length > 0 &&
      beforeFiles.length !==
        afterFiles.length
    ) {
      setError(
        "Before and after counts must match when saving matched pairs. Remove after drafts if you want to save before images only.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSavingMessage(
      "Preparing images...",
    );

    try {
      const uploadedPairs: Array<{
        before_image_url: string;
        after_image_url: string | null;
      }> = [];

      for (
        let index = 0;
        index < beforeFiles.length;
        index += 1
      ) {
        setSavingMessage(
          `Uploading before image ${
            index + 1
          } of ${
            beforeFiles.length
          }...`,
        );

        const beforeUrl =
          await uploadImage(
            beforeFiles[index].file,
            "before",
          );

        let afterUrl:
          | string
          | null = null;

        if (afterFiles[index]) {
          setSavingMessage(
            `Uploading after image ${
              index + 1
            } of ${
              afterFiles.length
            }...`,
          );

          afterUrl =
            await uploadImage(
              afterFiles[index].file,
              "after",
            );
        }

        uploadedPairs.push({
          before_image_url:
            beforeUrl,
          after_image_url:
            afterUrl,
        });
      }

      for (
        let index = 0;
        index <
        uploadedPairs.length;
        index += 1
      ) {
        setSavingMessage(
          `Saving record ${
            index + 1
          } of ${
            uploadedPairs.length
          }...`,
        );

        const response =
          await fetch(
            "/api/admin/before-after",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                uploadedPairs[index],
              ),
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to save pair.",
          );
        }
      }

      clearDraft();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save pair.",
      );
    } finally {
      setSaving(false);
      setSavingMessage("");
    }
  };

  const pickAfterForSavedPair =
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (
        !file ||
        !attachingPairId
      ) {
        return;
      }

      setSaving(true);
      setError("");
      setSavingMessage(
        "Uploading after image...",
      );

      try {
        const afterUrl =
          await uploadImage(
            file,
            "after",
          );

        const response =
          await fetch(
            "/api/admin/before-after",
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                id: attachingPairId,
                after_image_url:
                  afterUrl,
              }),
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to attach after image.",
          );
        }

        setAttachingPairId("");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to attach after image.",
        );
      } finally {
        setSaving(false);
        setSavingMessage("");
      }
    };

  const removePair = async (
    id: string,
  ) => {
    if (
      !window.confirm(
        "Delete this before/after pair?",
      )
    ) {
      return;
    }

    const response = await fetch(
      `/api/admin/before-after?id=${id}`,
      {
        method: "DELETE",
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      window.alert(
        result.error ||
          "Unable to delete pair.",
      );
      return;
    }

    router.refresh();
  };

  const clearAll = async () => {
    if (!pairs.length) return;

    if (
      !window.confirm(
        "Delete all saved before/after pairs?",
      )
    ) {
      return;
    }

    const response = await fetch(
      "/api/admin/before-after?all=true",
      {
        method: "DELETE",
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      window.alert(
        result.error ||
          "Unable to clear pairs.",
      );
      return;
    }

    router.refresh();
  };

  const downloadPdf = async () => {
    if (!pairs.length) return;

    setDownloading(true);
    setError("");

    try {
      const pdf =
        await createBeforeAfterPdf(
          pairs,
        );

      const url =
        URL.createObjectURL(
          new Blob([pdf], {
            type: "application/pdf",
          }),
        );

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "camz-before-after-gallery.pdf";

      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to download PDF.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Compare Gallery
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                Before / After
              </h1>

              <p className="mt-1 text-slate-500">
                Upload and manage cleaning transformation images from all users.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearAll}
                disabled={!pairs.length}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-[9px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={12} />
                Clear All
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={
                  !pairs.length ||
                  downloading
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#13263A] px-3 text-[9px] font-bold text-white transition hover:bg-[#1D354C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={12} />
                {downloading
                  ? "Preparing..."
                  : "Download PDF"}
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Saved Pairs"
            value={pairs.length}
          />

          <StatCard
            label="Completed"
            value={completedPairs}
            tone="text-emerald-600"
          />

          <StatCard
            label="Awaiting After"
            value={pendingPairs}
            tone="text-amber-600"
          />
        </section>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold text-red-700">
            {error}
          </p>
        )}

        {/* UPLOAD PANEL */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Upload New Images
              </h2>

              <p className="mt-0.5 text-slate-500">
                Save before images now or upload matching before/after pairs together.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  beforeInput.current?.click()
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4A86F7] px-3 text-[9px] font-bold text-white transition hover:bg-blue-600"
              >
                <ImagePlus size={13} />
                Add Before
                <CountBadge
                  value={
                    beforeFiles.length
                  }
                  light
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  afterInput.current?.click()
                }
                disabled={
                  !beforeFiles.length
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ImagePlus size={13} />
                Add After
                <CountBadge
                  value={
                    afterFiles.length
                  }
                />
              </button>

              <button
                type="button"
                onClick={saveImages}
                disabled={
                  saving ||
                  !beforeFiles.length ||
                  (afterFiles.length >
                    0 &&
                    beforeFiles.length !==
                      afterFiles.length)
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[9px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Upload size={13} />
                {saving
                  ? "Uploading..."
                  : afterFiles.length
                    ? `Save ${beforeFiles.length} Pair${beforeFiles.length === 1 ? "" : "s"}`
                    : `Save ${beforeFiles.length} Before${beforeFiles.length === 1 ? "" : "s"}`}
              </button>

              {(beforeFiles.length >
                0 ||
                afterFiles.length >
                  0) && (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={12} />
                  Clear Draft
                </button>
              )}
            </div>
          </div>

          <input
            ref={beforeInput}
            type="file"
            multiple
            accept="image/*"
            onChange={pickImage(
              "before",
            )}
            className="hidden"
          />

          <input
            ref={afterInput}
            type="file"
            multiple
            accept="image/*"
            onChange={pickImage(
              "after",
            )}
            className="hidden"
          />

          <input
            ref={attachAfterInput}
            type="file"
            accept="image/*"
            onChange={
              pickAfterForSavedPair
            }
            className="hidden"
          />

          {savingMessage && (
            <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-[9px] font-semibold text-blue-700">
              {savingMessage}
            </p>
          )}

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <ImageDrop
              label="Before"
              images={beforeFiles}
              emptyText="Add before images"
              onClick={() =>
                beforeInput.current?.click()
              }
              onRemove={(index) =>
                removeDraft(
                  "before",
                  index,
                )
              }
            />

            <ImageDrop
              label="After"
              images={afterFiles}
              emptyText={
                beforeFiles.length
                  ? "Add after images"
                  : "Add before images first"
              }
              onClick={() => {
                if (
                  beforeFiles.length
                ) {
                  afterInput.current?.click();
                }
              }}
              onRemove={(index) =>
                removeDraft(
                  "after",
                  index,
                )
              }
            />
          </div>

          {afterFiles.length > 0 &&
            beforeFiles.length !==
              afterFiles.length && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[9px] font-semibold text-amber-700">
                Before and after counts must match to save pairs. Remove the after drafts to save before images only.
              </p>
            )}
        </section>

        {/* SAVED PAIRS */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Saved Gallery Pairs
              </h2>

              <p className="mt-0.5 text-slate-500">
                {pairs.length} saved pair
                {pairs.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
              <Images size={14} />
            </span>
          </div>

          {pairs.length ? (
            <div className="grid gap-3 p-4 xl:grid-cols-2">
              {pairs.map(
                (pair, index) => (
                  <article
                    key={pair.id}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFD] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[11px] font-bold text-[#13263A]">
                          Pair{" "}
                          {pairs.length -
                            index}
                        </h3>

                        <p className="mt-0.5 text-[8px] text-slate-400">
                          {formatDateTime(
                            pair.created_at,
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!pair.after_image_url && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              setAttachingPairId(
                                pair.id,
                              );
                              attachAfterInput.current?.click();
                            }}
                            className="h-8 rounded-lg bg-emerald-600 px-3 text-[8px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                          >
                            Add After
                          </button>
                        )}

                        <button
                          type="button"
                          aria-label={`Delete pair ${pairs.length - index}`}
                          onClick={() =>
                            removePair(
                              pair.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        >
                          <Trash2
                            size={12}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <SavedImage
                        label="Before"
                        tone="text-rose-600"
                        src={
                          pair.before_image_url
                        }
                      />

                      <SavedImage
                        label="After"
                        tone="text-emerald-600"
                        src={
                          pair.after_image_url
                        }
                        emptyText="After image pending"
                      />
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <Images
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                No saved before/after pairs yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "text-[#13263A]",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </div>

      <div
        className={`mt-1 text-[20px] font-extrabold leading-none ${tone}`}
      >
        {value}
      </div>
    </div>
  );
}

function CountBadge({
  value,
  light = false,
}: {
  value: number;
  light?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[7px] font-extrabold ${
        light
          ? "bg-white/15 text-white"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

function ImageDrop({
  label,
  images,
  emptyText,
  onClick,
  onRemove,
}: {
  label: string;
  images: DraftImage[];
  emptyText: string;
  onClick: () => void;
  onRemove: (
    index: number,
  ) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>

        <span className="rounded-md bg-slate-100 px-2 py-1 text-[7px] font-bold text-slate-500">
          {images.length} selected
        </span>
      </div>

      {!images.length ? (
        <button
          type="button"
          onClick={onClick}
          className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#F8FAFD] text-slate-400 transition hover:border-blue-300 hover:bg-blue-50/40 hover:text-[#4A86F7]"
        >
          <ImagePlus size={22} />

          <span className="mt-2 text-[9px] font-bold">
            {emptyText}
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map(
            (image, index) => (
              <div
                key={`${image.file.name}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                <img
                  src={image.preview}
                  alt={`${label} preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  aria-label={`Remove ${label} image ${index + 1}`}
                  onClick={() =>
                    onRemove(index)
                  }
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ),
          )}

          <button
            type="button"
            onClick={onClick}
            className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-blue-300 hover:text-[#4A86F7]"
          >
            <PlusIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <div className="flex flex-col items-center gap-1">
      <ImagePlus size={18} />
      <span className="text-[8px] font-bold">
        Add more
      </span>
    </div>
  );
}

function SavedImage({
  label,
  tone,
  src,
  emptyText = "Image unavailable",
}: {
  label: string;
  tone: string;
  src: string | null;
  emptyText?: string;
}) {
  return (
    <div>
      <div
        className={`mb-1.5 text-[8px] font-extrabold uppercase tracking-[0.08em] ${tone}`}
      >
        {label}
      </div>

      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        {src ? (
          <img
            src={src}
            alt={`${label} cleaning`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="px-3 text-center">
            <ImagePlus
              size={18}
              className="mx-auto text-slate-300"
            />

            <p className="mt-1.5 text-[8px] font-semibold text-slate-400">
              {emptyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* -------------------------------------------------------------------------- */
/* PDF GENERATION                                                              */
/* -------------------------------------------------------------------------- */

async function loadImage(
  url: string,
): Promise<LoadedImage> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Unable to load one of the gallery images for the PDF.",
    );
  }

  const blob =
    await response.blob();

  const objectUrl =
    URL.createObjectURL(blob);

  try {
    const image =
      await new Promise<HTMLImageElement>(
        (resolve, reject) => {
          const img =
            new Image();

          img.onload = () =>
            resolve(img);

          img.onerror = () =>
            reject(
              new Error(
                "Unable to decode gallery image.",
              ),
            );

          img.src = objectUrl;
        },
      );

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      image.naturalWidth;

    canvas.height =
      image.naturalHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Unable to prepare gallery image.",
      );
    }

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.drawImage(
      image,
      0,
      0,
    );

    const jpegUrl =
      canvas.toDataURL(
        "image/jpeg",
        0.86,
      );

    const base64 =
      jpegUrl.split(",")[1] || "";

    const binary =
      atob(base64);

    const data =
      new Uint8Array(
        binary.length,
      );

    for (
      let index = 0;
      index < binary.length;
      index += 1
    ) {
      data[index] =
        binary.charCodeAt(
          index,
        );
    }

    return {
      data,
      width:
        image.naturalWidth,
      height:
        image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(
      objectUrl,
    );
  }
}

function ascii(
  value: string,
) {
  return new TextEncoder().encode(
    value,
  );
}

function concatBytes(
  chunks: Uint8Array[],
) {
  const total =
    chunks.reduce(
      (sum, chunk) =>
        sum + chunk.length,
      0,
    );

  const output =
    new Uint8Array(total);

  let offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

function escapePdfText(
  value: string,
) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function fitImage(
  image: LoadedImage,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
) {
  const scale = Math.min(
    boxWidth / image.width,
    boxHeight / image.height,
  );

  const width =
    image.width * scale;

  const height =
    image.height * scale;

  return {
    x:
      boxX +
      (boxWidth - width) / 2,
    y:
      boxY +
      (boxHeight - height) / 2,
    width,
    height,
  };
}

async function createBeforeAfterPdf(
  pairs: BeforeAfterPair[],
) {
  const loadedPairs =
    await Promise.all(
      pairs.map(
        async (pair) => ({
          pair,
          before:
            await loadImage(
              pair.before_image_url,
            ),
          after:
            pair.after_image_url
              ? await loadImage(
                  pair.after_image_url,
                )
              : null,
        }),
      ),
    );

  const objects =
    new Map<number, Uint8Array>();

  const pageIds: number[] =
    [];

  let nextId = 4;

  for (
    let index = 0;
    index <
    loadedPairs.length;
    index += 1
  ) {
    const item =
      loadedPairs[index];

    const pageId =
      nextId++;

    const contentId =
      nextId++;

    const beforeImageId =
      nextId++;

    const afterImageId =
      item.after
        ? nextId++
        : null;

    pageIds.push(pageId);

    objects.set(
      beforeImageId,
      concatBytes([
        ascii(
          `${beforeImageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${item.before.width} /Height ${item.before.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${item.before.data.length} >>\nstream\n`,
        ),
        item.before.data,
        ascii(
          "\nendstream\nendobj\n",
        ),
      ]),
    );

    if (
      item.after &&
      afterImageId
    ) {
      objects.set(
        afterImageId,
        concatBytes([
          ascii(
            `${afterImageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${item.after.width} /Height ${item.after.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${item.after.data.length} >>\nstream\n`,
          ),
          item.after.data,
          ascii(
            "\nendstream\nendobj\n",
          ),
        ]),
      );
    }

    const margin = 42;
    const gap = 24;
    const top = 90;
    const imageBoxWidth =
      (pageWidth -
        margin * 2 -
        gap) /
      2;

    const imageBoxHeight =
      390;

    const imageBoxY =
      pageHeight -
      top -
      imageBoxHeight;

    const beforeBox =
      fitImage(
        item.before,
        margin,
        imageBoxY,
        imageBoxWidth,
        imageBoxHeight,
      );

    const afterBox =
      item.after
        ? fitImage(
            item.after,
            margin +
              imageBoxWidth +
              gap,
            imageBoxY,
            imageBoxWidth,
            imageBoxHeight,
          )
        : null;

    const title =
      `Camz Cleaning - Before / After Pair ${index + 1}`;

    const date =
      new Date(
        item.pair.created_at,
      ).toLocaleDateString(
        "en-CA",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );

    const commands: string[] =
      [
        "0.08 0.15 0.23 rg",
        `BT /F1 18 Tf ${margin} ${pageHeight - 42} Td (${escapePdfText(title)}) Tj ET`,
        "0.35 0.42 0.50 rg",
        `BT /F1 9 Tf ${margin} ${pageHeight - 60} Td (${escapePdfText(date)}) Tj ET`,
        "0.29 0.53 0.97 rg",
        `BT /F1 11 Tf ${margin} ${pageHeight - 80} Td (BEFORE) Tj ET`,
        "0.06 0.65 0.46 rg",
        `BT /F1 11 Tf ${margin + imageBoxWidth + gap} ${pageHeight - 80} Td (AFTER) Tj ET`,
        `q ${beforeBox.width.toFixed(2)} 0 0 ${beforeBox.height.toFixed(2)} ${beforeBox.x.toFixed(2)} ${beforeBox.y.toFixed(2)} cm /ImB Do Q`,
      ];

    if (
      item.after &&
      afterBox
    ) {
      commands.push(
        `q ${afterBox.width.toFixed(2)} 0 0 ${afterBox.height.toFixed(2)} ${afterBox.x.toFixed(2)} ${afterBox.y.toFixed(2)} cm /ImA Do Q`,
      );
    } else {
      const x =
        margin +
        imageBoxWidth +
        gap;

      commands.push(
        "0.96 0.97 0.98 rg",
        `${x} ${imageBoxY} ${imageBoxWidth} ${imageBoxHeight} re f`,
        "0.45 0.50 0.56 rg",
        `BT /F1 12 Tf ${x + 105} ${imageBoxY + imageBoxHeight / 2} Td (After image pending) Tj ET`,
      );
    }

    const stream =
      commands.join("\n");

    const streamBytes =
      ascii(stream);

    objects.set(
      contentId,
      ascii(
        `${contentId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
      ),
    );

    const xObjects =
      `/ImB ${beforeImageId} 0 R${
        afterImageId
          ? ` /ImA ${afterImageId} 0 R`
          : ""
      }`;

    objects.set(
      pageId,
      ascii(
        `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> /XObject << ${xObjects} >> >> /Contents ${contentId} 0 R >>\nendobj\n`,
      ),
    );
  }

  objects.set(
    1,
    ascii(
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    ),
  );

  objects.set(
    2,
    ascii(
      `2 0 obj\n<< /Type /Pages /Kids [${pageIds
        .map(
          (id) => `${id} 0 R`,
        )
        .join(
          " ",
        )}] /Count ${pageIds.length} >>\nendobj\n`,
    ),
  );

  objects.set(
    3,
    ascii(
      "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    ),
  );

  const header =
    concatBytes([
      ascii("%PDF-1.4\n%"),
      new Uint8Array([
        0xe2,
        0xe3,
        0xcf,
        0xd3,
      ]),
      ascii("\n"),
    ]);

  const maxId =
    nextId - 1;

  const offsets =
    new Array<number>(
      maxId + 1,
    ).fill(0);

  const bodyChunks:
    Uint8Array[] = [];

  let cursor =
    header.length;

  for (
    let id = 1;
    id <= maxId;
    id += 1
  ) {
    const object =
      objects.get(id);

    if (!object) {
      throw new Error(
        `PDF object ${id} is missing.`,
      );
    }

    offsets[id] =
      cursor;

    bodyChunks.push(object);

    cursor +=
      object.length;
  }

  const xrefOffset =
    cursor;

  let xref =
    `xref\n0 ${maxId + 1}\n`;

  xref +=
    "0000000000 65535 f \n";

  for (
    let id = 1;
    id <= maxId;
    id += 1
  ) {
    xref +=
      `${String(
        offsets[id],
      ).padStart(
        10,
        "0",
      )} 00000 n \n`;
  }

  const trailer =
    `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return concatBytes([
    header,
    ...bodyChunks,
    ascii(xref),
    ascii(trailer),
  ]);
}
