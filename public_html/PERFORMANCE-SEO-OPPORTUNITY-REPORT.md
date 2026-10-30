# Morocco Trek Tours — Performance & SEO Opportunity Report

**Property:** https://moroccotrektours.com/
**Prepared:** 25 October 2026
**Mode:** Analysis only. No website file, title, description, content, image, price, itinerary, booking behaviour, code or configuration was changed. No deployment, backup, ZIP, paid API or subscription was used.
**Companion working copy inspected:** `public_html/` (local, not necessarily what the live host serves)

---

## 0. Executive summary

| Finding | Measurement |
|---|---|
| Mobile performance (PageSpeed Insights, Lighthouse 13.5.0) | **68–82 / 100** on 16 tested URLs — all in Google's "needs improvement" band |
| Desktop performance | **94–99 / 100** |
| Mobile LCP | **3.9 s – 5.4 s** on every tested URL (good = ≤ 2.5 s) |
| Mobile TBT / CLS | **0 ms / 0–0.006** — no JavaScript or layout problem |
| TTFB (CDN) | **2–18 ms** — server speed is not a bottleneck |
| Largest byte cost | **Fonts: 303–414 KB per page** (Font Awesome alone 228 KB via cdnjs) |
| Heaviest page | **`/tours.html` desktop: 2,931 KB**, of which 2,517 KB is images |
| Live SEO head tags | **52/54 pages have no meta description; 0/54 have canonical; 0/54 have hreflang** |
| Live crawl files | **`/robots.txt` = HTTP 404, `/sitemap.xml` = HTTP 404** |
| Field data (CrUX) | **"No Data" for every tested URL** — no real-user LCP/INP/CLS available |
| Search Console | **No connection and no exports in the workspace** — zero click/impression/query data available |
| Analytics | **No GA4 / GTM snippet** found on the live homepage or local templates |

**The single most important finding:** the live site is serving an **older HTML generation than the local working copy**. The local files already contain unique meta descriptions (54/54), canonical tags, EN/FR hreflang, Twitter cards, richer structured data, a valid `robots.txt` and a 54-URL `sitemap.xml`. None of that is live. This explains the identical **SEO 91** score on every tested page and the missing-crawl-file errors.

**Second most important:** mobile LCP is caused by **render-blocking CSS/fonts and image weight**, not by JavaScript or the server. Lighthouse puts the recoverable render-blocking time at **2,380–4,020 ms** on the mobile pages where the insight value was captured.

No traffic, CTR, ranking or revenue claim can be made in this report because Search Console access does not exist. Those sections are explicitly marked unavailable and include exact export instructions.

---

## 1. Testing method and dates

### 1.1 Tooling actually used

| Tool | Status | Use |
|---|---|---|
| PageSpeed Insights **web UI** (`https://pagespeed.web.dev/`) | Working | Official source for all Lighthouse results; both mobile and desktop reports run per submission |
| PageSpeed Insights **API** | **Blocked** — HTTP 429, "Quota exceeded … project_number:583797351490" | Not used; no results were fabricated |
| Lighthouse in-page JSON (`window.__LIGHTHOUSE_MOBILE_JSON__`, `window.__LIGHTHOUSE_DESKTOP_JSON__`) | Working | Full audit-level extraction (metrics, byte weights, resources, third parties, failed audits, LCP breakdown) |
| Local Lighthouse CLI / Node / Chrome CLI | Unavailable in this environment | No local benchmark |
| Search Console API / UI | **Not authorised** | No GSC data |
| CrUX API / dashboard | No data returned for these URLs | Field data unavailable |
| Direct HTTP requests (live crawl) | Working | 54-URL crawl, header checks, redirect checks, robots/sitemap checks |

All Lighthouse figures in this report come from the PageSpeed Insights UI running **Lighthouse 13.5.0** with **HeadlessChromium 153.0.8010.36**. The PSI UI exposes the complete Lighthouse JSON in page globals; the tables below are read from that JSON, not from screenshots or estimates.

### 1.2 Emulation settings reported by Lighthouse

| Setting | Mobile | Desktop |
|---|---|---|
| Form factor | `mobile` | `desktop` |
| Device | Moto G Power emulation | Desktop |
| Network RTT | 150 ms | 40 ms |
| CPU slowdown | 1.2× | 1× |
| Lighthouse | 13.5.0 | 13.5.0 |

### 1.3 Test window

All runs were executed on **25 October 2026 between 20:17 and 20:34 UTC** (PSI "Captured at" timestamps are recorded per row in §2). Each URL was submitted once to PSI; PSI then generated the mobile and desktop reports for the same submission. Repeat runs were made for the homepage, `/tours.html` and `/tour-toubkal.html` to show variance (§3.3).

### 1.4 What is lab and what is field

- **Lab:** every number in §3, §4 and §5 is synthetic Lighthouse data under throttled emulation. It is not a measurement of real visitors.
- **Field:** CrUX field data would be real-user data. It is **absent** for all tested URLs (§6). No field number appears anywhere in this report.

---

## 2. URLs tested and data coverage

16 URLs × 2 devices = **32 Lighthouse reports**. Each pair is a live page plus its French counterpart where one exists.

| # | URL | Role | Language | Mobile captured (UTC) | Desktop captured (UTC) |
|---|---|---|---|---|---|
| 1 | `/` | Homepage | EN | 2026-10-25 20:19:55 | 2026-10-25 20:19:55 |
| 2 | `/index-fr.html` | Homepage | FR | 2026-10-25 20:22:30 | 2026-10-25 20:22:31 |
| 3 | `/tours.html` | Tours listing | EN | 2026-10-25 20:23:59 | 2026-10-25 20:23:58 |
| 4 | `/tours-fr.html` | Tours listing | FR | 2026-10-25 20:24:23 | 2026-10-25 20:24:23 |
| 5 | `/tour-toubkal.html` | Signature trek | EN | 2026-10-25 20:24:52 | 2026-10-25 20:24:52 |
| 6 | `/tour-toubkal-fr.html` | Signature trek | FR | 2026-10-25 20:25:11 | 2026-10-25 20:25:11 |
| 7 | `/tour-essaouira.html` | Day trip | EN | 2026-10-25 20:26:06 | 2026-10-25 20:26:06 |
| 8 | `/tour-essaouira-fr.html` | Day trip | FR | 2026-10-25 20:26:53 | 2026-10-25 20:26:53 |
| 9 | `/tour-sahara-erg-chebbi.html` | Desert | EN | 2026-10-25 20:27:21 | 2026-10-25 20:27:21 |
| 10 | `/tour-sahara-erg-chebbi-fr.html` | Desert | FR | 2026-10-25 20:27:40 | 2026-10-25 20:27:40 |
| 11 | `/tour-mgoun.html` | Signature trek | EN | 2026-10-25 20:28:12 | 2026-10-25 20:28:11 |
| 12 | `/tour-mgoun-fr.html` | Signature trek | FR | 2026-10-25 20:28:33 | 2026-10-25 20:28:33 |
| 13 | `/tour-sahara-merzouga.html` | Desert | EN | 2026-10-25 20:29:05 | 2026-10-25 20:29:05 |
| 14 | `/tour-sahara-merzouga-fr.html` | Desert | FR | 2026-10-25 20:29:27 | 2026-10-25 20:29:26 |
| 15 | `/tour-10-days.html` | Multi-day circuit | EN | 2026-10-25 20:30:00 | 2026-10-25 20:29:59 |
| 16 | `/tour-10-jours.html` | Multi-day circuit | FR | 2026-10-25 20:30:21 | 2026-10-25 20:30:22 |

