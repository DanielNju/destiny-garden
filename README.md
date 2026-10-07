# Destiny Garden

Website for Destiny Garden, a dining, events, stay and entertainment destination in Ruiru, Kiambu County, Kenya. It is a static site built with plain HTML, CSS and JavaScript. There is no build step.

## Run locally

Service workers only run on `https://` or `localhost`, so use a local server rather than opening the files directly:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the address it prints (for example http://localhost:8000).

## Structure

```
destiny-garden/
├── index.html          Home page
├── 404.html            Not-found page (uses root paths: /css/...)
├── sw.js               Service worker (offline support)
├── pages/              about, dining, events, accommodation,
│                       entertainment, family, gallery, contact
├── css/
│   ├── style.css       Design tokens, reset, home page, shared components
│   └── pages.css       Inner pages, gallery, contact form, GSAP overrides
├── js/
│   ├── main.js         Nav, mobile menu, reveals, gallery, forms, SW registration
│   └── animations.js   GSAP hero sequence, parallax, scroll entrances
└── assets/             images/, videos/, icons/, fonts/
```

Inner pages load `../css/style.css` first, then `../css/pages.css`.

## Design system

Defined as CSS variables at the top of `css/style.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-primary` | `#173c2c` | Deep garden green, buttons, panels |
| `--color-dark` | `#0b2118` | Footer, stats, overlays |
| `--color-background` | `#f5f1e8` | Page background |
| `--color-beige` | `#d8cdb5` | Section backgrounds |
| `--color-accent` | `#8faf76` | Hover, focus, highlights |

Fonts: **Fraunces** (headings) and **Instrument Sans** (body), loaded from Google Fonts.

## Pages

| Page | Highlights |
| --- | --- |
| Home | Hero, philosophy, explore panels, stats, story, hover-image rows, gallery teaser, visit, newsletter |
| About | Story block, three guiding ideas |
| Dining | Intro, hover-image rows |
| Events | Hover-image rows, three-step planning list |
| Stay | Accommodation cards |
| Entertainment | Live music, DJ nights, mugithi |
| Family | Play and family cards |
| Gallery | Category filter, lightbox (native `<dialog>`) |
| Contact | Enquiry form, opening hours, location (`#book` anchor) |

## JavaScript

- **`main.js`** runs on every page: navbar scrolled state, mobile menu (Escape closes it), fallback scroll reveals, gallery filter and lightbox, form confirmation, home-page parallax, service worker registration.
- **`animations.js`** runs only if GSAP and ScrollTrigger loaded and the visitor has not asked for reduced motion. It adds the `gsap` class to `<html>`, which switches off the CSS reveals and hero fade in `pages.css`. If GSAP fails to load, the CSS reveals still work.

GSAP 3.12.5 loads from cdnjs. Script order matters: `gsap`, `ScrollTrigger`, `animations.js`, then `main.js`.

## Offline support

`sw.js` precaches the HTML, CSS and JS files. Pages use network first, falling back to cache and then `404.html`. Images, fonts and GSAP use stale-while-revalidate (80 items maximum). Videos are never cached.

**Bump `VERSION` in `sw.js` on every deploy** (for example `dg-v1` to `dg-v2`) so visitors receive updates.

## Before launch

- [ ] **Contact form:** it only shows a thank-you message. Connect it to a backend or a service such as Formspree (see `main.js`, the `form[data-note]` handler).
- [ ] **Newsletter form:** same as above.
- [ ] **Contact details:** replace the "Phone and email" placeholder in `pages/contact.html`.
- [ ] **Map:** the home page "Visit" section has a placeholder; embed a map.
- [ ] **Social links:** footer links on the home page point to `#`.
- [ ] **Images:** confirm every path used in the HTML exists (some folders, such as `chilling/` and `social/`, are not in the original tree).
- [ ] **Compress media:** convert photos to WebP or AVIF and compress videos before deploying.
- [ ] **Subfolder hosting:** `404.html` uses root paths (`/css/style.css`). Change them if the site is not at the domain root.
- [ ] **Optional:** add `manifest.json` (home-screen install), `robots.txt` and `sitemap.xml`.

## Accessibility

Skip link, visible focus styles, labelled form fields, `aria-current` on the active nav link, keyboard-closable menu and lightbox, and `prefers-reduced-motion` respected in both CSS and JavaScript.

© 2026 Destiny Garden
