# Master template — café QR menu

Reusable table-QR menu. Guests open the **menu**. The café team edits in **Menu Studio** (`/studio`) and taps **Publish**. No other CMS.

Sample dishes are **The Hashtag Cafe**. Names live in seed / Studio only — duplicate this template, change content, deploy.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Guest menu |
| `/studio` | Owner editor (password) |

## How edits go live

1. Open Menu Studio
2. First visit: set a password
3. Edit café, dishes, theme, or import CSV
4. Tap **Publish**

Tables keep the last published menu until you publish again.

## Studio

- **Dishes** — add, edit, hide, CSV export / add-update import (`public/menu-template.csv` is a blank sheet)
- **Categories** — sections on the menu
- **Café** — name, WhatsApp, address, hours, Instagram, optional logo upload (JPG/PNG/WebP, 6 MB), theme + accent

Logo is optional. Without one, the menu shows the café name only.

## Duplicate for a new café

1. Copy this repo
2. Open `/studio` (or edit `src/lib/seed.ts`)
3. Change name, WhatsApp (`91XXXXXXXXXX`), address, maps, hours
4. Replace dishes (or import CSV)
5. Upload a logo if you have one
6. Pick a theme, then Publish

## GitHub

https://github.com/pothepanda2/master-template

## Netlify

https://qr-menu-master-template.netlify.app

Build: `npm run build`  
Publish directory: `dist`

## WhatsApp

WhatsApp only. Number is digits with country code. No call button.
