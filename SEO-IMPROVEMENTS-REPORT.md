# SEO Improvements Report — Morocco Trek Tours

**Project:** moroccotrektours.com (`public_html/`)
**Date:** 25 October 2026
**Scope:** Technical SEO, on-page SEO, structured data, internal linking, validation
**Status:** Changes applied to the local project files only. Nothing was deployed. No backups, ZIPs, or archives were created.

---

## 1. Executive summary

| Area | Work completed |
|---|---|
| Broken mobile hero images | 27 pages / 54 CSS declarations repointed to existing assets |
| Open Graph + Twitter/X Cards | Rebuilt on all 54 pages (page-specific, absolute URLs) |
| Canonical / hreflang / sitemap / robots | Audited and re-verified — already correct, left intact |
| Titles | 15 rewritten for keyword clarity and length |
| Meta descriptions | 1 rewritten; all 54 unique and within recommended length |
| Headings | 1 vague H1 and 2 generic H2s improved |
| Internal links | 11 new contextual links (blog → tour, tour → tour) |
| Anchor text | 2 vague tour-card titles made descriptive |
| Structured data | `TouristTrip` added to 8 priority tour pages |
| Validation | 54/54 pages pass all automated checks (0 issues) |

The site is a 54-page static English/French site (27 EN / 27 FR) with correct self-referencing canonicals, three hreflang links per page, and a complete bilingual sitemap. This pass fixed the remaining broken assets and metadata gaps and strengthened on-page relevance without changing design, prices, itineraries, booking logic, or WhatsApp destinations.

---

## 2. Technical SEO fixes

### 2.1 Broken mobile hero image references (27 pages, 54 declarations)

Each affected tour page declares its mobile hero twice (a root-relative and a relative `background-image`). Both declarations pointed at files that do not exist. Every reference was repointed to an existing image of the same subject; no new images were created and the 768 px breakpoint behaviour is unchanged.

| Page(s) | Old (missing) file | New (existing) file |
|---|---|---|
| `tour-10-days.html`, `tour-10-jours.html` | `tour-10-days-main_mobile.jpg` | `tour-10-days-main1.jpg` |
| `tour-agafay.html`, `tour-agafay-fr.html` | `agafay_desert1_mobil.jpg` | `agafay_desert1.jpg` |
| `tour-ait-bougmez-fr.html` | `images/tours/happy_valley/happy_valley_main1_backup_mobile.jpg` | `images/happy_valley_main1.jpg` |
| `tour-atlas-villages(.html/-fr)`, `tour-azzaden-tamsoult(.html/-fr)` | `images/atlas_village.jpg` | `images/destinations/atlas_village.jpg` |
| `tour-chefchaouen(.html/-fr)` | `chefchaoun_akchour_mobile.jpg` | `chefchaoun_rif.jpg` |
| `tour-essaouira(.html/-fr)` | `images/tours/essaouira/Essaouira-blue-boats_mobile.jpg` | `images/Essaouira-blue-boats.jpg` |
| `tour-mgoun(.html/-fr)` | `mgoun_main1_mobile.jpg` | `mgoun_main1.jpeg` |
| `tour-ouzoud(.html/-fr)` | `ouzoud_card1.jpg` | `ouzoud_card.jpg` |
| `tour-saghro(.html/-fr)` | `saghro_mobile.jpg` | `saghro_main1.jpg` |
| `tour-sahara-erg-chebbi(.html/-fr)`, `tour-sahara-merzouga(.html/-fr)` | `sahara_erg_chebbi_mobile.jpg` | `sahara_erg_chebbi1.jpeg` |
| `tour-siroua(.html/-fr)` | `siroua_mobile.jpg` | `siroua_main1.jpeg` |
| `tour-todra-dades(.html/-fr)` | `todra_dades_mobile.jpg` | `todra_dades1.jpg` |

All 34 distinct CSS background images used across the 54 pages were checked against the filesystem; all exist.

### 2.2 Open Graph and Twitter/X Cards (54 pages)

All pages previously shared the same three generic Open Graph tags (`Morocco Trek Tours` / `Gateway To Authentic Adventures` / a relative logo path), and none had Twitter Card tags. Each page now has 12 tags placed in the same location:

