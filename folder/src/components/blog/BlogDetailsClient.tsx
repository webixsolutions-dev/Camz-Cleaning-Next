"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Loader2, User } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type FAQ = { question: string; answer: string };
type Step = { title: string; description: string };

export type Blog = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  faqs: FAQ[];
  steps: Step[];
  detail_images: string[];
};

const getAltFromUrl = (url: string, fallback: string): string => {
  const filename = url.split("/").pop()?.split("?")[0] || "";
  const nameOnly = filename.split(".")[0]?.replace(/[-_]+/g, " ").trim();
  return nameOnly || fallback;
};

export default function BlogDetailsClient({
  blog,
  recentPosts,
}: {
  blog: Blog;
  recentPosts: Blog[];
}) {
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!commentName.trim() || !commentEmail.trim() || !commentText.trim()) {
      setCommentError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(commentEmail)) {
      setCommentError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setCommentError(null);
    setCommentSuccess(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("blog_comments").insert({
        blog_id: blog.id,
        name: commentName.trim(),
        email: commentEmail.trim(),
        comment: commentText.trim(),
        status: "pending",
      });

      if (error) {
        if (
          error.message.includes("does not exist") ||
          error.message.includes("schema cache")
        ) {
          throw new Error(
            "Comments feature is not yet set up. Please contact the administrator.",
          );
        }
        throw error;
      }

      setCommentSuccess("Comment submitted! It will appear after approval.");
      setCommentName("");
      setCommentEmail("");
      setCommentText("");
    } catch (error) {
      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to submit comment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#f7f7f7]">
      <section className="relative overflow-hidden bg-[#0B4E9B] py-24">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={blog.image_url}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center text-white">
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            {blog.title}
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <User size={18} aria-hidden="true" />
              <span>Camz Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} aria-hidden="true" />
              <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom mx-auto grid grid-cols-1 gap-12 px-4 lg:grid-cols-3">
          <article className="space-y-10 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src={blog.image_url}
                alt={blog.title}
                width={1200}
                height={700}
                className="w-full object-cover"
              />
            </div>

            <div className="whitespace-pre-line text-lg leading-9 text-gray-700">
              {blog.description}
            </div>

            {blog.detail_images?.length > 0 && (
              <div className="space-y-6">
                {blog.detail_images.map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-3xl">
                    <Image
                      src={image}
                      alt={getAltFromUrl(image, `${blog.title} detail image`)}
                      width={1200}
                      height={700}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {blog.steps?.length > 0 && (
              <section className="space-y-8" aria-labelledby="article-steps">
                <h2 id="article-steps" className="text-3xl font-bold text-[#0B4E9B]">
                  Step-by-Step Guide
                </h2>
                {blog.steps.map((step, index) => (
                  <div key={`${step.title}-${index}`} className="space-y-3">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {step.title}
                    </h3>
                    <p className="whitespace-pre-line text-lg leading-9 text-gray-700">
                      {step.description}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {blog.faqs?.length > 0 && (
              <section className="space-y-7" aria-labelledby="article-faqs">
                <h2 id="article-faqs" className="text-3xl font-bold text-[#0B4E9B]">
                  Frequently Asked Questions
                </h2>
                {blog.faqs.map((faq, index) => (
                  <div key={`${faq.question}-${index}`} className="space-y-3">
                    <h3 className="text-2xl font-semibold text-black">
                      {faq.question}
                    </h3>
                    <p className="text-lg leading-8 text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </section>
            )}

            {!blog.id.startsWith("guide-") && (
              <section className="rounded-3xl bg-white p-8 shadow-sm" aria-labelledby="reply-heading">
              <h2 id="reply-heading" className="text-3xl font-bold text-[#0B4E9B]">
                Leave a Reply
              </h2>
              <p className="mt-3 text-gray-500">Your email address will not be published.</p>

              {commentError && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{commentError}</div>}
              {commentSuccess && <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">{commentSuccess}</div>}

              <form onSubmit={handleCommentSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="blog-comment" className="mb-2 block font-medium">Comment</label>
                  <textarea id="blog-comment" rows={8} value={commentText} onChange={(e) => setCommentText(e.target.value)} disabled={submitting} required className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#0B4E9B] disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="blog-name" className="mb-2 block font-medium">Name</label>
                  <input id="blog-name" type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)} disabled={submitting} required className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#0B4E9B] disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="blog-email" className="mb-2 block font-medium">Email</label>
                  <input id="blog-email" type="email" value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} disabled={submitting} required className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#0B4E9B] disabled:opacity-50" />
                </div>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#0B4E9B] px-8 py-4 font-semibold text-white transition hover:bg-[#00B7EB] disabled:opacity-50">
                  {submitting ? <><Loader2 size={18} className="animate-spin" />Submitting...</> : "Post Comment"}
                </button>
              </form>
              </section>
            )}
          </article>

          <aside className="space-y-10">
            <section className="rounded-3xl bg-white p-8 shadow-sm" aria-labelledby="about-camz">
              <h2 id="about-camz" className="text-2xl font-bold text-[#0B4E9B]">About Camz Cleaning</h2>
              <Image src="/logo.webp" alt="Camz Cleaning" width={180} height={80} className="mt-6 h-auto w-auto" />
              <p className="mt-5 leading-7 text-gray-700">
                Camz Cleaning provides residential, commercial, vehicle and seasonal property cleaning with online booking for preferred appointments.
              </p>
              <div className="mt-7 flex items-center gap-3">
                {[
                  { label: "Instagram", href: "https://www.instagram.com/camzcleaning", icon: <FaInstagram key="i" size={16} /> },
                  { label: "X", href: "https://x.com/camzcleaning", icon: <FaXTwitter key="x" size={16} /> },
                  { label: "Facebook", href: "https://web.facebook.com/Camzcleaning1?_rdc=1&_rdr#", icon: <FaFacebookF key="f" size={16} /> },
                  { label: "LinkedIn", href: "https://www.linkedin.com/company/camzcleaning", icon: <FaLinkedinIn key="l" size={16} /> },
                  { label: "YouTube", href: "https://www.youtube.com/@CamzCleaning", icon: <FaYoutube key="y" size={16} /> },
                ].map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Camz Cleaning on ${social.label}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B4E9B] text-white transition hover:bg-[#00B7EB]">{social.icon}</a>
                ))}
              </div>
            </section>

            {recentPosts.length > 0 && (
              <section className="rounded-3xl bg-white p-8 shadow-sm" aria-labelledby="recent-posts">
                <h2 id="recent-posts" className="text-2xl font-bold text-[#0B4E9B]">Recent Posts</h2>
                <div className="mt-7 space-y-7">
                  {recentPosts.map((item) => (
                    <Link key={item.id} href={`/blog/${item.id}/`} className="block border-b pb-6 last:border-0">
                      <h3 className="text-xl font-semibold text-[#0B4E9B] hover:text-[#00B7EB]">{item.title}</h3>
                      <time dateTime={item.created_at} className="mt-2 block text-sm text-gray-500">{formatDate(item.created_at)}</time>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
