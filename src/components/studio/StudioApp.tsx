import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { DietBadge } from "@/components/DietBadge";
import { CsvTools } from "@/components/studio/CsvTools";
import { LogoField } from "@/components/studio/LogoField";
import { PasswordLock } from "@/components/studio/PasswordLock";
import { ThemePicker } from "@/components/studio/ThemePicker";
import { ThemeApplier } from "@/components/ThemeApplier";
import { cloneSeed, saveContent } from "@/lib/content";
import {
  changeStudioPassword,
  checkStudioToken,
  loadPublishedMenu,
  publishMenu,
  setupStudioPassword,
  studioStatus,
  unlockStudio,
} from "@/lib/menu-actions";
import {
  clearStudioToken,
  readStudioToken,
  writeStudioToken,
} from "@/lib/studio-session";
import type {
  DietType,
  MenuCategory,
  MenuContent,
  MenuItem,
  RestaurantSettings,
} from "@/lib/types";
import { DIET_LABEL } from "@/lib/types";
import { cn, formatInr, slugify } from "@/lib/utils";

type Tab = "menu" | "categories" | "cafe";
type Gate = "loading" | "setup" | "lock" | "open";
type SaveState = "idle" | "publishing" | "live" | "error";

const inputClass =
  "h-11 w-full rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none";
const areaClass =
  "w-full rounded-md bg-surface-2 px-3 py-2.5 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus:shadow-[var(--shadow-border-hover)] focus:outline-none";

function snapshot(content: MenuContent): string {
  return JSON.stringify({
    settings: content.settings,
    categories: content.categories,
    items: content.items,
  });
}

