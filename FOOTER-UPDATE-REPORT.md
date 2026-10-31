# Footer Update Report — © 2024–[year] + Gallery link

**Date:** 2026-10-31 · **Local work only — nothing deployed, uploaded, or cached.**

## 1. What was changed

Two footer-only changes on **all 54 HTML pages**. No CSS, no JS file, no image, no
tour content, no price, no booking form, no WhatsApp block was touched.

### 1.1 Copyright (`<div class="copyright">` on every page)

Before (variants across the site):
```html
<p>© 2024 Morocco Trek Tours. All rights reserved.</p>      <!-- EN -->
<p>© 2024 Morocco Trek Tours. Tous droits réservés.</p>     <!-- FR -->
<p>&copy; 2024 …</p>                                        <!-- index-fr, tours-fr -->
<p> 2024 …</p>          <!-- 5 pre-existing copies where the © symbol was MISSING in source -->
```

After (same styling, same classes — only text inside the existing `<p>`):
```html
<p>© 2024–<span class="footer-year">2026</span> Morocco Trek Tours. All rights reserved.</p>
<script>(function () { var y = new Date().getFullYear(); var els = document.querySelectorAll('.footer-year'); for (var i = 0; i < els.length; i++) { els[i].textContent = y; } })();</script>
```
- **Fallback year in HTML:** `2026` (kept in markup, shows if JS is off/blocked).
- **JavaScript updater:** one-line ES5 IIFE placed inside the same
  `<div class="copyright">`, right after the `<p>`. It overwrites every
  `.footer-year` on the page with the browser's current year — no caching, no
  deploy needed for future years.
- The 5 occurrences of `<p> 2024 …` (missing `©`) now render `©` like every other
  page. These were a pre-existing typo, fixed inside the same copyright line.
- `<span>` inherits the existing `.copyright p` styles (font-size 0.8rem etc.);
  the `<script>` element is `display:none` by default → **zero visual change**.

### 1.2 Gallery / Galerie link (footer "Quick Links" on every page)

- **No dedicated gallery page exists, so none was created.** The site's gallery is
  the section that already exists on both home pages:
  - `public_html/index.html:589` → `<div id="gallery" class="gallery-grid">`
  - `public_html/index-fr.html:721` → `<div id="gallery" class="gallery-grid">`
- Inserted, matching surrounding markup exactly, **before** the existing Contact
  entry in each footer `<ul class="footer-links">` (Contact stays last):
  - English pages: `<li><a href="index.html#gallery">Gallery</a></li>`
  - French pages: `<li><a href="index-fr.html#gallery">Galerie</a></li>`
- This is the same markup rendered for both desktop and mobile footers (no CSS
  changed), so the link is identical on both.

## 2. Verification (static tests)

| Check | Method | Result |
|---|---|---|
| Gallery link on all 27 EN pages | grep `index.html#gallery">Gallery` | **27/27** |
| Galerie link on all 27 FR pages | grep `index-fr.html#gallery">Galerie` | **28** (26 pages ×1 + `customize-trip-fr.html` ×2 — see §4) |
| No leftover `© 2024` / `<p> 2024` anywhere | grep `© 2024 Morocco\|&copy; 2024\|<p> 2024` | **0 matches** |
| Year span on every page | grep `class="footer-year"` | **55** = 54 pages + the 1 duplicate footer in `customize-trip-fr.html` |
| Year script on every page | grep `querySelectorAll('.footer-year')` | **55** (same distribution) |
| Gallery anchor exists | grep `id="gallery"` | 2 matches, exactly the 2 link targets |
| Link target files exist | `index.html`, `index-fr.html` in `public_html/` | **exist** |
| Only footer regions edited | edit oldStrings = copyright `<p>` + footer contact `<li>` only | confirmed — no nav/section touched |
| Rendering unchanged | read `index.html:639-652`, `index-fr.html:774-787` | markup/indent/classes intact, script invisible |

All other footer links (Home, Our Tours/Tours, Customize Trip, About Us,
Travel Blog/Guide, Contact, tel:, wa.me, mailto) were **not modified** — they point
at the same existing files as before, so a full re-test of pre-existing links is
out of scope of this change; the only new href is `index.html#gallery` /
`index-fr.html#gallery`, both verified above.

