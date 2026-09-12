# Portfolio

A single-page engineer portfolio in the style of a modern WebGL landing site: a
particle field that morphs from a sphere into your name, a glass pill nav with
scroll-spy, scroll-reveal sections, an accent-keyed tech stack grid, filterable
project cards with a lightbox, and a glass contact form.

Static HTML, CSS, and ES modules. **No build step and no install** — three.js and
GSAP are vendored into `vendor/`, so it runs offline and deploys as plain files.

## Run it

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works. Opening `index.html` via `file://` will *not* work —
ES modules and the import map need an HTTP origin.

## Make it yours

Everything you need to edit lives in **`js/config.js`**. Nothing else has to change.

| Export | What it controls |
| --- | --- |
| `profile` | Name, the word the particles spell, rotating role lines, photo, email, social links |
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
js/config.js        ← all content lives here
js/main.js          boot, nav, scroll-spy, reveals, lightbox, form
js/sections.js      renders about / stack / projects / contact / footer
js/hero.js          three.js particle morph + bloom
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
