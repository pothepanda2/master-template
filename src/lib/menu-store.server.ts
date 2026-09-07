import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchSanityMenuIfConfigured, getSanityConfig } from "../../sanity/lib/client";
import { writeMenuToSanity } from "../../sanity/lib/write";
import { SEED_MENU } from "../../sanity/seed";
import { isMenuContent, type MenuContent } from "@/lib/types";

const FILE_PATH = join(process.cwd(), "data", "menu.json");
const BLOB_STORE = "qr-menu";
const BLOB_KEY = "content";

function cloneSeed(): MenuContent {
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

export async function readPublishedMenu(): Promise<MenuContent> {
  if (getSanityConfig()) {
    try {
      const fromSanity = await fetchSanityMenuIfConfigured();
      if (fromSanity) return fromSanity;
    } catch {
      // fall through to live store / seed
    }
  }

  const fromBlob = await readBlobMenu();
  if (fromBlob) return fromBlob;

  const fromFile = await readFileMenu();
  if (fromFile) return fromFile;

  return cloneSeed();
}

export async function writePublishedMenu(content: MenuContent): Promise<void> {
  if (!isMenuContent(content)) {
    throw new Error("Invalid menu content");
  }

  const next: MenuContent = {
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
  };

  const fileOk = await writeFileMenu(next);
  const blobOk = await writeBlobMenu(next);

  let sanityOk = false;
  try {
    sanityOk = await writeMenuToSanity(next);
  } catch (error) {
    console.error("[menu] Sanity publish failed", error);
  }

  if (!fileOk && !blobOk && !sanityOk) {
    throw new Error("Could not publish the live menu");
  }
}