export function StudioApp() {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");
  const [token, setToken] = useState("");
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockBusy, setLockBusy] = useState(false);
  const [draft, setDraft] = useState<MenuContent>(cloneSeed);
  const [baseline, setBaseline] = useState("");
  const [tab, setTab] = useState<Tab>("menu");
  const [saveState, setSaveState] = useState<SaveState>("live");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const dirty = snapshot(draft) !== baseline;
  const cafeName = draft.settings.name || "your café";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [published, status] = await Promise.all([
          loadPublishedMenu(),
          studioStatus(),
        ]);
        if (cancelled) return;
        setDraft(published);
        setBaseline(snapshot(published));
        const existing = readStudioToken();
        if (existing) {
          const check = await checkStudioToken({ data: { token: existing } });
          if (cancelled) return;
          if (check.ok) {
            setToken(existing);
            setGate("open");
            return;
          }
          clearStudioToken();
        }
        setGate(status.hasPassword ? "lock" : "setup");
      } catch {
        if (cancelled) return;
        setDraft(cloneSeed());
        setGate("setup");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function rememberToken(next: string) {
    writeStudioToken(next);
    setToken(next);
    setGate("open");
    setLockError(null);
  }

  async function handlePassword(password: string) {
    if (password.trim().length < 4) return;
    setLockBusy(true);
    setLockError(null);
    try {
      if (gate === "setup") {
        const result = await setupStudioPassword({ data: { password } });
        rememberToken(result.token);
      } else {
        const result = await unlockStudio({ data: { password } });
        rememberToken(result.token);
      }
    } catch (error) {
      setLockError(error instanceof Error ? error.message : "Wrong password");
    } finally {
      setLockBusy(false);
    }
  }

  function patchDraft(next: MenuContent) {
    setDraft(next);
    setSaveState("idle");
  }

  async function publish() {
    if (!dirty || saveState === "publishing") return;
    const unnamed = draft.items.filter((item) => !item.name.trim());
    if (unnamed.length > 0) {
      setEditingId(unnamed[0]._id);
      setTab("menu");
      setSaveState("error");
      return;
    }
    if (!draft.settings.name.trim() || !draft.settings.whatsappNumber.trim()) {
      setTab("cafe");
      setSaveState("error");
      return;
    }
    setSaveState("publishing");
    try {
      await publishMenu({ data: { menu: draft, token } });
      saveContent(draft);
      setBaseline(snapshot(draft));
      setSavedAt(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setSaveState("live");
      await router.invalidate();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("locked")) {
        clearStudioToken();
        setToken("");
        setGate("lock");
        setLockError("Enter your password again");
      }
      setSaveState("error");
    }
  }

  function lock() {
    clearStudioToken();
    setToken("");
    setGate("lock");
    setLockError(null);
  }

  async function updatePassword(password: string) {
    setPasswordBusy(true);
    setPasswordMsg(null);
    try {
      const result = await changeStudioPassword({ data: { password, token } });
      rememberToken(result.token);
      setPasswordMsg("Password updated");
    } catch (error) {
      setPasswordMsg(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setPasswordBusy(false);
    }
  }

  if (gate === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-muted">
        Opening Menu Studio…
      </div>
    );
  }

  if (gate === "setup" || gate === "lock") {
    return (
      <PasswordLock
        mode={gate === "setup" ? "setup" : "unlock"}
        cafeName={cafeName}
        error={lockError}
        busy={lockBusy}
        onSubmit={handlePassword}
      />
    );
  }

  const statusLabel =
    saveState === "publishing"
      ? "Publishing…"
      : saveState === "error"
        ? dirty
          ? "Couldn’t publish — try again"
          : "Name every dish before publishing"
        : dirty
          ? "Unsaved changes"
          : savedAt
            ? `Live · ${savedAt}`
            : "Live for all tables";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <ThemeApplier themeId={draft.settings.themeId} accentColor={draft.settings.accentColor} />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
          <Link
            to="/"
            className="flex size-10 shrink-0 items-center justify-center rounded-sm text-muted hover:text-fg"
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold">Menu Studio</p>
            <p className="truncate text-xs text-muted">{statusLabel}</p>
          </div>
          <button
            type="button"
            onClick={lock}
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-fg"
            aria-label="Lock studio"
          >
            <Lock className="size-4" />
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!dirty || saveState === "publishing"}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg disabled:opacity-40"
          >
            {saveState === "publishing" ? (
              "Publishing"
            ) : (
              <>
                <Upload className="size-4" />
                Publish
              </>
            )}
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-3 pb-2 sm:px-4">
          {(
            [
              ["menu", "Dishes"],
              ["categories", "Categories"],
              ["cafe", "Café"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "min-h-10 flex-1 rounded-md px-3 text-sm font-semibold",
                tab === id ? "bg-lime text-lime-fg" : "text-muted hover:bg-surface hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-4 pb-24 sm:px-4">
        {tab === "menu" ? (
          <MenuPanel
            content={draft}
            query={query}
            filterCat={filterCat}
            editingId={editingId}
            onQuery={setQuery}
            onFilter={setFilterCat}
            onEdit={setEditingId}
            onChange={patchDraft}
          />
        ) : null}
        {tab === "categories" ? (
          <CategoriesPanel content={draft} onChange={patchDraft} />
        ) : null}
        {tab === "cafe" ? (
          <CafePanel
            content={draft}
            onChange={patchDraft}
            passwordBusy={passwordBusy}
            passwordMessage={passwordMsg}
            onChangePassword={updatePassword}
            onReset={() => {
              const next = cloneSeed();
              patchDraft(next);
              setEditingId(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function MenuPanel({
  content,
  query,
  filterCat,
  editingId,
  onQuery,
  onFilter,
  onEdit,
  onChange,
}: {
  content: MenuContent;
  query: string;
  filterCat: string;
  editingId: string | null;
  onQuery: (value: string) => void;
  onFilter: (value: string) => void;
  onEdit: (id: string | null) => void;
  onChange: (content: MenuContent) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const categories = [...content.categories].sort((a, b) => a.order - b.order);
  const editing = content.items.find((item) => item._id === editingId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.items
      .filter((item) => (filterCat === "all" ? true : item.categoryId === filterCat))
      .filter((item) => {
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (filterCat === "all") {
          const left = categories.findIndex((category) => category._id === a.categoryId);
          const right = categories.findIndex((category) => category._id === b.categoryId);
          if (left !== right) return left - right;
        }
        return a.order - b.order || a.name.localeCompare(b.name);
      });
  }, [content.items, content.categories, filterCat, query]);

  useEffect(() => {
    if (editingId && nameRef.current) nameRef.current.focus();
  }, [editingId]);

  function addDish() {
    const categoryId =
      filterCat !== "all" ? filterCat : (categories[0]?._id ?? "");
    if (!categoryId) return;
    const order = content.items.filter((item) => item.categoryId === categoryId).length + 1;
    const item: MenuItem = {
      _id: `item-${Date.now()}`,
      _type: "menuItem",
      name: "",
      slug: `dish-${order}`,
      categoryId,
      price: 0,
      dietType: "veg",
      available: true,
      featured: false,
      order,
    };
    onChange({ ...content, items: [...content.items, item] });
    onEdit(item._id);
    onFilter(categoryId);
    onQuery("");
  }

  function updateItem(id: string, partial: Partial<MenuItem>) {
    onChange({
      ...content,
      items: content.items.map((item) => (item._id === id ? { ...item, ...partial } : item)),
    });
  }

  function removeItem(id: string) {
    onChange({ ...content, items: content.items.filter((item) => item._id !== id) });
    if (editingId === id) onEdit(null);
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Dishes</h1>
            <p className="text-sm text-muted">Add or edit, then tap Publish.</p>
          </div>
          <button
            type="button"
            onClick={addDish}
            disabled={categories.length === 0}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg disabled:opacity-40"
          >
            <Plus className="size-4" />
            Add dish
          </button>
        </div>
        <CsvTools content={content} onChange={onChange} />

        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <input
            className={cn(inputClass, "pl-10")}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search dishes"
          />
        </label>

        <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3">
          <Chip active={filterCat === "all"} onClick={() => onFilter("all")}>
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category._id}
              active={filterCat === category._id}
              onClick={() => onFilter(category._id)}
            >
              {category.title}
            </Chip>
          ))}
        </div>

        {categories.length === 0 ? (
          <p className="rounded-xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)]">
            Add a category first, then add dishes.
          </p>
        ) : visible.length === 0 ? (
          <p className="rounded-xl bg-surface p-4 text-sm text-muted shadow-[var(--shadow-border)]">
            No dishes here yet. Tap Add dish.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((item) => {
              const open = editingId === item._id;
              return (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => onEdit(open ? null : item._id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl bg-surface p-3 text-left shadow-[var(--shadow-border)]",
                      open && "shadow-[var(--shadow-border-hover)]",
                      !item.available && "opacity-60",
                    )}
                  >
                    <DietBadge diet={item.dietType} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {item.name.trim() || "Untitled dish"}
                      </span>
                      <span className="text-xs text-muted">
                        {formatInr(item.price)}
                        {item.available ? "" : " · Hidden"}
                        {item.featured ? " · Popular" : ""}
                      </span>
                    </span>
                    <ChevronRight
                      className={cn("size-4 text-subtle transition-transform", open && "rotate-90")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="lg:sticky lg:top-32">
        {editing ? (
          <DishEditor
            item={editing}
            categories={categories}
            nameRef={nameRef}
            onChange={(partial) => updateItem(editing._id, partial)}
            onDelete={() => removeItem(editing._id)}
            onDone={() => onEdit(null)}
          />
        ) : (
          <div className="rounded-xl bg-surface p-5 text-sm text-muted shadow-[var(--shadow-border)]">
            Tap a dish to edit, or add a new one. Nothing goes live until you publish.
          </div>
        )}
      </aside>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-pill px-3 text-sm font-semibold",
        active ? "bg-lime text-lime-fg" : "bg-surface text-muted shadow-[var(--shadow-border)]",
      )}
    >
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

function DishEditor({
  item,
  categories,
  nameRef,
  onChange,
  onDelete,
  onDone,
}: {
  item: MenuItem;
  categories: MenuCategory[];
  nameRef: RefObject<HTMLInputElement | null>;
  onChange: (partial: Partial<MenuItem>) => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  const [priceText, setPriceText] = useState(
    item.price === 0 && !item.name ? "" : String(item.price),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setPriceText(item.price === 0 && !item.name.trim() ? "" : String(item.price));
    setConfirmDelete(false);
  }, [item._id]);

  function setPrice(text: string) {
    const cleaned = text.replace(/[^\d]/g, "");
    setPriceText(cleaned);
    onChange({ price: cleaned === "" ? 0 : Number(cleaned) });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-lg font-bold">
          {item.name.trim() || "New dish"}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-lime"
        >
          <Check className="size-4" />
          Done
        </button>
      </div>
      <Field label="Name">
        <input
          ref={nameRef}
          className={inputClass}
          value={item.name}
          placeholder="e.g. Margherita"
          onChange={(e) => {
            const name = e.target.value;
            onChange({ name, slug: slugify(name) || item.slug });
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (INR)">
          <input
            className={inputClass}
            inputMode="numeric"
            value={priceText}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value)}
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
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">Diet</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(["veg", "nonveg", "vegan", "egg"] as DietType[]).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => onChange({ dietType: diet })}
              className={cn(
                "inline-flex min-h-11 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold",
                item.dietType === diet
                  ? "bg-lime text-lime-fg"
                  : "bg-surface-2 text-muted",
              )}
            >
              <DietBadge diet={diet} />
              {DIET_LABEL[diet]}
            </button>
          ))}
        </div>
      </div>
      <Field label="Description">
        <textarea
          className={areaClass}
          rows={2}
          value={item.description ?? ""}
          placeholder="Short line guests will read"
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label="Photo URL (optional)">
        <input
          className={inputClass}
          value={item.image ?? ""}
          placeholder="/menu/photo.jpg"
          onChange={(e) => onChange({ image: e.target.value })}
        />
      </Field>
      <div className="flex gap-2">
        <Toggle
          label={item.available ? "On the menu" : "Hidden"}
          checked={item.available}
          onChange={(available) => onChange({ available })}
        />
        <Toggle
          label="Popular"
          checked={item.featured}
          onChange={(featured) => onChange({ featured })}
        />
      </div>
      {confirmDelete ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-red px-3 text-sm font-semibold text-fg"
          >
            Delete dish
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-surface-2 px-3 text-sm font-semibold"
          >
            Keep
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold text-muted hover:text-red"
        >
          <Trash2 className="size-4" />
          Remove dish
        </button>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold",
        checked ? "bg-lime text-lime-fg" : "bg-surface-2 text-muted",
      )}
    >
      {label}
    </button>
  );
}

function CategoriesPanel({
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

  function move(id: string, direction: -1 | 1) {
    const index = categories.findIndex((category) => category._id === id);
    const swap = index + direction;
    if (index < 0 || swap < 0 || swap >= categories.length) return;
    const next = [...categories];
    const [row] = next.splice(index, 1);
    next.splice(swap, 0, row);
    onChange({
      ...content,
      categories: next.map((category, order) => ({ ...category, order: order + 1 })),
    });
  }

  function add() {
    const order = categories.length + 1;
    const category: MenuCategory = {
      _id: `cat-${Date.now()}`,
      _type: "menuCategory",
      title: "",
      slug: `category-${order}`,
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
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted">Pizza, drinks, desserts — the tabs on the QR menu.</p>
        </div>
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
        {categories.map((category, index) => {
          const count = content.items.filter((item) => item.categoryId === category._id).length;
          return (
            <li key={category._id} className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={category.title}
                  placeholder="Category name"
                  onChange={(e) => {
                    const title = e.target.value;
                    update(category._id, { title, slug: slugify(title) || category.slug });
                  }}
                />
                <button
                  type="button"
                  onClick={() => move(category._id, -1)}
                  disabled={index === 0}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(category._id, 1)}
                  disabled={index === categories.length - 1}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(category._id)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:text-red"
                  aria-label={`Delete ${category.title || "category"}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-subtle">
                {count} {count === 1 ? "dish" : "dishes"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CafePanel({
  content,
  onChange,
  passwordBusy,
  passwordMessage,
  onChangePassword,
  onReset,
}: {
  content: MenuContent;
  onChange: (content: MenuContent) => void;
  passwordBusy: boolean;
  passwordMessage: string | null;
  onChangePassword: (password: string) => void;
  onReset: () => void;
}) {
  const settings = content.settings;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  function patch(partial: Partial<RestaurantSettings>) {
    onChange({ ...content, settings: { ...settings, ...partial } });
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-2xl font-bold tracking-tight">Café</h1>
      <p className="text-sm text-muted">
        Name, WhatsApp and address on the QR menu. Publish to send them to every table.
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
      <Field label="WhatsApp (country code, digits only)">
        <input
          className={inputClass}
          inputMode="numeric"
          value={settings.whatsappNumber}
          onChange={(e) => patch({ whatsappNumber: e.target.value.replace(/\D/g, "") })}
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
      <LogoField value={settings.logo} onChange={(logo) => patch({ logo })} />

      <ThemePicker
        themeId={settings.themeId}
        accentColor={settings.accentColor}
        onChange={(next) => patch(next)}
      />

      <div className="mt-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <p className="font-display font-semibold">Change password</p>
        <p className="mt-1 text-sm text-muted">At least 4 characters. Keep it with the café team.</p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            maxLength={64}
            value={newPassword}
            placeholder="New password"
            onChange={(e) => setNewPassword(e.target.value.slice(0, 64))}
          />
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            maxLength={64}
            value={confirmPassword}
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value.slice(0, 64))}
          />
          <button
            type="button"
            disabled={
              newPassword.trim().length < 4 ||
              newPassword !== confirmPassword ||
              passwordBusy
            }
            onClick={() => {
              onChangePassword(newPassword.trim());
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-lime px-3 text-sm font-semibold text-lime-fg disabled:opacity-40"
          >
            Save password
          </button>
        </div>
        {passwordMessage ? <p className="mt-2 text-sm text-muted">{passwordMessage}</p> : null}
      </div>

      {confirmReset ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onReset();
              setConfirmReset(false);
            }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-red px-3 text-sm font-semibold text-lime-fg"
          >
            <RotateCcw className="size-4" />
            Reset sample menu
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-surface px-3 text-sm font-semibold shadow-[var(--shadow-border)]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold text-muted hover:text-fg"
        >
          <RotateCcw className="size-4" />
          Reset to sample menu
        </button>
      )}
    </div>
  );
}
