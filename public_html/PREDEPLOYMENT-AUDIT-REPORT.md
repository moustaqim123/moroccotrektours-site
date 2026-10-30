# Pre-Deployment Audit — Morocco Trek Tours

**Date:** 25 October 2026
**Scope:** `C:\Users\user\Downloads\moroccotrektours-working` (local files) vs. the currently deployed site at `https://moroccotrektours.com`
**Type:** Analysis only. No website file was modified, nothing was deployed, no backups or ZIPs were created.

---

## 1. Verdict

| Question | Answer |
|----------|--------|
| Is the **SEO / static content layer** ready to deploy? | **GO** — every claim in the three SEO reports was re-verified against the actual files and holds. |
| Is a **full production launch** safe today? | **NO-GO** — the lead-capture path is broken in production and the deployment package would expose repository files. |
| Is the **live site currently correct**? | **No** — the live site is an older build (no descriptions, no canonicals, no hreflang) and its contact form returns HTTP 500. |

**Bottom line:** ship the content only after four release-blocking items are closed (§4). Everything the SEO work promised is genuinely in the files; the blockers are forms, deployment layout, language coherence on two tours, and one advertised itinerary that cannot be booked.

---

## 2. How this was verified

- All 54 HTML pages parsed with a DOM parser and compared field-by-field (head, links, structured data, headings, forms, assets).
- Asset existence checked at **byte level** against the real directory listing, including filename case.
- `sitemap.xml` / `robots.txt` parsed and cross-checked against every page's canonical and hreflang.
- Pricing/booking logic read from `js/pricing-system.js` and compared with the static HTML defaults.
- Live behaviour tested with real HTTP requests (status, headers, redirects, exposed paths).
- Real Lighthouse 13.4.1 was executed through the browser harness against the live site (§7).
- **Not verified by running the site locally** — see §7.1 for why, and §9 for the checks that still need a human in a browser.

**Status labels used below:** `VERIFIED` = proven by file/HTTP inspection. `MANUAL` = cannot be proven without a running server and a browser.

---

## 3. What was verified as correct (no action needed)

### 3.1 Canonicals, hreflang, titles, descriptions `VERIFIED`

| Check | Result |
|-------|--------|
| Pages audited | **54** (27 EN + 27 FR) |
| Canonical present, self-referencing, absolute | 54/54 |
| `hreflang` sets (en / fr / x-default) | 54/54 complete and reciprocal, **0 mismatches** |
| `x-default` points at the EN URL | 54/54 |
| Unique `<title>` | 54/54, lengths **29–65 characters** |
| Unique `meta description` | 54/54, lengths **110–156 characters** |
| Duplicate/missing title, description, canonical, viewport, charset, H1 | **0** |
| Exactly one `<h1>` per page | 54/54 |
| `lang` attribute | 27 `en` / 27 `fr`, all correct (`tour-10-jours.html` is genuinely French) |
| `noindex` pages | none |
| Open Graph + Twitter tags | 0 pages missing `og:url`, `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:title`, `twitter:image` |

### 3.2 Sitemap and robots `VERIFIED`

- `sitemap.xml`: **54 URLs**, all unique, all matching a page canonical; each `<url>` carries exactly **3** `xhtml:link` alternates whose targets are themselves canonical; `x-default == en`.
- No orphan URLs, no missing pages, no duplicates. No `lastmod` / `changefreq` / `priority` (harmless — Google ignores all three).
- `robots.txt`: valid, `Allow: /`, points to `https://moroccotrektours.com/sitemap.xml`.

### 3.3 Links and assets `VERIFIED`

- **332** image/asset references (img, source, srcset, inline `url()`, preload, OG/Twitter images) → **0 missing, 0 case mismatches**.
- All internal `.html` links resolve to real files.
- **0 orphan pages** (lowest inbound count is 3, on the blog detail pages).
- No `http://` references anywhere; no mixed content.
- Arabic/RTL markup present but unused; no stray `dir` issues found.

### 3.4 Structured data `VERIFIED`

- `TravelAgency` on **52** pages; `CollectionPage` + `ItemList` on the two tour listings; `TouristTrip` on the 4 tours that have it (EN/FR).
- Every JSON-LD block parses as valid JSON; no `Product`, `Offer`, `aggregateRating` or fabricated review markup.
- No `FAQPage`/`BreadcrumbList` — a missed opportunity, not a defect.

