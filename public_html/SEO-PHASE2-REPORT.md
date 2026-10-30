# SEO Phase 2 Report — Morocco Trek Tours

**Site:** `public_html/` (54 pages: 27 English / 27 French)
**Scope:** performance fixes → keyword research → on-page optimisation → technical validation
**Constraint:** no deployment, no backups/archives, no redesign, no changes to prices, itineraries, booking forms, WhatsApp links or business policies.

> **Measurement honesty note:** every number in this report is either (a) a local file-size / pixel-dimension measurement of an asset in `public_html/images/`, or (b) a count produced by parsing the actual HTML. No Core Web Vitals (LCP/CLS/INP), Lighthouse, PageSpeed Insights, CrUX, ranking, traffic or search-volume data was available in this environment, so none is claimed. File-size deltas are **not** Core Web Vitals results.

---

## 1. Executive summary

| Area | Result |
|---|---|
| Pages validated | 54 / 54, **0 issues** in the final automated pass |
| Above-the-fold image weight reduced | Homepage mobile hero **283 KB → 107 KB**; Essaouira mobile hero **4,091 KB → 767 KB** |
| Above-the-fold discovery improved | Preconnect reordered before font CSS on 6 templates; hero preloads added on 6 templates; analytics script made `async` |
| Logo loading | Removed `loading="lazy"` from the header logo on all 54 pages, added intrinsic dimensions |
| Layout-shift reservation | Intrinsic `width`/`height` added to **33 in-article images** across 11 blog pages |
| On-page changes | 4 title/H1 retargets, 1 H1 language fix, 1 H3→H2 hierarchy fix (×2 languages), 3 new internal-linking sections, 1 factual winter-detail addition (×2 languages) |
| New pages | **None** — intent was absorbed into existing pages |
| Content problems found | **6** EN/FR or internal duration/location inconsistencies (reported, not altered) |

---

## 2. Method and tool availability

- Phase 1 was re-read first (`SEO-IMPROVEMENTS-REPORT.md`); all Phase 1 fixes were confirmed still present, so none were repeated.
- Image weight and intrinsic dimensions were measured per file (bytes and decoded `width × height`).
- All 54 documents were parsed with a DOM parser and checked programmatically (see §8).
- Available free evidence sources: **Google Autocomplete** (`suggestqueries.google.com`) and **DuckDuckGo HTML SERPs**.
- Unavailable / unusable: Lighthouse, PageSpeed Insights, CrUX, Google Search Console, Google Trends, any local HTTP server. DuckDuckGo rate-limited after two queries (HTTP 202); Bing returned unrelated/proxy results; Mojeek returned HTTP 403. **No search volumes, rankings, impressions or CWV scores were invented.**

---

## 3. Performance findings and fixes

### 3.1 Measured asset inventory (top offenders, above-the-fold and in-article)

Sizes are the actual files on disk. "Role" indicates whether the image can affect LCP.

| Asset | Size | Intrinsic px | Role | Action |
|---|---:|---|---|---|
| `Essaouira-blue-boats.jpg` | 4,091 KB | 5333×3555 | was Essaouira **mobile hero** | removed from hero; kept lazy in-article |
| `ouzoud_card.jpg` | 2,082 KB | 3840×2160 | Ouzoud hero (all viewports) + card | **unchanged** — no smaller same-subject asset exists |
| `hero_about.jpg` | 1,737 KB | 3840×1376 | About **desktop** hero | unchanged (mobile uses `hero_about_mobile`) |
| `atlas_13.avif` | 1,395 KB | 2500×1668 | in-article, lazy | dimensions added |
| `Colorful Moroccan food spread.jpg` | 1,104 KB | 5234×2087 | in-article, lazy | unchanged |
| `agafay_desert1.jpg` | 1,086 KB | — | Agafay hero + card | unchanged — no smaller same-subject asset |
| `flavor_tagine.jpg` | 1,086 KB | 2560×1708 | in-article, lazy | dimensions added |
| `4_fes.jpg` | 1,076 KB | 2880×1922 | in-article, lazy | dimensions added |
| `0_fes.jpg` | 969 KB | 2200×1467 | in-article, lazy | dimensions added |
| `hero_contact.jpg` | 900 KB | — | Contact hero | unchanged — no mobile variant exists |
| `remparts-…-essaouira-scaled.jpg` | 767 KB | 1920×1280 | **now** Essaouira mobile hero | switched (see 3.2) |
| `hero_home.jpg` | 283 KB | 1591×895 | Homepage **desktop** hero | preloaded |
| `logo-header.png` | 271 KB | 1024×567 | header, all pages | de-lazied + dimensions; still heavy (see §10) |
| `hero_tours.jpg` | 114 KB | 1280×519 | Tours **desktop** hero | preloaded |
| `hero_home_mobile.jpg` | 107 KB | 503×895 | Homepage **mobile** hero | preloaded + now actually applied |
| `hero_tours_mobile.jpg` | 48 KB | 292×519 | Tours **mobile** hero | preloaded |

