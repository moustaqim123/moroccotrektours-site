# Final Pre-Deployment Audit — Morocco Trek Tours

Audit of the five local fixes described in `FRONTEND-FIX-REPORT.md`, against
`LIVE-VS-LOCAL-REPORT.md` §8.

**No file was modified during this audit.** The only file written is this report.
Nothing was deployed, uploaded, purged or reconfigured.

Method: static inspection of the working tree (`grep` / file reads). The shell
runner is still non-functional, so `git diff`, `php -l`, `node --check` and any
rendering/device test were **not** possible — every such item is marked
NOT VERIFIED, not PASS.

---

## Verdict summary

| # | Check | Verdict |
|---|---|---|
| A1 | Every local CSS/JS reference carries `?v=20261030` | **PASS** |
| A2 | All 54 pages covered (EN, FR, tour, contact, customize) | **PASS** |
| A3 | Inline references | **PASS** |
| A4 | Dynamically loaded local assets | **PASS** |
| A5 | No accidental external-URL changes | **PASS** |
| A6 | Hero `<link rel=preload>` versioned (§8.1) | **FAIL** (deliberate, documented) |
| A7 | No duplicate version params | **PASS** |
| A8 | `defer` / `async` attributes preserved | **PASS** |
| A9 | Exactly one `styles.css` / `mobile-fixes.css` / `main.js` per page | **PASS** |
| B1 | Enumerate every element matched by the hero selector | **PASS** (30 matches) |
| B2 | All matches are intended hero backgrounds | **PASS** |
| B3 | Non-hero elements affected on mobile | **PASS** (none) |
| B4 | Desktop behaviour unchanged | **PASS** |
| B5 | Override actually beats the inline declaration | **PASS** |
| C1 | Switcher keeps all layout/open/close/focus/mobile rules | **PASS** |
| C2 | Removed legacy blocks not required by another component | **PASS** |
| C3 | Remaining inline blocks left intact (as instructed) | **PASS** |
| C4 | Mobile switcher spacing preserved | **PASS** |
| C5 | `:not(.is-ready)` fallback preserved | **PASS** |
| D1 | Fix 1 vs §8.1 | **FAIL** (preloads only; rest PASS) |
| D2 | Fix 2 vs §8.2 | **PASS** |
| D3 | Fix 3 vs §8.3 | **PASS** |
| D4 | Fix 4 vs §8.4 | **FAIL** (stylesheet rules done; 60 inline blocks deferred) |
| D5 | Fix 5 vs §8.5 | **PASS** |
| E1 | Backup exists and covers every changed region | **PASS** |
| E2 | Rollback instructions accurate | **FAIL** (2 documentation defects) |
| E3 | Backup survivability | **FAIL** (gitignored, no full-file snapshot) |
| F1 | No unintended changes outside the five fixes | **NOT VERIFIED** (no `git diff`) |
| F2 | CSS/JS syntax validity | **NOT VERIFIED** (no linter; brace balance read manually) |
| F3 | Mobile/iOS rendering of the hero fix | **NOT VERIFIED** (no browser/device) |
| F4 | `?v=` actually busts the Hostinger CDN cache | **NOT VERIFIED** (not deployed) |

---

## A. Reference coverage (Fix 1)

### A1 — every local CSS/JS reference is versioned: PASS

Pattern hunt for a local reference **not** followed by a query string
(`css/….css["')]` and `js/….js["')]`, which also catches single-quoted values and
`url()` usage):

