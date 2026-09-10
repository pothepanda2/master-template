import { useRef, useState } from "react";
import { FileDown, FileUp } from "lucide-react";
import { exportMenuCsv, importMenuCsv } from "@/lib/menu-csv";
import type { MenuContent } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function CsvTools({
  content,
  onChange,
}: {
  content: MenuContent;
  onChange: (content: MenuContent) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [replace, setReplace] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  function download() {
    const csv = exportMenuCsv(content);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(content.settings.name) || "menu"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyCsv(text: string, mode: "upsert" | "replace") {
    try {
      const result = importMenuCsv(content, text, mode);
      onChange(result.content);
      const bits = [
        result.added ? `${result.added} added` : null,
        result.updated ? `${result.updated} updated` : null,
        result.createdCategories.length
          ? `${result.createdCategories.length} new ${result.createdCategories.length === 1 ? "category" : "categories"}`
          : null,
        result.skipped.length ? `${result.skipped.length} skipped` : null,
      ].filter(Boolean);
      setError(null);
      setMessage(bits.length > 0 ? bits.join(" · ") : "No dishes in that file");
      if (result.skipped[0]) {
        setError(
          `Row ${result.skipped[0].row}: ${result.skipped[0].reason}${
            result.skipped.length > 1 ? ` (+${result.skipped.length - 1} more)` : ""
          }`,
        );
      }
    } catch (err) {
      setMessage(null);
      setError(err instanceof Error ? err.message : "Could not read that CSV");
    }
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (replace) {
        setConfirming(text);
        return;
      }
      applyCsv(text, "upsert");
    };
    reader.onerror = () => {
      setError("Could not read that file");
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={download}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-surface px-3 text-sm font-semibold text-fg shadow-[var(--shadow-border)]"
        >
          <FileDown className="size-4" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-surface px-3 text-sm font-semibold text-fg shadow-[var(--shadow-border)]"
        >
          <FileUp className="size-4" />
          Import CSV
        </button>
        <label className="inline-flex min-h-10 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={replace}
            onChange={(e) => setReplace(e.target.checked)}
            className="size-4 accent-lime"
          />
          Replace all dishes
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
      </div>
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-md bg-surface p-3 shadow-[var(--shadow-border)]">
          <p className="text-sm text-fg">
            Replace every dish with this file? Categories stay. You still need to Publish.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                applyCsv(confirming, "replace");
                setConfirming(null);
              }}
              className="inline-flex min-h-10 items-center rounded-md bg-red px-3 text-sm font-semibold text-lime-fg"
            >
              Replace dishes
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-red">{error}</p> : null}
    </div>
  );
}
