# Sketchware Neo Landing Page

A lightweight static landing page for Sketchware Neo with real project screenshots, responsive layout and a small theme-aware screenshot carousel.

## Included

- Light and night screenshot variants switch with the site appearance.
- The screenshot carousel supports arrows, touch/mouse dragging and automatic advance.
- Automatic slide changes use local transform state, so the page does not jump vertically while the carousel is running.
- The screenshot set includes the Cloud screen in the main carousel.

Screenshots are stored under `assets/screenshots/light/` and `assets/screenshots/night/`.

Deploy with:

```bash
npx wrangler deploy
```

Static output directory remains `.`
