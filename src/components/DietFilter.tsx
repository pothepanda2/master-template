import type { DietFilter as DietFilterValue } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: DietFilterValue; label: string }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg" },
  { id: "nonveg", label: "Non-veg" },
];

export function DietFilter({
  value,
  onChange,
}: {
  value: DietFilterValue;
  onChange: (value: DietFilterValue) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Diet filter"
      className="grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-1 shadow-[var(--shadow-border)]"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-10 rounded-sm px-2 text-sm font-semibold transition-colors duration-150",
              active
                ? option.id === "veg"
                  ? "bg-veg text-lime-fg"
                  : option.id === "nonveg"
                    ? "bg-nonveg text-fg"
                    : "bg-lime text-lime-fg"
                : "text-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