- **54 hits, all of them the external Font Awesome CDN URL**
  (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`,
  one per page, e.g. `blog.html:36`).
- **Zero local CSS/JS references remain unversioned.**

Reverse check for a leaked version param on an absolute URL
(`https?://…?v=20261030`): **0 hits**. `og:image`, `twitter:image`, `hreflang` and
`preconnect` values are untouched.

### A2 — all 54 pages covered: PASS

`glob public_html/**/*.html` = **54 files**; the Font Awesome hit count is also 54,
i.e. every page was inspected. Per-reference totals:

| Reference | Expected | Found |
|---|---|---|
| `css/styles.css?v=20261030` | 54 (1/page) | **54** |
| `css/mobile-fixes.css?v=20261030` | 54 (1/page) | **54** |
| `js/main.js?v=20261030` | 54 (1/page) | **54** |
| `css/luxury-pricing.css?v=20261030` | 30 tour pages | **30** (1 replacement recorded per page) |
| `js/pricing-system.js?v=20261030` | 30 tour pages | **30** (3 JS refs/page on 30 pages = 90) |
| quote / toubkal pricing JS | 30 | **15 EN** (14 `-quote.js`, 1 `-toubkal.js`) + **15 FR** (14 `-quote-fr.js`, 1 `-toubkal-fr.js`) |
| `css/site-common.css` / `js/customize-form.js` | 2 / 2 | **2 / 2** |
| `js/contact-form.js` | 2 | **2** |
| `js/cta-whatsapp-analytics.js` | 2 | **2** |
| **Total** | **260** | **260** |

Per-page spot checks (read directly):

| Page type | File | Refs | Lines |
|---|---|---|---|
| Normal EN | `blog-atlas.html` | 3 | 40, 42, 422 |
| Normal FR | `tour-10-jours.html` (FR tour) | 6 | 40, 42, 44, 944, 946, 947 |
| Home | `index.html` | 4 | 213, 215, 409, 659 |
| Tours hub | `tours.html` | 3 | 43, 45, 1443 |
| Tour detail | `tour-toubkal.html` | 6 | 43, 44, 46, 1112, 1114, 1115 |
| Contact | `contact.html` | 4 | 40, 42, 577, 578 |
| Customize | `customize-trip.html` | 5 | 40, 42, 44, 917, 918 |

`index.html` correctly has 4 (not 5): the home page loads no pricing CSS.

### A3 — inline references: PASS

- No `@import` of a local stylesheet in any HTML page; the single `@import` in the
  project is `css/styles.css:1` → Google Fonts (external, unchanged).
- No `rel="manifest"`, no `rel="modulepreload"`, no `<link rel=preload as="style">`
  or `as="script">` anywhere.
- Inline `<style>` blocks reference **images** (`hero_*.jpg`, tour JPEGs), not CSS/JS.

### A4 — dynamically loaded local assets: PASS

- `js/main.js:6` and `js/main.js:134` — `fetch('images.json', { cache: 'no-store' })`.
  A version param would be meaningless here: the request already bypasses the cache
  and the file is data, not CSS/JS.
- `js/main.js:1224-1225` — injects `https://cdn.jsdelivr.net/npm/animejs@3.2.2/…`
  (external, unchanged).
- `js/main.js:23/53/84/168` — assign `img.src` from `images.json` (images).
- No `createElement('link'|'script')` pointing at a local file, no `import()`, no
  service worker registration anywhere.

### A5 — external URLs: PASS

Unchanged: Font Awesome `6.0.0` (54 pages), Google Fonts stylesheet + 2 preconnects
(54 pages), `cdn.jsdelivr.net` anime.js (runtime), Google Maps embeds
(`contact.html:488`, `contact-fr.html:548`). None carries `?v=20261030`.

### A6 — hero preloads: **FAIL (deviation)**

`rel="preload" as="image"` tags remain unversioned — **10 tags on 6 pages**:

| Page | Lines |
|---|---|
| `index.html` | 34, 35 |
| `index-fr.html` | 33, 34 |
| `tours.html` | 33, 34 |
| `tours-fr.html` | 35, 36 |
| `tour-toubkal.html` | 33 |
| `tour-toubkal-fr.html` | 33 |

`LIVE-VS-LOCAL-REPORT.md:332` explicitly recommends versioning the two
`index.html:34-35` / `index-fr.html:33-34` preloads, so this is a **literal
non-compliance**, not a free choice. It is intentional and benign:

- the preloaded JPEGs are also referenced **without** a version by the same page
  (e.g. `index.html:46` and `:61`, `tours.html:236/252/945`, `tour-toubkal.html:475`),
  so versioning the preload alone would make the preload URL ≠ the used URL →
  **two downloads** of the hero and a useless preload;
- versioning both sides means changing hero-image cache keys on 6 pages plus
  `styles.css:42-53` and `mobile-fixes.css:227-230` — a forced re-download for
  images that did not change, for zero staleness benefit.

Remedy if you want literal compliance: version the 10 preloads **and** every
matching `url()` in the same commit (≈19 line edits) so cache keys stay identical.

### A7/A8/A9: PASS

- Duplicate params (`?v=…?v=`, `&v=…`): **0**.
- `defer` on `customize-trip.html:918` / `customize-trip-fr.html:793` and `async` on
  `index.html:409` / `index-fr.html:536` are preserved.
- One `styles.css`, one `mobile-fixes.css`, one `main.js` per page (54/54/54); no page
  loads a second copy of any of them.

---

## B. Mobile hero override (`div[style*="background-attachment: fixed"]`)

### B1 — every matched element: PASS (30 matches, 1 per tour page)

The selector only matches an **inline `style` attribute** containing that exact
substring. Enumerated by searching the inline form (`background-attachment: fixed;`
without `!important`, which is exactly how the hero backdrops are written):

| # | File | Line | # | File | Line |
|---|---|---|---|---|---|
| 1 | `tour-10-days.html` | 336 | 16 | `tour-siroua.html` | 336 |
| 2 | `tour-10-jours.html` | 313 | 17 | `tour-siroua-fr.html` | 320 |
| 3 | `tour-agafay.html` | 335 | 18 | `tour-toubkal.html` | 479 |
| 4 | `tour-agafay-fr.html` | 312 | 19 | `tour-toubkal-fr.html` | 338 |
| 5 | `tour-ait-bougmez.html` | 373 | 20 | `tour-sahara-merzouga.html` | 332 |
| 6 | `tour-ait-bougmez-fr.html` | 313 | 21 | `tour-sahara-merzouga-fr.html` | 332 |
| 7 | `tour-atlas-villages.html` | 371 | 22 | `tour-todra-dades.html` | 335 |
| 8 | `tour-atlas-villages-fr.html` | 336 | 23 | `tour-todra-dades-fr.html` | 320 |
| 9 | `tour-azzaden-tamsoult.html` | 366 | 24 | `tour-mgoun.html` | 336 |
| 10 | `tour-azzaden-tamsoult-fr.html` | 340 | 25 | `tour-mgoun-fr.html` | 343 |
| 11 | `tour-chefchaouen.html` | 370 | 26 | `tour-ouzoud.html` | 501 |
| 12 | `tour-chefchaouen-fr.html` | 312 | 27 | `tour-ouzoud-fr.html` | 320 |
| 13 | `tour-essaouira.html` | 336 | 28 | `tour-saghro.html` | 336 |
| 14 | `tour-essaouira-fr.html` | 320 | 29 | `tour-saghro-fr.html` | 346 |
| 15 | `tour-sahara-erg-chebbi.html` | 336 | 30 | `tour-sahara-erg-chebbi-fr.html` | 321 |

**Elements *not* matched** (important, otherwise the count would be wrong): the page
`<style>` blocks contain **45** `background-attachment: fixed !important;`
declarations (e.g. `.tour-hero` at `tour-toubkal.html:274`, `.hero-section` at
`blog.html:232`, `.hero-fix` at `index.html:50`, `.hero` at `tours.html:239`). Those
are class rules inside stylesheets, **not** inline attributes, so the attribute
selector cannot match them.

### B2 — all 30 are the intended hero backdrops: PASS

Read in full (6 of 30, all four template variants):
`tour-toubkal.html:469-481`, `tour-10-days.html:326-338` (2-space indent variant),
`tour-ouzoud.html:491-503`, `tour-ait-bougmez.html:365-375`,
`tour-chefchaouen-fr.html:303-314`, `tour-sahara-merzouga.html:325-334`.

Every one is the `<div style="position:absolute; top:0; left:0; width:100%;
height:100%; background-image:url('images/…'); background-size:cover;
background-position:center; background-repeat:no-repeat;
background-attachment:fixed; z-index:1;"></div>` backdrop inside the tour hero
wrapper (immediately followed by the black overlay `div`).

The other 24 are the same template at the same position (lines 312-501); the
distribution is exactly one per tour page across 30 distinct tour files, which rules
out a second inline-styled element per page.

### B3 — non-hero elements affected on mobile: PASS (none)

- 0 inline matches outside `tour-*.html`.
- On non-tour pages the rule is evaluated but matches nothing (the backdrops there
  are class-based: `.hero-fix`, `.hero`, `.hero-section`).
- The overlay `div` and the hero content wrapper contain no such substring.

### B4 — desktop unchanged: PASS

`css/mobile-fixes.css`:

```
29: @media (max-width: 768px) {
...
49:     div[style*="background-attachment: fixed"] {
50:         background-attachment: scroll !important;
51:     }
52: }
```

The rule is inside the `max-width: 768px` block, which opens at line 29 and closes at
line 52; it is the last rule in that block. Above 768 px it is inert, so the inline
`background-attachment: fixed` (parallax) stays exactly as before. No other
declaration was changed, and no HTML was touched by this fix.

### B5 — the override actually wins: PASS

An `!important` declaration in an author stylesheet outranks a **normal** inline
declaration (the 30 inline values carry no `!important`). Order of stylesheet vs
page `<style>` is therefore irrelevant.

### B6 — class-based heroes are unaffected but still correct: PASS

Every page that has a `fixed !important` hero also ships its own mobile
`background-attachment: scroll !important` override for the same class
(`blog.html:239`, `about.html:72`, `contact.html:208`, `contact-fr.html:198,478`,
`customize-trip.html:251`, `customize-trip-fr.html:105`, `tours.html:253`,
`index.html:62`, `tour-*.html` at ~142 where the (dead) `.tour-hero` rule exists).
Those were pre-existing and were not modified.

> Note: the `scroll` declarations on tour pages (`tour-*.html:142`) target the dead
> class-based `.tour-hero`, which is why they never applied — the backdrop is
> classless. That is exactly the gap the new attribute selector closes.

---

## C. Language switcher CSS (Fix 4)

### C1 — required rules present: PASS

`css/styles.css` (all verified by reading the file):

| Requirement | Location |
|---|---|
| Base layout (`position: relative`, `display:flex`, `margin-left:20px`, list-style) | 587-593 |
| Pill (`display:flex`, gap 8, padding 8/16, radius 30, border, hover) | 595-619 |
| Panel (`position:absolute`, top 100%, right 0, min-width 160, shadow, radius 12, opacity/visibility/transform transition, z-index 1100) | 621-637 |
| Hover bridge (`.lang-switcher::after`, 12 px) | 717-724 |
| Closed state (`.is-ready:not(.is-open)`) | 727-732 |
| Open state (`.is-ready.is-open`) | 735-740 |
| No-JS fallback (`:not(.is-ready):hover` / `:focus-within`) | 743-749 |
| Authoritative button (`body .lang-switcher .lang-btn`) | 754-779 |
| Authoritative panel (`margin-top 10`, padding 8, min-width 180, z-index 1200) | 782-791 |
| Option hit areas (`li`, `li + li`, `li a`, `li a.active`) | 794-834 |
| Keyboard focus (`a:focus-visible`, 2 px accent outline) | 826-831 |
| Mobile: bridge off, panel static/`display:none`, 100 % width, radius 12 | 838-858 |
| Mobile open (`.is-ready.is-open` **and** `:not(.is-ready):focus-within`) | 860-867 |
| Mobile option sizing (44 px min-height, centered) | 869-873 |
| Touch targets (`.lang-btn` 44×44) | 2881 |

JS contract (`js/main.js:1343-1401`) needs exactly `.lang-switcher`, `.lang-btn`,
`.lang-dropdown`, `is-ready`, `is-open`, `aria-expanded` — all supported.

### C2 — removed legacy blocks are not required elsewhere: PASS

Removed:

| File | What | Replacement |
|---|---|---|
| `styles.css` ~2381 block | `.lang-btn`, `.lang-dropdown`, `.lang-dropdown li`, `li:last-child`, `a`, `a:hover` | `styles.css:754-834` (`body …!important`, higher specificity) |
| `styles.css` ~3426 block | `.lang-dropdown` (absolute), `li a`, `li a:hover` | `styles.css:782-834` + mobile `846-873` |
| `luxury-pricing.css` ~1309 block | `.lang-btn`, `.lang-dropdown` | same authoritative rules |

- No other component uses these class names: `class="lang-…"` appears **only** on the
  `<li class="lang-switcher"> <button class="lang-btn"> <ul class="lang-dropdown">`
  triplet, once per page (`about.html:255-261`, `blog-atlas.html:266-272`, …, 54 pages).
- No `id="lang-…"`, no other `nav` dropdown shares the names.
- Every property the removed rules set is re-declared with `!important` by the
  remaining block, except `overflow: hidden` on the panel — cosmetic only, because
  the panel's children are already rounded.
- No JS reads these styles.

### C3 — inline blocks left intact: PASS

All per-page `.lang-*` copies inside the inline `<style>` blocks are still present
(60 blocks / 53 pages). Untouched, as instructed.

### C4 — mobile spacing preserved: PASS

The `.lang-switcher` **layout** rules were deliberately kept:

```
styles.css:663   .lang-switcher { margin: 15px 0; width:100%; display:flex; flex-direction:column; align-items:center; }
styles.css:2382  .lang-switcher { position: static; margin-top: 20px; text-align: center; }
styles.css:3388  .lang-switcher { position: static; margin-top: 10px; }
luxury-pricing.css:1309 .lang-switcher { position: static; margin-top: 20px; text-align: center; }
```

Effective mobile box (unchanged from before the edits): `margin: 10px 0 15px 0`,
`text-align: center`, `position: static`, full width, centered column. Cascade order
is 663 → 2382 → 3388, so the `10px` top offset still wins.

### C5 — graceful fallback: PASS

`styles.css:743-744` (desktop hover/focus-within) and `861` (mobile
`focus-within`) still reveal the panel when `js/main.js` never adds `is-ready`.

---

## D. The five fixes vs `LIVE-VS-LOCAL-REPORT.md` §8

| §8 recommendation | Implementation | Verdict |
|---|---|---|
| **§8.1** version every CSS/JS ref **and** the two hero preloads | 260 refs versioned; **preloads not versioned** | **FAIL** (preload part only — see A6) |
| **§8.2** point `styles.css:47/:49` at `hero_contact.jpg` / `hero_customize.jpg` | done, exactly at those lines | **PASS** |
| **§8.3** reach tour heroes on mobile — add a class **or** change the inline declaration | third route: one `!important` attribute-selector override inside the existing mobile block ("equally reliable mobile override", explicitly allowed by the task) | **PASS** |
| **§8.4** delete the 60 inline blocks + `styles.css:2382-2430,3427-3450` + `luxury-pricing.css:1309-1328`, keep the fallback | stylesheet rules deleted; **60 inline blocks kept** | **FAIL — deferred** |
| **§8.5** remove `index.html:659` | done exactly there | **PASS** |
| §8.6/§8.7 optional pruning / www redirect | out of scope, untouched | n/a |

**D4 justification:** §8.4 itself gates its deletions on "once `styles.css:754-870`
is confirmed on staging". Staging confirmation never happened (no deploy, no render
tooling), so removing the inline blocks would have violated that precondition. The
stylesheet rules could still be removed safely because they are provably inert
(lower specificity, no `!important`).

