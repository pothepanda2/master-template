import { DietBadge } from "@/components/DietBadge";
import type { MenuItem } from "@/lib/types";
import { cn, formatInr } from "@/lib/utils";

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]",
        !item.available && "opacity-55",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0">
            <DietBadge diet={item.dietType} />
          </span>
          <h3 className="min-w-0 text-sm leading-snug font-semibold text-fg">
            {item.name}
          </h3>
        </div>
        {item.description ? (
          <p className="mt-1 line-clamp-2 pl-5 text-sm leading-snug text-muted">
            {item.description}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2 pl-5">
          {item.available ? (
            <p className="font-display text-lg leading-none font-bold tracking-tight text-lime tabular-nums">
              {formatInr(item.price)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-subtle">Not available</p>
          )}
          {item.featured && item.available ? (
            <span className="rounded-pill bg-lime/15 px-2 py-0.5 text-xs font-semibold tracking-wide text-lime uppercase">
              Popular
            </span>
          ) : null}
        </div>
      </div>
      {item.image ? (
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
          <img
            src={item.image}
            alt=""
            width={96}
            height={96}
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
