# Café QR digital menu

A table QR menu website. Guests land on the **menu** — search, diet filters, sticky category tabs, WhatsApp. Café owners edit everything in **Menu Studio** (`/studio`). There is no separate CMS.

Sample content is **The Hashtag Cafe** (Nagole, Hyderabad). Components never hardcode the café name; only seed / Studio content does. Duplicate this repo, change content in Studio (or `src/lib/seed.ts`), and it is a new café.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Digital menu (the product) |
| `/studio` | Café-owner editor: settings, categories, items grouped by category, veg / non-veg preview |

No marketing pages.

## How edits go live

1. Open Menu Studio
2. First visit: set a password (only the café team should know it)
3. Add or edit dishes, then tap **Publish**
4. Every table QR shows the new menu

Nothing goes live until you publish. The live site store is the source of truth. Until the first publish, the site shows the seed menu.

## Content model

Defined in [`src/lib/types.ts`](src/lib/types.ts), seeded in [`src/lib/seed.ts`](src/lib/seed.ts):

1. **Settings** — name, tagline, logo, WhatsApp number, address, Google Maps URL, hours, Instagram
2. **Category** — title, slug, order
3. **Item** — name, slug, category, price (INR), description, diet (`veg` \| `nonveg` \| `vegan` \| `egg`), image, available, featured, order

## Duplicate for a new café

1. Clone / copy this repo
2. Open `/studio` (or edit `src/lib/seed.ts`)
3. Change name, WhatsApp (digits with country code, e.g. `91XXXXXXXXXX`), address, maps URL, hours
4. Replace categories and items
5. Deploy. Do not change component code.

## GitHub

```bash
git init
git add .
git commit -m "Café QR digital menu"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/YOUR_REPO.git
git push -u origin main
```

## Deploy on Netlify

1. Push the repo to GitHub
2. New Netlify site from that repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Trigger a deploy

## WhatsApp

Only WhatsApp is exposed. Number must be digits with country code (`91XXXXXXXXXX`). There is no call button.

## Design

Dark café: black field, lime prices and tabs, red for non-veg, WhatsApp green only on chat buttons. Mobile-first, 44px tap targets, large INR prices.
