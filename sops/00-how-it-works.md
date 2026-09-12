# SOP-00 — How it works

**Audience:** you (agency)  
**Goal:** explain the product in one minute.

## Two URLs

| URL | Who | What |
| --- | --- | --- |
| `/` (the site root) | Guest at the table | Digital menu |
| `/studio` | Café owner | Back office |

Guests never see Studio. There is no call button. WhatsApp is the only contact.

## The rule that matters

**Typing in Studio does not change the tables.**

1. Owner edits in Studio (draft, this device).
2. Owner taps **Publish**.
3. The whole menu is written to the site’s live store.
4. Every phone that opens the QR link reads that store.

Until Publish, tables keep the last published menu.

## What gets stored

One published copy of:

- Café name, tagline, WhatsApp, address, maps, hours, Instagram
- Optional logo
- Theme + accent colour
- Categories and dishes (name, price, diet, photo URL, available, featured)

Plus a separate lock:

- Studio password (hashed)
- Session (~12 hours on that phone/browser)

This is **not** GitHub and **not** a code change. Redeploying the site does **not** wipe a published menu.

## What is not in the product

- No Sanity / extra CMS
- No phone-call button
- No guest accounts
- No auto-publish while typing

## Roles

| Role | Does |
| --- | --- |
| Guest | Scans QR → reads menu → WhatsApp if they want |
| Café owner | `/studio` + password → edit → **Publish** |
| You | Clone template, set first password with the owner, print QRs, hand over SOPs |