**Coverage:** 16 of 54 live HTML pages (30%). The selection covers the two homepages, both listing pages, and the highest-business-value products (Toubkal, Essaouira, both Sahara products, M'Goun, the 10-day circuit) in both languages.

**Not performance-tested:** the other 38 pages (Chefchaouen, Agafay, Ouzoud, Todra & Dades, Saghro, Siroua, Aït Bougmez, Atlas Villages, Azzaden-Tamsoult and all blog/about/contact/customise pages). Their HTML/head/crawl status **was** inspected (§8).

---

## 3. Lighthouse lab results

### 3.1 Mobile

| URL | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | TTFB | Weight | Req |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | **69** | 89 | 96 | 91 | 3.62 s | **5.44 s** | 0 ms | 0 | 5.51 s | 5 ms | 686.8 KB | 24 |
| `/index-fr.html` | **82** | 87 | 96 | 91 | 3.05 s | **3.95 s** | 0 ms | 0 | 3.05 s | 7 ms | 695.2 KB | 22 |
| `/tours.html` | **70** | 82 | 96 | 91 | 4.10 s | **4.78 s** | 0 ms | 0 | 5.62 s | 8 ms | 776.8 KB | 24 |
| `/tours-fr.html` | **77** | 82 | 96 | 91 | 4.07 s | **4.07 s** | 0 ms | 0 | 4.12 s | 3 ms | 771.1 KB | 24 |
| `/tour-toubkal.html` | **70** | 94 | 96 | 91 | 4.36 s | **4.74 s** | 0 ms | 0 | 5.41 s | 3 ms | 558.8 KB | 23 |
| `/tour-toubkal-fr.html` | **71** | 94 | 96 | 91 | 4.36 s | **4.73 s** | 0 ms | 0 | 5.11 s | 2 ms | 558.8 KB | 23 |
| `/tour-essaouira.html` | **76** | 94 | 96 | 91 | 4.22 s | **4.22 s** | 0 ms | 0.004 | 4.22 s | 10 ms | 573.4 KB | 23 |
| `/tour-essaouira-fr.html` | **70** | 89 | 96 | 91 | 4.37 s | **4.82 s** | 0 ms | 0 | 5.37 s | 8 ms | 573.7 KB | 23 |
| `/tour-sahara-erg-chebbi.html` | **72** | 94 | 96 | 91 | 4.24 s | **4.54 s** | 0 ms | 0 | 5.30 s | 8 ms | 526.7 KB | 22 |
| `/tour-sahara-erg-chebbi-fr.html` | **76** | 89 | 96 | 91 | 4.22 s | **4.22 s** | 0 ms | 0.005 | 4.22 s | 9 ms | 527.4 KB | 22 |
| `/tour-mgoun.html` | **68** | 94 | 96 | 91 | 4.37 s | **5.27 s** | 0 ms | 0 | 5.42 s | 7 ms | 670.7 KB | 23 |
| `/tour-mgoun-fr.html` | **68** | 89 | 96 | 91 | 4.37 s | **5.27 s** | 0 ms | 0 | 5.16 s | 15 ms | 670.5 KB | 23 |
| `/tour-sahara-merzouga.html` | **72** | 94 | 96 | 91 | 4.21 s | **4.51 s** | 0 ms | 0 | 5.06 s | 5 ms | 527.2 KB | 22 |
| `/tour-sahara-merzouga-fr.html` | **71** | 94 | 96 | 91 | 4.22 s | **4.74 s** | 0 ms | 0 | 5.34 s | 7 ms | 552.8 KB | 23 |
| `/tour-10-days.html` | **72** | 94 | 96 | 91 | 4.22 s | **4.52 s** | 0 ms | 0 | 5.09 s | 15 ms | 532.6 KB | 22 |
| `/tour-10-jours.html` | **72** | 94 | 96 | 91 | 4.22 s | **4.52 s** | 0 ms | 0 | 5.31 s | 8 ms | 533.4 KB | 22 |

### 3.2 Desktop

| URL | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | TTFB | Weight | Req |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | **94** | 89 | 96 | 91 | 0.80 s | 1.44 s | 0 ms | 0.001 | 1.22 s | 5 ms | 1,121.3 KB | 24 |
| `/index-fr.html` | **97** | 87 | 96 | 91 | 0.81 s | 1.07 s | 0 ms | 0.002 | 1.19 s | 5 ms | 1,118.1 KB | 22 |
| `/tours.html` | **95** | 87 | 96 | 91 | 0.98 s | 1.10 s | 0 ms | 0.001 | 1.44 s | 18 ms | **2,931.2 KB** | 29 |
| `/tours-fr.html` | **96** | 87 | 96 | 91 | 1.02 s | 1.02 s | 0 ms | 0.003 | 1.47 s | 13 ms | **2,692.9 KB** | 29 |
| `/tour-toubkal.html` | **97** | 96 | 96 | 91 | 0.97 s | 0.97 s | 0 ms | 0.004 | 0.97 s | 3 ms | 610.0 KB | 23 |
| `/tour-toubkal-fr.html` | **97** | 96 | 96 | 91 | 0.97 s | 1.05 s | 0 ms | 0.006 | 1.03 s | 14 ms | 610.3 KB | 23 |
| `/tour-essaouira.html` | **96** | 96 | 96 | 91 | 0.98 s | 0.98 s | 0 ms | 0.003 | 1.42 s | 8 ms | 720.2 KB | 23 |
| `/tour-essaouira-fr.html` | **97** | 92 | 96 | 91 | 0.98 s | 0.98 s | 0 ms | 0.003 | 1.25 s | 4 ms | 720.7 KB | 23 |
| `/tour-sahara-erg-chebbi.html` | **98** | 96 | 96 | 91 | 0.94 s | 0.94 s | 0 ms | 0.002 | 1.07 s | 11 ms | 636.7 KB | 22 |
| `/tour-sahara-erg-chebbi-fr.html` | **97** | 92 | 96 | 91 | 0.94 s | 0.94 s | 0 ms | 0.004 | 1.33 s | 9 ms | 636.8 KB | 22 |
| `/tour-mgoun.html` | **96** | 96 | 96 | 91 | 0.98 s | 0.98 s | 0 ms | 0.003 | 1.33 s | 8 ms | **1,215.4 KB** | 23 |
| `/tour-mgoun-fr.html` | **96** | 92 | 96 | 91 | 0.98 s | 0.98 s | 0 ms | 0.002 | 1.36 s | 5 ms | **1,215.9 KB** | 23 |
| `/tour-sahara-merzouga.html` | **98** | 96 | 96 | 91 | 0.93 s | 0.93 s | 0 ms | 0.003 | 0.93 s | 4 ms | 636.6 KB | 22 |
| `/tour-sahara-merzouga-fr.html` | **98** | 96 | 96 | 91 | 0.93 s | 0.93 s | 0 ms | 0.004 | 1.05 s | 6 ms | 637.1 KB | 22 |
| `/tour-10-days.html` | **99** | 96 | 96 | 91 | 0.79 s | 0.79 s | 0 ms | 0.002 | 0.89 s | 4 ms | 640.1 KB | 22 |
| `/tour-10-jours.html` | **97** | 96 | 96 | 91 | 0.95 s | 0.95 s | 0 ms | 0.005 | 1.38 s | 14 ms | 640.2 KB | 22 |

### 3.3 Repeated runs (variance)

| Page / device | Run 1 | Run 2 | Run 3 | Observed range |
|---|---|---|---|---|
| Homepage mobile | Perf **73**, FCP 3.0 s, LCP 5.5 s, SI 3.9 s (20:17) | Perf **69**, FCP 3.62 s, LCP 5.44 s, SI 5.51 s (20:19) | — | Perf 69–73; LCP 5.4–5.5 s; SI 3.9–5.5 s |
| `/tours.html` mobile | Perf **70**, LCP 4.78 s (20:24) | Perf **70**, LCP 4.76 s (20:31) | — | Stable |
| `/tour-toubkal.html` mobile | Perf **70**, LCP 4.74 s (20:25) | Perf **71**, LCP 4.75 s (20:31) | Perf **70**, LCP 4.7 s (20:33) | Perf 70–71; LCP 4.7–4.8 s |

The tour pages are stable. The homepage varies by 4 performance points and 1.6 s of Speed Index between runs, so the homepage should be quoted as **69–73**, not as a single score.

### 3.4 How to read these scores

- **Mobile 68–82** all fall in the 50–89 "needs improvement" band. The deficit is almost entirely **LCP and FCP**.
- **Desktop 94–99** is good, but two desktop pages carry abnormal bytes: `/tours.html` (2.93 MB) and `/tours-fr.html` (2.69 MB).
- **SEO = 91 on all 16 URLs** because exactly one SEO audit fails everywhere: *"Document does not have a meta description."* That is confirmed against the live HTML in §8.
- **Best Practices = 96 everywhere** because of *"Browser errors were logged to the console."* This is a real but low-severity code-quality issue.
- **Accessibility = 82–96.** Listing/home pages are weakest (82–89); tour pages are 89–96. Failing audits: colour contrast (all), links without a discernible name (home + listing + FR tour pages), non-sequential headings (home + listing), missing `<main>` landmark (home + listing).
- **Agentic Browsing = 50** on home and listing pages, **100** on tour pages. This is a new Lighthouse category and **not a Google ranking signal**; it is noted only so it is not mistaken for an SEO score.

**Passing comfortably everywhere:** TBT 0 ms, CLS 0–0.006, TTFB 2–18 ms. JavaScript execution, layout stability and hosting latency are **not** the problem.

---

## 4. Page weight and resource breakdown

### 4.1 Mobile resource split (transfer size)

| URL | Image | Font | CSS | JS | Doc + other | Total | Requests |
|---|---|---|---|---|---|---|---|
| `/` | 312.6 KB | 303.3 KB | 36.5 KB | 22.6 KB | 11.8 KB | 686.8 KB | 24 |
| `/index-fr.html` | 324.0 KB | 303.3 KB | 34.6 KB | 20.9 KB | 12.5 KB | 695.2 KB | 22 |
| `/tours.html` | 362.1 KB | 347.4 KB | 36.7 KB | 19.9 KB | 10.7 KB | 776.8 KB | 24 |
| `/tours-fr.html` | 355.6 KB | 347.4 KB | 36.8 KB | 19.9 KB | 11.5 KB | 771.1 KB | 24 |
| `/tour-toubkal.html` | 71.6 KB | 413.7 KB | 38.9 KB | 24.2 KB | 10.4 KB | 558.8 KB | 23 |
| `/tour-toubkal-fr.html` | 71.6 KB | 413.7 KB | 38.8 KB | 24.0 KB | 10.6 KB | 558.8 KB | 23 |
| `/tour-essaouira.html` | 87.8 KB | 413.7 KB | 38.9 KB | 24.1 KB | 8.9 KB | 573.4 KB | 23 |
| `/tour-essaouira-fr.html` | 87.8 KB | 413.7 KB | 38.8 KB | 24.1 KB | 9.2 KB | 573.7 KB | 23 |
| `/tour-sahara-erg-chebbi.html` | 87.6 KB | 367.1 KB | 38.8 KB | 24.1 KB | 9.0 KB | 526.7 KB | 22 |
| `/tour-sahara-erg-chebbi-fr.html` | 87.6 KB | 367.1 KB | 38.8 KB | 24.4 KB | 9.4 KB | 527.4 KB | 22 |
| `/tour-mgoun.html` | 184.1 KB | 413.7 KB | 38.8 KB | 24.5 KB | 9.6 KB | 670.7 KB | 23 |
| `/tour-mgoun-fr.html` | 184.1 KB | 413.7 KB | 38.9 KB | 24.1 KB | 9.7 KB | 670.5 KB | 23 |
| `/tour-sahara-merzouga.html` | 87.6 KB | 367.1 KB | 38.8 KB | 24.5 KB | 9.2 KB | 527.2 KB | 22 |
| `/tour-sahara-merzouga-fr.html` | 87.5 KB | 392.2 KB | 38.9 KB | 24.5 KB | 9.7 KB | 552.8 KB | 23 |
| `/tour-10-days.html` | 92.4 KB | 367.1 KB | 38.8 KB | 24.1 KB | 10.2 KB | 532.6 KB | 22 |
| `/tour-10-jours.html` | 92.3 KB | 367.1 KB | 38.8 KB | 24.5 KB | 10.6 KB | 533.4 KB | 22 |

**Observation:** on 13 of 16 mobile pages, **fonts are the largest or second-largest resource**, at 44–74% of total page weight. Tour pages download 367–414 KB of fonts to display an H1 and body copy.

### 4.2 Desktop weight exceptions

| URL | Total | Images | Fonts | Why it matters |
|---|---|---|---|---|
| `/tours.html` | **2,931.2 KB** | **2,516.5 KB** | 347.4 KB | 29 requests; card images served at desktop width |
| `/tours-fr.html` | **2,692.9 KB** | **2,277.4 KB** | 347.4 KB | same listing images |
| `/tour-mgoun.html` | 1,215.4 KB | 729.1 KB | 413.7 KB | one hero image dominates |
| `/tour-mgoun-fr.html` | 1,215.9 KB | 729.1 KB | 413.7 KB | same |
| `/` | 1,121.3 KB | 746.8 KB | 303.3 KB | homepage cards |
| `/index-fr.html` | 1,118.1 KB | 746.8 KB | 303.3 KB | same |
| all other tested tour pages | 610–720 KB | 71–88 KB | 367–414 KB | acceptable, font-dominated |

### 4.3 Largest individual resources

| Page | Largest resources (transfer) |
|---|---|
| Homepage mobile | `mgoun_main.jpg` 142.3 KB, `fa-solid-900.woff2` 124.8 KB, `fa-brands-400.woff2` 103.0 KB, `logo-header.png` 60.2 KB |
| Homepage desktop | `mgoun_main.jpg` 258.2 KB, `hero_home.jpg` 167.6 KB, `tour-10-days-main.jpg` 126.1 KB, `fa-solid-900.woff2` 124.8 KB, `toubkal_summit.jpg` 121.4 KB |
| `/tours.html` mobile | `fa-solid-900.woff2` 124.8 KB, `mgoun_main1.jpeg` 123.9 KB, `fa-brands-400.woff2` 103.0 KB, `logo-header.png` 60.2 KB |
| `/tours.html` desktop | `mgoun_main1.jpeg` **655.7 KB**, `agafay_desert1.jpg` 367.3 KB, `siroua_main1.jpeg` 331.9 KB, `saghro_main1.jpg` 303.7 KB, `happy_valley_main1.jpg` 257.8 KB |
| `/tour-toubkal.html` | `fa-solid-900.woff2` 124.8 KB, `fa-brands-400.woff2` 103.0 KB, `logo-header.png` 60.2 KB, Poppins woff2 46.6 KB |
| `/tour-mgoun.html` desktop | `mgoun_main1.jpeg` **655.7 KB**, `fa-solid-900.woff2` 124.8 KB, `fa-brands-400.woff2` 103.0 KB, `logo-header.png` 73.4 KB |

The same `mgoun_main1.jpeg` is **123.9 KB on mobile and 655.7 KB on desktop**: a responsive variant exists for mobile but the desktop breakpoint requests the oversized original.

### 4.4 Third-party weight

| Host | Transfer per page | Notes |
|---|---|---|
| `cdnjs.cloudflare.com` | **267.9 KB** on every page | Font Awesome CSS + `fa-solid-900.woff2` (124.8 KB) + `fa-brands-400.woff2` (103.0 KB) |
| `fonts.gstatic.com` | 51.2–161.6 KB | Poppins / Open Sans / Montserrat / Playfair / Outfit woff2 |
| `cdn.jsdelivr.net` | 7.8–8.2 KB | AOS or similar library |
| `fonts.googleapis.com` | 5.2–5.4 KB | two `css2` stylesheet requests on some templates |

There are no analytics, ad, chat or tag-manager third parties.

---

## 5. LCP and Lighthouse opportunities (lab)

### 5.1 LCP element and breakdown (mobile)

| URL | LCP element | TTFB | Resource load delay | Resource load duration | Element render delay | LCP |
|---|---|---|---|---|---|---|
| `/` | `p.hero-description` (hero text) | 5.1 ms | — | — | **3,559.7 ms** | 5.44 s |
| `/index-fr.html` | `header.hero-section` (hero background) | 7.2 ms | 766.6 ms | 345.3 ms | 42.9 ms | 3.95 s |
| `/tours.html` | `header.hero-section` (hero background) | 8.2 ms | 803.7 ms | 409.7 ms | 1,349.6 ms | 4.78 s |
| `/tours-fr.html` | `header.hero-section` (hero background) | 3.1 ms | 721.2 ms | 493.7 ms | 294.0 ms | 4.07 s |
| `/tour-toubkal.html` | `h1` | 3.1 ms | — | — | **2,551.6 ms** | 4.74 s |
| `/tour-toubkal-fr.html` | hero block (`body > div > div`) | 2.1 ms | 511.9 ms | 96.0 ms | 1,727.8 ms | 4.73 s |
| `/tour-essaouira.html` | `h1` | 10.2 ms | — | — | 1,089.4 ms | 4.22 s |
| `/tour-essaouira-fr.html` | `h1` | 8.2 ms | — | — | 2,517.2 ms | 4.82 s |
| `/tour-sahara-erg-chebbi.html` | `h1` | 8.1 ms | — | — | 2,505.3 ms | 4.54 s |
| `/tour-sahara-erg-chebbi-fr.html` | `h1` | 9.2 ms | — | — | 1,054.3 ms | 4.22 s |
| `/tour-mgoun.html` | `h1` | 7.2 ms | — | — | 2,578.0 ms | 5.27 s |
| `/tour-mgoun-fr.html` | `h1` | 15.1 ms | — | — | 2,358.4 ms | 5.27 s |
| `/tour-sahara-merzouga.html` | `h1` | 5.3 ms | — | — | 2,336.5 ms | 4.51 s |
| `/tour-sahara-merzouga-fr.html` | `h1` | 7.2 ms | — | — | 2,558.7 ms | 4.74 s |
| `/tour-10-days.html` | `h1` | 15.2 ms | — | — | 2,341.3 ms | 4.52 s |
| `/tour-10-jours.html` | `h1` | 8.2 ms | — | — | 2,519.0 ms | 4.52 s |

**Interpretation:** on 12 of 16 pages the LCP element is **text**. The wait is not the image download and not the server; it is **"element render delay"** — the browser cannot paint the H1 until render-blocking CSS and font requests resolve. On the home/listing pages the LCP is the hero *background image*, where initial connection/load delay (720–804 ms) plus render delay adds up.

### 5.2 Lighthouse insight savings (captured per page)

| Page | Device | Render-blocking | Image delivery | Cache lifetimes | Font display |
|---|---|---|---|---|---|
| Homepage | Mobile | **2,380 ms** | 156 KiB | 34 KiB | 30 ms |
| Homepage | Desktop | 570 ms | 520 KiB | 77 KiB | 250 ms |
| `/tours.html` | Mobile | **3,570 ms** | 204 KiB | 39 KiB | 20 ms |
| `/tours.html` | Desktop | 670 ms | **2,278 KiB** | 254 KiB | 40 ms |
| `/tour-toubkal.html` | Mobile | **4,020 ms** | 59 KiB | 11 KiB | 20 ms |
| `/tour-toubkal.html` | Desktop | 830 ms | 71 KiB | 16 KiB | 60 ms |

For the other 13 URLs the insight totals were not separately captured, but the per-resource blocking times in §5.3 and the image sizes in §4.3 are the underlying evidence.

Small legacy opportunities on every page: minify CSS **6.3 KiB**, minify JS **3.1 KiB**, remove unused CSS **14.5–14.6 KiB**. These are minor relative to fonts and blocking CSS and should not be prioritised first.

### 5.3 Render-blocking resources (mobile, wasted time)

| Resource | Where | Wasted time |
|---|---|---|
| Font Awesome `all.min.css` (cdnjs) | every page | **1,053–1,353 ms** |
| `js/main.js` | every page | **752–1,204 ms** |
| `css/styles.css` | every page | 452–829 ms |
| `css/mobile-fixes.css` | every page | 452–829 ms |
| `css/luxury-pricing.css` + `js/luxury-pricing.js` | all tour pages | 452–816 ms each |
| Google Fonts `css2?family=…` | most pages | 451–751 ms |
| `css/logo-entrance.css` | listing pages | 454–781 ms |

Six render-blocking stylesheets/scripts are loaded before first paint on tour pages; seven on the listing pages.

### 5.4 Failed audits worth acting on

| Category | Audit | Affected |
|---|---|---|
| SEO | `meta-description` — "Document does not have a meta description" | **all 16 URLs** |
| Best Practices | `errors-in-console` — "Browser errors were logged to the console" | all 16 URLs |
| Accessibility | `color-contrast` | all 16 URLs |
| Accessibility | `link-name` — "Links do not have a discernible name" | home, listing, Essaouira-FR, Erg Chebbi-FR, M'Goun-FR, 10-jours |
| Accessibility | `heading-order` — non-sequential headings | home, listing |
| Accessibility | `landmark-one-main` — no `<main>` | home, listing |
| Performance | `largest-contentful-paint`, `first-contentful-paint`, `speed-index` | all 16 URLs |
| Performance | `render-blocking-insight`, `image-delivery-insight`, `cache-insight`, `font-display-insight`, `network-dependency-tree-insight` | all 16 URLs |

### 5.5 What is not the bottleneck

- **Server latency:** TTFB 2–18 ms on every page (CDN `hcdn`).
- **JavaScript:** TBT 0 ms on all 32 reports; total JS is only 19.9–24.5 KB.
- **Layout stability:** CLS ≤ 0.006.
- **Image LCP on tour pages:** the H1 is the LCP element; images are not blocking those pages.
- **Third-party scripts:** there are none beyond fonts/icon libraries.

---

## 6. Core Web Vitals field data (CrUX)

**Result: unavailable.**

Every one of the 16 tested URLs returned **"No Data"** in the PageSpeed Insights field section (English UI: "Discover what your real users are experiencing — No Data"). This was checked on each run and is not a failed test.

What this means:

- No real-user **LCP**, **INP** or **CLS** is available at URL level.
- **INP cannot be measured in Lighthouse** at all; it is a field-only metric. The lab proxy is TBT, which is 0 ms everywhere.
- "No Data" usually means the URL does not have enough eligible Chrome traffic in the CrUX dataset (28-day rolling). It does **not** mean the page passes CWV.
- Origin-level field data may exist in the Search Console **Core Web Vitals** report. That report is not accessible here (§7).

**Do not describe these pages as passing or failing Core Web Vitals in the field.** The only defensible statement is: *lab LCP is 3.9–5.4 s on mobile, field data is unknown.*

---

## 7. Google Search Console

### 7.1 Status: not available

- No authorised Search Console connection exists in this environment.
- The workspace was searched for exports (`*.csv`, `*.xlsx`, `*.xls`, `*.json`, and any filename containing search/console/GSC/query/analytics/export/performance). **No Search Console export exists.**
- No Google verification meta tag is present on the live homepage (`google-site-verification` not found). The property may still be verified by DNS; that cannot be determined from outside.

Therefore this report contains **no clicks, impressions, CTR, average position, query, country, device, search-appearance, indexing or sitemap data**. Nothing in §9 or §10 is derived from GSC. Any claim that a page "gets impressions" or "has a CTR problem" would be fabricated, so none is made.

### 7.2 Exact export procedure

A user with **Owner** or **Full** permission on the property can produce everything needed in about 15 minutes.

1. Open `https://search.google.com/search-console/` and select the property (`moroccotrektours.com` domain property if it exists, otherwise the `https://moroccotrektours.com/` URL-prefix property).
2. Go to **Performance → Search results**.
3. Set the date range to **Last 3 months** (e.g. 2026-07-25 → 2026-10-24).
4. Use the **Export** button (top right) → **Download CSV**. This produces separate files for the visible tabs:
   - `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, `Search appearance.csv`, `Dates.csv`.
5. Switch the date selector to **Compare → Previous period** (2026-04-25 → 2026-07-24) and export again. This is the 3-month vs previous-3-month comparison.
6. For the 12-month trend, set a **Custom** range of 2025-10-25 → 2026-10-24 and export `Dates.csv` (and `Queries.csv` if the row limit allows).
7. Add filters and export again for the language split:
   - **Country = France** → export Queries + Pages (French-market view).
   - Optionally **Page contains `/fr` or `-fr.html`** → export Queries + Pages (French-language pages).
   - **Device = Mobile** → export Queries + Pages.
8. Go to **Indexing → Pages** → **Export** the "Why pages aren't indexed" table and the "Indexed" table.
9. Go to **Indexing → Sitemaps** and record: sitemap URL, status, last read, discovered URLs. (Note: `/sitemap.xml` is currently 404 on the live host — see §8.)
10. Go to **Experience → Core Web Vitals** → export the Mobile and Desktop URL-group tables. This is the only place where real-user LCP/INP/CLS can be obtained.
11. For query–page pairs and complete row sets (the UI table caps at 1,000 rows), use the free **Search Console API**:
    - `POST https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`
    - dimensions: `["query","page","country","device","date"]`, `rowLimit: 25000`, `type: "web"`.
    - OAuth credentials must stay private; do not paste tokens into the repository.
    - Alternative: **Bulk export to BigQuery** (free tier) if the property owner enables it.

**Recommended file layout** (create the folder, drop exports in, and the analysis can be completed without further access):

```
gsc-exports/
  gsc-queries-2026-07-25_2026-10-24.csv
  gsc-pages-2026-07-25_2026-10-24.csv
  gsc-countries-2026-07-25_2026-10-24.csv
  gsc-devices-2026-07-25_2026-10-24.csv
  gsc-appearance-2026-07-25_2026-10-24.csv
  gsc-dates-12m.csv
  gsc-queries-prev-2026-04-25_2026-07-24.csv
  gsc-pages-prev-2026-04-25_2026-07-24.csv
  gsc-queries-fr.csv
  gsc-pages-fr.csv
  gsc-indexing-pages.csv
  gsc-cwv-mobile.csv
  gsc-cwv-desktop.csv
```

### 7.3 Analysis that will be produced once exports exist

The following are the exact questions the data will answer; they map to the required analysis A–I:

| Ref | Question | Method |
|---|---|---|
| A | High-impression, low-CTR queries | Filter impressions ≥ site median, CTR < expected for position band; segment by country/device |
| B | Position 4–20 opportunities | Position 4–10 and 11–20 bands, excluding branded queries and queries already at position 1–3 |
| C | Pages with strong impressions, weak clicks | Page-level impressions vs CTR vs position; check SERP feature interference |
| D | Valuable existing traffic | Pages/queries with clicks and booking-intent modifiers (tour, trek, price, from Marrakech, day trip, private) |
| E | Declines vs previous period | 3-month vs previous 3-month delta on clicks, impressions, position; 12-month trend for seasonality |
| F | EN vs FR | Country=France and `-fr.html` filters; compare CTR and position per language |
| G | Booking-intent queries | Query classification: itinerary/price/private/from-Marrakech/duration vs informational |
| H | Cannibalization | Same query appearing on ≥2 URLs with alternating ranking; overlapping page themes |
| I | Low-visibility pages | Sitemap URLs with zero impressions in 3 months, cross-checked against internal links (§8.6) |

**Caveats that will be applied:** average position is not demand; low CTR can be caused by SERP features, brand ambiguity, country, device and ranking position; seasonality (spring/autumn trekking peaks) must be compared year-on-year where possible.

---

## 8. Live technical SEO audit (crawl of 25 October 2026)

### 8.1 Crawl coverage

All **54 URLs** in the local `sitemap.xml` were requested from the live host.

- **54/54 return HTTP 200.**
- **0/54 have `noindex`.**
- **54/54 have a unique `<title>`.**
- **54/54 have exactly one `<h1>`.**
- **54/54 have `lang="en"` or `lang="fr"` set correctly.**
- Unknown URLs correctly return **404** (tested).

So there is no mass indexing blockage at page level. The problems are in the head layer and crawl files.

### 8.2 Confirmed live issues

| # | Issue | Evidence (live, 2026-10-25) | Scope | Impact | Confidence |
|---|---|---|---|---|---|
| 1 | **Meta descriptions missing** | 52/54 pages have no `<meta name="description">`. Only `tour-azzaden-tamsoult.html` (137 chars) and `-fr.html` (172 chars) have one. Lighthouse SEO 91 on all 16 tested pages, failing audit `meta-description`. | Site-wide | Google writes its own snippets; CTR opportunity lost; confirmed Lighthouse SEO failure | **Confirmed** |
| 2 | **Canonical tags missing** | 0/54 pages contain `<link rel="canonical">`. | Site-wide | Duplicate consolidation left to Google | **Confirmed** |
| 3 | **hreflang missing** | 0/54 pages contain any `hreflang` link. | Site-wide | EN/FR pairing not declared; wrong-language results possible | **Confirmed** |
| 4 | **`robots.txt` returns 404** | `GET /robots.txt` → 404 with the host's HTML error page. | Site-wide | No crawl directives and no sitemap reference; looks like a misconfigured deployment | **Confirmed** |
| 5 | **`sitemap.xml` returns 404** | `GET /sitemap.xml` → 404. `GET /sitemap_index.xml` → 404. | Site-wide | Search engines cannot discover the 54-URL sitemap | **Confirmed** |
| 6 | **Host/index duplication** | `http://moroccotrektours.com/` correctly ends on `https://moroccotrektours.com/`; **`https://www.moroccotrektours.com/` serves 200 with no redirect**; **`https://moroccotrektours.com/index.html` serves 200** alongside `/`. No canonical on any variant. | Site-wide | Two crawlable URL variants per page (www + /index.html); link equity and indexing split | **Confirmed** |
| 7 | **Structured data thin** | Tour pages emit only `TravelAgency`. `/tours.html` emits **no JSON-LD at all**. No `TouristTrip`, `Product`, `Offer`, `FAQPage` or `BreadcrumbList` on live pages checked. | Most pages | No eligibility for tour/product rich results | **Confirmed** |
| 8 | **No analytics** | Live homepage contains no GA4, GTM, Meta pixel, Clarity or Plausible snippet. Two local JS files only call `gtag()` conditionally. | Site-wide | Inquiries and conversions cannot be measured | **Confirmed** |
| 9 | **No Google verification meta tag** | Not present on the live homepage. | Homepage | GSC property status unknown (may be DNS-verified) | **Confirmed absence / unknown verification** |
| 10 | **Homepage links only 3 tours** | Live homepage links `tour-toubkal`, `tour-mgoun`, `tour-10-days` (EN) and the three FR equivalents. Essaouira, Chefchaouen, both Sahara products, Agafay, Ouzoud, Todra, Saghro, Siroua, Aït Bougmez, Atlas Villages and Azzaden are **not linked from either homepage**. | Site-wide internal linking | Weak discovery and link equity for 9+ commercial pages | **Confirmed** |
| 11 | **Very shallow inbound linking** | Each tour page has only **2–3 unique internal source pages** (nav/footer links are identical, so they do not add contextual value). Each blog post links to exactly one tour. | Tour pages | Deep pages depend on `/tours.html` alone | **Confirmed** |
| 12 | **Title/keyword gaps** | See §8.3. | 6 commercial pages | Query–title mismatch on the most valuable pages | **Confirmed** |

### 8.3 Live titles vs the local working copy

The live site is an older generation. Titles differ on these pages, and in each case the **local** version is the more search-aligned one:

| URL | Live title | Local title (not deployed) | Gap |
|---|---|---|---|
| `/tour-toubkal.html` | High Atlas Summit Challenge \| Morocco Trek Tours | Mount Toubkal Trek: 1-6 Day Options \| Morocco Trek Tours | **"Toubkal" absent from live title** |
| `/tour-toubkal-fr.html` | Défi du Sommet du Haut Atlas \| Morocco Trek Tours | Trek du Mont Toubkal : 1 à 6 Jours \| Morocco Trek Tours | **"Toubkal" absent** |
| `/tour-essaouira.html` | Essaouira Coastal & Argan Forest \| Morocco Trek Tours | Essaouira Day Trip from Marrakech \| Morocco Trek Tours | Missing "day trip" / "Marrakech" |
| `/tour-essaouira-fr.html` | Côte Atlantique & Essaouira \| Morocco Trek Tours | Excursion Essaouira depuis Marrakech \| Morocco Trek Tours | Missing "excursion" / "Marrakech" |
| `/tours.html` | Adventures & Hiking Tours \| Morocco Trek Tours | Morocco Trekking & Hiking Tours \| Morocco Trek Tours | Missing "Morocco" + "trekking" in the title body |
| `/tours-fr.html` | Aventures & Circuits de Randonnée \| Morocco Trek Tours | Treks & Randonnées au Maroc \| Morocco Trek Tours | Missing "Maroc" + "treks" |
| `/tour-ait-bougmez.html` | The Happy Valley \| Morocco Trek Tours | Aït Bougmez Valley Trek \| Morocco Trek Tours | **Destination keyword absent** |
| `/tour-siroua.html` | **Massif du Siroua Trek** \| Morocco Trek Tours | Siroua Massif Trek \| Morocco Trek Tours | **French title on an English URL** |
| `/tour-ouzoud-fr.html` | Cascades d'**Oukaimeden** & Trek d'Ouzoud \| Morocco Trek Tours | Cascades d'Ouzoud : Trek de 3 Jours \| Morocco Trek Tours | Title names a different destination than the H1 ("Cascades d'Ouzoud") |
| `/tour-10-days.html` | 10-Day Morocco Adventure \| Morocco Trek Tours | 10-Day Morocco Tour: Atlas & Sahara \| Morocco Trek Tours | Missing "tour" + route keywords |
| `/index-fr.html` | Morocco Trek Tours \| Aventures en Montagne avec Guides Experts | Morocco Trek Tours \| Treks & Aventures au Maroc | Missing "treks" / "Maroc" |

These are **hypotheses about query matching**, not proven CTR losses. Confirming them requires the GSC query data in §7.

### 8.4 What the local working copy already contains

| Asset | Local status | Live status |
|---|---|---|
| Meta descriptions | 54/54, 110–156 characters, unique | 2/54 |
| Canonical tags | 54/54, absolute HTTPS URLs | 0/54 |
| hreflang | 54/54 (en, fr, x-default) | 0/54 |
| Twitter card tags | 54/54 | 0/54 |
| Open Graph | 54/54 | Present |
| `robots.txt` | Valid, `Allow: /` + sitemap line | 404 |
| `sitemap.xml` | 54 URLs, hreflang annotations, no `lastmod` | 404 |
| Structured data | `TravelAgency` + `CollectionPage` on tours + `TouristTrip` on Toubkal, Aït Bougmez, Atlas Villages, Erg Chebbi | `TravelAgency` only; none on tours |
| Improved titles | See §8.3 | Older titles |

**Important:** the local `public_html/` also contains the recent content changes (duration audit and Essaouira one-day cleanup). A deployment would publish those too. The recommendation in §11 is therefore scoped to *verify and release the head/crawl layer*, coordinated with whatever content release is already approved.

### 8.5 Language handling

- URLs are cleanly separated: English pages use `*.html`, French pages use `*-fr.html`.
- `lang` attributes are correct.
- **But there is no `hreflang` on the live site**, so Google must infer the pairing. The local files fix this with reciprocal `en` / `fr` / `x-default` annotations.
- French titles are translated, but several still lack the French commercial modifiers ("excursion", "trek", "circuit", "désert", "au départ de Marrakech").

### 8.6 Indexing and duplication implications

With **no canonical tags, no hreflang, and no robots/sitemap**, and with `https://www.` and `/index.html` both returning 200, the site currently exposes two crawlable variants of every page (the `http://` → `https://` redirect works). Google will usually pick a canonical on its own, but the choice is not controlled and can differ between languages.

This is a **confirmed configuration problem**, not a guess. It is also the cheapest high-impact fix, because the correct tags already exist in the local files.

---

## 9. Prioritised URL list

Clicks, impressions, CTR and average position are **n/a for every row** — no GSC access (§7). Priority is therefore based on measured performance, confirmed technical defects, business role and internal-link evidence. Confidence reflects the strength of the evidence, not expected traffic.

### 9.1 High priority

| URL | Role | Mobile perf / LCP | Desktop perf / LCP | Weight (M/D) | Confirmed issues | Recommended next action | Confidence |
|---|---|---|---|---|---|---|---|
| `/` | Homepage, strongest internal page | 69–73 / 5.4 s | 94 / 1.44 s | 687 / 1,121 KB | Missing meta description; LCP element is hero text with 3,560 ms render delay; 2,380 ms render-blocking; 1 missing alt image; contrast/link-name/heading-order | Deploy head metadata; cut render-blocking CSS/fonts; fix alt + a11y names | High |
| `/tour-toubkal.html` | Signature trek, highest commercial intent | 70 / 4.74 s | 97 / 0.97 s | 559 / 610 KB | Title omits "Toubkal"; no meta description; 4,020 ms render-blocking; font 414 KB | Deploy local title/description/canonical/hreflang; remove render-blocking CSS | High |
| `/tour-toubkal-fr.html` | Same, FR | 71 / 4.73 s | 97 / 1.05 s | 559 / 610 KB | Title omits "Toubkal"; no description; 4.7 s LCP; LCP element is hero block | Same as EN | High |
| `/tours.html` | Main listing / category page | 70 / 4.78 s | 95 / 1.10 s | 777 / **2,931 KB** | Title lacks "Morocco trekking"; no description; desktop images 2.5 MB; 3,570 ms render-blocking; 2,278 KiB image savings | Deploy metadata; responsive card images; defer non-critical CSS | High |
| `/tours-fr.html` | Main listing / FR | 77 / 4.07 s | 96 / 1.02 s | 771 / **2,693 KB** | Same as EN listing; title lacks "Maroc"/"treks" | Same as EN listing | High |
| `/tour-essaouira.html` | Day trip, short decision cycle | 76 / 4.22 s | 96 / 0.98 s | 573 / 720 KB | Title lacks "day trip"/"Marrakech"; no description; 1,089 ms LCP render delay | Deploy local title/description; keep one-day content (already correct) | High |
| `/tour-essaouira-fr.html` | Day trip, FR | 70 / 4.82 s | 97 / 0.98 s | 574 / 721 KB | Title lacks "excursion"/"Marrakech"; a11y 89 (contrast + link-name); 2,517 ms render delay | Deploy metadata; a11y link names | High |
| `/tour-mgoun.html` | Signature trek | **68** / 5.27 s | 96 / 0.98 s | 671 / **1,215 KB** | Slowest mobile page; 655.7 KB hero on desktop; no description; 2,578 ms render delay | Compress/responsive hero; deploy metadata; reduce blocking CSS | High |
| `/tour-mgoun-fr.html` | Signature trek, FR | **68** / 5.27 s | 96 / 0.98 s | 671 / 1,216 KB | Same as EN | Same as EN | High |
| `/tour-sahara-merzouga.html` | 3-day desert, high intent | 72 / 4.51 s | 98 / 0.93 s | 527 / 637 KB | No description; 2,337 ms render delay; title lacks "from Marrakech" | Deploy metadata; test title against GSC queries | Medium-High |
| `/tour-sahara-erg-chebbi.html` | 3-day desert, high intent | 72 / 4.54 s | 98 / 0.94 s | 527 / 637 KB | No description; 2,505 ms render delay; overlaps Merzouga theme | Deploy metadata; verify cannibalisation in GSC | Medium-High |
| `/tour-10-days.html` | High-value multi-day circuit | 72 / 4.52 s | 99 / 0.79 s | 533 / 640 KB | Title lacks "tour"/route; no description; 2,341 ms render delay | Deploy local title/description | Medium-High |

### 9.2 Medium priority

| URL | Role | Mobile perf / LCP | Issues | Action | Confidence |
|---|---|---|---|---|---|
| `/index-fr.html` | FR homepage | 82 / 3.95 s | Title lacks "treks/Maroc"; no description; hero image LCP with 767 ms load delay | Deploy metadata; optimise hero | High |
| `/tour-sahara-merzouga-fr.html` | Desert FR | 71 / 4.74 s | No description; 2,559 ms render delay | Deploy metadata | Medium-High |
| `/tour-sahara-erg-chebbi-fr.html` | Desert FR | 76 / 4.22 s | No description; a11y 89 | Deploy metadata | Medium-High |
| `/tour-10-jours.html` | 10-day FR | 72 / 4.52 s | No description; 2,519 ms render delay | Deploy metadata | Medium |
| `/tour-siroua.html` | Trek | Not tested | **French title on EN URL**; no description | Fix title; deploy metadata | High |
| `/tour-ait-bougmez.html` | Trek | Not tested | Title "The Happy Valley" omits destination; no description | Fix title; deploy metadata | High |
| `/tour-ouzoud-fr.html` | Waterfalls FR | Not tested | Title says "Oukaimeden", H1 says "Ouzoud"; no description | Align title with actual product | High |
| `/tour-chefchaouen.html` / `-fr` | Popular destination | Not tested | No descriptions; 2 inbound links | Deploy metadata; add homepage/blog links | Medium |
| `/tour-agafay.html` / `-fr` | Day trip near Marrakech | Not tested | No descriptions; 2 inbound links | Deploy metadata; internal links | Medium |
| `/tour-ouzoud.html` / `-fr` | Waterfalls | Not tested | No descriptions; 2 inbound links | Deploy metadata; internal links | Medium |
| `/tour-todra-dades.html` / `-fr` | Gorges circuit | Not tested | No descriptions; 2 inbound links | Deploy metadata | Medium |
| `/tour-saghro.html` / `-fr` | Trek | Not tested | No descriptions; 2 inbound links | Deploy metadata | Medium |
| `/tour-atlas-villages.html` / `-fr` | Village trek | Not tested | No descriptions; 2 inbound links | Deploy metadata | Medium |
| `/tour-azzaden-tamsoult.html` / `-fr` | Flexible trek | Not tested | Has descriptions (only pages that do); 2 inbound links | Keep descriptions; internal links | Low-Medium |

### 9.3 Lower priority

| URL | Role | Issues | Action |
|---|---|---|---|
| Blog pages (16 URLs) | Informational / upper funnel | No descriptions; each links only one tour; some H2 counts = 0 (`blog.html`, `blog-fr.html`) | Deploy metadata; add contextual tour links |
| `/about.html`, `/about-fr.html` | Trust | No descriptions | Deploy metadata |
| `/contact.html`, `/contact-fr.html` | Conversion | No descriptions | Deploy metadata |
| `/customize-trip.html`, `-fr` | Conversion | No descriptions; 2,279-word form page | Deploy metadata; ensure it is not indexed above core tours |

### 9.4 Confirmed problems vs likely opportunities vs incomplete data

**Confirmed problems (measured or HTTP-verified):**
1. 52/54 live pages have no meta description; Lighthouse fails the audit on all 16 tested URLs.
2. 0/54 live pages have canonical tags.
3. 0/54 live pages have hreflang.
4. `robots.txt` and `sitemap.xml` return 404.
5. `https://www.moroccotrektours.com/` and `/index.html` both serve 200 with no canonical (`http://` does correctly reach `https://`).
6. Mobile LCP 3.9–5.4 s on all 16 tested URLs.
7. Render-blocking CSS/fonts cost 2.4–4.0 s on mobile (captured pages).
8. Fonts are 303–414 KB per page; Font Awesome is 228 KB via cdnjs.
9. `/tours.html` desktop downloads 2.5 MB of images; `mgoun_main1.jpeg` is 655.7 KB.
10. 6 of the 16 tested titles have a measurable keyword gap (§8.3).
11. Tour pages have only 2–3 unique inbound internal links; the homepage links only 3 tours.
12. No analytics and no JSON-LD beyond `TravelAgency` on most pages.

**Likely opportunities requiring GSC verification:**
- Title/CTR gains on Toubkal, Essaouira, tours listing, Aït Bougmez and 10-day pages.
- Impression gains on the 9 tours that the homepage does not link to.
- Cannibalisation between `tour-sahara-erg-chebbi` and `tour-sahara-merzouga` (two 3-day Sahara products with overlapping themes).
- French-market opportunity: FR pages exist for all products but have no hreflang and several lack French commercial modifiers.
- "Invisible" pages: Agafay, Ouzoud, Todra, Saghro, Siroua, Aït Bougmez, Atlas Villages, Azzaden — all reachable only via `/tours.html` (+ one blog post at most). Their actual impressions are unknown.

**Incomplete-data recommendations (cannot be evaluated now):**
- Which queries drive the most valuable inquiries.
- Whether CTR is actually low for any query (SERP features may explain it).
- Whether French or English converts better.
- Whether the site has any indexed duplicate URLs.
- Whether CrUX at origin level passes CWV.

---

## 10. Best organic opportunities (evidence-linked, not GSC-quantified)

No query volumes, clicks or positions are available. The clusters below are derived from **what each page sells**, **the live title/H1**, and **the confirmed title gaps** — they are hypotheses to test against the GSC export, not forecasts.

| Intent cluster (EN/FR) | Target URL | Evidence | Why it is an opportunity | Confidence |
|---|---|---|---|---|
| Mount Toubkal trek / Toubkal 1–6 day options / Toubkal from Marrakech | `/tour-toubkal.html` | Live title omits "Toubkal" entirely; H1 is "Mount Toubkal: 1 to 6 Days Options"; 1,230 words; 2 inbound links | Strongest product with the clearest title defect | High |
| Toubkal trek FR / ascension Toubkal | `/tour-toubkal-fr.html` | Live title omits "Toubkal"; H1 includes it | Same defect in French | High |
| Essaouira day trip from Marrakech / excursion Essaouira | `/tour-essaouira.html`, `-fr` | Live titles omit "day trip"/"excursion"/"Marrakech"; one-day itinerary now consistent | Short-cycle, high-volume destination; title mismatch | High |
| Morocco trekking tours / Morocco hiking tours | `/tours.html` | Live title "Adventures & Hiking Tours"; 16 tour cards; 2,931 KB desktop page | Category page with the broadest commercial intent | Medium-High |
| 3-day Sahara / Merzouga desert tour | `/tour-sahara-merzouga.html` | Title includes "3-Day Merzouga" but not "from Marrakech"; 996 words | Clear intent; overlapping product with Erg Chebbi | Medium |
| Erg Chebbi / Sahara expedition | `/tour-sahara-erg-chebbi.html` | 884 words; similar theme to Merzouga | Potential cannibalisation must be checked first | Medium-Low |
| Aït Bougmez / Happy Valley trek | `/tour-ait-bougmez.html` | Live title "The Happy Valley" — destination absent | Page is effectively invisible for its own name | High |
| Ouzoud waterfalls tour / cascades d'Ouzoud | `/tour-ouzoud.html`, `-fr` | FR title names Oukaimeden; H1 names Ouzoud | Title–content mismatch in French | High |
| 10-day Morocco tour / circuit 10 jours | `/tour-10-days.html`, `/tour-10-jours.html` | Live EN title lacks "tour"/route; FR is complete | High-value itinerary; weak EN title | Medium-High |
| Chefchaouen day trip / 2-day | `/tour-chefchaouen.html`, `-fr` | No description; no homepage link; 2 inbound links | Popular destination, weak internal support | Medium |
| Agafay day trip / desert near Marrakech | `/tour-agafay.html`, `-fr` | No description; 2 inbound links | Short-cycle product; not linked from home | Medium |
| Atlas villages / Berber village trek | `/tour-atlas-villages.html`, `-fr` | `TouristTrip` schema locally; 2 inbound links | Differentiated product; low visibility | Medium-Low |

### 10.1 Cannibalisation candidates to verify in GSC

| Candidate pair | Why | Verification needed |
|---|---|---|
| `/tour-sahara-erg-chebbi.html` vs `/tour-sahara-merzouga.html` | Both are 3-day Sahara products from Marrakech with overlapping terminology | Same query appearing on both URLs with alternating positions |
| `/blog-coastal.html` vs `/tour-essaouira.html` | Blog article targets the coastal day-trip theme and links to the tour | Whether the blog outranks the commercial page for "Essaouira day trip" |
| `/tour-ouzoud.html` vs `/tour-ouzoud-fr.html` | FR title references Oukaimeden, EN references Ouzoud | Which URL ranks for "Ouzoud" queries; title mismatch |
| `/tour-10-days.html` vs `/tour-10-jours.html` | Language pair with no hreflang | Whether both appear in the same French/English SERPs |

### 10.2 Pages with little or no organic visibility to investigate

These have **no homepage link** and only 2 unique inbound internal links: Agafay, Ouzoud, Todra & Dades, Saghro, Siroua, Aït Bougmez, Atlas Villages, Azzaden-Tamsoult, Chefchaouen. They should be the first pages checked in the GSC Pages export for zero/low impressions.

---

## 11. Ranked action plan

Ranking = expected impact × confidence ÷ effort, with risk considered. Every action is tied to evidence above. Nothing here is a generic checklist item.

| # | Action | Impact | Confidence | Effort | Risk | Evidence | Success metric |
|---|---|---|---|---|---|---|---|
| 1 | **Release the head-metadata layer that already exists locally**: 54 meta descriptions, canonical tags, EN/FR hreflang, Twitter cards; plus `robots.txt` and `sitemap.xml`. Coordinate with the pending content release. | **High** | **High** | **Low** | Low–Medium | Live: 52/54 no description, 0/54 canonical, 0/54 hreflang, robots/sitemap 404. Local: all present and valid. Lighthouse SEO 91 on all 16 URLs. | Lighthouse SEO 100 on 5 sampled URLs; live crawl shows 54/54 descriptions + canonicals + hreflang; `/robots.txt` and `/sitemap.xml` 200; GSC sitemap "Success — 54 discovered" |
| 2 | **Remove the render-blocking CSS/JS chain**: inline critical CSS, defer `all.min.css`, `mobile-fixes.css`, `luxury-pricing.css`, `logo-entrance.css`, async `main.js`; drop unused icon CSS. | **High** | **High** | Medium | Medium | Mobile render-blocking savings 2,380 ms (home), 3,570 ms (tours), 4,020 ms (Toubkal); six to seven blocking files before first paint; TBT 0 ms | Mobile LCP < 2.5 s on `/`, `/tours.html`, `/tour-toubkal.html` (3 PSI runs); `render-blocking-insight` score 1; mobile perf ≥ 90 |
| 3 | **Cut font payload**: subset/self-host Font Awesome (or replace with inline SVG for the ~10 icons used), load only the used families/weights, keep `font-display: swap`. | **High** | Medium-High | Medium | Low | Fonts 303–414 KB/page; FA `fa-solid-900` 124.8 KB + `fa-brands-400` 103.0 KB on every page; `cdnjs` 267.9 KB; font-display savings 20–250 ms | Font transfer ≤ 150 KB/page; FCP improves ≥ 0.5 s; `font-display-insight` passes |
| 4 | **Fix image delivery**: add `srcset`/`sizes` for card and hero images, cap at rendered width, compress the desktop originals, shrink the logo. | **High** | **High** | Medium | Low | `/tours.html` desktop 2,516 KB images; `mgoun_main1.jpeg` 655.7 KB desktop vs 123.9 KB mobile; image-delivery savings 2,278 KiB desktop, 204 KiB mobile; logo 60.2 KB | `/tours.html` desktop < 1 MB total; image-delivery savings < 100 KiB; desktop LCP ≤ 1.5 s |
| 5 | **Enforce one canonical URL form**: 301 `www` → apex and `/index.html` → `/` (the existing `http://` → `https://` redirect already works); then the canonical tags from #1 reinforce it. | **Medium-High** | **High** | Low–Medium | Medium | `www` and `/index.html` return 200; zero canonical tags | One 301 hop per variant; GSC "Duplicate, Google chose different canonical" trends down; only one host indexed |
| 6 | **Raise static-asset cache lifetime** from 7 days to 1 year with `immutable` (fingerprinted assets) while keeping HTML short-lived. | Medium | High | Low | Low | `Cache-Control: public, max-age=604800` on CSS/JS/images; cache savings 34–254 KiB | `cache-insight` passes; repeat-visit TTFB/asset load drops |
| 7 | **Rewrite the failing live titles** using the local versions as drafts (Toubkal EN/FR, Essaouira EN/FR, tours EN/FR, Aït Bougmez, Siroua, Ouzoud-FR, 10-day EN). | Medium | Medium-High | Low | Low | §8.3 title table | After 4–6 weeks: impressions/clicks/CTR for the target query clusters (requires GSC); title contains the destination keyword |
| 8 | **Add contextual internal links**: a homepage block for day trips/desert (Essaouira, Agafay, Merzouga, Chefchaouen) and one relevant tour link per blog post. | Medium | Medium | Low | Low | Homepage links only 3 tours; 9 tours have 2 inbound links | Each commercial tour ≥ 5 unique inbound links; GSC impressions for previously unlinked pages |
| 9 | **Add structured data** for tours (`TouristTrip` with `Offer`/price and `itinerary`) and `BreadcrumbList`; keep `TravelAgency` site-wide; add `CollectionPage` to listings. | Medium | Medium | Low–Medium | Low | Live tour pages: `TravelAgency` only; `/tours.html`: none; local drafts exist for 5 pages | Rich Results Test valid; Search Appearance report shows eligible enhancements; no manual-action warnings |
| 10 | **Install measurement**: GA4 (or GTM) with events for WhatsApp clicks, form submits and `customize-trip`, and confirm Search Console ownership. | Enabler (High long-term) | High | Low | Low | No GA4/GTM/pixel on live homepage; no verification tag | Conversion events recorded; GSC property accessible; CWV report populated |
| 11 | **Fix accessibility defects**: contrast, link names, heading order, `<main>` landmark, missing alt on homepage. | Low–Medium | High | Medium | Low | A11y 82–89 on home/listing; failing audits listed in §5.4 | A11y ≥ 95 on home/listing; zero `link-name`/`heading-order`/`landmark-one-main` failures |
| 12 | **Resolve FR title/product mismatches** (Ouzoud/Oukaimeden, Siroua French title on EN). | Medium | High | Low | Low | §8.3 | Title matches H1 and product; no mixed-language titles in crawl |

### What not to do

- Do not mass-rewrite tour copy: the pages already have 700–1,740 words and clear itineraries; there is no evidence of a content-depth problem.
- Do not create new landing pages for query variants before the GSC data shows demand and before existing pages are consolidated.
- Do not change prices, itineraries, durations or booking behaviour as part of SEO work.
- Do not chase the "Agentic Browsing" score or the 6.3 KiB CSS minification before the blocking/font issues.

---

## 12. Missing data and limitations

| Gap | Consequence | How to close it |
|---|---|---|
| **No Search Console access or exports** | No clicks, impressions, CTR, position, queries, countries, devices, search appearance, indexing or sitemap data. Sections A–I of the brief cannot be answered. | §7.2 export procedure, or grant access |
| **No CrUX field data for any URL** | Cannot state real-user LCP/INP/CLS; INP is impossible to obtain from lab tests | GSC → Experience → Core Web Vitals; or CrUX API with a key (paid/limited quota) |
| **No analytics** | No inquiry, WhatsApp or booking conversion data; no way to attribute SEO changes to revenue | Install GA4/GTM with conversion events |
| **PSI API quota exhausted** (HTTP 429, project 583797351490) | Could not script bulk runs; used the web UI instead | Use an API key or wait for quota reset for larger crawls |
| **Only 16 of 54 pages performance-tested** | Other 38 pages may have different templates and issues | Run the same PSI routine on the remaining tour pages |
| **Lab ≠ field** | Lighthouse mobile uses Moto G Power + slow 4G; real devices/networks differ | Treat mobile LCP as a directional signal until CrUX exists |
| **Single test location/run per page** | CDN and network variance; homepage varied 69–73 | Re-run after changes; compare 3 runs |
| **Live vs local drift** | Live is older; local fixes are unverified in production | Deploy in a controlled release, then re-crawl |
| **No server access or logs** | Cannot confirm redirect rules, compression config or bot behaviour | Hosting/CDN access needed |
| **CDN image negotiation** | The CDN may serve WebP/AVIF to browsers; Lighthouse byte counts reflect what Chrome received, not the originals | Validate with the CDN/hosting panel |

**On estimating opportunity:** no traffic or revenue uplift is promised. The only quantified figures are measured byte/time savings reported by Lighthouse.

---

## 13. Practical next-step plan

### Next 48 hours (no site change)
1. Grant Search Console access (Owner or Full) or drop the 13 exports from §7.2 into `gsc-exports/`.
2. Confirm whether `public_html/` is the intended next release and whether the head-metadata layer has been reviewed.
3. Decide the canonical host (`https://moroccotrektours.com`) and the redirect rules.
4. Record a baseline: re-run PSI on `/`, `/tours.html`, `/tour-toubkal.html` and store the share links.

### Week 1 (after approval)
5. Deploy the head layer + `robots.txt` + `sitemap.xml` as a single, reversible release.
6. Verify with a live crawl: 54/54 descriptions, canonicals, hreflang; `/robots.txt` and `/sitemap.xml` return 200.
7. Submit the sitemap in GSC; request indexing for the re-titled pages.
8. Turn on GA4/GTM conversion events.

### Weeks 2–4
9. Ship the render-blocking fix (critical CSS + defer) and the font reduction.
10. Ship responsive images for listing cards and the M'Goun hero; re-check desktop weight.
11. Implement the 301 rules and re-test `http`, `www`, `/index.html`.
12. Extend cache lifetime to 1 year for fingerprinted assets.
13. Add homepage links for day trips and desert tours; add one tour link per blog post.

### Weeks 4–8 (measurement)
14. Re-run PSI (3 runs per key URL) and compare LCP/FCP/weight against §3–§5.
15. With GSC data, produce the A–I analysis and quantify which titles/queries moved.
16. Only then consider new pages or content expansion, based on demonstrated demand.

**Stop point:** this report is the deliverable. No website change has been made. Any deployment, redirect rule, template edit or content change requires explicit approval.

---

## Appendix A — Test reproducibility

Each result can be reproduced at:

```
https://pagespeed.web.dev/analysis?url=<url-encoded-page>&form_factor=mobile
https://pagespeed.web.dev/analysis?url=<url-encoded-page>&form_factor=desktop
```

The PSI UI runs both form factors from one submission; the report page exposes the full Lighthouse JSON. Metrics were extracted from that JSON, including `largest-contentful-paint`, `first-contentful-paint`, `total-blocking-time`, `cumulative-layout-shift`, `speed-index`, `server-response-time`, `total-byte-weight`, `network-requests`, `third-party-summary`, `lcp-breakdown-insight`, `render-blocking-insight`, `image-delivery-insight`, `cache-insight` and `font-display-insight`.

## Appendix B — Live crawl checks performed

- 54 sitemap URLs requested; status, title, meta description, canonical, hreflang, H1, robots meta recorded.
- `/robots.txt`, `/sitemap.xml`, `/sitemap_index.xml` requested.
- `http://`, `https://www.`, `/index.html`, trailing-slash, uppercase and unknown-URL variants requested with redirects disabled; the `http://` case was re-verified in the browser (it lands on the HTTPS apex).
- `Cache-Control`, `Content-Encoding`, `Content-Type`, `ETag` and `Last-Modified` read for CSS, JS, hero image, logo and HTML.
- Internal link graph built from all 54 live pages (unique source pages per target).
- JSON-LD types and Open Graph/Twitter tags checked on homepage, listing and Toubkal page.

## Appendix C — Source data notes

- Mobile home run 1 (20:17): perf 73, FCP 3.0 s, LCP 5.5 s, TBT 0 ms, CLS 0, SI 3.9 s. Run 2 (20:19) is the JSON-backed record in §3.1.
- Byte weights are Lighthouse transfer sizes (compressed over the wire), not original file sizes.
- "Font" includes icon fonts served from `cdnjs.cloudflare.com`.
- The local `sitemap.xml` contains exactly the 54 crawled URLs, with `xhtml:link` hreflang annotations and no `lastmod`.
- The local `robots.txt` is `User-agent: * / Allow: / / Sitemap: https://moroccotrektours.com/sitemap.xml`.

---

*End of report. No website files were modified. Awaiting approval before any implementation.*
