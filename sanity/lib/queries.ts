/**
 * GROQ queries for the digital menu.
 * Used by the Sanity HTTP client when a project ID is configured.
 */

export const restaurantSettingsQuery = /* groq */ `
*[_type == "restaurantSettings"][0]{
  _id,
  _type,
  name,
  tagline,
  "logo": logo.asset->url,
  whatsappNumber,
  address,
  googleMapsUrl,
  hours,
  instagramUrl
}
`;

export const menuCategoriesQuery = /* groq */ `
*[_type == "menuCategory"] | order(order asc, title asc) {
  _id,
  _type,
  title,
  "slug": slug.current,
  order,
  icon
}
`;

export const menuItemsQuery = /* groq */ `
*[_type == "menuItem"] | order(order asc, name asc) {
  _id,
  _type,
  name,
  "slug": slug.current,
  "categoryId": category->_id,
  price,
  description,
  dietType,
  "image": image.asset->url,
  available,
  featured,
  order
}
`;

export const fullMenuQuery = /* groq */ `
{
  "settings": ${restaurantSettingsQuery},
  "categories": ${menuCategoriesQuery},
  "items": ${menuItemsQuery}
}
`;