### 3.2 Fixes applied

**A. Header logo was lazy-loaded on all 54 pages (above the fold).**
`loading="lazy" src="images/assets/logo-header.png"` → `src="…" width="1024" height="567" decoding="async"`.
Why it matters: the logo sits in the header, so lazy-loading delayed a visible above-the-fold image. The explicit aspect ratio also reserves its box before the bitmap arrives. CSS already forces `img { height: auto }` (`css/styles.css:114–118`), so the attributes cannot distort it.

**B. Homepage mobile hero was downloading the 283 KB desktop image.**
The inline `<style>` contained a dead `.hero-fix` desktop declaration plus an inline `background-image` on the `<header>` that overrode the mobile media rule. Removed the dead inline overrides and added the mobile rule:

```css
@media (max-width: 768px) {
  .hero-fix {
    background-image: url('images/hero/hero_home_mobile.jpg') !important;
    background-attachment: scroll !important;
    min-height: 80vh !important;
  }
}
```
**Measured delta: 283 KB → 107 KB per mobile homepage view (−176 KB, −62%).** Desktop keeps `hero_home.jpg` at 100vh.
Also removed the redundant `background-attachment`/`min-height`/`background-*` overrides from the header `style` attribute so one source of truth controls it. Applied to `index.html`; `index-fr.html` already had a correct mobile rule and only needed the preloads.

**C. Essaouira tour mobile hero was 4,091 KB.**
Both mobile `@media` blocks on each page pointed at `Essaouira-blue-boats.jpg`. Switched to the existing 767 KB `remparts-incontournable-essaouira-scaled.jpg`, which depicts the same destination and is already used elsewhere on the page.
**Measured delta: 4,091 KB → 767 KB per mobile Essaouira view (−3,324 KB, −81%).**

**D. Preconnect was requested after the font stylesheet (and duplicated).**
Moved `<link rel="preconnect">` for `fonts.googleapis.com` and `fonts.gstatic.com` **before** the font CSS link on `index.html`, `index-fr.html`, `tours.html`, `tours-fr.html`, `tour-toubkal.html`, `tour-toubkal-fr.html`, and deleted the late duplicate pair. A preconnect only helps if it is issued before the request it is meant to warm, so the previous placement reduced its value.

**E. Hero preloads added where none existed.**
`<link rel="preload" as="image" …>` with matching `media` queries:

| Page | Desktop | Mobile |
|---|---|---|
| `index.html`, `index-fr.html` | `hero_home.jpg` (283 KB) | `hero_home_mobile.jpg` (107 KB) |
| `tours.html`, `tours-fr.html` | `hero_tours.jpg` (114 KB) | `hero_tours_mobile.jpg` (48 KB) |
| `tour-toubkal.html`, `tour-toubkal-fr.html` | `toubkal/toubkal_summit1.jpg` (153 KB) | same |

These do **not** reduce bytes; they start the LCP candidate earlier and avoid waiting for CSS parsing. Reported as discovery improvements, not as measured speed gains.

**F. Analytics script made non-blocking.**
`js/cta-whatsapp-analytics.js` changed from synchronous to `async` on `index.html` and `index-fr.html`, removing it from the parser-blocking path.

**G. Layout-shift reservation on in-article images.**
`width`/`height` added to 33 images (11 files) so the browser reserves aspect ratio before decode:

