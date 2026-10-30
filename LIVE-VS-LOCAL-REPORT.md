# LIVE vs LOCAL — Diagnosis Report

**Site:** https://moroccotrektours.com/
**Local project:** `C:\Users\user\Downloads\moroccotrektours-working`
**Date of measurement:** 2026-10-30, 16:55–17:00 UTC (live `Last-Modified` on all HTML/CSS/JS: `Fri, 30 Oct 2026 15:53 GMT`)
**Mode:** diagnosis only — **no file was modified, nothing was deployed, no cache or server setting was changed.**

### How the comparison was made

| Step | Method |
|---|---|
| Local bytes | Local files were handed to the browser (`browser.files.upload`) and hashed in-page with `crypto.subtle.digest('SHA-256')` — the local file is never re-written or printed |
| Live bytes | `fetch(url, {cache:'no-store', cache-busting query})` from the live origin, hashed the same way |
| Live rendering | `getComputedStyle`, CSSOM rule matching (including inside `@media`), DOM/DOMParser inspection of all 53 sitemap pages |
| Images | HTTP status + `Content-Type` + byte length + `naturalWidth/Height` + 32×32 pixel-grid comparison against the local file |
| Headers | Full response headers for HTML / CSS / JS / JPEG (CDN, cache, ETag, Last-Modified) |

**Limits:** the shell/exec runner is dead in this session (every command returns nothing), so `git diff`, `php -l` and a local HTTP server were unavailable. Screenshots fail ("needs a visible tab") and no viewport/device emulation tool exists, so **every mobile-viewport claim below is static CSS analysis, not a pixel observation.** Nothing below is asserted as "visually tested".

---

## Verdict in one paragraph

The published files are **not outdated**. Every HTML/CSS/JS file that matters is byte-identical to local, every hero image exists live with HTTP 200 and valid dimensions, and the live language switcher computes to the **new** pill design on all six page types tested. What remains are four *real* defects that can produce exactly the reported symptoms on a visitor's machine — all of them in caching policy and in legacy/duplicate CSS that the project itself still ships. The strongest single explanation for "some improvements are live, others look old, and the hero is missing on my device but fine locally" is the **7-day public cache on unversioned CSS/JS** combined with **mobile hero rules that break on iOS and on any stale copy of `mobile-fixes.css`**.

---

## 1. File version mismatch

### 1.1 Byte-for-byte result

16 representative files were re-hashed today (after the 15:53 UTC re-upload). **All identical.**

| File | Local bytes | SHA-256 (first 16 hex) | Live | Same |
|---|---|---|---|---|
| `index.html` | 27,679 | `547fec60585c8435` | 200 | ✅ |
| `index-fr.html` | 31,696 | `4c4eab553c772cf4` | 200 | ✅ |
| `tours.html` | 66,153 | `67ea6c6ea8ffaa95` | 200 | ✅ |
| `contact.html` | 21,736 | `d2598f2a75ce4a2b` | 200 | ✅ |
| `about.html` | 17,230 | `6e2ca8fc4ef70fb5` | 200 | ✅ |
| `tour-toubkal.html` | 53,039 | — | 200 | ✅ |
| `tour-10-days.html` | 40,693 | — | 200 | ✅ |
| `blog-fr.html` | 19,029 | — | 200 | ✅ |
| `customize-trip-fr.html` | 60,135 | — | 200 | ✅ |
| `css/styles.css` | 76,923 | `7ca899dbcc2d12f6` | 200 | ✅ |
| `css/mobile-fixes.css` | 10,299 | `3352d88f53b4445a` | 200 | ✅ |
| `css/luxury-pricing.css` | 26,342 | — | 200 | ✅ |
| `js/main.js` | 62,600 | `7ef994fbd06743fb` | 200 | ✅ |
| `images.json` | 17,049 | — | 200 | ✅ |
| `sitemap.xml` | 20,305 | — | 200 | ✅ |
| `robots.txt` | 78 | — | 200 | ✅ |

A full sweep on 2026-10-28 had already returned **70/70 identical** (54 HTML, 9 JS, 4 CSS, plus `images.json`, `sitemap.xml`, `robots.txt`). The hashes of `styles.css`, `main.js`, `tours.html`, `contact.html`, `index.html` are unchanged since then.

**Finding 1.1 — Result: no outdated HTML/CSS/JS on the server.** (Confirmed)
Expected: any local edit absent live. Actual: zero byte differences.
Local path: `public_html/<file>` → Live URL: `https://moroccotrektours.com/<file>`