- `og:type` — `article` on the 12 blog articles, `website` everywhere else
- `og:site_name`, `og:locale`, `og:locale:alternate` (`en_US` / `fr_FR` matched to page language)
- `og:url` — absolute and identical to the page canonical
- `og:title`, `og:description` — page-specific, in the page language
- `og:image` — absolute HTTPS URL using the page's own hero image
- `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`

Verification: 0 remaining generic OG strings, 0 relative `og:image` values, 0 pages where `og:url` differs from the canonical.

### 2.3 Canonical, hreflang, sitemap, robots (verified, intentionally unchanged)

These implementations were already correct and were preserved:

- 54/54 pages have a self-referencing absolute canonical; the homepage canonical is `https://moroccotrektours.com/`.
- 54/54 pages carry `en`, `fr`, and `x-default` hreflang links. Every alternate group is reciprocal across the pair (checked both directions).
- `sitemap.xml`: 54 `<url>` entries, 162 `xhtml:link` alternates (3 per URL), homepage listed as `/`, XML parses with 0 errors.
- `robots.txt`: allows all crawling and declares the sitemap.
- No page contains a `noindex` directive.

### 2.4 Internal links and image paths

- All internal `*.html` targets resolve to an existing page (0 broken links across 54 pages).
- All 46 distinct local `<img src>` values resolve to existing files (including `images/atlas_13.avif`, which was verified separately).
- No duplicated `id` attributes, no missing `charset`/`viewport`, and `<html lang>` matches the page language on all 54 pages.

### 2.5 Structured data

- All existing JSON-LD blocks parse without error.
- `TravelAgency` remains on all content pages; `CollectionPage` + `ItemList` remains on the two tours indexes.
- A page-specific `TouristTrip` node was added to 8 priority tour pages (EN/FR Toubkal, Aït Bougmez, Sahara Erg Chebbi, Atlas Villages), using only facts already on each page (name, description, hero image, canonical URL, trip type, provider).
- The `ItemList` entry for Aït Bougmez was updated from “The Happy Valley” to “Aït Bougmez Valley Trek” so the structured name matches the destination.

### 2.6 CSS

One additive rule was added to `css/styles.css` for inline contextual links (`.text-link`: brand green, 600 weight, underlined). It applies only to the new links, so no existing element or layout changed. Computed style was verified in a browser (colour `rgb(0,77,51)`, underline, weight 600).

---

## 3. On-page SEO improvements

### 3.1 Titles (15 pages)

| Page | Before | After |
|---|---|---|
| `tour-toubkal.html` | High Atlas Summit Challenge | Mount Toubkal Trek: 1-6 Day Options |
| `tour-toubkal-fr.html` | Défi du Sommet du Haut Atlas | Trek du Mont Toubkal : 1 à 6 Jours |
| `tour-ait-bougmez.html` | The Happy Valley | Aït Bougmez Valley Trek |
| `tour-atlas-villages.html` | Atlas Mountain Village Discovery | Atlas Mountain Village Trek |
| `tour-siroua.html` | Massif du Siroua Trek | Siroua Massif Trek |
| `tours.html` | Adventures & Hiking Tours | Morocco Trekking & Hiking Tours |
| `tours-fr.html` | Aventures & Circuits de Randonnée | Treks & Randonnées au Maroc |
| `index-fr.html` | Morocco Trek Tours \| Aventures en Montagne avec Guides Experts | Morocco Trek Tours \| Treks & Aventures au Maroc |
| `tour-agafay-fr.html` | Désert d'Agafay & Trek d'une Journée depuis Marrakech | Désert d'Agafay : Trek d'une Journée |
| `tour-azzaden-tamsoult.html` | Azaden & Tamsoult Tour \| Flexible Day Options 1 to 4 | Azaden & Tamsoult Trek: 1 to 4 Days |
| `tour-azzaden-tamsoult-fr.html` | Circuit Azaden & Tamsoult \| Options Flexibles 1 à 4 Jours | Trek Azaden & Tamsoult : 1 à 4 Jours |
| `tour-sahara-merzouga-fr.html` | Découverte du Désert de Merzouga en 3 Jours | Désert de Merzouga en 3 Jours |
| `tour-10-days.html` | 10-Day Morocco Adventure | 10-Day Morocco Tour: Atlas & Sahara |
| `tour-10-jours.html` | Grande Aventure de 10 Jours au Maroc | Circuit de 10 Jours au Maroc |
| `tour-ouzoud-fr.html` | Cascades d'Oukaimeden & Trek d'Ouzoud | Cascades d'Ouzoud : Trek d'une Journée |