| File | Images |
|---|---|
| `blog-atlas.html`, `blog-atlas-fr.html` | `toubkal_summit` 1353×900, `atlas_13.avif` 2500×1668, `atlas_12` 2560×1707 |
| `blog-culture.html`, `blog-culture-fr.html` | `flavor_tagine` 2560×1708, `flavor_tea` 700×467, `flaavor_hamam` 2048×1367 |
| `blog-fes.html`, `blog-fes-fr.html` | `0_fes` 2200×1467, `2_fes` 2270×1500, `4_fes` 2880×1922 |
| `blog-sahara.html`, `blog-sahara-fr.html` | `ait_bougmez` 1347×900, `sahara_1` 1620×1080, `petit-desert` 1536×1024 |
| `blog-coastal.html`, `blog-coastal-fr.html` | `Essaouira-blue-boats` 5333×3555, `remparts` 1920×1280, `argan_1` 1620×1080 |
| `blog-marrakech-fr.html` | `guide_souks` 612×408, `guide_jamaa` 612×408, `guide_garden` 2400×1350 |

`blog-marrakech.html` (EN) needed none: its three images use `.guide-highlight-image` with a fixed 220 px height. Remaining unsized images site-wide are all inside fixed-height containers (`.blog-image` 200 px, `.guide-highlight-image` 220 px, `.guide-image-container` 130×130, `.card-image-wrapper` 240 px) or the hidden `#lightbox-img`, so they cannot shift layout.

### 3.3 Deliberately NOT changed

- **No image re-encoding / conversion.** No encoder was available, and blind conversion would risk visual regressions. Assets are only *selected* more cheaply, never recompressed.
- **No `.htaccess`.** Server type is unverified, so compression/cache headers would be speculative. Reported as a recommendation in §10.
- **No `srcset`/`<picture>` rollout.** No resized derivatives exist to point at; generating them requires an encoder.
- **No new sizes for `ouzoud_card.jpg`, `agafay_desert1.jpg`, `hero_contact.jpg`, `hero_customize.jpg`** — no smaller same-subject asset exists, and substituting a different image would misrepresent the product.

---

## 4. Keyword opportunity research

### 4.1 Evidence available

**Google Autocomplete** (fetched this session, `client=firefox`). These are verbatim suggestion strings — they prove *phrasing and co-occurrence*, not volume.

**English**
- `toubkal trek` → `toubkal trekking`, `toubkal trek from imlil`, `toubkal trek from marrakech`, `toubkal trek 3 days`, `toubkal trek price`, `toubkal trekking guide`
- `toubkal trek 2 days` → `mount toubkal trek 2 days`, `… 2 days itinerary`, `… 2 days price`, `… 2 days distance`, `2 days toubkal trek from marrakech`
- `toubkal winter` → `toubkal winter ascent`, `toubkal winter climb`, `toubkal winter trek`, `toubkal winter kit list`, `toubkal winter packing list`, `toubkal winter gear`
- `climb toubkal` → `climb toubkal morocco`, `climb toubkal winter`, `climb toubkal in december`, `climb toubkal guide`
- `atlas mountains trek` → `atlas mountains trekking tour`, `atlas mountains trek morocco`, `atlas mountains trekking routes`, `atlas mountains trek from marrakech`, `atlas mountain trekking imlil`
- `essaouira day trip` → `essaouira day trip from marrakech`, `essaouira day trip itinerary`, `essaouira private day trip from marrakech`, `one day trip from marrakech to essaouira`
- `essaouira day trip from marrakech` → `essaouira day tour from marrakech`, `is there a train from marrakech to essaouira`, `how far is essaouira from marrakech`
- `agafay desert day trip` → `agafay desert day trip from marrakech`, `agafay desert day trip price`, `agafay desert day trip luxury`, `agafay desert one day trip`, `best agafay desert day trip`

**French**
- `trek toubkal` → `trek toubkal maroc`, `trek toubkal 4 jours`, `trek toubkal 2 jours`, `trek toubkal 3 jours`, `trek toubkal 8 jours`, `trek toubkal et m'goun`, `trek toubkal agence`, `trek toubkal avis`

**SERP observations** (DuckDuckGo HTML, 2 successful queries before rate-limiting):

- `toubkal trek 2 days` — top 8 results were **all commercial tour-operator pages with duration-specific titles**: “The Best Toubkal Trek 2 Days 2025”, “2-Day Mount Toubkal Trek”, “Mount Toubkal Trek 2 Days — 2026 Prices, Routes & Booking”, “Mount Toubkal 2-Day Trek: Complete Itinerary & Costs”, “2 Day Toubkal Trek from Marrakech | Summit & Refuge Night”, etc.
- `ait bougmez trek` — top 8 results were **all operator pages**, most with day counts in the title: “5 Day Ait Bougmez valley trek”, “Ait Bougmez Villages Trek — 5 Days”, “Ait Bougmez Valley Trek – 6-Day Hiking”, “5-Day Aït Bouguemez Valley Trek”, “Aït Bougmez Valley Trek, Seven Days, Six Nights”.