### 1.2 What *is* different: the hero JPEGs

The hero images are the **only** files whose bytes differ, and they differ consistently (see §2.2). This is not a deployment gap — the live copies are valid, same-aspect, visually equivalent downscaled copies.

### 1.3 Duplicate / conflicting references

| Item | Where | Finding |
|---|---|---|
| One `css/styles.css` per page | all 53 sitemap pages | exactly 1 reference, no duplicates ✅ |
| One `css/mobile-fixes.css` per page | all 53 pages | exactly 1 ✅ |
| One `js/main.js` per page | all 53 pages | exactly 1 ✅ |
| No duplicated `<link>`/`<script>` | all 53 pages | 0 pages with duplicate asset refs ✅ |
| Inline `<style>` blocks | 1–6 per page, 4,796–28,987 chars | `index.html` carries **4 blocks / 26,082 chars**; large duplicated rule sets |
| Legacy switcher CSS inside pages | **53/53 pages**, 60 blocks | `.lang-switcher:hover .lang-dropdown` etc. still shipped in every page |
| Legacy switcher CSS in `styles.css` | `css/styles.css:2382-2430`, `3427-3450` | old square/transparent button, re-declared |
| Legacy switcher CSS in `luxury-pricing.css` | `css/luxury-pricing.css:1309-1328` | loaded **after** `mobile-fixes.css` on all 30 tour pages |
| Dead Node script | `index.html:659` `<script src="/socket.io/socket.io.js">` | 404 live, `window.io === undefined` |

All of the legacy switcher rules are **out-specified** by the authoritative `body .lang-switcher …` block (`css/styles.css:754-870`), which is why the live result is still correct (§3). The risk is fragility, not current breakage.

---

## 2. Hero image failure

### 2.1 Every hero reference, resolved

| Reference (file:line) | Declared URL | Base used by browser | Live result |
|---|---|---|---|
| `index.html:34` / `:35` (preload) | `images/hero/hero_home.jpg` / `hero_home_mobile.jpg` | document `/` | 200 / 200 |
| `index.html:46` / `:61` (`.hero-fix`) | same two | document `/` | 200 / 200 |
| `index.html:407` inline style | (no image; size/position only) | — | hero paints via CSS |
| `css/styles.css:42-43` | `../images/hero/hero_home.jpg` / `_mobile` | **CSS file** `/css/` → `/images/hero/…` | 200 / 200 |
| `css/styles.css:44-45` | `../images/hero/hero_tours.jpg` / `_mobile` | `/css/` | 200 / 200 |
| `css/styles.css:46` | `../images/hero/hero_contact.jpg` | `/css/` | 200 |
| `css/styles.css:47` | `../images/hero/hero_contact_mobile.jpg` | `/css/` | **404 — file does not exist locally either** |
| `css/styles.css:48` | `../images/hero/hero_customize.jpg` | `/css/` | 200 |
| `css/styles.css:49` | `../images/hero/hero_customize_mobile.jpg` | `/css/` | **404 — file does not exist locally either** |
| `css/styles.css:50-53` | `hero_guide(.jpg/_mobile)`, `hero_about(.jpg/_mobile)` | `/css/` | 200 (all four) |
| `tour-*.html` (30 pages, e.g. `tour-toubkal.html:475`) | `images/tours/...` inline | document `/` | **30/30 → 200** |

CSS-relative resolution is **correct**: `url('../images/…')` inside `/css/styles.css` resolves to `/images/…`, verified by the live computed value `url("https://moroccotrektours.com/images/hero/hero_home.jpg")`. Page-relative `url('images/…')` in the inline `<style>` blocks is also correct because **all 54 pages sit at the web root** (there is no sub-directory page anywhere).

`https://moroccotrektours.com/images/hero/` itself returns **403**, which is `Options -Indexes` (`public_html/.htaccess:19`), *not* a missing directory.

### 2.2 Hero file inventory — local vs live

Local: `public_html/images/hero/` contains exactly 10 files. Live status per file:

| File | Local bytes | Live bytes | Local dims | Live dims | Live HTTP | Pixel diff (32×32) |
|---|---|---|---|---|---|---|
| `hero_home.jpg` | 289,616 | 251,840 | 1591×895 | 1591×895 | 200 | 0.6 |
| `hero_home_mobile.jpg` | 109,304 | 94,605 | 503×895 | 503×895 | 200 | 0.8 |
| `hero_tours.jpg` | 116,686 | 100,377 | 1280×519 | 1280×519 | 200 | 0.6 |
| `hero_tours_mobile.jpg` | 49,041 | 42,499 | 292×519 | 292×519 | 200 | 1.1 |
| `hero_contact.jpg` | 921,875 | 345,316 | 2546×1222 | **1600×768** | 200 | 13.3 |
| `hero_guide.jpg` | 297,209 | 257,062 | 1536×672 | 1536×672 | 200 | 1.1 |
| `hero_about.jpg` | 1,778,337 | 326,912 | 3840×1376 | **1600×573** | 200 | 19.9 |
| `hero_customize.jpg` | 450,282 | 266,126 | 1920×804 | **1600×670** | 200 | 13.2 |
| `hero_contact_mobile.jpg` | **absent** | — | — | — | **404** | — |
| `hero_customize_mobile.jpg` | **absent** | — | — | — | **404** | — |

**Reading of this table**

* Every referenced hero image **exists live** and decodes (non-zero `naturalWidth/Height`).
* Aspect ratios are identical to local; only the width is capped at **1600 px** (`3840→1600`, `2546→1600`, `1920→1600`) while files already ≤1600 px keep their dimensions but are re-compressed. That pattern is characteristic of **automatic image optimisation on the Hostinger CDN** (classified *suspected* — the mechanism cannot be proven from outside, but the 1600 px cap is unambiguous).
* The pixel-grid differences (0.6–1.1 for unchanged dimensions, 13–20 for downscaled ones) are consistent with re-compression/downscaling of the **same photograph**, not a substituted or blank image.
* **No hero asset is missing on the server.** (Confirmed)

### 2.3 Why a hero can still render blank — the four provable paths

**(a) `styles.css:47` and `:49` point at files that have never existed.**
They are only neutralised by the override in `css/mobile-fixes.css:217-220`:

```css
:root {
    --hero-contact-mobile: url('../images/hero/hero_contact.jpg');
    --hero-customize-mobile: url('../images/hero/hero_customize.jpg');
}
```

On the current live CSS the contact page computes `url("…/hero_contact.jpg")` — correct. But the backup copy `_backups/2026-10-24-mobile-fixes/css/mobile-fixes.css.bak` (the pre-2026-10-24 file) **does not contain that block**. Any browser or edge node still holding that older `mobile-fixes.css` gets `hero_contact_mobile.jpg` / `hero_customize_mobile.jpg` → **404 → no background → blank hero** on the mobile versions of `contact.html`, `contact-fr.html`, `customize-trip.html`, `customize-trip-fr.html`. And `mobile-fixes.css` is currently cached for 7 days (§5.1), so this is a reachable state.
Classification: **confirmed defect (latent), suspected trigger** for the reported symptom.

**(b) The 30 tour pages cannot be fixed by the mobile CSS at all.**
They use a classless, fully inline hero (`tour-toubkal.html:467-481`):

```html
<div style="position: sticky; top: 0; width: 100%; height: 100vh; z-index: 1;">
  <div style=" … background-image: url('images/tours/toubkal/toubkal_summit1.jpg');
              background-size: cover; … background-attachment: fixed; …"></div>
```

Verified across **all 30 `/tour-*.html` pages**: 30/30 hero images return 200, 30/30 use inline `background-attachment: fixed`, **0/30 have a `.tour-hero` or `.hero-section` class**. Therefore `css/mobile-fixes.css:29-42`, which sets `background-attachment: scroll` for `.tour-hero, .hero-section` on `max-width:768px`, **never applies to any tour page**. On iOS Safari a fixed background attachment is not painted as expected; the usual visible result is a blank/static hero. This is the most likely mobile-only "missing hero".
Classification: **confirmed code defect** (the override is unreachable); iOS blank-render is **suspected** (not verifiable here — no device emulation).

**(c) `mobile-fixes.css:12-33` forces the *home* hero on every element with those classes**, using `!important`:

```css
.tour-hero, .hero-section { background-image: var(--hero-desktop) !important; }
```

Today it is overridden by page-specific inline `!important` rules (e.g. `contact.html:197-207`, `about.html:61-71`, `tours.html:236-252`), which is why `tours.html` computes `hero_tours.jpg` and `about.html` computes `hero_about.jpg`. Any page (or any future template) that lacks such an inline override would silently show the **home** hero instead of its own.
Classification: **confirmed conflict**, currently masked.

