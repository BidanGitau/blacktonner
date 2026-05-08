import { Link, useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowLeft, Clock, FileText } from "lucide-react";

import { usePost } from "~/lib/queries";
import { isDirectVideo, videoEmbedUrl } from "~/lib/video";
import { POST_CATEGORY_LABELS } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Article — Blacktoner" },
];

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = usePost(slug ?? "");

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-12 lg:px-6">
        <div className="h-6 w-32 animate-pulse bg-stone-100" />
        <div className="h-12 w-3/4 animate-pulse bg-stone-100" />
        <div className="aspect-[16/9] animate-pulse bg-stone-100" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 animate-pulse bg-stone-100" />)}
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center lg:px-6">
        <FileText className="mx-auto mb-3 h-7 w-7 text-black/30" strokeWidth={1.5} />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">Article not found</p>
        <Link to="/blog" className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 hover:text-black">
          ← Back to all articles
        </Link>
      </div>
    );
  }

  const embedUrl = videoEmbedUrl(post.videoUrl);
  const directVideo = post.videoUrl && isDirectVideo(post.videoUrl) ? post.videoUrl : null;

  return (
    <div className="bg-white">
      <article className="container mx-auto max-w-3xl px-4 py-10 lg:px-6 lg:py-14">
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3 w-3" /> All Articles
        </Link>

        <header className="mb-8">
          <p className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
            <span className="bg-brand px-2 py-1 text-brand-foreground">
              {POST_CATEGORY_LABELS[post.category]}
            </span>
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
          <h1
            className="text-3xl font-black uppercase leading-[1.05] tracking-tight text-black md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-black/65">
            {post.excerpt}
          </p>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
            By {post.author}
          </p>
        </header>

        {/* Cover image */}
        {post.coverImage && !embedUrl && !directVideo && (
          <div className="mb-8 overflow-hidden border border-stone-200">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Embedded video (YouTube/Vimeo) */}
        {embedUrl && (
          <div className="mb-8 aspect-video overflow-hidden border border-stone-200 bg-black">
            <iframe
              src={embedUrl}
              title={post.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        {/* Direct video file */}
        {directVideo && !embedUrl && (
          <div className="mb-8 aspect-video overflow-hidden border border-stone-200 bg-black">
            <video controls className="h-full w-full" poster={post.coverImage ?? undefined}>
              <source src={directVideo} />
              Your browser doesn't support embedded video.
            </video>
          </div>
        )}

        {/* Body — preserves paragraph breaks */}
        <div className="prose-blog max-w-none whitespace-pre-wrap text-base leading-relaxed text-black/80">
          {post.body}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Tags</span>
            {post.tags.map((tag) => (
              <span key={tag} className="border border-stone-300 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-black/65">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
