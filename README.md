# Master template — The Cafe Store

Reusable table-QR menu. Guests open the **menu**. The café team edits in **Menu Studio** (`/studio`) and taps **Publish**.

This repo is the **copy-from template**. Sample name is **The Cafe Store**. Duplicate it, change Studio content, deploy.

**The Hashtag Cafe** is a demo only (Studio → Café → Load Hashtag Cafe demo, or a demo deploy with `MENU_SEED=hashtag`).

## Pages

| Path | What it is |
| --- | --- |
| `/` | Guest menu |
| `/studio` | Owner editor (password) |

## How edits go live

1. Open Menu Studio
2. First visit: set a password
3. Edit café, dishes, photos, theme, or import CSV
4. Tap **Publish**

Tables keep the last published menu until you publish again.

## Studio

- **Dishes** — add, edit, hide, optional photo upload (JPG/PNG/WebP, 4 MB, shrunk), CSV export / add-update import
- **Categories** — sections on the menu
- **Café** — name, WhatsApp, address, hours, Instagram, optional logo (6 MB), theme + accent
- Reset to **The Cafe Store**, or load the **Hashtag Cafe** demo

Logo and dish photos are optional. No logo → café name only.

## SOPs

**[sops/README.md](./sops/README.md)** — owner quick card, launch a client, QR codes, troubleshooting.

## Duplicate for a new café

1. Copy this repo (not the Hashtag demo)
2. New Netlify site
3. Open `/studio`, set password
4. Change name, WhatsApp (`91XXXXXXXXXX`), address, maps, hours
5. Replace dishes (or import CSV). Add photos from the phone if you have them
6. Upload a logo if you have one
7. Pick a theme, then **Publish**

Full steps: [sops/01-new-cafe-launch.md](./sops/01-new-cafe-launch.md).

## GitHub

https://github.com/pothepanda2/master-template

## Netlify

- Template: https://qr-menu-master-template.netlify.app
- Hashtag demo (if deployed): set `MENU_SEED=hashtag` on that site

Build: `npm run build`  
Publish directory: `dist`

## WhatsApp

WhatsApp only. Number is digits with country code. No call button.
