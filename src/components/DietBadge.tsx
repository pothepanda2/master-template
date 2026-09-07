import type { DietType } from "@/lib/types";
import { DIET_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const MARK: Record<DietType, string> = {
  veg: "bg-veg",
  vegan: "bg-vegan",
  nonveg: "bg-nonveg",
  egg: "bg-egg",
};

const RING: Record<DietType, string> = {
  veg: "border-veg",
  vegan: "border-vegan",
  nonveg: "border-nonveg",
  egg: "border-egg",
};

export function DietBadge({
  diet,
  size = "sm",
  withLabel = false,
}: {
  diet: DietType;
  size?: "sm" | "md";
  withLabel?: boolean;
}) {
  const box = size === "md" ? "size-4" : "size-3.5";
  const dot = size === "md" ? "size-2" : "size-1.5";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-[2px] border-2 bg-transparent",
          box,
          RING[diet],
        )}
        title={DIET_LABEL[diet]}
        aria-label={DIET_LABEL[diet]}
      >
        <span className={cn("rounded-full", dot, MARK[diet])} />
      </span>
      {withLabel ? (
        <span className="text-xs font-medium text-muted">{DIET_LABEL[diet]}</span>
      ) : (
        <span className="sr-only">{DIET_LABEL[diet]}</span>
      )}
    </span>
  );
}
