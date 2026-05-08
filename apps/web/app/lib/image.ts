export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  skipUnderBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 2000,
  quality: 0.85,
  skipUnderBytes: 500 * 1024,
};

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const { maxDimension, quality, skipUnderBytes } = { ...DEFAULTS, ...opts };

  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const bitmap = await loadBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const needsResize = scale < 1;

  if (!needsResize && file.size <= skipUnderBytes) {
    bitmap.close?.();
    return file;
  }

  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  const blob = await encode(canvas, quality);
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, { type: blob.type, lastModified: Date.now() });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image"));
      el.src = url;
    });
    return img as unknown as ImageBitmap;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (webp) => {
        if (webp) return resolve(webp);
        canvas.toBlob((jpg) => resolve(jpg), "image/jpeg", quality);
      },
      "image/webp",
      quality,
    );
  });
}