### 3.5 Tour durations and Essaouira `VERIFIED`

Duration matrix (EN = source of truth from the detailed itineraries):

| Tour | Duration | EN/FR agree | Card | Metadata | Booking widget |
|------|----------|-------------|------|----------|----------------|
| Aït Bougmez | 3 days | yes | yes | yes | `3` |
| Chefchaouen | 3 days | yes | yes | yes | `3` |
| **Essaouira** | **1 day** | yes | `1 Day` / `1 Jour` | yes | `1` only |
| M'Goun Express | 4 days | yes | yes | yes | `4` |
| Ouzoud | 3 days | yes | yes | yes | `3` |
| Jebel Saghro | 5 days | yes | yes | yes | `5` |
| Siroua | 6 days | yes | yes | yes | `6` |
| Todra & Dadès | 4 days | yes | yes | yes | `4` |
| Toubkal | 1–6 days | yes | yes | yes | `1`–`6` |
| Agafay | 1–3 bookable | yes | yes | yes | `1`–`3` (see P1-3) |
| Atlas Villages | 3 days | yes | yes | yes | `3` |
| Azzaden | 1–4 days | yes | yes | yes | `1`–`4` |
| Merzouga | 3 days | yes | yes | yes | `3` |
| Erg Chebbi | 5 days | yes | yes | yes | `5` |
| 10-day tour | 10 days | yes | yes | yes | `10` |

**Essaouira is a one-day product everywhere** — hero, title, description, OG/Twitter, three itinerary segments (morning / lunch / afternoon), one `data-duration="1"`, card "1 Day", accommodation "Not applicable", and no multi-day or optional variant in either language. The duration reports' fix is genuinely complete.

Also confirmed: no `Oukaimeden` reference survives; no "Optional 3-Day Coastal Explorer" variants survive; no duration claim in metadata contradicts its itinerary.

### 3.6 Pricing, WhatsApp, language switching `VERIFIED`

