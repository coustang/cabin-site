# Smoky Mountain Cabins — Direct Booking Site

**Live:** https://coustang.github.io/cabin-site/  ·  **Repo:** github.com/coustang/cabin-site (GitHub Pages, master branch)

Static site (no build step) for direct bookings on your three Gatlinburg-area cabins.
Works with Hospitable: paste your Hospitable payment links into the editor and flip
the booking mode to "Pay only" or "Both", or keep the built-in booking-request form.

## Editing the site — two ways

### 1. The visual editor (recommended) — `admin.html`

Open **https://coustang.github.io/cabin-site/admin.html** (or the "✏️ Edit site" link
in the footer). It loads your live listings into a friendly form:

- Edit names, taglines, specs, descriptions, amenities, distances, notes.
- Reorder / remove gallery photos, set a new hero, or upload new ones (auto-resized).
- Change contact email/phone, booking mode, and Hospitable pay links per cabin.
- **Save & publish** commits straight to this repo via the GitHub API — your changes
  go live in about a minute.

To publish you need a GitHub personal access token with `repo` scope for this repo:
github.com → Settings → Developer settings → Personal access tokens → Generate new,
then paste it into the editor (stored only in your browser).

### 2. Edit the data file directly — `data/site.json`

All listing content lives in one JSON file. Edit it locally and push:

```bash
git add -A && git commit -m "what changed" && git push
```

## Files

| File | What it does |
|---|---|
| `index.html` | Page shell (header/footer) |
| `data/site.json` | **All listing content** — site settings + every cabin |
| `admin.html` + `js/admin.js` | The visual editor / publisher |
| `js/app.js` | Rendering + routing + booking form logic |
| `css/style.css` | All styling |
| `images/` | Cabin photos (optimized JPEGs) |

## Booking modes (`site.bookingMode`)

- `"request"` — guests fill the form, an email with their dates goes to `bookingEmailTo`. *(current)*
- `"link"` — button opens your Hospitable payment link for that cabin.
- `"both"` — show both options.

## Run locally

```bash
python -m http.server 8090 --directory .
# open http://localhost:8090 and /admin.html
```
