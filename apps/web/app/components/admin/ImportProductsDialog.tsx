import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useImportProducts, type ImportResult, type ImportRow } from "~/lib/queries";

const TEMPLATE_HEADERS = [
  "name", "sku", "category", "brand", "slug", "description",
  "price", "originalPrice", "costPrice", "stock",
  "images", "featured", "active",
];
const REQUIRED = ["name", "sku", "category", "price"] as const;

interface Props { children: React.ReactNode }

export function ImportProductsDialog({ children }: Props) {
  const importMutation = useImportProducts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setFile(null);
    setRows([]);
    setParseError(null);
    setResult(null);
    importMutation.reset();
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleFile(f: File) {
    setParseError(null);
    setResult(null);
    setFile(f);
    Papa.parse<ImportRow>(f, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (out) => {
        if (out.errors.length) {
          setParseError(out.errors[0].message);
          setRows([]);
          return;
        }
        const data = out.data.filter((r) => Object.values(r).some((v) => v && String(v).trim() !== ""));
        setRows(data);
      },
      error: (err) => setParseError(err.message),
    });
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  const validation = useMemo(() => validateRows(rows), [rows]);

  function downloadTemplate() {
    const sample = `${TEMPLATE_HEADERS.join(",")}\nHP LaserJet Pro M404n,HP-LJ-M404N,printers,HP,,Mono laser printer,28500,33000,22000,5,https://example.com/a.jpg|https://example.com/b.jpg,false,true\n`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit() {
    if (!rows.length) return;
    importMutation.mutate(rows, {
      onSuccess: (res) => setResult(res),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import products from CSV</DialogTitle>
          <DialogDescription>
            Upsert by SKU. Required columns: <code>{REQUIRED.join(", ")}</code>.
            <button onClick={downloadTemplate} className="ml-2 text-black underline underline-offset-2 hover:no-underline">
              Download template
            </button>
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <>
            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-10 text-center transition-colors hover:border-black hover:bg-stone-100"
              >
                <Upload className="h-7 w-7 text-black/40" strokeWidth={1.5} />
                <p className="text-sm font-medium text-black">Drop a .csv file here, or click to browse</p>
                <p className="eyebrow-xs text-black/45">Comma-separated, UTF-8</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onPickFile} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-black/55" />
                    <span className="truncate text-sm text-black">{file.name}</span>
                    <span className="eyebrow-xs shrink-0 text-black/45">{rows.length} rows</span>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex h-7 w-7 items-center justify-center rounded text-black/40 hover:bg-white hover:text-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {parseError && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {parseError}
                  </p>
                )}

                {validation.issues.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <p className="font-bold">{validation.issues.length} row(s) flagged — they will fail on submit:</p>
                    <ul className="mt-1 space-y-0.5">
                      {validation.issues.slice(0, 8).map((m, i) => (
                        <li key={i}>· {m}</li>
                      ))}
                      {validation.issues.length > 8 && <li>· …and {validation.issues.length - 8} more</li>}
                    </ul>
                  </div>
                )}

                {rows.length > 0 && (
                  <div className="overflow-hidden rounded-md border border-stone-200">
                    <div className="max-h-56 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-stone-50">
                          <tr>
                            {["name", "sku", "category", "price", "stock"].map((h) => (
                              <th key={h} className="px-3 py-1.5 text-left font-bold uppercase tracking-[0.18em] text-black/45">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.slice(0, 6).map((r, i) => (
                            <tr key={i} className="border-t border-stone-100">
                              <td className="px-3 py-1.5 text-black">{r.name}</td>
                              <td className="px-3 py-1.5 font-mono text-black/65">{r.sku}</td>
                              <td className="px-3 py-1.5 text-black/65">{r.category}</td>
                              <td className="px-3 py-1.5 tabular-nums text-black/65">{r.price}</td>
                              <td className="px-3 py-1.5 tabular-nums text-black/65">{r.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {rows.length > 6 && (
                      <p className="border-t border-stone-100 bg-stone-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                        Showing first 6 of {rows.length}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{result.created}</strong> created, <strong>{result.updated}</strong> updated
                {result.failed.length > 0 && <>, <strong>{result.failed.length}</strong> failed</>}
              </span>
            </div>
            {result.failed.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <p className="font-bold">Failed rows</p>
                <ul className="mt-1 space-y-0.5">
                  {result.failed.map((f, i) => (
                    <li key={i}>Row {f.row}{f.sku ? ` (${f.sku})` : ""}: {f.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!rows.length || importMutation.isPending}
              >
                {importMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Import {rows.length || ""} {rows.length === 1 ? "row" : "rows"}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function validateRows(rows: ImportRow[]) {
  const issues: string[] = [];
  rows.forEach((r, i) => {
    const num = i + 1;
    for (const key of REQUIRED) {
      if (!r[key] || String(r[key]).trim() === "") {
        issues.push(`Row ${num}: missing ${key}`);
        return;
      }
    }
    if (r.price != null && isNaN(Number(r.price))) issues.push(`Row ${num}: price not a number`);
  });
  return { issues };
}
