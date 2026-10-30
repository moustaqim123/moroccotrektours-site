# Frontend Fixes — 2026-10-30 (local only, not deployed)

Scope: the five controlled fixes from `LIVE-VS-LOCAL-REPORT.md` §8. Nothing was
deployed, uploaded, or pushed. No Hostinger/CDN setting, `.htaccess`, caching
header, price, tour text, image asset, booking flow, form handler or WhatsApp
link was changed.

**Status: complete locally, awaiting approval. Not deployed.**

---

## 0. Checkpoint taken before any edit

The shell/exec runner was non-functional for this entire session (every command
returned no output and produced no files), so `git commit`, file copies and tool
based syntax checks were impossible. Following the pattern already used in
`_backups/2026-10-24-mobile-fixes/`, the checkpoint is a **snippet-level backup**:

- `_backups/2026-10-30-frontend-fixes/BEFORE-snippets.md` — exact pre-edit text of
  every CSS block that was changed, the dead hero variables, the Socket.IO tag,
  and the hero image inventory.

**Note:** the working tree is a git repo and these edits are uncommitted. Run
`git diff` / `git checkout` for a byte-exact comparison or rollback once a
working shell is available (see §9).

---

## 1. CSS/JS cache versioning

**Version token:** `?v=20261030` — one value for the whole release, applied to
every local CSS and JS reference.

**Result: 260 references across all 54 HTML pages. No unversioned local CSS/JS
reference remains anywhere in `public_html/`.**

| Reference | Pages | Count |
|---|---|---|
| `css/styles.css` | all | 54 |
| `css/mobile-fixes.css` | all | 54 |
| `js/main.js` | all | 54 |
| `css/luxury-pricing.css` | tour pages | 30 |
| `js/pricing-system.js` | tour pages | 30 |
| `js/luxury-pricing-quote.js` | tour (EN) | 14 |
| `js/luxury-pricing-quote-fr.js` | tour (FR) | 14 |
| `js/luxury-pricing-toubkal.js` | `tour-toubkal.html` | 1 |
| `js/luxury-pricing-toubkal-fr.js` | `tour-toubkal-fr.html` | 1 |
| `css/site-common.css` | customize pages | 2 |
| `js/customize-form.js` | customize pages | 2 |
| `js/contact-form.js` | contact pages | 2 |
| `js/cta-whatsapp-analytics.js` | home pages | 2 |
| **Total** | | **260** |

Before → after examples (structure identical everywhere, only the query string
is added; indentation and attribute order untouched):

```html
- <link rel="stylesheet" href="css/styles.css">
+ <link rel="stylesheet" href="css/styles.css?v=20261030">
- <link rel="stylesheet" href="css/mobile-fixes.css">
+ <link rel="stylesheet" href="css/mobile-fixes.css?v=20261030">
- <script src="js/main.js"></script>
+ <script src="js/main.js?v=20261030"></script>
- <script src="js/customize-form.js" defer></script>
+ <script src="js/customize-form.js?v=20261030" defer></script>
```

No duplicate parameters were introduced (`?v=20261030?v=…`, `&v=…`): verified,
0 occurrences. No absolute/CDN URL was touched: verified, 0 occurrences of
`http(s)://…?v=20261030`. `og:image` / `twitter:image` / hreflang URLs are
unchanged.

### Hero preloads — deliberately not versioned (needs your decision)

`public_html/` has **10 `<link rel="preload" as="image">` tags on 6 pages**
(`index.html`, `index-fr.html`, `tours.html`, `tours-fr.html`, `tour-toubkal.html`,
`tour-toubkal-fr.html`). All of them preload **hero JPEGs**, not stylesheets or
scripts, so the "all local CSS and JS references" rule does not reach them.

They were left exactly as-is because versioning only the preload would be a
regression, not a fix:

- the same image is referenced again without a version by the page's inline hero
  style / `:root` custom properties, so the preloaded URL would no longer equal
  the URL actually used → the browser would download the hero **twice** and the
  preload would be wasted;
