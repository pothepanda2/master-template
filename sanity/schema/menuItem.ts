/**
 * Sanity document type: menuItem
 */

type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
};

export const menuItem = {
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  orderings: [
    {
      title: "Category, then order",
      name: "categoryOrder",
      by: [
        { field: "category.title", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 80 },
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "menuCategory" }],
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "price",
      title: "Price (INR)",
      type: "number",
      validation: (Rule: SanityRule) => Rule.required().min(0),
    },
    {
      name: "description",
      title: "Short description",
      type: "text",
      rows: 2,
    },
    {
      name: "dietType",
      title: "Diet",
      type: "string",
      options: {
        list: [
          { title: "Veg", value: "veg" },
          { title: "Non-veg", value: "nonveg" },
          { title: "Vegan", value: "vegan" },
          { title: "Egg", value: "egg" },
        ],
        layout: "radio",
      },
      initialValue: "veg",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "featured",
      title: "Featured / popular",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "order",
      title: "Order in category",
      type: "number",
      initialValue: 0,
    },
  ],
  preview: {
    select: {
      title: "name",
      price: "price",
      dietType: "dietType",
      available: "available",
      media: "image",
      category: "category.title",
    },
    prepare({
      title,
      price,
      dietType,
      available,
      media,
      category,
    }: {
      title?: string;
      price?: number;
      dietType?: string;
      available?: boolean;
      media?: unknown;
      category?: string;
    }) {
      const diet =
        dietType === "nonveg"
          ? "Non-veg"
          : dietType === "vegan"
            ? "Vegan"
            : dietType === "egg"
              ? "Egg"
              : "Veg";
      const status = available === false ? " · Not available" : "";
      return {
        title,
        subtitle: `${diet} · ₹${price ?? "—"} · ${category ?? "No category"}${status}`,
        media,
      };
    },
  },
};
