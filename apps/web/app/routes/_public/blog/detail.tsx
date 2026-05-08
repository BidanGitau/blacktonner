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

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-KE", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;
  const initial = post.author.trim().charAt(0).toUpperCase() || "B";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(post.body);

  return (
    <div className="bg-white">
      <article className="mx-auto px-4 pt-6 pb-12 lg:pt-10">
        <div className="mx-auto max-w-[680px]">
          <Link
            to="/blog"
            className="eyebrow-xs mb-5 inline-flex items-center gap-2 text-black/55 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" /> All Articles
          </Link>
        </div>

        <header className="mx-auto mb-5 max-w-[680px]">
          <Link
            to={`/blog?category=${post.category}`}
            className="eyebrow-xs mb-2.5 inline-block text-black/55 transition-colors hover:text-black"
          >
            {POST_CATEGORY_LABELS[post.category]}
          </Link>
          <h1 className="font-display text-[1.625rem] font-black leading-[1.15] tracking-tight text-black md:text-[2.25rem] md:leading-[1.1]">
            {post.title}
          </h1>
          <p className="mt-2 text-sm leading-snug text-black/55 md:text-base">
            {post.excerpt}
          </p>

          <div className="mt-4 flex items-center gap-2.5 border-y border-stone-200 py-2.5">
            <span className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold uppercase text-white">
              {initial}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="eyebrow-xs text-black">{post.author}</p>
              <p className="eyebrow-xs mt-0.5 flex items-center gap-1.5 text-black/45">
                {formattedDate && <span>{formattedDate}</span>}
                {formattedDate && <span aria-hidden>·</span>}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" strokeWidth={1.8} />
                  {post.readMinutes} min read
                </span>
              </p>
            </div>
          </div>
        </header>

        {post.coverImage && !embedUrl && !directVideo && (
          <figure className="mx-auto mb-6 max-w-[1080px]">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </figure>
        )}
        {embedUrl && (
          <figure className="mx-auto mb-6 aspect-video max-w-[1080px] overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={post.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </figure>
        )}
        {directVideo && !embedUrl && (
          <figure className="mx-auto mb-6 aspect-video max-w-[1080px] overflow-hidden bg-black">
            <video controls className="h-full w-full" poster={post.coverImage ?? undefined}>
              <source src={directVideo} />
              Your browser doesn't support embedded video.
            </video>
          </figure>
        )}

        <div className="mx-auto max-w-[680px]">
          {isHtml ? (
            <div className="prose-blog" dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <div className="prose-blog whitespace-pre-wrap">{post.body}</div>
          )}

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-1.5 border-t border-stone-200 pt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="eyebrow-xs border border-stone-200 bg-white px-2 py-1 text-black/55 transition-colors hover:border-black hover:text-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