### 4.2 Reading of the evidence

- Duration variants (`2 days`, `3 days`, `4 jours`, `2 jours`) are **explicitly suggested and explicitly targeted by ranking competitors**. The site already sells flexible 1–6 day Toubkal options but its title only said “1-6 Day Options”.
- Origin intent (`from marrakech`, `depuis marrakech`, `from imlil`) is strong and recurring for Toubkal, Essaouira and Agafay.
- Season intent (`winter ascent`, `winter kit list`, `winter climb`) exists as a distinct cluster, and the Toubkal page had only one sentence on winter.
- `day trip` is the dominant framing for Essaouira/Agafay, which the old titles did not use.

### 4.3 Not measured

No search volumes, keyword difficulty, CPC, ranking positions, impressions, clicks, or competitor traffic. The clusters above are **phrasing evidence**, and the two SERP observations show *who ranks*, not *how much traffic* the terms get.

---

## 5. On-page optimisations

Each change is tied to a specific piece of evidence from §4 or to a verified correctness problem.

### 5.1 Heading hierarchy on the tours hub
`tours.html` / `tours-fr.html`: the three category headings (“Summits That Define Morocco”, “Golden Dunes & Sahara Nights”, “Classic Treks & Scenic Escapes” / FR equivalents) changed **H3 → H2**.
Safe because `.category-title` fully controls their appearance (`font-family`, `font-size: 2rem`, weight, colour, margin — `tours.html:377–384`, plus a `1.6rem` mobile override), so no visual change occurs. The page previously jumped H1 → H3.

### 5.2 New “Day Trips from Marrakech” internal-linking section
Added to `tours.html`, `tours-fr.html`, `blog-marrakech.html`, `blog-marrakech-fr.html` — a short H2/paragraph block (existing `category-header` and `.text-link` styles) linking to the matching tour pages:

| Page | Links |
|---|---|
| `tours.html` | Agafay, Essaouira, Azzaden & Tamsoult |
| `tours-fr.html` | Agafay, Ouzoud, Azzaden & Tamsoult |
| `blog-marrakech.html` | Agafay, Essaouira, Azzaden & Tamsoult |
| `blog-marrakech-fr.html` | Agafay, Ouzoud, Azzaden & Tamsoult |

Rationale: the `… day trip from marrakech` suggestions describe a real cluster, but `tours.html` did not group or link those products as short escapes, and `blog-marrakech*` only linked to the tours hub. This adds topically relevant internal links to existing money pages **without creating thin new pages**.

### 5.3 Essaouira title and H1 retargeted to the actual query phrasing
| Field | Before | After |
|---|---|---|
| EN title / og / twitter | Essaouira Coastal & Argan Forest | **Essaouira Day Trip from Marrakech** |
| EN H1 | Essaouira Coastal & Argan Forest | **Essaouira Day Trip from Marrakech: Coast & Argan Forest** |
| FR title / og / twitter | Côte Atlantique & Essaouira | **Excursion Essaouira depuis Marrakech** |
| FR H1 | Côte Atlantique & Essaouira | **Excursion Essaouira depuis Marrakech : Côte Atlantique** |

Evidence: `essaouira day trip from marrakech` / `excursion essaouira depuis marrakech`. The destination and “argan forest” angle are preserved, so nothing factual changes.

### 5.4 Agafay title retargeted to day-trip intent
| Field | Before | After |
|---|---|---|
| EN title / og / twitter | Agafay Desert & Marrakech Day Trek | **Agafay Desert Day Trip from Marrakech** |
| FR title / og / twitter | Désert d'Agafay : Trek d'une Journée | **Désert d'Agafay : Excursion depuis Marrakech** |

Evidence: `agafay desert day trip from marrakech`. H1 and body were not rewritten.

### 5.5 Siroua H1 language fix
`tour-siroua.html` H1: **“Massif du Siroua Trek” → “Siroua Massif Trek”**. The page is English and the title was already “Siroua Massif Trek”; the H1 mixed French into an English page. No French content was changed.

