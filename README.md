# Smoky Mountain Cabins — Direct Booking Site

Static site (no build step) for direct bookings on your three Gatlinburg-area cabins.
Works with Hospitable: paste your Hospitable payment links into the config, or keep using
the built-in booking-request form.

## Files

| File | What it does |
|---|---|
| `index.html` | Page shell (header/footer) |
| `js/config.js` | **EDIT THIS** — all cabin data, contact info, booking mode |
| `js/app.js` | Rendering + routing + booking form logic |
| `css/style.css` | All styling |
| `images/` | Photos. Currently branded SVG placeholders — swap in real photos (keep filenames) |

## Make it yours (5 minutes)

1. Open `js/config.js`.
2. Set your real **email** and **phone** at the top (`SITE.email`, `SITE.phone`).
3. Pick a **booking mode**:
   - `"request"` — guests fill the form, you get an email with their dates (works immediately).
   - `"link"` — button opens your Hospitable payment link for that cabin. Paste each link into `hospitableLinks`.
   - `"both"` — show both options.
4. Swap placeholder images in `images/` for real photos. Keep the same filenames:
   - `hero.svg` → main homepage banner (use a wide landscape shot, ~2000px)
   - `<cabin>-hero.svg` + `<cabin>-1..4.svg` → each cabin's pages
   - You can rename to `.jpg`/`.webp` and update the paths in `config.js`.

## Run locally

```bash
python -m http.server 8090 --directory .
# open http://localhost:8090
```

## Deploy (any static host)

The whole folder is deployable as-is. URLs use hash routing (`/#/cabin/oaks`), so no
server rewrite rules are needed on GitHub Pages, Cloudflare Pages, Netlify, or anywhere else.
