import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search the menu</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
        strokeWidth={2}
      />
      <input
        id="menu-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search dishes"
        autoComplete="off"
        autoCorrect="off"
        enterKeyHint="search"
        className={cn(
          "h-11 w-full rounded-md border-0 bg-surface pr-10 pl-10 text-base text-fg placeholder:text-subtle",
          "shadow-[var(--shadow-border)] transition-[box-shadow] duration-150",
          "focus:shadow-[var(--shadow-border-hover)] focus:outline-none",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:text-fg"
          aria-label="Clear search"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </label>
  );
}
