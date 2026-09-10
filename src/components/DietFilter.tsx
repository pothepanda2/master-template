import { cn } from "@/lib/utils";

export function VegButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors duration-150",
        active
          ? "bg-veg text-lime-fg"
          : "bg-surface text-fg shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      <span
        className={cn(
          "inline-flex size-3.5 items-center justify-center rounded-[2px] border-2 bg-transparent",
          active ? "border-lime-fg" : "border-veg",
        )}
        aria-hidden="true"
      >
        <span className={cn("size-1.5 rounded-full", active ? "bg-lime-fg" : "bg-veg")} />
      </span>
      Veg
    </button>
  );
}
