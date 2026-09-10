import { DietBadge } from "@/components/DietBadge";
import type { MenuItem } from "@/lib/types";
import { cn, formatInrAmount } from "@/lib/utils";

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl bg-surface p-3.5 shadow-[var(--shadow-border)]",
        !item.available && "opacity-55",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 shrink-0">
            <DietBadge diet={item.dietType} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 font-display text-lg leading-snug font-semibold tracking-tight text-fg">
                {item.name}
              </h3>
              {item.available ? (
                <p className="flex shrink-0 items-baseline gap-0.5 pt-0.5 font-display leading-none text-price">
                  <span className="text-sm font-medium text-lime-dim">₹</span>
                  <span className="text-xl font-semibold tracking-tight tabular-nums">
                    {formatInrAmount(item.price)}
                  </span>
                </p>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!item.available ? (
                <p className="text-sm font-semibold text-subtle">Not available</p>
              ) : null}
              {item.featured && item.available ? (
                <span className="rounded-pill bg-lime/12 px-2 py-0.5 text-xs font-semibold tracking-wide text-lime uppercase">
                  Popular
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {item.image ? (
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
          <img
            src={item.image}
            alt=""
            width={104}
            height={104}
            loading="lazy"
            decoding="async"
            className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
          {!item.available ? (
            <span className="absolute inset-0 flex items-center justify-center bg-bg/70 text-center text-xs font-semibold tracking-wide text-fg uppercase">
              Not available
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
