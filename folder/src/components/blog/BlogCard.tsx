import Image from "next/image";
import Link from "next/link";

type BlogCardProps = {
  blog: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
  };
};

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#0B4E9B] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[240px] w-full overflow-hidden">
        <Image
          src={blog.image_url}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-6">
        <h3 className="line-clamp-2 text-2xl font-bold text-[#0B4E9B]">
          {blog.title}
        </h3>
        <p className="line-clamp-3 leading-7 text-gray-600">
          {blog.description}
        </p>
        <Link
          href={`/blog/${blog.id}/`}
          className="inline-flex items-center justify-center rounded-lg bg-[#0593C8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00B7EB]"
        >
          Read Article
        </Link>
      </div>
    </article>
  );
}