## 3. Modified files — 54

`public_html/` only:

- `index.html`, `index-fr.html`, `tours.html`, `tours-fr.html`, `about.html`, `about-fr.html`, `contact.html`, `contact-fr.html`, `customize-trip.html`, `customize-trip-fr.html`
- `blog.html`, `blog-fr.html`, `blog-atlas.html`, `blog-atlas-fr.html`, `blog-coastal.html`, `blog-coastal-fr.html`, `blog-culture.html`, `blog-culture-fr.html`, `blog-fes.html`, `blog-fes-fr.html`, `blog-marrakech.html`, `blog-marrakech-fr.html`, `blog-sahara.html`, `blog-sahara-fr.html`
- `tour-10-days.html`, `tour-10-jours.html`, `tour-agafay.html`, `tour-agafay-fr.html`, `tour-ait-bougmez.html`, `tour-ait-bougmez-fr.html`, `tour-atlas-villages.html`, `tour-atlas-villages-fr.html`, `tour-azzaden-tamsoult.html`, `tour-azzaden-tamsoult-fr.html`, `tour-chefchaouen.html`, `tour-chefchaouen-fr.html`, `tour-essaouira.html`, `tour-essaouira-fr.html`, `tour-mgoun.html`, `tour-mgoun-fr.html`, `tour-ouzoud.html`, `tour-ouzoud-fr.html`, `tour-saghro.html`, `tour-saghro-fr.html`, `tour-sahara-erg-chebbi.html`, `tour-sahara-erg-chebbi-fr.html`, `tour-sahara-merzouga.html`, `tour-sahara-merzouga-fr.html`, `tour-siroua.html`, `tour-siroua-fr.html`, `tour-todra-dades.html`, `tour-todra-dades-fr.html`, `tour-toubkal.html`, `tour-toubkal-fr.html`

**Not touched:** `css/*`, `js/*`, `images/*`, `images.json`, `sitemap.xml`,
`.htaccess`, `private/*`, and all other files (≤112 files under `public_html`).

Non-website artifacts created (both in gitignored `_backups/`):
`_backups/2026-10-30-footer/BEFORE-footer.md` (checkpoint + rollback) and this report.

## 4. Notes / pre-existing issues found (not fixed)

1. **`customize-trip-fr.html` contains a malformed duplicate footer**
   (lines ~749-791: a second `<footer>` nested inside the first, its `</footer>`
   closing the inner one). Pre-existing bug, cosmetic duplication on that page.
   Both footers received the same Galerie link and updated copyright so the page
   is consistent either way. Fixing the duplication itself was out of scope.
2. Same duplicate pattern does **not** exist in `customize-trip.html` (single footer).
3. No `?v=` token needed bumping: `js/main.js` was NOT modified; the year script is
   inline per page, so it can never go stale.

## 5. Rollback

Exact original lines are recorded in
`_backups/2026-10-30-footer/BEFORE-footer.md`. Per page: delete the inserted
`<li>…Gallery/Galerie…</li>` line and restore the `<p>` line to its original text
(also remove the one-line `<script>` that follows it). Because this work is
uncommitted, `git checkout -- public_html/<file>` per single file also restores it.

---

# Addendum — 2026-10-31: duplicate-footer fix in customize-trip-fr.html

## What was wrong

`public_html/customize-trip-fr.html` contained **two `<footer>` elements**: the
real one (line 708) that was **never closed**, and a full duplicate nested inside
it (lines 751-795). The file's only `</footer>` (795) closed the INNER footer, so
everything after it (the two scripts, then the `<style>` block and remaining body
content) sat inside the still-open outer `<footer>` — invalid HTML, and on screen
it meant two stacked footers.

Front page: 55 `<footer>` opening tags vs 54 `</footer>` closing tags across the
54 pages — the only unbalanced file in the site.

## What was changed (this file only)

- Deleted the entire duplicated inner block: the `<!-- Footer -->` comment at
  ~751 and the nested `<footer class="footer">…</footer>` (was 752-795).
