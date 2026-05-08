import { useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight, Clock, FileText, PlayCircle, Search } from "lucide-react";

import { usePosts } from "~/lib/queries";
import { POST_CATEGORY_LABELS, type PostCategory } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Repair Tips & How-Tos — Blacktoner" },
  { name: "description", content: "Easy repair guides, tips, and how-tos for laptops, printers and toners — written by the Blacktoner team." },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "",       label: "All" },
  ...(Object.entries(POST_CATEGORY_LABELS) as [PostCategory, string][]).map(([value, label]) => ({ value, label })),
];

export default function BlogListPage() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const { data: posts = [], isLoading } = usePosts({
    category: category || undefined,
    search: search || undefined,
  });

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            <span className="block h-px w-6 bg-black/25" />
            Tips & How-Tos
          </p>
          <h1
            className="font-black uppercase leading-[0.95] tracking-tight text-black"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontFamily: "var(--font-display)" }}
          >
            Fix It. Learn It. <span className="text-brand">Save On It.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/55">
            Honest guides from the Blacktoner team — printer fixes, toner refills, laptop tune-ups and the easy todos that save you a service call.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-4 lg:px-6">
          <div className="relative max-w-sm flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="h-9 w-full border border-black/15 bg-white pl-9 pr-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.value || "all"}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  category === c.value
                    ? "bg-black text-white"
                    : "text-black/55 hover:bg-stone-100 hover:text-black"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-stone-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 border border-stone-200 bg-stone-50 py-16 text-center">
            <FileText className="h-7 w-7 text-black/30" strokeWidth={1.5} />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/55">
              {search || category ? "No matches" : "Nothing published yet"}
            </p>
            <p className="max-w-xs text-xs text-black/45">
              {search || category
                ? "Try a different search term or category."
                : "Check back soon — guides and how-tos are on the way."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col"
                style={{ animationDelay: `${i * 60}ms`, animation: "fade-up 0.4s ease forwards", opacity: 0 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-black/15">
                      <FileText className="h-12 w-12" strokeWidth={1.2} />
                    </div>
                  )}
                  {post.videoUrl && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-black/85 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                      <PlayCircle className="h-3 w-3" strokeWidth={2} /> Video
                    </span>
                  )}
                  <span className="absolute right-3 top-3 bg-brand px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-foreground">
                    {POST_CATEGORY_LABELS[post.category]}
                  </span>
                </div>

                <div className="pt-4">
                  <p className="mb-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.8} />
                      {post.readMinutes} min read
                    </span>
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </p>
                  <h2 className="line-clamp-2 text-base font-bold leading-tight text-black transition-colors group-hover:text-black/70">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/55">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-all group-hover:gap-2.5">
                    Read article <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
