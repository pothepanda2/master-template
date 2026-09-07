import type { MenuContent } from "@/lib/types";
import { SEED_MENU } from "../seed";
import { fullMenuQuery } from "./queries";

export type SanityConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
};

function envString(...keys: Array<string | undefined>): string {
  for (const key of keys) {
    if (key && key.length > 0) return key;
  }
  return "";
}

export function getSanityConfig(): SanityConfig | null {
  const viteEnv = import.meta.env;
  const projectId = envString(
    viteEnv.VITE_SANITY_PROJECT_ID,
    viteEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
    typeof process !== "undefined" ? process.env.VITE_SANITY_PROJECT_ID : undefined,
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID : undefined,
  );
  if (!projectId) return null;

  return {
    projectId,
    dataset:
      envString(
        viteEnv.VITE_SANITY_DATASET,
        viteEnv.NEXT_PUBLIC_SANITY_DATASET,
        typeof process !== "undefined" ? process.env.VITE_SANITY_DATASET : undefined,
        typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SANITY_DATASET : undefined,
      ) || "production",
    apiVersion:
      envString(
        viteEnv.VITE_SANITY_API_VERSION,
        viteEnv.NEXT_PUBLIC_SANITY_API_VERSION,
        typeof process !== "undefined" ? process.env.VITE_SANITY_API_VERSION : undefined,
        typeof process !== "undefined"
          ? process.env.NEXT_PUBLIC_SANITY_API_VERSION
          : undefined,
      ) || "2025-01-01",
    token: envString(
      viteEnv.VITE_SANITY_API_READ_TOKEN,
      typeof process !== "undefined" ? process.env.SANITY_API_READ_TOKEN : undefined,
      typeof process !== "undefined" ? process.env.VITE_SANITY_API_READ_TOKEN : undefined,
    ) || undefined,
  };
}

function cloneSeed(): MenuContent {
  return structuredClone(SEED_MENU);
}

/**
 * Fetch live menu content from Sanity.
 * Returns null when no project is configured or the request fails —
 * callers then fall back to the live site store / seed.
 */
export async function fetchSanityMenuIfConfigured(): Promise<MenuContent | null> {
  const config = getSanityConfig();
  if (!config) return null;

  const url = new URL(
    `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`,
  );
  url.searchParams.set("query", fullMenuQuery);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;

  try {
    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: MenuContent };
    const result = json.result;
    if (
      !result?.settings?.name ||
      !Array.isArray(result.categories) ||
      !Array.isArray(result.items)
    ) {
      return null;
    }
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        available: item.available !== false,
        featured: Boolean(item.featured),
        dietType: item.dietType ?? "veg",
      })),
    };
  } catch {
    return null;
  }
}

export async function getMenuData(): Promise<MenuContent> {
  return (await fetchSanityMenuIfConfigured()) ?? cloneSeed();
}
