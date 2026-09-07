import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryNav } from "@/components/CategoryNav";
import { DietFilter } from "@/components/DietFilter";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MenuSection } from "@/components/MenuSection";
import { SearchBar } from "@/components/SearchBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useMenuContent, saveContent } from "@/lib/content";
import { loadPublishedMenu } from "@/lib/menu-actions";
import type { DietFilter as DietFilterValue, MenuContent } from "@/lib/types";
import { matchesDiet, matchesQuery } from "@/lib/types";

export function MenuExperience({ initial }: { initial: MenuContent }) {
  const content = useMenuContent(initial);
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<DietFilterValue>("all");
  const [activeId, setActiveId] = useState<string | null>(
    content.categories[0]?._id ?? null,
  );
  const jumping = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadPublishedMenu()
        .then((published) => {
          saveContent(published);
        })
        .catch(() => {
          // keep showing whatever is already on screen
        });
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const categories = [...content.categories].sort((a, b) => a.order - b.order);
    return categories
      .map((category) => ({
        category,
        items: content.items
          .filter((item) => item.categoryId === category._id)
          .filter((item) => matchesDiet(item.dietType, diet))
          .filter((item) => matchesQuery(item, query))
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
      }))
      .filter((section) => section.items.length > 0);
  }, [content, diet, query]);

  useEffect(() => {
    if (visible.length === 0) return;
    if (!visible.some((section) => section.category._id === activeId)) {
      setActiveId(visible[0].category._id);
    }
  }, [visible, activeId]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-category-id]");
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (jumping.current) return;
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = hit?.target.getAttribute("data-category-id");
        if (id) setActiveId(id);
      },
      { rootMargin: "-220px 0px -50% 0px", threshold: [0.1, 0.35] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visible]);

  function jumpTo(id: string) {
    const category = content.categories.find((entry) => entry._id === id);
    if (!category) return;
    jumping.current = true;
    setActiveId(id);
    const el = document.getElementById(`category-${category.slug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      jumping.current = false;
    }, 1100);
  }

  const totalVisible = visible.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Header settings={content.settings} />

      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5 px-4 py-2.5">
          <SearchBar value={query} onChange={setQuery} />
          <DietFilter value={diet} onChange={setDiet} />
          <CategoryNav
            categories={visible.map((section) => section.category)}
            activeId={activeId}
            onSelect={jumpTo}
          />
        </div>
      </div>

      <main id="menu" className="mx-auto max-w-3xl px-4 pt-5 pb-10">
        {totalVisible === 0 ? (
          <div className="rounded-xl bg-surface px-5 py-12 text-center shadow-[var(--shadow-border)]">
            <p className="font-display text-lg font-bold text-fg">No dishes match</p>
            <p className="mt-1 text-sm text-muted">Try another word or clear the filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDiet("all");
              }}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-lime px-4 text-sm font-semibold text-lime-fg"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {visible.map((section) => (
              <MenuSection
                key={section.category._id}
                category={section.category}
                items={section.items}
              />
            ))}
          </div>
        )}
      </main>

      <Footer settings={content.settings} />
      <WhatsAppButton
        number={content.settings.whatsappNumber}
        cafeName={content.settings.name}
        variant="fab"
      />
    </div>
  );
}
