"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  BookOpen,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  optimizeImageForUpload,
  uploadImageToBucket,
} from "@/lib/images/upload";

export type AdminBlog = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  detail_images: string[] | null;
  steps:
    | Array<{
        title: string;
        description: string;
      }>
    | null;
  faqs:
    | Array<{
        question: string;
        answer: string;
      }>
    | null;
  created_at: string;
};

type BlogForm = {
  title: string;
  description: string;
  image_url: string;
  detail_images_text: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const emptyForm: BlogForm = {
  title: "",
  description: "",
  image_url: "",
  detail_images_text: "",
  steps: [
    {
      title: "",
      description: "",
    },
  ],
  faqs: [
    {
      question: "",
      answer: "",
    },
  ],
};

export default function BlogManagement({
  blogs = [],
}: {
  blogs?: AdminBlog[];
}) {
  const [items, setItems] =
    useState<AdminBlog[]>(blogs);

  const [query, setQuery] = useState("");

  const [form, setForm] =
    useState<BlogForm>(emptyForm);

  const [open, setOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mainImageFile, setMainImageFile] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState("");

  const sorted = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return [...items]
      .filter((blog) => {
        if (!normalizedQuery) return true;

        const searchable =
          `${blog.title} ${blog.description}`.toLowerCase();

        return searchable.includes(
          normalizedQuery,
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [items, query]);

  const totalImages = items.reduce(
    (total, blog) =>
      total +
      (blog.image_url ? 1 : 0) +
      (blog.detail_images?.length || 0),
    0,
  );

  const totalSteps = items.reduce(
    (total, blog) =>
      total + (blog.steps?.length || 0),
    0,
  );

  const totalFaqs = items.reduce(
    (total, blog) =>
      total + (blog.faqs?.length || 0),
    0,
  );

  const resetForm = () => {
    setForm({
      ...emptyForm,
      steps: [
        {
          title: "",
          description: "",
        },
      ],
      faqs: [
        {
          question: "",
          answer: "",
        },
      ],
    });

    setMainImageFile(null);
    setMainImagePreview("");
    setError("");
  };

  const openAddBlog = () => {
    resetForm();
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setOpen(false);
    setError("");
  };

  const uploadMainImage =
    async () => {
      if (!mainImageFile) return "";

      const supabase =
        createClient();

      const optimized =
        await optimizeImageForUpload(
          mainImageFile,
        );

      const ext =
        optimized.name
          .split(".")
          .pop() || "jpg";

      const path = `blogs/main_${Date.now()}_${crypto.randomUUID()}.${ext}`;

      return uploadImageToBucket(
        supabase,
        "job-images",
        path,
        optimized,
      );
    };

  const saveBlog = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!mainImageFile) {
      setError(
        "Please upload a main blog image.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const imageUrl =
        await uploadMainImage();

      const response = await fetch(
        "/api/admin/blogs",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            description:
              form.description,
            image_url: imageUrl,
            detail_images:
              form.detail_images_text
                .split(/\r?\n/)
                .map((url) =>
                  url.trim(),
                )
                .filter(Boolean),
            steps: form.steps,
            faqs: form.faqs,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to save blog.",
        );
      }

      setItems((current) => [
        result.blog as AdminBlog,
        ...current,
      ]);

      resetForm();
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save blog.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (
    blog: AdminBlog,
  ) => {
    if (
      !window.confirm(
        `Delete "${blog.title}"?`,
      )
    ) {
      return;
    }

    const response = await fetch(
      `/api/admin/blogs?id=${blog.id}`,
      {
        method: "DELETE",
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      window.alert(
        result.error ||
          "Unable to delete blog.",
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== blog.id,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Content Management
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                Blogs
              </h1>

              <p className="mt-1 text-slate-500">
                Create and manage website blog content shown on the public site.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddBlog}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Plus size={14} />
              Add Blog
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Blogs"
            value={items.length}
            icon={FileText}
          />

          <StatCard
            label="Images"
            value={totalImages}
            icon={ImageIcon}
          />

          <StatCard
            label="Steps"
            value={totalSteps}
            icon={BookOpen}
          />

          <StatCard
            label="FAQs"
            value={totalFaqs}
            icon={FileText}
          />
        </section>

        {/* SEARCH */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 transition focus-within:border-blue-300 focus-within:bg-white">
            <Search
              size={14}
              className="text-slate-400"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search blog title or description..."
              className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </section>

        {/* BLOG LIST */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Blog List
              </h2>

              <p className="mt-0.5 text-slate-500">
                {sorted.length} blog
                {sorted.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {!sorted.length ? (
            <div className="px-5 py-14 text-center">
              <BookOpen
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                {query
                  ? "No blogs match this search."
                  : "No blogs added yet."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full table-fixed text-left">
                  <thead className="bg-[#F8FAFD]">
                    <tr>
                      {[
                        [
                          "Blog",
                          "w-[34%]",
                        ],
                        [
                          "Published",
                          "w-[15%]",
                        ],
                        [
                          "Images",
                          "w-[10%]",
                        ],
                        [
                          "Steps",
                          "w-[9%]",
                        ],
                        [
                          "FAQs",
                          "w-[9%]",
                        ],
                        [
                          "Actions",
                          "w-[23%]",
                        ],
                      ].map(
                        ([head, width]) => (
                          <th
                            key={head}
                            className={`border-b border-slate-200 px-2.5 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400 ${width}`}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sorted.map(
                      (blog) => (
                        <tr
                          key={blog.id}
                          className="transition hover:bg-blue-50/40"
                        >
                          <td className="px-2.5 py-2.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                {blog.image_url ? (
                                  <img
                                    src={
                                      blog.image_url
                                    }
                                    alt={
                                      blog.title
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon
                                    size={15}
                                    className="text-slate-300"
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="truncate text-[10px] font-bold text-[#13263A]">
                                  {
                                    blog.title
                                  }
                                </div>

                                <div className="mt-0.5 line-clamp-2 text-[8px] leading-3.5 text-slate-400">
                                  {
                                    blog.description
                                  }
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-2.5 py-2.5 text-[9px] text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={11}
                                className="text-slate-400"
                              />

                              {formatDate(
                                blog.created_at,
                              )}
                            </span>
                          </td>

                          <td className="px-2.5 py-2.5">
                            <MetricBadge
                              value={
                                (blog
                                  .detail_images
                                  ?.length ||
                                  0) +
                                (blog.image_url
                                  ? 1
                                  : 0)
                              }
                            />
                          </td>

                          <td className="px-2.5 py-2.5">
                            <MetricBadge
                              value={
                                blog.steps
                                  ?.length ||
                                0
                              }
                            />
                          </td>

                          <td className="px-2.5 py-2.5">
                            <MetricBadge
                              value={
                                blog.faqs
                                  ?.length ||
                                0
                              }
                            />
                          </td>

                          <td className="px-2 py-2.5">
                            <div className="flex flex-nowrap items-center gap-1">
                              <a
                                href={`/blog/${blog.id}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-7 items-center gap-1 rounded-md bg-[#4A86F7] px-2.5 text-[8px] font-bold text-white transition hover:bg-blue-600"
                              >
                                <BookOpen
                                  size={11}
                                />
                                View
                              </a>

                              <button
                                type="button"
                                aria-label={`Delete ${blog.title}`}
                                onClick={() =>
                                  deleteBlog(
                                    blog,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                              >
                                <Trash2
                                  size={11}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {sorted.map(
                  (blog) => (
                    <article
                      key={blog.id}
                      className="p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {blog.image_url ? (
                            <img
                              src={
                                blog.image_url
                              }
                              alt={
                                blog.title
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={18}
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-[11px] font-bold text-[#13263A]">
                            {blog.title}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500">
                            {
                              blog.description
                            }
                          </p>

                          <p className="mt-1.5 text-[8px] text-slate-400">
                            {formatDate(
                              blog.created_at,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <MobileMetric
                          label="Images"
                          value={
                            (blog
                              .detail_images
                              ?.length ||
                              0) +
                            (blog.image_url
                              ? 1
                              : 0)
                          }
                        />

                        <MobileMetric
                          label="Steps"
                          value={
                            blog.steps
                              ?.length || 0
                          }
                        />

                        <MobileMetric
                          label="FAQs"
                          value={
                            blog.faqs
                              ?.length || 0
                          }
                        />
                      </div>

                      <div className="mt-3 flex gap-1.5">
                        <a
                          href={`/blog/${blog.id}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#4A86F7] text-[9px] font-bold text-white"
                        >
                          <BookOpen
                            size={12}
                          />
                          View Blog
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            deleteBlog(
                              blog,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
                        >
                          <Trash2
                            size={12}
                          />
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD BLOG MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-5"
          onMouseDown={(event) =>
            event.target ===
              event.currentTarget &&
            closeModal()
          }
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">
                  Blog Management
                </p>

                <h2 className="mt-1 font-bold text-[#13263A]">
                  Add New Blog
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <X size={14} />
              </button>
            </div>

            <form
              onSubmit={saveBlog}
              className="space-y-4 p-5"
            >
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700">
                  {error}
                </p>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Blog Title"
                  value={form.title}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      title: value,
                    })
                  }
                  placeholder="How to prepare for deep cleaning"
                  required
                />

                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
                    Main Blog Image
                  </span>

                  <input
                    required={
                      !mainImageFile
                    }
                    type="file"
                    accept="image/*"
                    onChange={(
                      event,
                    ) => {
                      const file =
                        event.target
                          .files?.[0] ||
                        null;

                      setMainImageFile(
                        file,
                      );

                      setMainImagePreview(
                        file
                          ? URL.createObjectURL(
                              file,
                            )
                          : "",
                      );
                    }}
                    className="block h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-2 py-1 text-[9px] font-medium text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-[#4A86F7] file:px-3 file:py-1.5 file:text-[8px] file:font-bold file:text-white"
                  />
                </label>
              </div>

              {mainImagePreview && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFD] p-3">
                  <p className="mb-2 text-[9px] font-bold text-slate-600">
                    Image Preview
                  </p>

                  <img
                    src={
                      mainImagePreview
                    }
                    alt="Blog preview"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <TextArea
                label="Description"
                value={
                  form.description
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    description: value,
                  })
                }
                placeholder="Write the main blog content..."
                required
              />

              <TextArea
                label="Detail Image URLs"
                value={
                  form.detail_images_text
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    detail_images_text:
                      value,
                  })
                }
                placeholder="One image URL per line"
              />

              <DynamicPairs
                title="Steps"
                firstLabel="Step Title"
                secondLabel="Step Description"
                items={form.steps}
                onChange={(steps) =>
                  setForm({
                    ...form,
                    steps,
                  })
                }
              />

              <DynamicPairs
                title="FAQs"
                firstLabel="Question"
                secondLabel="Answer"
                items={form.faqs.map(
                  (faq) => ({
                    title:
                      faq.question,
                    description:
                      faq.answer,
                  }),
                )}
                onChange={(items) =>
                  setForm({
                    ...form,
                    faqs: items.map(
                      (item) => ({
                        question:
                          item.title,
                        answer:
                          item.description,
                      }),
                    ),
                  })
                }
              />

              <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  className="h-9 rounded-lg bg-[#4A86F7] px-4 text-[10px] font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
            {label}
          </div>

          <div className="mt-1 text-[20px] font-extrabold leading-none text-[#13263A]">
            {value}
          </div>
        </div>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
          <Icon size={14} />
        </span>
      </div>
    </div>
  );
}

function MetricBadge({
  value,
}: {
  value: number;
}) {
  return (
    <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-600">
      {value}
    </span>
  );
}

function MobileMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-[#F8FAFD] p-2 text-center">
      <div className="text-[8px] font-bold uppercase text-slate-400">
        {label}
      </div>

      <div className="mt-0.5 text-[10px] font-bold text-[#13263A]">
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </span>

      <input
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </span>

      <textarea
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[10px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
      />
    </label>
  );
}

function DynamicPairs({
  title,
  firstLabel,
  secondLabel,
  items,
  onChange,
}: {
  title: string;
  firstLabel: string;
  secondLabel: string;
  items: Array<{
    title: string;
    description: string;
  }>;
  onChange: (
    items: Array<{
      title: string;
      description: string;
    }>,
  ) => void;
}) {
  const update = (
    index: number,
    key:
      | "title"
      | "description",
    value: string,
  ) =>
    onChange(
      items.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
      ),
    );

  return (
    <section className="rounded-xl border border-slate-200 bg-[#F8FAFD] p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-bold text-[#13263A]">
          {title}
        </h3>

        <button
          type="button"
          onClick={() =>
            onChange([
              ...items,
              {
                title: "",
                description: "",
              },
            ])
          }
          className="h-8 rounded-lg bg-[#13263A] px-3 text-[9px] font-bold text-white"
        >
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {items.map(
          (item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 md:grid-cols-[1fr_1.4fr_32px]"
            >
              <Field
                label={firstLabel}
                value={
                  item.title
                }
                onChange={(
                  value,
                ) =>
                  update(
                    index,
                    "title",
                    value,
                  )
                }
              />

              <Field
                label={
                  secondLabel
                }
                value={
                  item.description
                }
                onChange={(
                  value,
                ) =>
                  update(
                    index,
                    "description",
                    value,
                  )
                }
              />

              <button
                type="button"
                aria-label={`Remove ${title} item`}
                onClick={() =>
                  onChange(
                    items.filter(
                      (
                        _,
                        itemIndex,
                      ) =>
                        itemIndex !==
                        index,
                    ),
                  )
                }
                className="mt-[22px] flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
              >
                <Trash2
                  size={12}
                />
              </button>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}
