# Venusco_Tech_Solutions_Official_Web
Official website codebase for Venusco Tech Solutions – offering branding, web presence, and digital launch services.

## Site maintenance & tools

Quick setup

1. Install Node dependencies (for sitemap generation):

```powershell
npm install
```

2. Generate sitemap (uses SITE_URL env var if you want a different domain):

```powershell
$env:SITE_URL = "https://venusco.in"; npm run generate-sitemap
```

Replace GA4

- Open `index.html` and replace `G-XXXXXXXXXX` with your Google Analytics Measurement ID.

Lighthouse & SEO checks

- Open the site in Chrome and run DevTools > Lighthouse to get performance/SEO/accessibility reports.

Notes

- Canonical and OG URLs assume `https://venusco.in`. Update if your production domain differs.
- The contact form opens WhatsApp with a prefilled message to +91 99472 41065. The server-side `forms/contact.php` is retained as a fallback for no-JS clients.

If you'd like, I can:
- Implement responsive `srcset` and minify assets.
- Add Google Tag Manager instead of a GA4 snippet.
- Set up a CI step to auto-generate `sitemap.xml` on commit.

### Build (responsive images + minify)

After installing dependencies, run the build to produce responsive images and minified CSS/JS into the `dist` folder:

```powershell
npm install
npm run build
```

Output:

- `dist/assets/img/...` — responsive WebP images (e.g. `3-800.webp`, `portfolio-1-400.webp`)
- `dist/assets/js/...` — minified JS
- `dist/assets/css/...` — minified CSS

## Deploying to Netlify

Recommended Netlify settings:

- Build command: npm install && npm run build
- Publish directory: . (site root)

Environment variables to set in Netlify (Site settings > Build & deploy > Environment):

- SITE_URL = https://venusco.in
- GA_ID = G-XXXXXXXXXX (optional — if set, the build will inject this into index.html)

Preferred: use GTM container instead of direct GA to manage tags centrally:

- GTM_ID = GTM-XXXXXXX (recommended) — the build will inject GTM container into `index.html` if provided. If GTM_ID is not provided but GA_ID is, the GA snippet will be injected.

CI (optional)

There's a GitHub Actions workflow (`.github/workflows/build.yml`) that runs `npm run build` on pushes to `main` and uploads the `dist` artifact. This is optional but useful to prebuild assets.

I added a `netlify.toml` and `_headers` file with recommended security headers and a Lighthouse plugin configured. The build will:

1. Run `npm run build` which:
	- Generates responsive images into `dist/` and minifies assets.
	- Copies optimized images and assets from `dist/assets/*` back into `assets/*` so existing HTML references work.
	- Runs the sitemap generator.
	- Injects GA ID from the `GA_ID` env var into `index.html` if provided.

If you prefer publishing only `dist/` and rewriting references automatically, I can change the publish directory and rewrite HTML during build instead.