- `WHATSAPP_NUMBER = '212659565040'` — **320** phone occurrences in HTML and 4 in JS all use the same number; **102** static `wa.me` links all correct.
- Group tiers: 1 / 2–3 / 4–7 / 8–12, consistently applied; traveller selector auto-clamps into the selected band.
- Seasonal pricing exists **only** for the 2-day Toubkal option (winter/summer); every other tour/duration uses a fixed rate — matches the code comments and the UI.
- Static default prices in HTML match the JS rate table (e.g. Essaouira 85, Agafay 60, M'Goun 500, 10-day 1250).
- Language switcher: 54/54 pages point at the correct counterpart, matching `hreflang`; no forced redirect and no `localStorage` language hijack.

### 3.7 Phase 2 performance claims `VERIFIED`

- `preconnect` appears before the Google Fonts stylesheet on the 6 claimed templates.
- Hero `preload` present on homepage, tours listing and Toubkal (desktop + mobile where a mobile asset exists).
- Analytics script is `async` on both homepage variants.
- Mobile hero swaps implemented via CSS custom properties.
- `mobile-fixes.css` intentionally overrides two hero variables that point at files which do not exist (`hero_contact_mobile.jpg`, `hero_customize_mobile.jpg`), with an explanatory comment. This is a documented fallback, **not** a broken image.

---

## 4. Release blockers (P0)

### P0-1 — The contact form is dead in production `VERIFIED`

Observed live:

```
GET https://moroccotrektours.com/send-email.php              → 500, empty body
GET https://moroccotrektours.com/generate-csrf-token.php     → 200, valid JSON token
GET https://moroccotrektours.com/vendor/autoload.php         → 200 (served from inside the web root)
GET https://moroccotrektours.com/private/email-config.php    → 404
```

`send-email.php` loads its dependencies from **`dirname(__DIR__) . '/vendor/autoload.php'`** and its config from **`dirname(__DIR__) . '/private/email-config.php'`** — i.e. both must sit *beside* `public_html`, not inside it.

On the server, `/vendor/autoload.php` is reachable at the web root, which proves `vendor/` was uploaded **inside** the document root. The `require_once` therefore resolves to a non-existent path and PHP fatals **before** the "not configured" JSON branch can run — which is exactly why the response is a 500 with an *empty* body instead of the friendly JSON error.

Consequence for a visitor: `contact-form.js` calls `response.json()`, the empty 500 body throws, and the form always shows "An error occurred. Please try again."

Locally, `private/email-config.php` does not exist at all (only `email-config.example.php`), so even after the path is fixed the form will return "temporarily unavailable" until credentials are created on the server.

**Fix:** deploy with the documented sibling layout —

```
<account root>/
├── public_html/      ← contents of public_html only
├── vendor/
└── private/email-config.php   ← real SMTP credentials, never in the repo
```

then POST a real submission and confirm the JSON `success: true` path.

### P0-2 — Both "Customize your trip" forms silently discard every enquiry `VERIFIED`

`customize-trip.html` (line 1724) and `customize-trip-fr.html` (line 1564):

```js
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(form);   // collected…
    console.log('Form submitted:', data);  // …logged to console only
    alert('Thank you! We have received your …');   // false success
});
```

- No `fetch`, no `XMLHttpRequest`, no `mailto`, no `action` attribute → **zero** data leaves the browser.
- The visitor is told the request was received and will be answered within 24 hours. This is the single most damaging defect in the package: it silently destroys high-intent leads while reassuring the customer.
- EN page additionally references an undefined `submitBtn` after the alert (line 1747) → `ReferenceError` in the console; the FR page has no such line.

**Fix (before deploy):** either point the form at `send-email.php` with the same CSRF flow as the contact form, or replace the fake success with a pre-filled `wa.me` link. Do not ship the fake success message under any circumstances.

### P0-3 — Repository files are publicly downloadable `VERIFIED`

```
/composer.json                  200 application/json
/composer.lock                  200 text/plain
/package.json                   200 application/json     ("name": "tensor-coronal-site" — leftover)
/cms-manifest.json              200 application/json
/images.json                    200 application/json
/vendor/composer/installed.json 200 application/json
/vendor/…                       (whole dependency tree publicly served)
```

This is not catastrophic, but it advertises the stack, the dependency versions (PHPMailer/Composer), the internal CMS manifest, and the fact that a Node `server.js`/`socket.io` dev setup was packaged by mistake. It also directly caused P0-1.

**Fix:** upload **only** the contents of `public_html` as the document root; keep `vendor/`, `private/`, `server.js`, `package.json`, `composer.*`, `cms-manifest.json` and `images.json` outside it.

### P0-4 — The FR/EN versions of two tours are different trips `VERIFIED`

| Tour | EN itinerary | FR itinerary |
|------|--------------|--------------|
| **Erg Chebbi** | Day 2 "Towards Ouzina", Day 3 "Crossing the Hamada", Day 4 "Remote Oases", Day 5 "Return to Merzouga" | Jour 2 "Traversée d'Erg Chebbi", Jour 3 "Plateau de Tarkeddite & Nomades", Jour 4 "Désert Rocheux & Retour", Jour 5 "Dernière Journée & Départ" (returns to Marrakech) |
| **Atlas Villages** | Day 1 Imlil → Tinerhourhine, Day 2 → Aït Aïssa, Day 3 return to Imlil (Tizi n'Mzik, 2 489 m) | Jour 1 Marrakech → "village d'accueil", Jour 2 village walk, Jour 3 return — no Imlil/Tinerhourhine/Aït Aïssa route |

Both pairs are correctly hreflanged as translations of each other, so a French visitor who switches to English is told they booked a different trek — different route, different end point, one ends in Merzouga and the other in Marrakech. This is a trust and (potentially) a consumer-law problem, not just an SEO one.

**Fix:** make the FR pages match the EN source of truth (EN is authoritative per the duration audit), or unlink the pairs until they are reconciled.

---

## 5. High-priority defects (P1)

### P1-1 — Agafay advertises 3–5 days but can only sell 1–3 `VERIFIED`

- Hero: "1 - 5 Days Options" (EN) / "Options 1 à 5 Jours" (FR).
- Option 4 is titled **"Agafay & Atlas Foothills (3-5 Days)"** with Phase 1/2/3 prose.
- Booking widget offers only `data-duration="1"`, `2`, `3`; `pricing-system.js` has rates only for `1`, `2`, `3`. There is no 4-day or 5-day price.
- Option 4 has no `data-duration` and no click target, so it cannot be selected at all.
- Accommodation block still says "Not applicable (Day Trip)" although 2- and 3-day options are sold.

**Decide:** either add real 4/5-day rates and itinerary detail, or retitle the hero to "1–3 days" and mark Option 4 as "on request". Shipping as-is invites a booking argument.

### P1-2 — Toubkal Option 6 has no itinerary `VERIFIED`

Options 1–5 each list days explicitly (Option 5 ends with "Day 5"). Option 6 ("6-Day Ultimate Toubkal & Valleys") is a 3-sentence paragraph that says "standard 5-day route plus an extra day" — no Day 1–6 list, no route, no extra-day content. The page's accommodation block also still reads "1 Night at the Toubkal Refuge" for every option, which is wrong for the 3–6 day products.

Anyone paying for a 6-day trek cannot see what they bought. Either write the six days or withdraw the option.

### P1-3 — Accessibility failures that are real in the local files `VERIFIED`

These are not Lighthouse artefacts of the stale site — the same markup exists locally, so they will reproduce after deploy:

| Issue | Count | Detail |
|-------|-------|--------|
| Icon-only `href="#"` social links with no accessible name | **114** (typically 3 per page, across 37 pages) | `<a href="#"><i class="fab fa-facebook-f"></i></a>` — also non-functional links |
| Pages with no `<main>` landmark | **54 / 54** | Lighthouse `landmark-one-main` will fail on every page |
| `<nav>` without `aria-label` | **54 / 54** | usually 2 navs per page |
| Heading order skips | **10** pages | `index`, `index-fr`, `tours`, `tours-fr`, `contact`, `contact-fr`, `blog`, `blog-fr`, `blog-marrakech`, `blog-marrakech-fr` (e.g. h2 → h4) |
| `<textarea id="message">` with no label or `aria-label` | customize EN/FR | the `label` markup is missing while sibling fields have it |
| Traveller `+` / `−` buttons with only an icon | 4 buttons | `updateTravelers()` buttons in customize EN/FR |
| Low-contrast logo subtitle | all pages | measured **2.85:1** (live, `#bf9223` on white at 11.2 px, italic 600); the CSS colour `#B8860B` at `opacity: .9` composites to exactly that → target 4.5:1 |

Fixing the 114 social links is the single highest-value a11y change: it also happens to be the `link-name` failure Lighthouse reported.

### P1-4 — Twelve WhatsApp links open a new tab without `rel="noopener"` `VERIFIED`

`tour-atlas-villages`, `tour-azzaden-tamsoult`, `tour-essaouira-fr`, `tour-mgoun-fr`, `tour-ouzoud`, `tour-saghro`, `tour-sahara-erg-chebbi-fr` and others use `target="_blank"` with no `rel`. Reverse-tabnabbing risk is low for `wa.me`, but it is a one-line fix and some of these are the primary booking CTAs.

---

## 6. Medium / low findings (P2)

| # | Finding | Evidence | Action |
|---|---------|----------|--------|
| P2-1 | `meta charset` appears **1 646–1 835 bytes** into every page (spec limit: 1 024). Live HTML is served **without** a charset in `Content-Type`, so decoding relies on sniffing. No mojibake observed today. | byte offsets measured on all 54 files; live header `text/html` only | Move `<meta charset>` to the first line of `<head>` and serve `text/html; charset=utf-8` |
| P2-2 | `/socket.io/socket.io.js` 404s on every homepage load; the file does not exist locally either. Harmless only because `main.js` guards with `typeof io !== 'undefined'`. | `index.html:645`, live 404 | Delete the script tag (it belongs to the Node dev server) |
| P2-3 | `customize-trip.html` / `-fr.html` load `css\site-common.css` (backslash). Browsers normalise it, but the file **404s on the live host**, and locally it is a 68-byte stub whose only rule (`--hero-bg`) is unused. | `styles.css` reads the real hero variable | Remove the link and the stub file |
| P2-4 | EN `customize-trip.html:453` links to `#customize-form`; the form id is `customizeForm` → "Learn More" does nothing. FR has no such link. | id mismatch | Fix the href |
| P2-5 | `http://`, `https://www.`, `https://…/index.html` all return **200 with no redirect**; no `HSTS` header; no `.htaccess` anywhere in the repo. | live fetch, `redirect: manual` | Pick one canonical host/scheme, 301 the rest, add HSTS once HTTPS is stable |
| P2-6 | Static assets cached `max-age=604800` (7 days) with **no fingerprinting**. | live `Cache-Control`, no hashed filenames | Add `?v=` to CSS/JS on deploy, or purge CDN after upload — otherwise returning visitors keep the old JS for a week |
| P2-7 | No `srcset`/`<picture>` anywhere; several oversized tour cards. | see §8 | Highest ROI: `ouzoud_card.jpg` 2.03 MB, `agafay_desert1.jpg` 1.06 MB, `mgoun_main1.jpeg` 0.81 MB |
| P2-8 | `TouristTrip` JSON-LD only on 4 tours (EN/FR), not on the other 10. | structured-data scan | Optional; no rich-result eligibility lost today |
| P2-9 | No breadcrumbs, no `FAQPage`, no local-business `openingHours`/`geo`. | structured-data scan | Optional growth work |
| P2-10 | Blog articles have no `datePublished`/`dateModified` or `Article` schema. | scan | Optional |

---

## 7. Lighthouse: what was actually run and what it can and cannot tell you

### 7.1 Local Lighthouse was not possible — and why

This environment cannot serve the local files, so no local Lighthouse run exists:

- The shell tool is inert here: a background Node static server reported "listening" but never bound a port. `fetch http://127.0.0.1:8123/` → `ECONNREFUSED`; the browser tab for `localhost` → 502.
- No PHP binary is installed, so `send-email.php` couldn't run anyway.
- No `node_modules/` and no Lighthouse CLI package; no `npx` cache.
- No Google Chrome installed. Only **Microsoft Edge 156.0.4314.42** (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`).
- The harness Lighthouse (`tools.browser.lighthouse`, Lighthouse **13.4.1**) runs in **snapshot** mode and reports only **Accessibility, SEO, Best Practices**. It explicitly does not emulate a device and does not produce a performance score — so **no LCP / CLS / TBT / Speed Index numbers exist for this audit**.

### 7.2 What the harness Lighthouse *did* produce (live site only)

| Page | Accessibility | SEO | Best Practices |
|------|---------------|-----|----------------|
| Homepage | 0.89 | 0.80 | 1.00 |
| Tours listing | 0.87 | 0.80 | 1.00 |
| Toubkal | 0.96 | 0.80 | 1.00 |
| Essaouira | 0.96 | 0.80 | 1.00 |
| M'Goun | 0.96 | 0.80 | 1.00 |
| Erg Chebbi | 0.96 | 0.80 | 1.00 |

Failing audits: `color-contrast` (all), `heading-order` (home, tours), `landmark-one-main` (tours), `link-name` (home), `meta-description` (all).

**How to read this:** the live site is an **older build**. Confirmed differences on every sampled page:

| Field | Local files | Live |
|-------|-------------|------|
| meta description | present | **absent** |
| canonical | present | **absent** |
| hreflang | 3 tags | **none** |
| JSON-LD on `tours.html` | `CollectionPage` | **0 blocks** |
| titles | e.g. "Mount Toubkal Trek: 1-6 Day Options…" | older, e.g. "High Atlas Summit Challenge…" |
| CSS/JS | `styles.css` | `logo-entrance.css` + `anime.js` (not in the local build) |

So the SEO 0.80 is **not** predictive of the new build: `meta-description` will pass once deployed. The accessibility failures **will** largely reproduce, because the underlying markup (no `<main>`, unlabeled social links, contrast, heading order) is identical in the local files.

### 7.3 Running Lighthouse yourself in Edge

1. **Best local option** (real HTTP, correct relative paths):
   ```powershell
   cd "C:\Users\user\Downloads\moroccotrektours-working\public_html"
   python -m http.server 8080
   ```
   then open `http://localhost:8080/` in Edge.
   If Python is unavailable, `npx --yes serve -l 8080` from the same folder. (`npm start` in the repo root runs `node server.js` on port 3000 and also serves `/socket.io/socket.io.js`, which matches production less closely — but it is fine for layout checks.)
2. **Fastest smoke test:** double-click `public_html\index.html`. It works for a visual pass, but `file://` skews performance and blocks the PHP endpoints, so do not trust Lighthouse numbers from it.
3. In Edge: `F12` → **Lighthouse** tab → Mode **Navigation**, Device **Mobile**, all four categories → **Analyze page load**. Repeat with **Desktop**. Use **InPrivate** to approximate a first visit.
4. To check a specific tour page, navigate to it *before* running, or paste the URL into the Lighthouse panel.

---

## 8. Static weight (measured, not estimated)

Sum of HTML + CSS + JS + images actually referenced per page (uncompressed bytes; server applies Brotli, so transfer is smaller):

| Page | Desktop | Mobile | Notes |
|------|---------|--------|-------|
| `index.html` | **1 483 KB** | **1 307 KB** | hero preloaded; 3 tour cards eager |
| `tours.html` | **8 652 KB** | 8 586 KB | 16 cards, all `loading="lazy"` — the declared total, not the initial load |
| `tour-toubkal.html` | 692 KB | 692 KB | CSS+JS ≈ 217 KB |
| `tour-essaouira.html` | 942 KB | 942 KB | |
| `tour-mgoun.html` | 1 354 KB | 1 354 KB | `mgoun_main1.jpeg` 0.81 MB |
| `tour-sahara-erg-chebbi.html` | 782 KB | 782 KB | |

Largest assets: `ouzoud_card.jpg` **2.03 MB**, `agafay_desert1.jpg` **1.06 MB**, `mgoun_main1.jpeg` **0.81 MB**, `atlas_village1.jpg` 0.61 MB, `todra_dades1.jpg` 0.58 MB, `saghro_main1.jpg` 0.48 MB.

No `srcset`, no AVIF/WebP alternatives, no responsive variants. The tours listing is only survivable because of lazy loading; on a slow connection the first three cards still cost ~2.3 MB.

---

## 9. Checks that still require a human in a browser (`MANUAL`)

These cannot be settled from static files, and none of them were exercised:

1. **Booking widget arithmetic** — change duration, group band, traveller count and (Toubkal 2-day only) season; confirm the displayed unit price and total recompute without console errors, and that the season panel hides for non-seasonal selections.
2. **WhatsApp hand-off** — click "Book Now" / "Contact Us to Book" / the sticky CTA; confirm the popup opens `wa.me/212659565040` with the constructed message (note: `main.js` intercepts `.book-now` clicks and builds its own text, overriding the static `?text=` value).
3. **Contact form round trip** — requires the P0-1 fix first; verify success message, auto-reply, rate limit (3/hour/IP) and CSRF rejection.
4. **Customize form** — currently guaranteed to fake success; verify only after P0-2 is fixed.
5. **Mobile navigation** — hamburger open/close, scroll inside the panel, `Escape`, body scroll lock.
6. **Language dropdown** — keyboard navigation, outside-click close, correct target page.
7. **Homepage slider/lightbox** — autoplay, arrows, caption, keyboard `Esc`.
8. **Sticky mobile CTA** and footer layout at 360 px, 390 px, 768 px.
9. **Deployed caching** — after upload, confirm a returning visitor receives the new `styles.css`/`main.js` (see P2-6).

---

## 10. Minimum release gate

Ship when **all** of these are true:

- [ ] **P0-1** `vendor/` and `private/email-config.php` sit beside `public_html`; a live test submission returns `{"success":true}` and lands in the inbox.
- [ ] **P0-2** customize forms either post to `send-email.php` or hand off to WhatsApp — no fake success message; EN `submitBtn` ReferenceError removed.
- [ ] **P0-3** document root contains only `public_html` contents; `/composer.json`, `/package.json`, `/cms-manifest.json`, `/images.json`, `/vendor/...` return 404.
- [ ] **P0-4** Erg Chebbi and Atlas Villages FR itineraries match the EN source of truth (or the pairs are unlinked).
- [ ] **P1-1 / P1-2** Agafay 4–5 day and Toubkal 6-day are either fully bookable with real content and prices, or explicitly marked "on request".
- [ ] **P1-3** social links get `aria-label`s, a single `<main>` wrapper is added, the logo subtitle contrast is raised to ≥ 4.5:1.
- [ ] Cache-busting query strings added to CSS/JS for the first deploy.
- [ ] One manual pass of §9 items 1, 2, 5, 6 on a phone.

Nice-to-have before or shortly after launch: P2-1 charset position, P2-2 socket.io tag, P2-3/P2-4 link fixes, P2-5 canonical-host redirects, image right-sizing for the three 1 MB+ cards.

---

## 11. Claim-by-claim check of the three source reports

| Report | Claim | Verified |
|--------|-------|----------|
| `SEO-PHASE2-REPORT.md` | Canonicals + hreflang + unique metadata across the site | **Yes**, 54/54 |
| | Sitemap regenerated with alternates | **Yes**, 54 URLs × 3 alternates |
| | Preconnect ordered before font CSS, hero preloads, async analytics | **Yes** on the 6 stated templates (analytics `async` only on the two homepages, as documented) |
| | Mobile hero weight reduced | **Yes** — homepage mobile hero is `hero_home_mobile.jpg` (107 KB); Essaouira mobile now uses `remparts-…-scaled.jpg` |
| | `ouzoud_card.jpg` left unchanged (no smaller asset) | **Yes**, confirmed — 2.03 MB, still the largest image |
| `TOUR-DURATION-AUDIT-REPORT.md` | Every listed FR duration corrected to the EN itinerary | **Yes** for the durations themselves |
| | Essaouira reduced to a single day in EN + FR | **Yes**, fully consistent |
| | Ouzoud FR rebuilt as a 3-day product | **Yes** (matches EN 3-day structure) |
| | FR itineraries now mirror EN routes | **No** — two exceptions, see P0-4 |
| `PERFORMANCE-SEO-OPPORTUNITY-REPORT.md` | Duplicate content / missing canonicals | **Fixed** |
| | Image weight as the main performance lever | **Confirmed** — §8 |
| | Missing meta descriptions / OG images | **Fixed** (the earlier "missing OG image" reading was an artefact of `images.json` being a partial gallery manifest, not a file inventory) |

---

## 12. False positives worth recording

These looked like defects during the audit and are **not**:

1. `tour-10-jours.html` flagged as wrong-language — it is legitimately French; `lang="fr"` is correct.
2. OG images flagged "missing" — the check was run against `images.json`, which is a partial gallery manifest. Direct file checks found **0** missing assets.
3. `hero_contact_mobile.jpg` / `hero_customize_mobile.jpg` missing — deliberately overridden in `mobile-fixes.css`, with an explanatory comment.
4. Homepage "blank hero" — the hero is an inline `background-image` with `!important` overrides in `.hero-fix`; it does not use an `<img>`, which is why asset-based checks miss it.
5. `css/site-common.css` "missing" locally — it exists locally (68 bytes) but is **not deployed**; that part is a genuine (minor) defect, see P2-3.

---

## 13. Appendix — raw counts

```
pages                                 54  (27 en / 27 fr)
titles unique                         54      lengths 29–65
descriptions unique                   54      lengths 110–156
canonicals                            54/54
hreflang sets complete                54/54   -> 0 issues
sitemap urls                          54      duplicates 0, alternates 3 each
robots.txt                            valid, sitemap referenced
internal .html links                  all resolve
asset references                      332     missing 0, case-mismatch 0
orphan pages                          0       (min inbound 3)
broken in-page anchors                1       (customize-trip.html -> #customize-form)
pages with exactly one <h1>           54/54
pages with <main>                     0/54
pages with unlabeled <nav>            54/54
heading-order skips                   10 pages
icon-only href="#" social links       114  (37 pages)
interactive elements with no name     118  (114 social + 4 traveller buttons)
target=_blank without noopener        12
meta charset byte offset              1646–1835  (limit 1024)
http:// references                    0
JSON-LD blocks                        TravelAgency 52, CollectionPage 2, TouristTrip 8; all valid
whatsapp number                       212659565040  (320 HTML + 4 JS occurrences, 0 deviations)
group tiers                           1 / 2–3 / 4–7 / 8–12
seasonal pricing                      Toubkal 2-day only
pages with srcset                     0
```
