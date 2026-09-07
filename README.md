# Café QR digital menu

A table QR menu website. Guests land on the **menu** — search, diet filters, sticky category tabs, WhatsApp. Café owners edit content in **Menu Studio** (`/studio`) or a connected Sanity project.

Sample content is **The Hashtag Cafe** (Nagole, Hyderabad). Components never hardcode the café name; only seed / CMS content does. Duplicate this repo, change content + env vars, and it is a new café.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Digital menu (the product) |
| `/studio` | Café-owner CMS: settings, categories, items grouped by category, veg / non-veg preview |

No marketing pages.

## Content model

Document types live in [`sanity/schema`](sanity/schema):

1. **restaurantSettings** (singleton) — name, tagline, logo, WhatsApp number, address, Google Maps URL, hours, Instagram
2. **menuCategory** — title, slug, order, optional icon
3. **menuItem** — name, slug, category, price (INR), description, diet (`veg` \| `nonveg` \| `vegan` \| `egg`), image, available, featured, order

GROQ queries: [`sanity/lib/queries.ts`](sanity/lib/queries.ts)  
Client: [`sanity/lib/client.ts`](sanity/lib/client.ts)  
Seed: [`sanity/seed.ts`](sanity/seed.ts)

### How content is loaded

1. Browser overlay from Menu Studio (`localStorage`) so a café owner can edit immediately
2. Sanity HTTP API, if `NEXT_PUBLIC_SANITY_PROJECT_ID` / `VITE_SANITY_PROJECT_ID` is set
3. Seed sample content otherwise

## Env vars

Copy [`.env.example`](.env.example):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_READ_TOKEN=

VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2025-01-01
VITE_SANITY_API_READ_TOKEN=
```

`SANITY_API_READ_TOKEN` is optional (drafts / private datasets). The public menu works without any env vars.

## Create a Sanity project (optional)

1. [Create a Sanity project](https://www.sanity.io/manage)
2. Add the schema files under `sanity/schema` to that Studio (`defineType` wrappers)
3. Create a singleton **restaurantSettings** document
4. Paste the project ID into the env vars above
5. Deploy. Menu edits in Sanity show on the next fetch (client falls back to seed if the request fails)

Until then, use `/studio` in this app. It is built for a café owner: Settings first, then Categories, then Menu items grouped by category with veg / non-veg marks and an available toggle.

## Duplicate for a new café

1. Clone / copy this repo
2. Open `/studio` (or edit `sanity/seed.ts`)
3. Change name, WhatsApp (digits with country code, e.g. `91XXXXXXXXXX`), address, maps URL, hours
4. Replace categories and items
5. Point env vars at a new Sanity dataset if you use one
6. Deploy. Do not change component code.

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
4. Publish directory: `dist` (Vite / Nitro output)
5. Site env vars — same keys as `.env.example`
6. Trigger a deploy

If you later wrap this content layer in a Next.js App Router app, keep the same schema, GROQ, and component names (`Header`, `WhatsAppButton`, `CategoryNav`, `SearchBar`, `DietFilter`, `MenuSection`, `MenuItemCard`, `Footer`). Revalidation: tag `menu` and call `revalidateTag('menu')` from a Sanity webhook.

## WhatsApp

Only WhatsApp is exposed. Number must be digits with country code (`91XXXXXXXXXX`). There is no call button.

## Design

Dark café: black field, lime prices and tabs, red for non-veg, WhatsApp green only on chat buttons. Mobile-first, 44px tap targets, large INR prices.
