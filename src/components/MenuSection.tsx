import { MenuItemCard } from "@/components/MenuItemCard";
import type { MenuCategory, MenuItem } from "@/lib/types";

export function MenuSection({
  category,
  items,
}: {
  category: MenuCategory;
  items: MenuItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      id={`category-${category.slug}`}
      data-category-id={category._id}
      className="scroll-mt-64"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight text-fg">
          {category.title}
        </h2>
        <span className="text-xs font-medium text-subtle tabular-nums">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item._id}>
            <MenuItemCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
