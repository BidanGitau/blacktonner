import { useRef, useState } from "react";
import { Loader2, Trash2, Upload, ImageIcon } from "lucide-react";
import { useUpload } from "~/lib/queries";
import { compressImage, fileToDataURL } from "~/lib/image";

interface ImageInputRowProps {
  value: string;
  onChange: (next: string) => void;
  onRemove?: () => void;
  placeholder?: string;
}

export function ImageInputRow({
  value,
  onChange,
  onRemove,
  placeholder = "https://…",
}: ImageInputRowProps) {
  const upload = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function pickFile() {
    setError(null);
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    try {
      const compressed = await compressImage(file);
      const data = await fileToDataURL(compressed);
      upload.mutate(
        { filename: compressed.name, data },
        {
          onSuccess: ({ url }) => onChange(url),
          onError: () => setError("Upload failed"),
        },
      );
    } catch {
      setError("Could not process image");
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-200 bg-stone-50">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <ImageIcon className="h-4 w-4 text-black/30" strokeWidth={1.6} />
          )}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
        />
        <button
          type="button"
          onClick={pickFile}
          disabled={upload.isPending}
          title="Upload from device"
          className="flex h-9 items-center gap-1.5 rounded-md border border-stone-200 px-2.5 text-xs font-semibold text-black/70 transition-colors hover:border-black hover:text-black disabled:opacity-60"
        >
          {upload.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <span>Upload</span>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
