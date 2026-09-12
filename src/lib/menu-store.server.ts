import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "@/lib/env.server";
import { SEED_MENU } from "@/lib/seed";
import { HASHTAG_DEMO_MENU } from "@/lib/seed-hashtag";
import { isMenuContent, type MenuContent } from "@/lib/types";

const FILE_PATH = join(process.cwd(), "data", "menu.json");
const BLOB_STORE = "qr-menu";
const BLOB_KEY = "content-v2";

function cloneDefaultSeed(): MenuContent {
  if (env("MENU_SEED") === "hashtag") return structuredClone(HASHTAG_DEMO_MENU);
  return structuredClone(SEED_MENU);
}

async function readFileMenu(): Promise<MenuContent | null> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isMenuContent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeFileMenu(content: MenuContent): Promise<boolean> {
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    await writeFile(FILE_PATH, JSON.stringify(content, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function blobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    try {
      return getStore({ name: BLOB_STORE, consistency: "strong" });
    } catch {
      return getStore(BLOB_STORE);
    }
  } catch {
    return null;
  }
}

async function readBlobMenu(): Promise<MenuContent | null> {
  const store = await blobStore();
  if (!store) return null;
  try {
    const parsed = await store.get(BLOB_KEY, { type: "json" });
    return isMenuContent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeBlobMenu(content: MenuContent): Promise<boolean> {
  const store = await blobStore();
  if (!store) return false;
  await store.setJSON(BLOB_KEY, content);
  return true;
}

function stamp(content: MenuContent): MenuContent {
  return { ...content, updatedAt: new Date().toISOString() };
}

export async function readPublishedMenu(): Promise<MenuContent> {
  const fromBlob = await readBlobMenu();
  if (fromBlob) return fromBlob;

  if (env("MENU_SEED") === "hashtag") return cloneDefaultSeed();

  const fromFile = await readFileMenu();
  if (fromFile) return fromFile;

  return cloneDefaultSeed();
}

export async function writePublishedMenu(content: MenuContent): Promise<void> {
  if (!isMenuContent(content)) {
    throw new Error("Invalid menu content");
  }

  const next = stamp({
    settings: {
      ...content.settings,
      _id: content.settings._id || "restaurantSettings",
      _type: "restaurantSettings",
      name: content.settings.name.trim(),
      whatsappNumber: content.settings.whatsappNumber.replace(/\D/g, ""),
    },
    categories: content.categories,
    items: content.items.map((item) => ({
      ...item,
      available: item.available !== false,
      featured: Boolean(item.featured),
      dietType: item.dietType ?? "veg",
    })),
  });

  const fileOk = await writeFileMenu(next);
  const blobOk = await writeBlobMenu(next);

  if (!fileOk && !blobOk) {
    throw new Error("Could not publish the live menu");
  }
}
