import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { fileToDishDataUrl, isVisiblePhoto } from "@/lib/logo-image";

export function DishPhotoField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (image: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shown = isVisiblePhoto(value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await fileToDishDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
        Photo
      </p>
      <p className="mb-2 text-xs text-muted">
        Optional. JPG, PNG or WebP, up to 4 MB — we shrink it.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="relative size-16 shrink-0 overflow-hidden rounded-md bg-surface-2 shadow-[var(--shadow-border)] disabled:opacity-50"
          aria-label={shown ? "Replace dish photo" : "Add dish photo"}
        >
          {shown ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <ImagePlus className="size-4" strokeWidth={2} />
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex min-h-10 items-center rounded-md bg-surface-2 px-3 text-sm font-semibold text-fg disabled:opacity-40"
          >
            {busy ? "Preparing…" : shown ? "Replace" : "Choose"}
          </button>
          {shown ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onChange("");
              }}
              className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-muted hover:text-fg"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-red">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onFile(file);
        }}
      />
    </div>
  );
}