Each title retains the `| Morocco Trek Tours` suffix. Average length is 47 characters; the longest is 62. All 54 titles remain unique.

**Note on `tour-ouzoud-fr.html`:** the previous title named “Cascades d'Oukaimeden”, but the page describes the Ouzoud waterfalls (and its H1 and description already said Ouzoud). The title now matches the actual product and the English pair.

### 3.2 Meta descriptions

- `tour-azzaden-tamsoult-fr.html`: shortened from 172 to 129 characters.
- All 54 descriptions are unique, in the page language, and between 110 and 156 characters (average 126). No unsupported claims were added.

### 3.3 Headings

| Page | Change |
|---|---|
| `tour-ait-bougmez.html` | H1 `The Happy Valley` → `Aït Bougmez Valley: The Happy Valley Trek` (adds the primary destination keyword) |
| `tour-saghro.html` | H2 `Overview` → `Jebel Saghro Trek Overview` |
| `tour-siroua.html` | H2 `Overview` → `Siroua Massif Trek Overview` |

Every page still has exactly one H1. No itinerary, price, inclusion, or exclusion text was altered.

### 3.4 Internal linking (11 new contextual links)

Blog articles previously had no outbound links to tour pages at all. Links were added only where the surrounding sentence already described the destination.

| From | Anchor text | To |
|---|---|---|
| `blog-atlas.html` | conquer Mount Toubkal | `tour-toubkal.html` |
| `blog-atlas.html` | Azzaden | `tour-azzaden-tamsoult.html` |
| `blog-sahara.html` | Erg Chebbi dunes | `tour-sahara-erg-chebbi.html` |
| `blog-coastal.html` | Essaouira | `tour-essaouira.html` |
| `blog-marrakech.html` | High Atlas | `blog-atlas.html` |
| `blog-atlas-fr.html` | conquérir le Mont Toubkal | `tour-toubkal-fr.html` |
| `blog-atlas-fr.html` | Azzaden | `tour-azzaden-tamsoult-fr.html` |
| `blog-sahara-fr.html` | dunes de l'Erg Chebbi | `tour-sahara-erg-chebbi-fr.html` |
| `blog-coastal-fr.html` | Essaouira | `tour-essaouira-fr.html` |
| `blog-marrakech-fr.html` | montagnes du Haut Atlas | `blog-atlas-fr.html` |
| `tour-mgoun.html` | Aït Bougmez Valley | `tour-ait-bougmez.html` |

English pages link only to English targets and French pages only to French targets (language-switcher links excluded from that check). Two tour-card titles were also made more descriptive:

- `tours.html`: “The Happy Valley” → “Aït Bougmez Valley Trek”
- `tours-fr.html`: “La Vallée Heureuse” → “Vallée Heureuse d'Aït Bouguemez”

### 3.5 Images and alt text

- Every image that loads a file has an `alt` attribute; no generic filename-style alt text was found.
- The only empty `alt` values are the two dynamic lightbox placeholders (`#lightbox-img`), where empty alt is correct.
- Existing `loading="lazy"` usage on below-the-fold images was left as is. Hero images are CSS backgrounds and are unaffected.
- No assets were renamed.

---

## 4. Validation results

All 54 HTML files were loaded into a browser DOM harness and parsed with `DOMParser`; sitemap and CSS were parsed separately.

