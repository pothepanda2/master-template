# SOP-04 — CSV bulk menu

**Audience:** café owner or you (agency)  
**When:** many prices change, a new café’s full list is in Excel / Google Sheets, or you want a backup.

## Default mode: add / update

Import matches a row to an existing dish by **name + category** (not case-sensitive).

- Same name in the same category → updates price, diet, description, available, featured, image.
- New name → adds a dish.
- New category name → creates that category.

Nothing goes live until **Publish**.

## Export (backup or edit in Sheets)

1. Studio → **Dishes**.
2. **Export CSV**.
3. Open in Excel or Google Sheets.
4. Keep the header row.

## Import

1. Save the sheet as `.csv` (comma-separated).
2. Studio → **Dishes** → **Import CSV**.
3. Leave **Replace all dishes** **unticked** unless you mean to wipe the current list.
4. Read the summary (e.g. 12 updated, 3 new, 1 skipped).
5. Check a few dishes in Studio.
6. **Publish**.

If you tick **Replace all dishes**, Studio asks first. Categories stay; every dish is swapped for the file. Still Publish after.

## Columns

Required:

| Column | Example |
| --- | --- |
| name | Margherita |
| category | Pizza |
| price | 249 |

Optional:

| Column | Allowed values |
| --- | --- |
| description | Short text |
| diet | `veg` `nonveg` `vegan` `egg` (also vegetarian, nv) |
| available | `yes` / `no` |
| featured | `yes` / `no` |
| image | Public `https://…` photo URL |

Blank diet → veg. Price may include `₹` or `Rs`.

Header aliases work (`dish`, `section`, `cost`, `photo`, etc.).

Blank template: `public/menu-template.csv` in the repo. Example: `examples/cafe-menu-example.csv`.

## Image URLs in CSV

CSV cannot attach files from the phone. The `image` cell must be a link that opens the picture itself. WhatsApp / Drive / Instagram page links usually fail.

Logo is **not** in the CSV. Use Café → Choose logo (SOP-05).

## Do not

- Do not import, then leave without Publish.
- Do not tick Replace unless you have an Export backup first.
- Do not put café name, WhatsApp, theme, or password in the CSV — those stay on the Café tab.