---

## E. Backup and rollback

### E1 — backup covers every changed region: PASS

`_backups/2026-10-30-frontend-fixes/BEFORE-snippets.md` contains the exact original
text for all 7 regions:

1. hero variables (`styles.css:42-53`)
2. `styles.css` legacy block 1 (~2382-2430) — includes the kept `.lang-switcher` rule
3. `styles.css` legacy block 2 (~3427-3450) — includes the kept `.lang-switcher` rule
4. `luxury-pricing.css` legacy block (~1309-1328)
5. `mobile-fixes.css` hero block (pre-insert baseline for lines 29-52)
6. `index.html:659` Socket.IO tag
7. hero image inventory

### E2 — rollback instructions: **FAIL** (documentation defects)

1. `BEFORE-snippets.md:12` says *"replace each **AFTER** block with the matching
   BEFORE block"* — the file contains **no AFTER blocks**; they live in
   `FRONTEND-FIX-REPORT.md`. The instruction as written is not actionable.
2. `FRONTEND-FIX-REPORT.md` §9 suggests `git checkout -- public_html css` — the path
   `css` does not exist (it is `public_html/css`), and an unscoped `git checkout`
   would also discard **any unrelated uncommitted work** in the tree. Safer:
   `git diff -- public_html` then `git checkout -- public_html` **only after
   confirming the diff contains nothing but these 57 files**, or
   `git diff -- public_html | git apply -R`.

