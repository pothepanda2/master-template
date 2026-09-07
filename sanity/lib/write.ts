import { createClient, type Mutation } from "@sanity/client";
import type { MenuContent } from "@/lib/types";
import { getSanityConfig } from "./client";

function writeToken(): string {
  if (typeof process === "undefined") return "";
  return (
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_API_READ_TOKEN ||
    process.env.VITE_SANITY_API_READ_TOKEN ||
    ""
  );
}

export async function writeMenuToSanity(content: MenuContent): Promise<boolean> {
  const config = getSanityConfig();
  const token = writeToken();
  if (!config || !token) return false;

  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token,
    useCdn: false,
  });

  const keepIds = new Set<string>([
    "restaurantSettings",
    ...content.categories.map((category) => category._id),
    ...content.items.map((item) => item._id),
  ]);

  const existing = (await client.fetch<string[]>(
    `*[_type in ["restaurantSettings","menuCategory","menuItem"]]._id`,
  )) as string[];

  const mutations: Mutation[] = [
    {
      createOrReplace: {
        _id: "restaurantSettings",
        _type: "restaurantSettings",
        name: content.settings.name,
        tagline: content.settings.tagline || "",
        logoUrl: content.settings.logo || "",
        whatsappNumber: content.settings.whatsappNumber,
        address: content.settings.address || "",
        googleMapsUrl: content.settings.googleMapsUrl || "",
        hours: content.settings.hours || "",
        instagramUrl: content.settings.instagramUrl || "",
      },
    },
    ...content.categories.map((category) => ({
      createOrReplace: {
        _id: category._id,
        _type: "menuCategory",
        title: category.title,
        slug: { _type: "slug", current: category.slug },
        order: category.order,
        icon: category.icon || "",
      },
    })),
    ...content.items.map((item) => ({
      createOrReplace: {
        _id: item._id,
        _type: "menuItem",
        name: item.name,
        slug: { _type: "slug", current: item.slug },
        category: { _type: "reference", _ref: item.categoryId },
        price: item.price,
        description: item.description || "",
        dietType: item.dietType,
        imageUrl: item.image || "",
        available: item.available !== false,
        featured: Boolean(item.featured),
        order: item.order,
      },
    })),
    ...existing
      .filter((id) => !keepIds.has(id))
      .map((id) => ({ delete: { id } })),
  ];

  await client.mutate(mutations, { visibility: "sync" });
  return true;
}
