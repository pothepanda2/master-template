import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { DietBadge } from "@/components/DietBadge";
import {
  cloneSeed,
  readStoredContent,
  saveContent,
} from "@/lib/content";
import { loadPublishedMenu, publishMenu } from "@/lib/menu-actions";
import type {
  DietType,
  MenuCategory,
  MenuContent,
  MenuItem,
  RestaurantSettings,
} from "@/lib/types";
import { cn, formatInr, slugify } from "@/lib/utils";

type Tab = "settings" | "categories" | "items";
type SaveState = "idle" | "saving" | "live" | "error";

export function StudioApp() {
  const router = useRouter();
  const [draft, setDraft] = useState<MenuContent>(cloneSeed);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [tab, setTab] = useState<Tab>("settings");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPublishedMenu()
      .then((published) => {
        if (cancelled) return;
        setDraft(published);
        saveContent(published);
        setSaveState("live");
      })
      .catch(() => {
        if (cancelled) return;
        setDraft(readStoredContent() ?? cloneSeed());
      });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function persist(next: MenuContent) {
    setDraft(next);
    saveContent(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      publishMenu({ data: next })
        .then(async () => {
          setSavedAt(
            new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
          setSaveState("live");
          await router.invalidate();
        })
        .catch(() => {
          setSaveState("error");
        });
    }, 500);
  }

  const statusLabel =
    saveState === "saving"
      ? "Publishing to live menu…"
      : saveState === "live"
        ? savedAt
          ? `Live for all tables · ${savedAt}`
          : "Live for all tables"
        : saveState === "error"
          ? "Couldn’t publish — edit again to retry"
          : "Editing sample content";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex size-10 items-center justify-center rounded-sm text-muted hover:text-fg"
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold">Menu Studio</p>
            <p className="truncate text-[11px] text-muted">
              {draft.settings.name} · {statusLabel}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-10 items-center rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg"
          >
            View menu
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-5 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
          <TabButton
            active={tab === "settings"}
            onClick={() => setTab("settings")}
            icon={<Settings className="size-4" />}
          >
            Settings
          </TabButton>
          <TabButton
            active={tab === "categories"}
            onClick={() => setTab("categories")}
            icon={<UtensilsCrossed className="size-4" />}
          >
            Categories
          </TabButton>
          <TabButton
            active={tab === "items"}
            onClick={() => setTab("items")}
            icon={<Plus className="size-4" />}
          >
            Menu items
          </TabButton>
          <button
            type="button"
            onClick={() => persist(cloneSeed())}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted hover:text-fg lg:mt-4"
          >
            <RotateCcw className="size-4" />
            Reset sample
          </button>
        </nav>

        <div className="pb-16">
          {tab === "settings" ? (
            <SettingsForm
              settings={draft.settings}
              onChange={(settings) => persist({ ...draft, settings })}
            />
          ) : null}
          {tab === "categories" ? (
            <CategoriesEditor content={draft} onChange={persist} />
          ) : null}
          {tab === "items" ? <ItemsEditor content={draft} onChange={persist} /> : null}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold",
        active ? "bg-lime text-lime-fg" : "text-muted hover:bg-surface hover:text-fg",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none";
const areaClass =
  "w-full rounded-md bg-surface-2 px-3 py-2.5 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none";

function SettingsForm({
  settings,
  onChange,
}: {
  settings: RestaurantSettings;
  onChange: (settings: RestaurantSettings) => void;
}) {
  function patch(partial: Partial<RestaurantSettings>) {
    onChange({ ...settings, ...partial });
  }

  return (
    <form className="flex max-w-xl flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <h1 className="font-display text-2xl font-bold tracking-tight">Café settings</h1>
      <p className="text-sm text-muted">
        Guests see this on the QR menu. WhatsApp is the only contact button — there is no
        call button.
      </p>
      <Field label="Café name">
        <input
          className={inputClass}
          value={settings.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </Field>
      <Field label="Tagline">
        <input
          className={inputClass}
          value={settings.tagline ?? ""}
          onChange={(e) => patch({ tagline: e.target.value })}
        />
      </Field>
      <Field label="WhatsApp number (country code, digits only)">
        <input
          className={inputClass}
          inputMode="numeric"
          value={settings.whatsappNumber}
          onChange={(e) => patch({ whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
        />
      </Field>
      <Field label="Address">
        <textarea
          className={areaClass}
          rows={3}
          value={settings.address ?? ""}
          onChange={(e) => patch({ address: e.target.value })}
        />
      </Field>
      <Field label="Google Maps URL">
        <input
          className={inputClass}
          value={settings.googleMapsUrl ?? ""}
          onChange={(e) => patch({ googleMapsUrl: e.target.value })}
        />
      </Field>
      <Field label="Hours">
        <textarea
          className={areaClass}
          rows={2}
          value={settings.hours ?? ""}
          onChange={(e) => patch({ hours: e.target.value })}
        />
      </Field>
      <Field label="Instagram URL (optional)">
        <input
          className={inputClass}
          value={settings.instagramUrl ?? ""}
          onChange={(e) => patch({ instagramUrl: e.target.value })}
        />
      </Field>
      <Field label="Logo URL">
        <input
          className={inputClass}
          value={settings.logo ?? ""}
          onChange={(e) => patch({ logo: e.target.value })}
        />
      </Field>
    </form>
  );
}

function CategoriesEditor({
  content,
  onChange,
}: {
  content: MenuContent;
  onChange: (content: MenuContent) => void;
}) {
  const categories = [...content.categories].sort((a, b) => a.order - b.order);

  function update(id: string, partial: Partial<MenuCategory>) {
    onChange({
      ...content,
      categories: content.categories.map((category) =>
        category._id === id ? { ...category, ...partial } : category,
      ),
    });
  }

  function add() {
    const order = categories.length + 1;
    const title = "New category";
    const category: MenuCategory = {
      _id: `cat-${Date.now()}`,
      _type: "menuCategory",
      title,
      slug: slugify(`${title}-${order}`),
      order,
    };
    onChange({ ...content, categories: [...content.categories, category] });
  }

  function remove(id: string) {
    onChange({
      ...content,
      categories: content.categories.filter((category) => category._id !== id),
      items: content.items.filter((item) => item.categoryId !== id),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {categories.map((category) => {
          const count = content.items.filter((item) => item.categoryId === category._id).length;
          return (
            <li key={category._id} className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
              <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <input
                  className={inputClass}
                  value={category.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    update(category._id, { title, slug: slugify(title) || category.slug });
                  }}
                />
                <input
                  className={inputClass}
                  type="number"
                  value={category.order}
                  onChange={(e) => update(category._id, { order: Number(e.target.value) })}
                  aria-label="Order"
                />
                <button
                  type="button"
                  onClick={() => remove(category._id)}
                  className="inline-flex size-11 items-center justify-center rounded-md text-muted hover:text-red"
                  aria-label={`Delete ${category.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-subtle">
                {count} items · /{category.slug}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ItemsEditor({
  content,
  onChange,
}: {
  content: MenuContent;
  onChange: (content: MenuContent) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryId, setNewCategoryId] = useState(content.categories[0]?._id ?? "");
  const categories = [...content.categories].sort((a, b) => a.order - b.order);

  function updateItem(id: string, partial: Partial<MenuItem>) {
    onChange({
      ...content,
      items: content.items.map((item) => (item._id === id ? { ...item, ...partial } : item)),
    });
  }

  function addItem(categoryId: string) {
    const order = content.items.filter((item) => item.categoryId === categoryId).length + 1;
    const item: MenuItem = {
      _id: `item-${Date.now()}`,
      _type: "menuItem",
      name: "New dish",
      slug: `new-dish-${order}`,
      categoryId,
      price: 0,
      dietType: "veg",
      available: true,
      featured: false,
      order,
    };
    onChange({ ...content, items: [...content.items, item] });
    setEditingId(item._id);
  }

  function removeItem(id: string) {
    onChange({ ...content, items: content.items.filter((item) => item._id !== id) });
    if (editingId === id) setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">Menu items</h1>
        <div className="flex gap-2">
          <select
            className={cn(inputClass, "w-40")}
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addItem(newCategoryId)}
            disabled={!newCategoryId}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg disabled:opacity-40"
          >
            <Plus className="size-4" />
            Add item
          </button>
        </div>
      </div>

      {categories.map((category) => {
        const items = content.items
          .filter((item) => item.categoryId === category._id)
          .sort((a, b) => a.order - b.order);
        return (
          <section key={category._id}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{category.title}</h2>
              <button
                type="button"
                onClick={() => addItem(category._id)}
                className="text-sm font-semibold text-lime"
              >
                Add to {category.title}
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const open = editingId === item._id;
                return (
                  <li
                    key={item._id}
                    className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <DietBadge diet={item.dietType} />
                      <button
                        type="button"
                        onClick={() => setEditingId(open ? null : item._id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span
                          className={cn(
                            "block truncate text-sm font-semibold",
                            !item.available && "text-subtle",
                          )}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-muted">
                          {formatInr(item.price)}
                          {item.available ? "" : " · Not available"}
                          {item.featured ? " · Popular" : ""}
                        </span>
                      </button>
                      <label className="flex items-center gap-2 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={(e) =>
                            updateItem(item._id, { available: e.target.checked })
                          }
                          className="size-4 accent-lime"
                        />
                        On
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        className="flex size-10 items-center justify-center text-muted hover:text-red"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {open ? (
                      <ItemForm
                        item={item}
                        categories={categories}
                        onChange={(partial) => updateItem(item._id, partial)}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ItemForm({
  item,
  categories,
  onChange,
}: {
  item: MenuItem;
  categories: MenuCategory[];
  onChange: (partial: Partial<MenuItem>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
      <Field label="Name">
        <input
          className={inputClass}
          value={item.name}
          onChange={(e) => {
            const name = e.target.value;
            onChange({ name, slug: slugify(name) || item.slug });
          }}
        />
      </Field>
      <Field label="Price (INR)">
        <input
          className={inputClass}
          type="number"
          min={0}
          value={item.price}
          onChange={(e) => onChange({ price: Number(e.target.value) })}
        />
      </Field>
      <Field label="Category">
        <select
          className={inputClass}
          value={item.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Diet">
        <select
          className={inputClass}
          value={item.dietType}
          onChange={(e) => onChange({ dietType: e.target.value as DietType })}
        >
          <option value="veg">Veg</option>
          <option value="nonveg">Non-veg</option>
          <option value="vegan">Vegan</option>
          <option value="egg">Egg</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea
            className={areaClass}
            rows={2}
            value={item.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Image URL (optional)">
        <input
          className={inputClass}
          value={item.image ?? ""}
          onChange={(e) => onChange({ image: e.target.value })}
        />
      </Field>
      <Field label="Order">
        <input
          className={inputClass}
          type="number"
          value={item.order}
          onChange={(e) => onChange({ order: Number(e.target.value) })}
        />
      </Field>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={item.featured}
          onChange={(e) => onChange({ featured: e.target.checked })}
          className="size-4 accent-lime"
        />
        Popular
      </label>
    </div>
  );
}