Neither defect affects the tree; both are instruction-quality issues to fix before
anyone relies on them.

### E3 — backup survivability: **FAIL**

- `_backups/` is listed in `.gitignore:3`, so the checkpoint exists **only on this
  machine** and is not part of any commit.
- No full-file snapshots were taken (shell dead), so the backup only proves the
  original text of the edited regions — it cannot restore a file if an edit damaged
  something outside those regions. The de-facto real backup is the uncommitted git
  working tree.

---

## F. Not verified / remaining risks

### NOT VERIFIED

| Item | Why |
|---|---|
| No unrelated change anywhere in the 57 files | no shell → no `git diff --stat` |
| CSS/JS/HTML syntax validity | no `php -l` / `node --check` / validator; brace balance read manually for every edited CSS region |
| Mobile/iOS hero rendering | no browser (cannot open `file://`), no local server, no device emulation |
| Switcher pixel appearance after the stylesheet cleanup | same reason; conclusion is from cascade analysis only |
| `?v=` busting the Hostinger CDN cache | not deployed |

### Remaining risks, highest first

1. **CDN may ignore query strings (fix 1 effectiveness).** `hcdn` returned
   `x-hcdn-cache-status: DYNAMIC` for HTML and `max-age=604800` for CSS/JS. If the CDN
   keys on path only, `styles.css?v=…` would still be served from the old cached copy
   and fix 1 would silently do nothing. **Verify immediately after upload** that
   `styles.css?v=20261030` returns a miss/`200` with new content; if not, a one-off
   CDN purge is the fallback (owner action — not part of this task).