- versioning both sides means changing 10 preloads **plus** the matching
  `url()`s in `styles.css`, `mobile-fixes.css` and the inline hero styles of
  those 6 pages — a cache-key change for images that did not change, i.e. a forced
  re-download for every visitor with zero cache-staleness benefit (images were
  never the reported symptom).

If you want them versioned anyway, say so and I will version the preload **and**
every matching `url()` in the same pass so the cache keys stay identical
(~19 edits, no visual change).

---

## 2. Dead hero image references

`public_html/css/styles.css` (`:root`):

```css
/* BEFORE */
--hero-contact-mobile: url('../images/hero/hero_contact_mobile.jpg');
--hero-customize-mobile: url('../images/hero/hero_customize_mobile.jpg');

/* AFTER */
--hero-contact-mobile: url('../images/hero/hero_contact.jpg');
--hero-customize-mobile: url('../images/hero/hero_customize.jpg');
```

The variables were kept (not deleted) and pointed at the existing desktop
artwork, which is what `css/mobile-fixes.css` (`:root`, lines 227-230) already
did. Desktop and mobile heroes therefore render the same artwork as before —
the mobile fallback simply stopped requesting two 404 URLs.

Verified: `hero_contact_mobile.jpg` / `hero_customize_mobile.jpg` now appear only
inside an explanatory comment; no `url()` anywhere points at them.

---

## 3. Tour hero mobile compatibility (all 30 pages)

**Approach chosen: one CSS override instead of 30 inline-HTML edits** — the
smallest consistent change, and it keeps the desktop appearance byte-identical.

`public_html/css/mobile-fixes.css`, inside the existing
`@media (max-width: 768px)` block:

```css
/* Tour detail pages (30 × tour-*.html) build their hero from a classless
   div whose *inline* style sets `background-attachment: fixed`. Class
   selectors cannot reach inline declarations, so the scrolling fallback is
   applied to the inline-styled backdrop itself. iOS Safari does not paint
   fixed-attachment backgrounds reliably; desktop (>768px) keeps `fixed`,
   so the desktop appearance is unchanged. */
div[style*="background-attachment: fixed"] {
    background-attachment: scroll !important;
}
```

Why this works: the hero backdrop on every tour page is a classless
`<div style="… background-attachment: fixed; …">` (e.g. `tour-toubkal.html:469-481`,
`tour-10-days.html:326-338`, `tour-ouzoud.html:491-503`). The `style` attribute
value literally contains the substring `background-attachment: fixed`, so the
attribute selector matches without needing a class, and `!important` beats the
inline declaration (only `!important` in an author stylesheet can).

- Desktop (> 768px): rule not active → inline `fixed` preserved, no visual change.
- Mobile (≤ 768px): `scroll` → no iOS Safari repaint/zoom artefact.
- No HTML was edited for this fix; all 30 pages are covered by the same rule.

Verified: exactly **30** tour pages contain the inline
`background-attachment: fixed;` declaration (one per page), so all 30 receive the
override.

---

## 4. Language switcher — `css/styles.css` is now the single source

`css/styles.css` already contained the authoritative implementation:

- base pill/panel design (`586-699`),
- interaction state block (`701-874`) with
  `.is-ready` / `.is-open` and the graceful
  `body .lang-switcher:not(.is-ready):hover/:focus-within` fallback
  (`743-744`, and mobile `861`),
- `body .lang-switcher …` `!important` rules that out-specify the per-page copies.

Removed (duplicated legacy rules that the authoritative block out-specifies):

| File | Removed |
|---|---|
| `css/styles.css` | legacy `.lang-btn` + `.lang-dropdown` / `li` / `a` / `a:hover` block in the `@media` at ~2381 |
| `css/styles.css` | legacy `.lang-dropdown` / `li a` / `li a:hover` block in the `@media` at ~3426 |
| `css/luxury-pricing.css` | legacy `.lang-btn` + `.lang-dropdown` block in the mobile `@media` (~1309) |

Kept on purpose:

- `.lang-switcher { position: static; margin-top: …; text-align: center; }` in both
  `styles.css` media blocks and in `luxury-pricing.css`. These are **layout**
  declarations for the mobile menu; the effective mobile offset comes from the
  later `margin-top: 10px`, so deleting them would shift the menu. All three are
  unchanged.