**(d) `background-attachment: fixed` on non-tour pages** (`css/styles.css:886`, and `mobile-fixes.css:19`) is also active above 768 px, so iPad-landscape widths keep `fixed`. Same iOS risk as (b), narrower window.
Classification: **suspected**.

---

## 3. The language switcher

### 3.1 Same markup, same JS, same CSS everywhere

* Markup is identical on all 53 pages: `li.lang-switcher > button.lang-btn > i.fa-globe + span + i.fa-chevron-down` plus `ul.lang-dropdown`. (`tour-toubkal.html:451-461`, `index.html` equivalent.)
* Behaviour is in `js/main.js` only (`index.html:421` comment confirms; single `js/main.js` on every page). Live `main.js` is byte-identical (`7ef994fb…`).
* Runtime state on live pages: `class="lang-switcher is-ready"`, button `aria-expanded="false"`, dropdown `opacity: 0` while closed — i.e. **the new component initialised**. (`is-ready` is the flag added by the rewritten switcher; see `styles.css:705-714`.)

### 3.2 Measured live appearance (6 page types)

| Page | `border-radius` | `padding` | `background` | `font-weight` | `is-ready` |
|---|---|---|---|---|---|
| `/index.html` | 30px | 8px 16px | `rgb(255,255,255)` | 600 | ✅ |
| `/contact.html` | 30px | 8px 16px | white | 600 | ✅ |
| `/tours.html` | 30px | 8px 16px | white | 600 | ✅ |
| `/about.html` | 30px | 8px 16px | white | 600 | ✅ |
| `/customize-trip.html` | 30px | 8px 16px | white | 600 | ✅ |
| `/tour-toubkal.html` | 30px | 8px 16px | white | 600 | ✅ |
| `/blog.html` (heaviest legacy CSS) | 30px | 8px 16px | white | 600 | ✅ |

This is the **new** design on every page tested — not the old square/transparent button. (Confirmed)

### 3.3 Where the "old version" still lives

| Location | What it contains | Status |
|---|---|---|
| `css/styles.css:2382-2430` | `.lang-btn { border:1px solid primary; border-radius:6px; background:transparent }` | dead — out-specified |
| `css/styles.css:3427-3450` | legacy dropdown (`border-radius:8px`, `#eee` separators) | dead |
| `css/luxury-pricing.css:1309-1328` | `.lang-btn{font-size:.9rem;padding:8px 15px}`, static dropdown | dead; and it loads **after** `mobile-fixes.css` on 30 tour pages (`tour-*.html:43-46`) |
| 60 inline `<style>` blocks across **all 53 pages** (e.g. `blog.html:129-172`, `contact.html:123`, `index.html:144,155`) | hover-driven `.lang-switcher:hover .lang-dropdown` with `!important`, transparent button, `padding:5px 10px` | dead — out-specified by `styles.css:754-870` |

**Mechanism that would make it look old:** these legacy rules are only beaten by the `body`-scoped `!important` block. If a visitor's browser holds a `styles.css` from *before* that block was added (7-day cache, §5.1) then the inline page rules at `blog.html:129-172` / `contact.html:123` take over — square button, transparent background, hover-only dropdown, `z-index:1000` instead of `1200`. That is exactly the "older language switcher" appearance.
Classification: **confirmed defect (duplicate/conflicting CSS shipped), suspected trigger via cache.**

### 3.4 Graceful-degradation caveat

`css/styles.css:742-745` deliberately restores **hover-open** behaviour when JS has not initialised:

```css
body .lang-switcher:not(.is-ready):hover .lang-dropdown,
body .lang-switcher:not(.is-ready):focus-within .lang-dropdown { … }
```

So if `js/main.js` fails for any reason (e.g. the unguarded `localStorage` calls at `main.js:413` / `:818` in a storage-blocked context), the switcher **legitimately falls back to the old hover menu** until reload. That is a second, independent way to see the "old" switcher while everything is deployed correctly.
Classification: **confirmed design fallback**, suspected contributor.

---

## 4. File organisation

### 4.1 Actual local structure