- Closed the real footer correctly: `        </div>` (container) +
  `    </footer>` — same indentation as every other page (e.g. `index-fr.html:780-781`).
- Whitespace-only: the two site scripts (`main.js`, `customize-form.js`) that sat
  at odd 12-space indent `customize-trip-fr.html:752-753` are now at 4 spaces,
  matching the twin page `customize-trip.html:917-918`. Content unchanged, URLs
  unchanged, `?v=20261030` preserved.

**Preserved in the single footer:** Galerie (`customize-trip-fr.html:725`),
Contact (`:726`), all Quick Links, contact info / WhatsApp lines, the
`© 2024–<span class="footer-year">2026</span> …` copyright (`:747`) and its
year-update script (`:748`, exactly one).

**Backup before edit:** `_backups/2026-10-31-footer-fix/BEFORE-customize-trip-fr.md`
(exact pre-edit text of lines 749-797 — the shell was dead, so snippet-level
checkpoint as usual; local-only, no git commit, no upload).

## Verification (2026-10-31)

| Check | Result |
|---|---|
| `<footer class="footer">` opening tags site-wide | **54** (exactly 1 per page) |
| `</footer>` closing tags site-wide | **54** (exactly 1 per page) |
| Nested/duplicate footers | **0** (was 1) |
| `class="copyright"` site-wide | **54** (exactly 1 per page) |
| Year-update script (`querySelectorAll('.footer-year')`) | **54** (exactly 1 per page — no duplicates) |
| `customize-trip-fr.html` footer content | 1 Ga… Galerie link, 1 Contact link, 1 copyright span with static `2026` fallback, 1 year script — verified by read `:738-753` |
| JS disabled | static fallback year `2026` is real text in HTML — renders without JS |
| Files modified | **1** (`public_html/customize-trip-fr.html`) — all other 53 pages and all CSS/JS/images untouched |

---

# Addendum 2 — 2026-10-31: single-year copyright (`© 2026`)

## Change

On **all 54 HTML pages**, inside the existing footer copyright `<p>` only:

```diff
- © 2024–<span class="footer-year">2026</span> Morocco Trek Tours. …
+ © <span class="footer-year">2026</span> Morocco Trek Tours. …
```

(`&copy; ` form kept on `index-fr.html` and `tours-fr.html`, matching their existing entity style.)

The `.footer-year` span, its static `2026` text, and the year-update script were **not
modified** — only the `2024–` prefix was deleted, so:
- renders as `© 2026 Morocco Trek Tours. All rights reserved.` / `Tous droits réservés.`
- single year only (no range);
- `2026` remains the visible fallback if JavaScript is off/blocked;
- the script keeps rewriting the span with the browser's current year each January;
- design/layout/links unchanged (same classes, same `<p>`, inline script invisible).

## Pre-edit evidence

grep `2024–` across `public_html/*.html` returned **exactly 54 matches — one per page,
all inside the copyright `<p>`**. No other occurrence anywhere.

## Validation (2026-10-31)

| Check | Result |
|---|---|
| Required format `© <year> Morocco Trek Tours …` on all 54 pages | **54/54** (52 literal `©` + 2 `&copy;` entity pages) |
| `2024–` remaining anywhere in HTML | **0 matches** |
| One copyright notice per page (`class="copyright"`) | **54** (untouched this task) |
| One year-update script per page (`querySelectorAll('.footer-year')`) | **54** (untouched this task) |
| Fallback year without JavaScript | static text `2026` inside `<span class="footer-year">` — verified by direct read (`index.html:642`); renders with JS disabled |
| Auto-update preserved | same ES5 IIFE at line 643 etc. — unchanged from the original implementation |
| `2026` HTML fallback kept | yes — literal text in markup on every page |

## Backup

`_backups/2026-10-31-copyright-single-year/BEFORE-copyright.md` — exact pre-edit text of
every copyright variant (3 groups) + rollback instructions. Local-only; no upload, no
git commit, no deploy. Modified files: **54** (all HTML pages under `public_html/`).