### 5.6 Toubkal winter guidance expanded (factual, not promotional)
In `#best-time` on `tour-toubkal.html` / `-fr.html`, the existing line about crampons and ice axes was extended with verifiable general mountaineering facts consistent with the page’s own content:

> “In practice, snow and ice cover the upper slopes from December to March, daylight hours are shorter, and the summit is best attempted with winter mountaineering experience and a local guide.”

French mirrored. Evidence: the `toubkal winter ascent / winter climb / winter kit list` cluster. No new price, itinerary, date guarantee or safety promise was added.

---

## 6. What was intentionally not done

- **No new pages.** “Marrakech day trips”, “Erg Chebbi vs Chigaga”, and duration-specific Toubkal landing pages were considered and rejected: the intent is already served by `tours*.html`, the existing tour pages, and `blog-marrakech*`, and thin duplicates would compete with them.
- **No bulk generic content.** No paragraph was added that did not answer a specific evidence-backed gap.
- **No heading-tag changes on tour detail pages other than Siroua.** Most detail-page headings inherit no class-safe styling, so a tag swap could not be visually verified here.
- **No changes to prices, itineraries, booking forms, WhatsApp links, or policies.**

---

## 7. Validation

All 54 pages were re-parsed after the final edit. Result: **0 issues**.

Checks that passed on every page:

| Check | Result |
|---|---|
| Canonical present, correct (root form for `index.html`) | 54/54 |
| Unique `<title>`, ≤ 68 chars | 54/54 |
| Unique meta description, ≤ 165 chars | 54/54 |
| Exactly one `<h1>` | 54/54 |
| `og:title`, `og:description`, `og:image`, `og:url`, `og:type` | 54/54 |
| `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` | 54/54 |
| `og:url` == canonical | 54/54 |
| JSON-LD parses | 54/54 |
| No duplicate `id` values | 54/54 |
| All 68 referenced image paths exist | 54/54 |
| No broken internal `.html` links | 54/54 |
| Every `<img>` has `alt` | 54/54 |
| Logo not lazy + has `width`/`height` | 54/54 |
| hreflang set complete (en, fr, x-default) and reciprocal | 54/54 |

Additional checks:

- `sitemap.xml` parses; **54 URLs**, all resolve to an existing file, 3 alternates per URL.
- `robots.txt` intact and references the sitemap.
- Preloads verified present exactly on the 6 intended templates (`index`, `index-fr`, `tours`, `tours-fr`, `tour-toubkal`, `tour-toubkal-fr`).

> Note: an earlier run flagged “non-reciprocal hreflang” on many pages. That was a fault in the test (it compared the FR page’s `en` alternate against the wrong key), not in the markup. The corrected test passes on all 54.

---

## 8. Content inconsistencies found (reported, not changed)

These are **business facts** (duration, location, itinerary), so they were left untouched and flagged for the owner to confirm. Changing them without confirmation would risk publishing false information.

| Page(s) | Problem |
|---|---|
| `tour-ouzoud.html` vs `tour-ouzoud-fr.html` | EN hero and itinerary say **3 Days**; FR hero says **1 Jour** (FR itinerary block says 3 Jours). |
| `tour-ouzoud-fr.html` | FR page places Ouzoud in the **“Région d'Oukaimeden”** and opens the itinerary “Marrakech → Oukaimeden”. Ouzoud is not Oukaimeden — this looks like a copy-paste error from another tour. |
| `tour-essaouira.html` vs `tour-essaouira-fr.html` | EN presents a **day trip**; FR hero and intro say **2 Jours**. |
| `tour-todra-dades.html` vs `tour-todra-dades-fr.html` | EN hero **4 Days**; FR hero **3 Jours**, while the FR itinerary block says **4 Jours**. |
| `tour-siroua.html` / `tour-siroua-fr.html` | **Internal** mismatch in both languages: hero says **4 Days / 4 Jours**, itinerary says **6 Days / 6 Jours**. |
| `tour-mgoun-fr.html` | FR intro says **“5 jours”**, but the FR duration badge and itinerary both say **4 Jours** (EN is consistently 4 days). |

---

## 9. Remaining issues and recommendations

Ordered by expected value. None of these were actioned because they require assets, server facts, or business decisions not available here.