```
C:\Users\user\Downloads\moroccotrektours-working\
├─ public_html\               ← web root (all 54 pages live flat at the root)
│  ├─ *.html                  54 files (27 EN + 27 FR)
│  ├─ css\                    styles.css, mobile-fixes.css, luxury-pricing.css, site-common.css (4)
│  ├─ js\                     main.js + pricing/quote/customize/contact/analytics (9)
│  ├─ images\                 hero(10), tours, gallery, assets, blog, destinations + 27 loose files
│  ├─ includes\               mailer.php (stub) + .htaccess
│  ├─ .htaccess               deny rules, security headers, Options -Indexes
│  ├─ send-email.php, send-custom-trip.php, generate-csrf-token.php
│  ├─ images.json, sitemap.xml, robots.txt, cms-manifest.json, package*.json
│  └─ logo-combined.svg, logo-symbol-professional.svg, logo-text-only.svg
├─ private\                   email-config.php (+ .example) — outside docroot
├─ vendor\                    Composer/PHPMailer 7.1.1 — outside docroot
├─ tools\                     generate-images-json.js, watch-images.js, prepare-mail-deploy.ps1, verify-mail-setup.php
├─ _backups\                  6 dated folders (10-24 … 10-28)
├─ server.js                  Node/Express dev server (not used by Hostinger)
└─ *.md reports (ARCHITECTURE, CHANGELOG, PROJECT-MAP, audits…)
```

No page lives in a sub-directory, so no page-level relative path can be wrong through depth. All relative refs were resolved and status-checked: **63 of 65 unique images return 200; the only two 404s are the unused `_mobile` variables** described in §2.3(a).

### 4.2 Obsolete / duplicate assets

| Item | Evidence | Impact |
|---|---|---|
| `public_html/logo-combined.svg`, `logo-symbol-professional.svg`, `logo-text-only.svg` | 0 references in any HTML/CSS/JS/PHP; all serve 200 | dead files, public |
| `public_html/includes/mailer.php` | stub, 0 references | dead |
| `public_html/css/site-common.css` (68 B) | linked only by `customize-trip.html:44` / `-fr.html:44`; its single rule `--hero-bg: url("images/tours/toubkal/toubkal_summit1.jpg")` is **never consumed**, and is overridden inline by `customize-trip.html:45` → `--hero-bg: url("")` | dead weight; the URL inside it is CSS-relative and would 404 if ever used |
| `public_html/images.json` — 23 of 62 `url` values | 404 live **and** absent locally (e.g. `images/destinations/ait_bougmez.jpg`, `images/tours/saghro/saghro_main.jpg`); 62 `thumb` entries point at the absent `images/thumbs/` | **no runtime effect**: `js/main.js:140-146` filters to `images/gallery/`, and all 23 gallery originals return 200 |
| `public_html/cms-manifest.json`, `package.json`, `package-lock.json`, `server.js`, `*.md` inside the web root | blocked by `public_html/.htaccess:34` (`FilesMatch`) | reachable only if `.htaccess` is lost |
| `/socket.io/socket.io.js` (`index.html:659`) | 404 live; `window.io === undefined`; `js/main.js:265` guards with `typeof io !== 'undefined'` | 1 wasted 404 per homepage load |

### 4.3 Wrong / risky relative paths (none currently broken, two fragile)

| File:line | Path | Why it matters |
|---|---|---|
| `css/styles.css:47,49` | `../images/hero/hero_contact_mobile.jpg`, `…hero_customize_mobile.jpg` | files do not exist; correctness depends entirely on a later stylesheet |
| `css/site-common.css:1` | `images/tours/toubkal/toubkal_summit1.jpg` (CSS-relative → `/css/images/…`) | would 404; unused today |
| `tour-*.html:475` (and 29 siblings) | inline `images/tours/…` in a `style` attribute | valid only because pages are at the root |

---

## 5. Live server

### 5.1 Caching — the decisive finding

| Resource | `Cache-Control` | `Expires` | ETag / Last-Modified | CDN status |
|---|---|---|---|---|
| `index.html` | **none** | — | `"6c1f-…;br"` / `2026-10-30 15:53:29` | `x-hcdn-cache-status: DYNAMIC` |
| `css/styles.css` | `public, max-age=604800` | `+7 days` | `"12c7b-…;br"` | `MISS` |
| `css/mobile-fixes.css` | `public, max-age=604800` | `+7 days` | `"283b-…;br"` | — |
| `js/main.js` | `public, max-age=604800` | `+7 days` | `"f488-…;br"` | `MISS` |
| `images/hero/*.jpg` | `public, max-age=604800` | — | — | `MISS` |

