import { restaurantSettings } from "./restaurantSettings";
import { menuCategory } from "./menuCategory";
import { menuItem } from "./menuItem";

export const schemaTypes = [restaurantSettings, menuCategory, menuItem];

export { restaurantSettings, menuCategory, menuItem };

/**
 * Suggested Sanity Studio structure (for café owners):
 *  1. Settings  — singleton restaurantSettings
 *  2. Categories
 *  3. Menu items (grouped by category)
 */
export const studioDesk = [
  { type: "restaurantSettings", title: "Settings", id: "restaurantSettings" },
  { type: "menuCategory", title: "Categories" },
  { type: "menuItem", title: "Menu items" },
];
