# SOP-01 — Launch a new café

**Audience:** you (agency)  
**When:** a new client wants their own QR menu.  
**Time:** about 30–60 minutes once you have the menu list.

## Collect from the café (before you build)

- Café name
- WhatsApp with country code (example `91XXXXXXXXXX`)
- Address + Google Maps link
- Opening hours
- Instagram (optional)
- Logo file (optional, JPG/PNG/WebP, under 6 MB)
- Dish list: name, category, price ₹, veg/non-veg, short description
- Preferred look: Warm cream / Dark / Coffee / Forest / Rose / Ocean + optional accent colour

## Steps

1. **Copy the master template**  
   GitHub: https://github.com/pothepanda2/master-template  
   Create a **new repo** and a **new Netlify site** for this café. Do not edit the master live demo as the client site.

2. **Deploy**  
   Connect the new repo to Netlify. Build command `npm run build`, publish folder `dist`.  
   Confirm `/` loads and `/studio` loads.

3. **Set the Studio password with the owner in the room**  
   First visit to `/studio` sets the password (4–64 characters).  
   Write it down for them. You should not keep it after handover unless they ask you to manage it.

4. **Café tab**  
   Fill name, WhatsApp, address, maps, hours, Instagram.  
   Upload logo or leave empty (name only).  
   Pick theme + accent.

5. **Categories**  
   Match their real sections (Pizza, Biryani, etc.). Delete sample ones they do not use.

6. **Dishes**  
   Either enter by hand (optional **Choose** photo, max 4 MB), or import CSV (SOP-04).  
   Mark sold-out items unavailable instead of deleting if they come back.

7. **Publish**  
   Header must say **Live for all tables**.

8. **Check on a phone that is not yours**  
   Open the public URL (not Studio). Confirm name, prices, WhatsApp, veg marks, logo/name.

9. **QR codes** (SOP-07)  
   Encode the **guest menu URL only** (`https://their-site.netlify.app/` or custom domain). Never encode `/studio`.

10. **Handover** (SOP-09)  
    Send the owner quick card + Studio URL + password (separately) + guest URL.

## Do not

- Do not reuse the master-template Netlify URL for a paying client.
- Do not print `/studio` on table tents.
- Do not skip Publish.
- Do not leave **The Cafe Store** sample name, `911234567890`, or “Your café address” live.
- Do not copy a Hashtag Cafe demo site as the client — copy the **master template**.