- `.lang-btn { min-height/min-width: 44px }` at `styles.css:2881` — that is the
  mobile touch-target group, not a duplicate of the pill styling.

Nothing else about the switcher changed: no HTML, no `js/main.js`, no class
names, no display/animation behaviour, and the `:not(.is-ready)` no-JS fallback
is intact.

### Not removed: the inline `<style>` switcher copies in the HTML pages

All 53 sitemap pages still carry a per-page `.lang-switcher/.lang-btn/.lang-dropdown`
copy inside their inline `<style>` block (60 blocks). They are **inert for
styling** — every declaration they set on the pill/panel is overridden by the
`body .lang-switcher … !important` rules — but they were **not** deleted, because:

1. removal cannot be visually confirmed in this session (no shell, no local
   server, and the browser cannot open `file://` pages), and
2. a copy may set a property the authoritative block does not declare (e.g.
   `letter-spacing`, `text-transform`); deleting it would silently change the
   pill on that page.

Per your rule "only after confirming they are not needed", removal is left for a
follow-up that can be checked in a browser. It is a pure deletion job: 60 blocks
in 53 files, all inside `<style>` and all scoped to `.lang-*`.

---

## 5. Dead Socket.IO request

`public_html/index.html`:

```html
- <script src="/socket.io/socket.io.js"></script>
  <script src="js/main.js?v=20261030"></script>
```

Verified dependency-free in production: the only consumer in the shipped JS is
`js/main.js:264-271`, which is already guarded:

```js
if (typeof io !== 'undefined') {
    const socket = io();
    socket.on('images-changed', () => { … initSlider(); });
}
```

With the tag gone, `io` is undefined, the guard is false, and the block is
skipped — no reference error, no console noise. The lost capability is the
dev-only "gallery live reload" fed by the Node dev server
(`public_html/server.js` + `socket.io` in `package.json`), which is not part of
production and was already unreachable (the endpoint 404s on the live host).
The request was 404ing on the live site; removing it drops one wasted request
per home page view.

---

## 6. Files changed (57 site files)

**HTML — all 54 pages** (version params only; `index.html` also lost the
Socket.IO tag):

`about.html`, `about-fr.html`, `blog.html`, `blog-fr.html`, `blog-atlas.html`,
`blog-atlas-fr.html`, `blog-coastal.html`, `blog-coastal-fr.html`,
`blog-culture.html`, `blog-culture-fr.html`, `blog-fes.html`, `blog-fes-fr.html`,
`blog-marrakech.html`, `blog-marrakech-fr.html`, `blog-sahara.html`,
`blog-sahara-fr.html`, `contact.html`, `contact-fr.html`, `customize-trip.html`,
`customize-trip-fr.html`, `index.html`, `index-fr.html`, `tours.html`,
`tours-fr.html`, `tour-10-days.html`, `tour-10-jours.html`, `tour-agafay.html`,
`tour-agafay-fr.html`, `tour-ait-bougmez.html`, `tour-ait-bougmez-fr.html`,
`tour-atlas-villages.html`, `tour-atlas-villages-fr.html`,
`tour-azzaden-tamsoult.html`, `tour-azzaden-tamsoult-fr.html`,
`tour-chefchaouen.html`, `tour-chefchaouen-fr.html`, `tour-essaouira.html`,
`tour-essaouira-fr.html`, `tour-mgoun.html`, `tour-mgoun-fr.html`,
`tour-ouzoud.html`, `tour-ouzoud-fr.html`, `tour-saghro.html`, `tour-saghro-fr.html`,
`tour-sahara-erg-chebbi.html`, `tour-sahara-erg-chebbi-fr.html`,
`tour-sahara-merzouga.html`, `tour-sahara-merzouga-fr.html`, `tour-siroua.html`,
`tour-siroua-fr.html`, `tour-todra-dades.html`, `tour-todra-dades-fr.html`,
`tour-toubkal.html`, `tour-toubkal-fr.html`

