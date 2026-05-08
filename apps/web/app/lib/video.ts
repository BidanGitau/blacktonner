/** Convert a YouTube/Vimeo/direct video URL into an embed URL or null if unsupported. */
export function videoEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // YouTube — youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>
  const ytShort = url.match(/youtu\.be\/([\w-]{6,})/i);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const ytWatch = url.match(/[?&]v=([\w-]{6,})/i);
  if (/youtube\.com/i.test(url) && ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  if (/youtube\.com\/embed\//i.test(url)) return url;

  // Vimeo — vimeo.com/<id>
  const vimeo = url.match(/vimeo\.com\/(?:.*?\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

/** Decide whether a URL is a direct video file we can render in <video>. */
export function isDirectVideo(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  return /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(rawUrl.trim());
}