1. **Re-encode/convert the largest assets** (needs an encoder, which was unavailable):
   `ouzoud_card.jpg` 2,082 KB, `hero_about.jpg` 1,737 KB, `atlas_13.avif` 1,395 KB, `Colorful Moroccan food spread.jpg` 1,104 KB, `agafay_desert1.jpg` 1,086 KB, `flavor_tagine.jpg` 1,086 KB, `4_fes.jpg` 1,076 KB, `0_fes.jpg` 969 KB, `hero_contact.jpg` 900 KB. Targets: WebP/AVIF at ~1600–2000 px wide, quality ~75–80.
2. **Generate a `srcset`/`<picture>` set** for hero and card images. The site currently has **no `srcset` anywhere**, so every device downloads desktop-resolution files.
3. **Logo weight**: `logo-header.png` is 271 KB on every page. Convert to WebP/AVIF or switch to the existing vector `logo-icon.svg` **only if** the wordmark design is preserved.
4. **Server-side caching and compression** (`.htaccess`/nginx): not created because the server stack is unverified. Recommend Brotli/gzip for HTML/CSS/JS and long `Cache-Control` for `/images/`.
5. **Third-party CSS is render-blocking**: Google Fonts and Font Awesome 6.0.0 are full stylesheets on every page. Consider self-hosting the used font weights and subsetting/replacing Font Awesome with inline SVG icons.
6. **Heading-order nits** remain on `index*`, `contact*`, `tours*` and `blog-marrakech*` (h2 → footer h4). Cosmetic, not a ranking blocker, but `h4` → `h3` in footers would make the outline clean.
7. **EN/FR content parity gaps**: `tour-siroua.html`, `tour-saghro.html`, `tour-ait-bougmez.html` and `tour-mgoun.html` have far thinner English content than their French counterparts (e.g., Siroua EN has 1 `<h2>` vs FR’s 7). This is a content task, not a tag fix.
8. **Footer social links** point to `href="#"`. Either wire them to real profiles or remove them.
9. **`blog.html` / `blog-fr.html`** have no `<h2>` at all (H1 → H3 cards). Adding a section H2 would fix the outline.
10. **Main gallery depends on `/api/images` or `images.json`**; if neither exists in production, the slider silently stays empty. Worth confirming server-side.

---

## 10. Next priorities

1. Confirm and correct the six duration/location inconsistencies in §8 (highest trust risk).
2. Commission one image-optimisation pass over the top ~10 assets in §9 (item 1), then add `srcset` for heroes and cards.
3. Decide the server stack and add compression + cache headers.
4. Bring the thin English tour pages up to French parity (real content, not filler).
5. Re-run Lighthouse/PSI on the live site once deployed — the performance claims above are file-size/discovery improvements only, and only field/lab measurement can show LCP/CLS/INP effect.

---

## Appendix — files changed

**All 54 HTML files:** header logo de-lazied, `width="1024" height="567" decoding="async"` added.

**Performance-specific:**
`index.html`, `index-fr.html` (preconnect order, hero preloads, mobile hero, inline override cleanup, analytics `async`);
`tours.html`, `tours-fr.html` (preconnect, hero preloads);
`tour-toubkal.html`, `tour-toubkal-fr.html` (preconnect order, hero preload, duplicate preconnect removed);
`tour-essaouira.html`, `tour-essaouira-fr.html` (mobile hero swap ×2 each);
`blog-atlas.html`, `blog-atlas-fr.html`, `blog-culture.html`, `blog-culture-fr.html`, `blog-fes.html`, `blog-fes-fr.html`, `blog-sahara.html`, `blog-sahara-fr.html`, `blog-coastal.html`, `blog-coastal-fr.html`, `blog-marrakech-fr.html` (33 image dimensions).

**On-page:**
`tours.html`, `tours-fr.html` (H3→H2 ×3, day-trip section);
`blog-marrakech.html`, `blog-marrakech-fr.html` (day-trip section);
`tour-essaouira.html`, `tour-essaouira-fr.html` (title/og/twitter/H1);
`tour-agafay.html`, `tour-agafay-fr.html` (title/og/twitter);
`tour-siroua.html` (H1);
`tour-toubkal.html`, `tour-toubkal-fr.html` (winter paragraph).

**Unchanged and verified:** `sitemap.xml` (54 URLs), `robots.txt`, `css/styles.css`, all `js/` files, all images (no file was overwritten or converted).
