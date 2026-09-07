import { useEffect, useRef } from "react";
import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: MenuCategory[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId || !scroller.current) return;
    const node = scroller.current.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);
    node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  if (categories.length === 0) return null;

  return (
    <nav aria-label="Menu categories" className="-mx-4">
      <div
        ref={scroller}
        className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-1"
      >
        {categories.map((category) => {
          const active = category._id === activeId;
          return (
            <button
              key={category._id}
              type="button"
              data-cat={category._id}
              onClick={() => onSelect(category._id)}
              className={cn(
                "shrink-0 rounded-pill px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150",
                active
                  ? "bg-lime text-lime-fg"
                  : "bg-surface-2 text-muted shadow-[var(--shadow-border)] hover:text-fg",
              )}
            >
              {category.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
