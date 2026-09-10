import { THEMES, THEME_IDS, isAccentHex, isThemeId, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemePicker({
  themeId,
  accentColor,
  onChange,
}: {
  themeId?: string;
  accentColor?: string;
  onChange: (patch: { themeId?: ThemeId; accentColor?: string }) => void;
}) {
  const active = isThemeId(themeId) ? themeId : "warm";
  const accent = isAccentHex(accentColor) ? accentColor : "";

  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="font-display font-semibold">Look</p>
      <p className="mt-1 text-sm text-muted">
        Theme plus an optional accent. Publish to send it to every table.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEME_IDS.map((id) => {
          const theme = THEMES[id];
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ themeId: id })}
              className={cn(
                "flex flex-col gap-2 rounded-md p-2.5 text-left shadow-[var(--shadow-border)]",
                selected ? "ring-2 ring-lime" : "hover:bg-surface-2",
              )}
            >
              <span className="flex h-8 overflow-hidden rounded-sm">
                <span className="w-2/3" style={{ background: theme.vars["--color-bg"] }} />
                <span className="w-1/3" style={{ background: theme.vars["--color-lime"] }} />
              </span>
              <span className="text-sm font-semibold">{theme.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">Accent color</p>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label="Accent color"
          value={accent || THEMES[active].vars["--color-lime"]}
          onChange={(e) => onChange({ accentColor: e.target.value })}
          className="size-11 shrink-0 cursor-pointer rounded-md bg-surface-2 p-1 shadow-[var(--shadow-border)]"
        />
        <input
          className="h-11 min-w-0 flex-1 rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none"
          value={accent}
          placeholder={THEMES[active].vars["--color-lime"]}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (!next) {
              onChange({ accentColor: "" });
              return;
            }
            const hex = next.startsWith("#") ? next : `#${next}`;
            if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) onChange({ accentColor: hex });
          }}
        />
        <button
          type="button"
          onClick={() => onChange({ accentColor: "" })}
          disabled={!accent}
          className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-semibold text-muted hover:text-fg disabled:opacity-40"
        >
          Default
        </button>
      </div>
    </div>
  );
}
