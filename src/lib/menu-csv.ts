import type { DietType, MenuCategory, MenuContent, MenuItem } from "@/lib/types";
import { slugify } from "@/lib/utils";

export const CSV_HEADERS = [
  "name",
  "category",
  "price",
  "description",
  "diet",
  "available",
  "featured",
  "image",
] as const;

export type CsvSkip = { row: number; reason: string };

export type CsvImportResult = {
  content: MenuContent;
  added: number;
  updated: number;
  skipped: CsvSkip[];
  createdCategories: string[];
};

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function exportMenuCsv(content: MenuContent): string {
  const categories = new Map(content.categories.map((category) => [category._id, category.title]));
  const rows = [...content.items]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((item) =>
      [
        item.name,
        categories.get(item.categoryId) ?? "",
        String(item.price),
        item.description ?? "",
        item.dietType,
        item.available === false ? "no" : "yes",
        item.featured ? "yes" : "no",
        item.image ?? "",
      ]
        .map(escapeCell)
        .join(","),
    );
  return `\uFEFF${CSV_HEADERS.join(",")}\n${rows.join("\n")}\n`;
}

function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function headerKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

const HEADER_ALIASES: Record<string, (typeof CSV_HEADERS)[number]> = {
  name: "name",
  dish: "name",
  item: "name",
  itemname: "name",
  category: "category",
  cat: "category",
  section: "category",
  price: "price",
  inr: "price",
  cost: "price",
  description: "description",
  desc: "description",
  details: "description",
  diet: "diet",
  type: "diet",
  veg: "diet",
  available: "available",
  avail: "available",
  featured: "featured",
  popular: "featured",
  image: "image",
  imageurl: "image",
  photo: "image",
  img: "image",
};

function parseDiet(value: string): DietType | null {
  const key = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!key) return "veg";
  if (["veg", "vegetarian", "v"].includes(key)) return "veg";
  if (key === "vegan") return "vegan";
  if (["egg", "eggetarian"].includes(key)) return "egg";
  if (["nonveg", "nonvegetarian", "nv", "n"].includes(key)) return "nonveg";
  return null;
}

function parseBool(value: string, fallback: boolean): boolean {
  const key = value.trim().toLowerCase();
  if (!key) return fallback;
  if (["yes", "y", "true", "1", "available", "popular", "featured"].includes(key)) return true;
  if (["no", "n", "false", "0", "out", "unavailable"].includes(key)) return false;
  return fallback;
}

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/₹/g, "").replace(/\brs\.?/gi, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function importMenuCsv(
  content: MenuContent,
  csvText: string,
  mode: "upsert" | "replace",
): CsvImportResult {
  const table = parseCsv(csvText);
  if (table.length < 2) {
    throw new Error("CSV needs a header row and at least one dish");
  }

  const mapped = table[0].map((cell) => HEADER_ALIASES[headerKey(cell)]);
  const nameIdx = mapped.indexOf("name");
  const catIdx = mapped.indexOf("category");
  const priceIdx = mapped.indexOf("price");
  if (nameIdx < 0 || catIdx < 0 || priceIdx < 0) {
    throw new Error("CSV must include name, category and price columns");
  }
  const descIdx = mapped.indexOf("description");
  const dietIdx = mapped.indexOf("diet");
  const availIdx = mapped.indexOf("available");
  const featIdx = mapped.indexOf("featured");
  const imageIdx = mapped.indexOf("image");

  const skipped: CsvSkip[] = [];
  const createdCategories: string[] = [];
  const categories: MenuCategory[] = content.categories.map((category) => ({ ...category }));

  function findOrCreateCategory(title: string): MenuCategory {
    const existing = categories.find(
      (category) => category.title.trim().toLowerCase() === title.toLowerCase(),
    );
    if (existing) return existing;
    const slug = slugify(title) || `category-${categories.length + 1}`;
    const next: MenuCategory = {
      _id: `cat-${slug}-${Date.now().toString(36)}`,
      _type: "menuCategory",
      title,
      slug,
      order: categories.reduce((max, category) => Math.max(max, category.order), 0) + 1,
    };
    categories.push(next);
    createdCategories.push(title);
    return next;
  }

  const items: MenuItem[] = mode === "replace" ? [] : content.items.map((item) => ({ ...item }));
  let added = 0;
  let updated = 0;

  table.slice(1).forEach((cols, index) => {
    const row = index + 2;
    const name = (cols[nameIdx] ?? "").trim();
    const categoryTitle = (cols[catIdx] ?? "").trim();
    if (!name) {
      skipped.push({ row, reason: "Missing name" });
      return;
    }
    if (!categoryTitle) {
      skipped.push({ row, reason: "Missing category" });
      return;
    }
    const price = parsePrice(cols[priceIdx] ?? "");
    if (price === null) {
      skipped.push({ row, reason: "Invalid price" });
      return;
    }
    const diet = parseDiet(dietIdx >= 0 ? (cols[dietIdx] ?? "") : "veg");
    if (!diet) {
      skipped.push({ row, reason: "Diet must be veg, nonveg, vegan or egg" });
      return;
    }

    const category = findOrCreateCategory(categoryTitle);
    const description = descIdx >= 0 ? (cols[descIdx] ?? "").trim() : "";
    const available = parseBool(availIdx >= 0 ? (cols[availIdx] ?? "") : "", true);
    const featured = parseBool(featIdx >= 0 ? (cols[featIdx] ?? "") : "", false);
    const image = imageIdx >= 0 ? (cols[imageIdx] ?? "").trim() : "";

    const match = items.find(
      (item) =>
        item.categoryId === category._id &&
        item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (match) {
      match.price = price;
      match.dietType = diet;
      match.available = available;
      match.featured = featured;
      if (description) match.description = description;
      else delete match.description;
      if (image) match.image = image;
      else delete match.image;
      updated += 1;
      return;
    }

    const order = items.filter((item) => item.categoryId === category._id).length + 1;
    items.push({
      _id: `item-${slugify(name) || "dish"}-${Date.now().toString(36)}-${added}`,
      _type: "menuItem",
      name,
      slug: slugify(name) || `dish-${order}`,
      categoryId: category._id,
      price,
      description: description || undefined,
      dietType: diet,
      image: image || undefined,
      available,
      featured,
      order,
    });
    added += 1;
  });

  return {
    content: {
      ...content,
      categories,
      items,
    },
    added,
    updated,
    skipped,
    createdCategories,
  };
}
