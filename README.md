# Portfolio
This is satan's portfolio.
This is completed portfolio.

A single-page engineer portfolio in the style of a modern WebGL landing site: a
particle field that morphs from a sphere into your name, a glass pill nav with
scroll-spy and a JA / EN language toggle, scroll-reveal sections, an accent-keyed
tech stack grid, filterable project cards with a lightbox, and a glass contact form.

Static HTML, CSS, and ES modules. **No build step and no install** — three.js and
GSAP are vendored into `vendor/`, so it runs offline and deploys as plain files.

## Run it

```bash
python3 serve.py        # macOS / Linux
py serve.py             # Windows (the `python` alias may be the Store stub)
# then open http://localhost:8000
```

`serve.py` is `http.server` plus a `Cache-Control: no-cache` header, so the
browser never pairs a fresh `main.js` with a stale cached module. Any static
server works. Opening `index.html` via `file://` will *not* work — ES modules and
the import map need an HTTP origin.

## Languages

The site opens in **Japanese** and the pill in the nav switches to English. The
choice is remembered in `localStorage`; `?lang=en` in the URL overrides it for a
single visit, which is handy for sharing a link in one language.

Any text field in `js/config.js` or `js/projects.js` can be a plain string (same
in every language) or an object keyed by locale:

```js
title: { ja: 'フルスタックエンジニア', en: 'Full Stack Engineer' }
```

Untranslated fields fall back to English. Chrome strings (section headings,
buttons, form labels) live in `js/i18n.js`. Switching re-renders the sections in
place — no reload, and the active project filter is kept.

## Make it yours

Everything you need to edit lives in **`js/config.js`** (projects in
**`js/projects.js`**). Nothing else has to change.

| Export | What it controls |
| --- | --- |
| `profile` | Name, the word the particles spell, monogram initials, rotating role lines, photo, email, social links, meta description |
| `nav` | Nav items (each `href` must match a section `id`) |
| `about` | About paragraphs, the callout note, the four stats |
| `technologies` | Tech stack cards — title, accent, proficiency %, six skills each |
| `projects` | Project cards (see badges below) |
| `projectsVisible` | How many cards show before "Show More" |
| `contact` | Form heading, submission mode, success copy |

### Project card badges

Badge and buttons are derived from the data, so you never set them by hand:

| Data | Badge | Footer |
| --- | --- | --- |
| `shareUrl: false` | `Private` | none |
| `liveUrl: '...'` | `Live` | "Visit" button |
| `link: '...'` | `GitHub` | source button |

`image` is optional — leave it empty and a deterministic gradient placeholder is
generated from the project name. Drop real screenshots in `images/` and set
`image: '/images/foo.png'` to replace them.

### Contact form

`contact.mode` picks the transport:

- `'none'` (default) — no backend. Opens the visitor's mail client via `mailto:`.
- `'formsubmit'` — posts to `https://formsubmit.co/ajax/<profile.email>`. Free,
  no server; confirm your address once on first submission.
- `'custom'` — posts JSON to whatever you put in `contact.endpoint`.

The form includes a honeypot field that silently drops bots.

## Deploy

`vercel.json` is included. From this directory:

```bash
vercel        # preview
vercel --prod # production
```

It is a static site, so Netlify, Cloudflare Pages, GitHub Pages, or any bucket
behind a CDN work identically — just publish the folder as-is.

## Layout

```
index.html          page shell, import map, section anchors
styles/main.css     all styling; design tokens at the top of the file
js/config.js        ← profile, about, stack, contact — all content but projects
js/projects.js      ← project cards
js/i18n.js          locale state, t() helper, UI strings for each language
js/main.js          boot, nav, language toggle, scroll-spy, reveals, lightbox, form
js/sections.js      renders about / stack / projects / contact / footer
js/hero.js          three.js particle morph + bloom
js/hero-bg.js       animated hero backgrounds (galaxy, waves, …); ?preview to try them
js/icons.js         inline SVG icon set
vendor/             three.js r161 + GSAP 3.12 (pinned, no CDN at runtime)
```

## Notes

- **Accessibility / resilience:** `prefers-reduced-motion` skips the morph and
  all scroll animations; if WebGL is unavailable the hero falls back to a
  typographic treatment; the page degrades to a readable message without JS.
- **Performance:** the hero render loop halts once the hero scrolls out of view,
  and skips entirely once the cloud has faded, so scrolling costs nothing.
- **The particle word** works best at 3–8 characters. Longer words still render
  but the letterforms get thin; the cloud auto-scales to fit the viewport.
- **Fonts:** Inter for Latin text, Noto Sans JP (Google Fonts) for Japanese glyphs.
