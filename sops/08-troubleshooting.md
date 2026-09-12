# SOP-08 — Troubleshooting

**Audience:** you + café owner  
**When:** “tables still show old prices”, Studio won’t open, logo won’t upload, CSV fails.

Work top to bottom.

## Tables show the old menu

1. In Studio, does the header say **Unsaved changes**? → tap **Publish**.
2. On a **table phone**, pull down to refresh, or close the tab and scan again.
3. Wait ~20 seconds if they left the menu open.
4. Confirm they scanned the **guest** URL, not an old printed domain.
5. Try a second phone (not the Studio phone). Studio can look updated while guests still see the previous Publish if you never published.

## Guest sees a password screen

They opened `/studio`. Reprint the QR with the site root only (SOP-07).

## Publish stays disabled / error

- Name every dish.
- Café name and WhatsApp must be filled.
- Unlock again if it says Studio is locked.
- Check internet.
- Tap Publish once — do not spam.

## Wrong password

- Caps lock, extra space.
- Old 4-digit PIN still works if you never changed it.
- Password is 4–64 characters.
- If truly lost → agency resets the Studio lock (hosting store). Do not reset dishes unless you mean to.

## Logo rejected

- File must be JPG, PNG, or WebP (not PDF, not HEIC from some iPhones — convert to JPG).
- **Max 6 MB.**
- Try another photo if the file is corrupt.

No logo is valid. Name-only header is correct.

## Dish photo rejected or missing

- File must be JPG, PNG, or WebP (not PDF; iPhone HEIC — convert to JPG).
- **Max 4 MB** for dishes (logo is 6 MB).
- CSV images still need a public URL that opens the picture itself.

## Dish photo not showing from CSV

CSV cannot attach phone files. The `image` cell must be a public URL that opens the picture (`.jpg` / `.png` / `.webp`).  
For a photo on the phone, open the dish in Studio and tap **Choose**.

WhatsApp, Drive “share” links, and Instagram posts usually fail.

## CSV import skipped rows

Read the on-screen skip reasons:

- Missing name or category
- Invalid price
- Diet not `veg` / `nonveg` / `vegan` / `egg`

Header must include name, category, price. Then still **Publish**.

Import matched the wrong dish: matching is **name + category**. Rename carefully; “Pizza Margherita” and “Margherita” are different.

## Theme / Instagram not on the guest menu

You changed Café but did not Publish. Instagram buttons appear only when a URL is saved and published.

## WhatsApp opens the wrong number

Café tab: digits with country code, no `+` needed, e.g. `91XXXXXXXXXX`. Publish.

## The Cafe Store sample came back

Someone used **Reset to The Cafe Store** (or loaded the Hashtag demo) and Published. Restore from a CSV export if you have one. Always Export CSV before a bulk replace or reset.

## Site is down

Check the Netlify dashboard for the café’s site. A failed deploy can take the app down; the last **published menu data** is usually still in the live store and returns when the site is up again.

## Still stuck

Note: café name, whether Studio or guest URL, exact error text, and whether Publish reported **Live**. Fix from that — do not recreate the whole site first.
