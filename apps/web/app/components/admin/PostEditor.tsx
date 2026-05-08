import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { POST_CATEGORY_LABELS, type Post, type PostCategory, type PostStatus } from "~/types";
import { isDirectVideo, videoEmbedUrl } from "~/lib/video";
import { RichTextEditor } from "./RichTextEditor";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface PostFormValue {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  videoUrl: string;
  category: PostCategory;
  author: string;
  readMinutes: number;
  tags: string;
  status: PostStatus;
}

export const emptyPost: PostFormValue = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  videoUrl: "",
  category: "how_to",
  author: "Blacktoner Team",
  readMinutes: 3,
  tags: "",
  status: "draft",
};

export function postToForm(post: Post): PostFormValue {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: post.coverImage ?? "",
    videoUrl: post.videoUrl ?? "",
    category: post.category,
    author: post.author,
    readMinutes: post.readMinutes,
    tags: post.tags.join(", "),
    status: post.status,
  };
}

export function formToPayload(form: PostFormValue) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || toSlug(form.title),
    excerpt: form.excerpt.trim(),
    body: form.body,
    coverImage: form.coverImage.trim() || null,
    videoUrl: form.videoUrl.trim() || null,
    category: form.category,
    author: form.author.trim() || "Blacktoner Team",
    readMinutes: Number(form.readMinutes) || 3,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    status: form.status,
  };
}

const labelCls = "block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";
const inputCls = (hasError = false) =>
  `mt-1.5 h-9 w-full border bg-white px-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40 ${
    hasError ? "border-red-400" : "border-stone-200"
  }`;

interface PostEditorProps {
  initialValue?: PostFormValue;
  title: string;
  eyebrow: string;
  saving: boolean;
  onSave: (form: PostFormValue) => void;
  onDelete?: () => void;
  deleting?: boolean;
}

export function PostEditor({
  initialValue,
  title,
  eyebrow,
  saving,
  onSave,
  onDelete,
  deleting,
}: PostEditorProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<PostFormValue>(initialValue ?? emptyPost);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) setForm(initialValue);
  }, [initialValue]);

  function set<K extends keyof PostFormValue>(key: K, value: PostFormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.excerpt.trim()) e.excerpt = "Required";
    if (!form.body.trim()) e.body = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const embedUrl = videoEmbedUrl(form.videoUrl);
  const directVideo = form.videoUrl && isDirectVideo(form.videoUrl) ? form.videoUrl : null;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link
          to="/admin/posts"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 transition-colors hover:border-black hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">{eyebrow}</p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            {title}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Body column */}
        <div className="space-y-6">
          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Content</h2>

            <div>
              <label className={labelCls}>Title *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!form.slug) set("slug", toSlug(e.target.value));
                }}
                placeholder="How to refill your HP toner cartridge"
                className={inputCls(!!errors.title)}
              />
              {errors.title && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-generated"
                  className={inputCls()}
                />
              </div>
              <div>
                <label className={labelCls}>Read time (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={form.readMinutes}
                  onChange={(e) => set("readMinutes", Number(e.target.value) || 1)}
                  className={inputCls()}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="A 1–2 sentence summary that shows on the listing card"
                className={`mt-1.5 w-full resize-none border bg-white p-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40 ${
                  errors.excerpt ? "border-red-400" : "border-stone-200"
                }`}
              />
              {errors.excerpt && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.excerpt}</p>}
            </div>

            <div>
              <label className={labelCls}>Body *</label>
              <RichTextEditor
                value={form.body}
                onChange={(html) => set("body", html)}
                placeholder="Write the article here. Use the toolbar for headings, lists, links, and more."
                hasError={!!errors.body}
              />
              {errors.body && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.body}</p>}
            </div>
          </section>

          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Media</h2>

            <div>
              <label className={labelCls}>Cover image URL</label>
              <input
                value={form.coverImage}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="https://…"
                className={inputCls()}
              />
              {form.coverImage && (
                <img src={form.coverImage} alt="" className="mt-3 max-h-48 w-full rounded border border-stone-200 object-cover" />
              )}
            </div>

            <div>
              <label className={labelCls}>Video URL <span className="text-black/40 normal-case tracking-normal">(YouTube, Vimeo, or direct .mp4)</span></label>
              <input
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className={inputCls()}
              />
              {embedUrl && (
                <div className="mt-3 aspect-video overflow-hidden rounded border border-stone-200 bg-black">
                  <iframe src={embedUrl} title="preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="h-full w-full" />
                </div>
              )}
              {!embedUrl && directVideo && (
                <video src={directVideo} controls className="mt-3 max-h-64 w-full rounded border border-stone-200 bg-black" />
              )}
              {form.videoUrl && !embedUrl && !directVideo && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-orange-600">
                  Couldn't recognise this URL — paste a YouTube/Vimeo link or a direct .mp4 file.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Publish</h2>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as PostStatus)}
                className={inputCls()}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as PostCategory)}
                className={inputCls()}
              >
                {(Object.entries(POST_CATEGORY_LABELS) as [PostCategory, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Author</label>
              <input
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                className={inputCls()}
              />
            </div>

            <div>
              <label className={labelCls}>Tags <span className="text-black/40 normal-case tracking-normal">(comma-separated)</span></label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="hp, toner, refill"
                className={inputCls()}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 bg-black text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : form.status === "published" ? "Save & Publish" : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/posts")}
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
            >
              Cancel
            </button>
          </section>

          {onDelete && (
            <section className="rounded-md border border-red-200 bg-red-50 p-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-700">Danger Zone</h2>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 border border-red-300 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting…" : "Delete Post"}
              </button>
            </section>
          )}
        </aside>
      </form>
    </div>
  );
}
