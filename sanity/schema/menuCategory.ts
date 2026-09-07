/**
 * Sanity document type: menuCategory
 */
export const menuCategory = {
  name: "menuCategory",
  title: "Menu Category",
  type: "document",
  orderings: [
    {
      title: "Menu order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
      description: "Lower numbers appear first on the menu.",
    },
    {
      name: "icon",
      title: "Icon / emoji",
      type: "string",
      description: "Optional short mark shown in category tabs.",
    },
  ],
  preview: {
    select: { title: "title", order: "order", icon: "icon" },
    prepare({
      title,
      order,
      icon,
    }: {
      title?: string;
      order?: number;
      icon?: string;
    }) {
      return {
        title: icon ? `${icon}  ${title}` : title,
        subtitle: `Order ${order ?? 0}`,
      };
    },
  },
};