**No fingerprinting anywhere:** every page links `css/styles.css`, `css/mobile-fixes.css`, `js/main.js` **without `?v=…`** (verified: `versioned: false` on all 53 pages). The 7-day `max-age` is **not** in `public_html/.htaccess` (that file only sets `nosniff` / `X-Frame-Options` at lines 24-27) — it is injected by the Hostinger platform.

Consequence: for 7 days a returning visitor keeps **whatever CSS/JS they downloaded last**, while HTML revalidates (`ETag`) and is always current. That is precisely "some local improvements appear live, others stay outdated".
Classification: **confirmed** (headers + absence of versioning).

### 5.2 Platform

| Check | Result |
|---|---|
| CDN | `server: hcdn`, `platform: hostinger`, `panel: hpanel`, `x-hcdn-cache-status`, `x-hcdn-request-id …-int-edge8` |
| Cloudflare | **not in use** — no `cf-ray`, no `cf-cache-status` |
| HTTP/3 | advertised (`alt-svc: h3=":443"`) |
| Compression | Brotli (`content-encoding: br`) on HTML/CSS/JS; zstd on error pages |
| `http://` → `https://` | ✅ redirects (`http://moroccotrektours.com/index.html` lands on `https://…`) |
| `www` → apex | ❌ **not redirected**; `https://www.moroccotrektours.com/` serves 200 directly (duplicate host, separate cache entry) |
| `/images/hero/` | 403 (`Options -Indexes`, `.htaccess:19`) — not evidence of a missing folder |
| `/vendor/`, `/private/`, `/includes/`, `/tools/` | 403 by design (`public_html/.htaccess:52-57,67`) |
| Service worker | none (no registration in `js/main.js`) |
| `css/site-common.css` | 200, 68 B (deployed, dead) |

### 5.3 Live 404 inventory (whole site)

Full sweep of the 53 sitemap pages + the 3 site stylesheets: 65 unique image URLs → **63 × 200, 2 × 404** (`hero_contact_mobile.jpg`, `hero_customize_mobile.jpg` — declared in `styles.css` but never used after the `mobile-fixes.css` override). Plus one script 404 (`/socket.io/socket.io.js`, `index.html:659`) and 23 stale `images.json` entries that are never requested. **No unexpected redirect loops, no missing page assets.**

---

## 6. Symptom → evidence

| Reported symptom | What the evidence shows | Verdict |
|---|---|---|
| "Live styles are outdated" | Live `styles.css`/`mobile-fixes.css`/`main.js` byte-identical to local **and** freshly re-uploaded at 15:53 UTC today; but served with `max-age=604800` and no `?v=` | **Server files are current.** Stale *client/edge copy* is the only mechanism left — confirmed caching defect, suspected cause of what you saw |
| "Language switcher looks like the older version" | Computed style is the new 30px pill on 6/6 page types; `is-ready` present; 60 legacy `!important` blocks still shipped and only beaten by specificity | **Current.** Old look is reachable only via cached pre-fix `styles.css`, or via the documented `:not(.is-ready)` hover fallback when JS fails |
| "Hero image missing live, fine locally" | All hero assets 200 with valid dimensions; computed background resolves; live copies are CDN-downscaled but visually equivalent | **Not reproducible server-side.** Reachable paths: stale `mobile-fixes.css` missing the `:root` override → 404 on contact/customize mobile (defect confirmed); iOS + `background-attachment: fixed` on the 30 tour pages, whose inline hero no media query can reach (defect confirmed, iOS render suspected) |
| "Some improvements are live, others aren't" | HTML always revalidates → new markup live immediately; CSS/JS pinned for 7 days → old styling until cache expiry | **Confirmed** — this is the caching asymmetry, not a partial deploy |

---

## 7. Root causes

