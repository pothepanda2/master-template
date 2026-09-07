/**
 * Sanity document type: restaurantSettings (singleton)
 *
 * Studio: keep a single document with _id "restaurantSettings".
 * Copy into a Sanity Studio schema as `defineType({ ...restaurantSettings })`.
 */
export const restaurantSettings = {
  name: "restaurantSettings",
  title: "Restaurant Settings",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Café name",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "string",
    },
    {
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "logoUrl",
      title: "Logo URL",
      type: "string",
    },
    {
      name: "whatsappNumber",
      title: "WhatsApp number",
      description: "Digits with country code, e.g. 91XXXXXXXXXX. Required.",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "address",
      title: "Address",
      type: "text",
      rows: 3,
    },
    {
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
    },
    {
      name: "hours",
      title: "Hours",
      type: "text",
      rows: 3,
      description: "Plain text is fine, e.g. 11:30 AM – 11:00 PM · Open all week",
    },
    {
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    },
  ],
  preview: {
    select: { title: "name", subtitle: "tagline", media: "logo" },
  },
};
