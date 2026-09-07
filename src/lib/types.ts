export type DietType = "veg" | "nonveg" | "vegan" | "egg";

export type DietFilter = "all" | "veg" | "nonveg";

export type RestaurantSettings = {
  _id: string;
  _type: "restaurantSettings";
  name: string;
  tagline?: string;
  logo?: string;
  whatsappNumber: string;
  address?: string;
  googleMapsUrl?: string;
  hours?: string;
  instagramUrl?: string;
};

export type MenuCategory = {
  _id: string;
  _type: "menuCategory";
  title: string;
  slug: string;
  order: number;
  icon?: string;
};

export type MenuItem = {
  _id: string;
  _type: "menuItem";
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  description?: string;
  dietType: DietType;
  image?: string;
  available: boolean;
  featured: boolean;
  order: number;
};

export type MenuContent = {
  settings: RestaurantSettings;
  categories: MenuCategory[];
  items: MenuItem[];
};

export const DIET_LABEL: Record<DietType, string> = {
  veg: "Veg",
  nonveg: "Non-veg",
  vegan: "Vegan",
  egg: "Egg",
};

export function matchesDiet(dietType: DietType, filter: DietFilter): boolean {
  if (filter === "all") return true;
  if (filter === "veg") return dietType === "veg" || dietType === "vegan";
  return dietType === "nonveg" || dietType === "egg";
}

export function matchesQuery(item: MenuItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.name.toLowerCase().includes(q) ||
    (item.description ?? "").toLowerCase().includes(q)
  );
}