| # | Cause | File:line | Class |
|---|---|---|---|
| RC-1 | Unversioned CSS/JS served with `Cache-Control: public, max-age=604800`; HTML revalidates. Old CSS survives up to 7 days after a deploy | `index.html:213,215,660` (and every page's `<head>`); header injected by Hostinger CDN | **Confirmed** |
| RC-2 | Two hero variables point at files that never existed; correctness depends on a later stylesheet | `css/styles.css:47,49` + `css/mobile-fixes.css:217-220` | **Confirmed defect** (trigger suspected) |
| RC-3 | Tour heroes are classless inline blocks with `background-attachment: fixed`; the mobile override targets classes the markup does not have | 30 × `tour-*.html:467-481`; `css/mobile-fixes.css:29-42` | **Confirmed defect**; iOS blank render **suspected** |
| RC-4 | `!important` home-hero rule applies to every `.hero-section` / `.tour-hero`, masked page-by-page by inline `!important` | `css/mobile-fixes.css:12-33` | **Confirmed conflict** |
| RC-5 | Legacy switcher CSS duplicated in 53 pages + 3 stylesheets; only specificity keeps the new design | `css/styles.css:2382-2430,3427-3450`; `css/luxury-pricing.css:1309-1328`; 60 inline blocks | **Confirmed defect (latent)** |
| RC-6 | Live hero JPEGs are downscaled/recompressed (≤1600 px), not the uploaded bytes | `images/hero/*.jpg` | Bytes **confirmed** different; CDN optimisation **suspected** |
| RC-7 | Dead Node script requested on every homepage load | `index.html:659` | **Confirmed** (harmless, guarded) |
| RC-8 | Stale `images.json` records (23 URLs) | `images.json` (e.g. lines 5, 15, 25, 35, 45) | **Confirmed** (filtered out by `main.js:140-146`) |

---

## 8. Recommended corrections (not applied)

Ordered by impact on the reported symptoms. Nothing here was executed.

1. **Stop the stale-CSS problem (highest impact).**
   * Add a content hash to every stylesheet/script reference — `css/styles.css?v=<hash>`, `css/mobile-fixes.css?v=<hash>`, `js/main.js?v=<hash>`, and the two hero `<link rel=preload>` in `index.html:34-35` / `index-fr.html:33-34`.
   * Or, if URLs must stay stable, override caching for text assets in `public_html/.htaccess` (after line 27):
     `<FilesMatch "\.(css|js)$"> Header set Cache-Control "public, max-age=300, must-revalidate" </FilesMatch>` and `Header set Cache-Control "no-cache"` for `text/html`.
   * Then purge the Hostinger CDN cache once (owner action).
2. **Make the contact/customize mobile heroes independent of stylesheet order.** Point `css/styles.css:47` and `:49` at `hero_contact.jpg` / `hero_customize.jpg` (or delete the two unused variables). This removes the only real 404s on the site.
3. **Reach the tour heroes on mobile.** Either add `class="tour-hero"` to the wrapper at `tour-*.html:467` so `css/mobile-fixes.css:29-42` applies, or change the inline `background-attachment: fixed` (line 479 in each of the 30 files) to `scroll`.
4. **Make the switcher single-source.** Delete the 60 inline legacy blocks and `css/styles.css:2382-2430,3427-3450` + `css/luxury-pricing.css:1309-1328` once `styles.css:754-870` is confirmed on staging. Keep the `:not(.is-ready)` fallback.
5. **Remove `index.html:659`** (`/socket.io/socket.io.js`) — it belongs to `server.js`, not to the Apache deployment.
6. **Optional:** prune the 23 dead `images.json` records and the three unused root SVG logos + `includes/mailer.php` + `css/site-common.css`.
7. **Optional:** redirect `www` → apex (`.htaccess` `RewriteCond %{HTTP_HOST} ^www\.`), so both hosts share one cache entry.

### How to verify afterwards (suggested, not performed)

```
1. Hard-reload twice, then in DevTools → Network confirm styles.css request carries ?v=…
2. Response headers: Cache-Control must no longer be max-age=604800 for css/js.
3. Contact/customize on a 390 px viewport: computed background-image must be hero_contact.jpg / hero_customize.jpg (no 404 in Network).
4. A tour page on iOS (or Safari Responsive Design Mode): hero must paint; computed background-attachment must be scroll.
5. Switcher: border-radius 30px, padding 8px 16px, aria-expanded toggling, dropdown z-index 1200.
```

---

## 9. What could not be verified here

| Item | Reason |
|---|---|
| Visual rendering (desktop/mobile screenshots) | `browser.screenshot` fails: "needs a visible tab" |
| Mobile/tablet viewport behaviour | no device/viewport emulation tool available; §2.3(b)/(d) are static CSS analysis |
| Exact stale copy in the user's browser | requires the visitor's own DevTools / cache state |
| Hostinger CDN image-optimisation setting | no account access; inferred from the consistent 1600 px cap |
| Local `git diff` / `php -l` | shell/exec runner returns no output this session |

**Nothing was modified, deployed, purged or reconfigured while producing this report.**