| Check | Result |
|---|---|
| Pages parsed | 54/54 parsed successfully by the browser DOM parser |
| Unique `<title>` | 54/54 unique; max 62 chars |
| Unique meta description | 54/54 unique; 110–156 chars |
| Self-referencing canonical | 54/54 correct |
| hreflang (`en`, `fr`, `x-default`) | 54/54 present, all target pages exist, all groups reciprocal |
| Open Graph `og:url` = canonical | 54/54 |
| `og:image` / `twitter:image` absolute | 54/54 |
| `twitter:card` = `summary_large_image` | 54/54 |
| JSON-LD parse | 54/54 valid (54 `TravelAgency`/`CollectionPage` blocks + 8 `TouristTrip` nodes) |
| Single H1 per page | 54/54 |
| `noindex` | none |
| Broken internal links | 0 |
| Missing `alt` attributes | 0 |
| Duplicate `id` attributes | 0 |
| `lang`, `charset`, `viewport` | present and correct on all pages |
| CSS background images | 34/34 distinct paths exist |
| `<img src>` files | 46/46 distinct paths exist |
| sitemap.xml | 54 URLs, 162 alternates, homepage `/`, 0 XML errors |
| robots.txt | valid, sitemap declared |
| `.text-link` styling | applied and computed correctly |

**Not changed:** prices, pricing tables, booking forms/flow, WhatsApp numbers and prefilled messages, tour itineraries, inclusions/exclusions, navigation, layout, or colours.

---

## 5. Issues found but deliberately not changed

| Issue | Detail | Why not changed |
|---|---|---|
| M'Goun duration mismatch | EN page: 4 days (Day 1–4, “4 Days” badge). FR page: overview and meta say 5 days and the itinerary runs Jour 1–5, while its itinerary card says 4 days. | Resolving this requires confirming the real trip length; guessing would risk publishing a wrong duration. |
| Todra & Dades duration mismatch | EN page: 4 days (Day 1–4). FR page: 3 days (Jour 1–3, three-day description). | Same reason — needs business confirmation of the actual product. |
| Ouzoud FR itinerary naming | The itinerary step reads “Marrakech → Oukaimeden”, although the tour is the Ouzoud waterfalls. | The title was corrected to Ouzoud, but itinerary text is treated as tour content and was left untouched. |
| Footer social links | Social icons use `href="#"` placeholders, so no `sameAs` values could be added to the `TravelAgency` schema. | No real profile URLs exist in the project; inventing them is not acceptable. |
| Heading-order nits | `tours.html`/`tours-fr.html` and `blog.html`/`blog-fr.html` go from H1 straight to card H3s; footer widgets use H4 after a content H2 on some pages. | Semantically imperfect but not a crawlability or ranking blocker; changing tags risks small visual shifts for little benefit. |
| Image weight | 67 image files total roughly 19.5 MB; several JPEGs are large. | No image-processing tooling is available in this environment; resizing/converting could alter visual quality and must be reviewed. |
| Review/rating schema | There is no `AggregateRating`/`Review` markup. | The site has no verifiable review data, and inventing ratings would violate search guidelines. |
| Article metadata | Blog posts have no visible publish dates or author bylines, so no dated `Article` schema was added. | Adding dates would require real publication dates. |

---

## 6. Environment limitations

- **No shell/CLI tools:** the shell tool returned no output and created no files, and Node/PHP/Python were unavailable. Validation therefore used a browser DOM harness with `DOMParser`, plus direct file reads and glob checks, instead of an HTML validator or Lighthouse. A full W3C markup validation was therefore not run; the DOM parser confirms the pages load and expose the expected metadata and links, not that every tag is standards-perfect.
- **No local rendering:** `file://` navigation and a local server were unavailable, so pages were not visually regression-tested in a real viewport. The CSS change was verified through computed styles in the browser.
- **No live checks:** no deployment was performed, and there is no Search Console or analytics access, so indexing status, crawl errors, Core Web Vitals, and rich-result eligibility could not be confirmed.
- **No image tooling:** image compression, resizing, and next-gen format conversion were out of scope for the available tools.

---

## 7. Recommended next steps

1. Confirm the correct durations for M'Goun and Todra & Dades and align both language versions.
2. Replace the footer `href="#"` social placeholders with real profiles, then add `sameAs` to the `TravelAgency` schema.
3. Compress and convert the largest images to WebP/AVIF with responsive `srcset`; consider preloading the desktop hero image.
4. Add real publication dates and author information to blog posts, then add `Article` schema.
5. After deployment, submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and check the Page Indexing and Enhancements reports.
6. Consider consolidating the repeated `TravelAgency` block into a single `@id`-referenced entity if the markup is centralised later.
7. Review heading levels on listing pages when a design pass is next scheduled.
