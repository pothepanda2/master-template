# SOP-07 — QR codes and tables

**Audience:** you (agency) + café manager  
**When:** printing table tents, stickers, or a counter board.

## What to encode

Encode the **guest menu URL only**.

Example (master demo): `https://qr-menu-master-template.netlify.app/`

For a client: their Netlify URL or custom domain, with a trailing slash if you like, **without** `/studio`.

| Encode this | Never encode this |
| --- | --- |
| `https://cafe-name.netlify.app/` | `https://cafe-name.netlify.app/studio` |
| Custom domain, e.g. `https://menu.thecafe.in/` | Any localhost / preview link |

## How to make the code

1. Open a QR generator (Google QR, QRCode Monkey, or your print vendor).
2. Paste the guest URL.
3. Download high-resolution PNG or PDF.
4. Print at least **3 cm × 3 cm** of actual code (not including the white border).
5. Keep a quiet zone (white margin) around the code.
6. Test with two phones (Android + iPhone) in café lighting before the full print run.

Do not put a logo so large it breaks the centre of the code unless the generator supports a safe overlay.

## Placement

- One code per table, easy to scan while seated.
- Laminate or use a table-tent so oil and wet glasses do not wreck it.
- Counter / takeaway: one large code at billing.
- If you reprint after a domain change, **destroy old tents**. Old URLs confuse staff.

## After they scan

They should land on the menu (name, search, categories, prices).  
They should **not** see a password screen. If they do, you printed `/studio`.

## Custom domain (optional)

If the café has a domain:

1. Add it in Netlify (Domain management).
2. Point DNS as Netlify shows.
3. Reprint QRs to the short domain.
4. Keep the Netlify URL working as a backup.

## Do not

- Do not use URL shorteners that expire.
- Do not print a screenshot of a QR from a low-res chat image for the final batch.
- Do not add “scan for offers” copy if the page is only a menu — say **Scan for menu**.
