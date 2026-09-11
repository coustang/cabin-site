# Smoky Mountain Cabins — Direct Booking Site

**Live:** https://coustang.github.io/cabin-site/  ·  **Repo:** github.com/coustang/cabin-site (GitHub Pages, master branch)

Static site (no build step) for direct bookings on your three Gatlinburg-area cabins.
Works with Hospitable: paste your Hospitable payment links into the...[truncated]
the built-in booking-request form.

## Files

| File | What it does |
|---|---|
| `index.html` | Page shell (header/footer) |
| `js/config.js` | **EDIT THIS** — all cabin data, contact info, booking mode |
| `js/app.js` | Rendering + routing + booking form logic |
| `css/style.css` | All styling |
| `images/` | Real cabin photos (optimized JPEGs, ~9 MB total) |

## Editing the site

Everything lives in **`js/config.js`**:

- **Contact** — `SITE.email` / `SITE.phone` at the top (email is set; add a phone number if you want it shown).
- **Booking mode** (`bookingMode`):
  - `"request"` — guests fill the form, an email with their dates goes to `bookingEmailTo`. *(current)*
  - `"link"` — button opens your Hospitable payment link for that cabin (paste links into `hospitableLinks`).
  - `"both"` — show both options.
- **Cabin data** — names, specs, descriptions, amenities, distances, and image paths per cabin.
- To swap a photo: replace the file in `images/` (same filename) or update the path in config.

## Run locally

```bash
python -m http.server 8090 --directory .
# open http://localhost:8090
```

## Deploying changes

Push to master and GitHub Pages picks it up automatically (~1 min):

```bash
git add -A && git commit -m "what changed" && git push
```
