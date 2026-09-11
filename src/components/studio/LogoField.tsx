import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { fileToLogoDataUrl, isVisibleLogo } from "@/lib/logo-image";

export function LogoField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (logo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shown = isVisibleLogo(value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await fileToLogoDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="font-display font-semibold">Logo</p>
      <p className="mt-1 text-sm text-muted">
        Optional. Skip it and the menu shows the café name only. JPG, PNG or
        WebP, up to 6 MB — we shrink it for the menu.
      </p>

      {shown ? (
        <img
          src={value}
          alt=""
          className="mt-3 size-28 rounded-xl bg-surface-2 object-contain p-2 shadow-[var(--shadow-border)]"
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-3 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface-2 text-sm font-semibold text-muted shadow-[var(--shadow-border)] hover:text-fg disabled:opacity-50"
        >
          <ImagePlus className="size-5 text-lime" strokeWidth={2} />
          {busy ? "Preparing…" : "Choose logo"}
        </button>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {shown ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-11 items-center rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg disabled:opacity-40"
            >
              {busy ? "Preparing…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                onChange("");
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted hover:text-fg"
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          </>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm font-semibold text-red">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
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