2. **Stale HTML chicken-and-egg.** Pages carry no `Cache-Control` but do carry an
   ETag, so they revalidate; a cached copy of an *old* page would still request the
   unversioned CSS. Low risk, but the first visit after upload matters.
3. **The hero selector is broad by design.** `div[style*="background-attachment:
   fixed"]` will hit **any future** div written that way, even a non-hero parallax
   block. Today: 0 extra matches. Consider narrowing to the hero wrapper later.
4. **iOS sticky + `scroll` interaction.** The tour hero wrapper is
   `position: sticky; height: 100vh`; switching the child to `scroll` is the standard
   fix, but the combination is unverified on a real device (address-bar collapse).
5. **Inline legacy switcher blocks remain** (60 blocks). They are out-specified today;
   if a property they declare is later removed from the authoritative block, it would
   resurface on 53 pages at once.
6. **`?v=` forces a one-time re-download** of all CSS/JS (intended) — expect a small
   first-visit cost after upload, and a CDN cold-fill.
7. **Backup is not committed** (`.gitignore`), and rollback instructions have the two
   defects in E2.

---

## G. Deploy checklist (no action taken)

1. `git status` / `git diff --stat` → expect **57 files** (`54` HTML + `3` CSS), no JS.
2. `git diff -- public_html/index.html` → only the Socket.IO removal + 4 `?v=` edits.
3. Upload, then hard-reload twice and confirm in DevTools Network:
   - `styles.css?v=20261030`, `mobile-fixes.css?v=20261030`, `main.js?v=20261030` all `200`;
   - no request to `hero_contact_mobile.jpg` / `hero_customize_mobile.jpg`;
   - no request to `/socket.io/socket.io.js`.
4. Contact + customize on a 390 px viewport: computed `background-image` resolves to
   `hero_contact.jpg` / `hero_customize.jpg`.
5. One tour page on iOS/Safari Responsive Design Mode: hero paints, computed
   `background-attachment` is `scroll`, desktop is still `fixed`.
6. Switcher: pill radius 30 px, `aria-expanded` toggles, open/close, Escape and
   outside-click close, panel z-index 1200.
7. Decide on A6 (preloads) and D4 (inline blocks) before or after this deploy.