**CSS — 3 files:**

- `public_html/css/styles.css` — hero variables (2), two legacy switcher blocks
  removed (comments left in their place)
- `public_html/css/mobile-fixes.css` — mobile tour-hero override added, hero
  fallback comment updated
- `public_html/css/luxury-pricing.css` — legacy switcher block removed

**JavaScript: 0 files changed.** No image, JSON, `.htaccess` or PHP file was
touched.

---

## 7. Validation results

| Check | Method | Result |
|---|---|---|
| Unversioned local CSS/JS refs | regex `href="css/…\.css"` + `src="js/…\.js"` over all HTML | **0** |
| Duplicate version params | regex `?v=…?v=` | **0** |
| Exactly one `styles.css` per page | exact-count grep | **54 / 54 pages**, 1 each |
| Exactly one `mobile-fixes.css` per page | exact-count grep | **54 / 54**, 1 each |
| Exactly one `main.js` per page | exact-count grep | **54 / 54**, 1 each |
| Tour pages carrying the hero fix | inline `background-attachment: fixed;` count | **30 / 30**, one each |
| Override scoped to mobile only | read `mobile-fixes.css` | inside `@media (max-width:768px)`, ends before desktop rules |
| `socket.io` script references | full-tree grep of `*.html` | **0** (JS keeps the `typeof io !== 'undefined'` guard, `main.js:265`) |
| Version param leaked to CDN/absolute URLs | regex `https?://…?v=` | **0** |
| Version param leaked into CSS `url()` | grep `?v=` in `*.css` | **0** |
| Dead hero image filenames | grep in `*.css` | comment text only, no `url()` |
| Legacy `.lang-btn/.lang-dropdown` left in stylesheets | grep `css/*.css` | only the authoritative `body .lang-switcher …` rules + the 44px touch-target selector remain |
| `:not(.is-ready)` fallback preserved | read `styles.css:743-744`, `861` | present, unchanged |
| `luxury-pricing.css` media block still well-formed | read 1297-1315 | `.lang-switcher` kept, `}` at 1315, following rules intact |
| Prices / tour text / images / booking / forms | edits were attribute-value and `.lang-*`-only | unchanged by construction; no JS or content line edited |

---

## 8. Could not be verified in this session

1. **No `git diff` / `git status`** — the shell returned no output for every
   command, so the change list above comes from the edit log, not from git.
   A `git diff --stat` should be run before deploy to confirm "57 files".
2. **No syntax linting** (`php -l`, `node --check`, HTML/CSS validators) — no
   shell. HTML edits are attribute-value replacements inside existing tags and
   CSS edits keep brace balance (verified by reading each edited region), but
   this is manual, not tool-verified.
3. **No rendering / mobile-width or iOS verification** — no local server could be
   started and the browser cannot open `file://` pages. Consequently:
   - the mobile switcher spacing (`margin-top: 10px`) is preserved by rule order
     analysis, not by screenshot;
   - the iOS hero fix is applied by selector analysis, not on a device.
4. **No live check of `?v=`** — Hostinger's CDN was reachable in the earlier
   diagnosis, but nothing here was deployed, so serving of query-stringed
   assets (200 vs. redirect) is unverified until after upload.

Recommended post-deploy smoke test (5 minutes, no CDN change needed):
home + one tour page + contact page, desktop and mobile widths; confirm CSS/JS
requests carry `?v=20261030` and return 200, the switcher pill renders and opens,
and a tour hero scrolls correctly on iOS.

---

## 9. Rollback

- Every changed CSS region: `_backups/2026-10-30-frontend-fixes/BEFORE-snippets.md`
  (`BEFORE` blocks are the exact original text).
- HTML: delete the `?v=20261030` parameter (the only HTML edit besides the
  removed `<script src="/socket.io/socket.io.js"></script>`).
- With a working shell: `git diff` to review, `git checkout -- public_html css`
  (or the specific paths) to revert.

**Nothing has been deployed. Awaiting your approval, and a decision on the two
deferred items in §1 and §4 (hero image preloads, inline switcher `<style>` copies).**
