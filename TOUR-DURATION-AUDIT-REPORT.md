# Tour Duration & Route Audit Report

**Project:** Morocco Trek Tours (`public_html/`)
**Date:** 25 October 2026
**Scope:** All eight single-tour product pages in English and French, plus every tour card, listing-category description and blog cross-reference that states a duration or route for those tours.

## Authority rule

The **detailed English day-by-day itinerary** on each tour page is the single source of truth for duration and route. Hero badges, titles, cards, meta descriptions, promotional copy, pricing widgets and French translations were corrected **to match the itinerary** whenever they disagreed. No itinerary was shortened, extended or re-routed to match a title or card, and no day, price, policy or inclusion was invented.

## Result summary

| # | Tour | English page | Authoritative duration | Route (from English itinerary) | Status |
|---|------|--------------|------------------------|-------------------------------|--------|
| 1 | Aït Bougmez / Happy Valley | `tour-ait-bougmez.html` | **3 days** (2 nights in gîtes) | Marrakech → Aït Bougmez valley walk → Sidi Moussa granary & dinosaur tracks → valley exploration & return | FR + cards fixed |
| 2 | Rif Mountains & Chefchaouen | `tour-chefchaouen.html` | **3 days** | God's Bridge & Akchour → Talassemtane National Park → Chefchaouen medina | FR fixed |
| 3 | Essaouira | `tour-essaouira.html` | **1 day** (day trip only) | Argan forest & Sidi Kaouki → seafood lunch → Mogador medina/ramparts → return | EN + FR fixed |
| 4 | M'Goun Express | `tour-mgoun.html` | **4 days** (3 nights camping) | Marrakech → Tarkeddite Plateau → Oulilimt pass → M'Goun summit (4,071 m) → Tabant → Marrakech | FR fixed |
| 5 | Ouzoud & Bin El Ouidane | `tour-ouzoud.html` | **3 days** (2 nights) | Marrakech → Ouzoud waterfalls → Bin El Ouidane lake → Imi N'Ifri → Marrakech | FR rebuilt from 1-day product |
| 6 | Jebel Saghro | `tour-saghro.html` | **5 days** (1 gîte + 3 bivouacs) | Marrakech → Tagdilt → Almou n'Ouarg → Kouaouch summit (2,592 m) → Igli → Bab n'Ali → Handour → Marrakech | EN hero + FR fixed |
| 7 | Siroua Massif | `tour-siroua.html` | **6 days** (5 bivouacs) | Marrakech → Taliouine & Tamlakout → Aït Tigga → Tajgalte → Siroua summit (3,304 m) → Iriri → Amassine/Azib n'Ouagane → Marrakech | EN hero + FR fixed |
| 8 | Todra & Dades | `tour-todra-dades.html` | **4 days** | Todra arrival & introductory hike → high ridge traverse → Dades valley / Monkey Fingers → gardens & kasbahs | FR fixed |

All eight English hero badges, hero duration widgets, `itinerary-option-card` values and detailed itineraries now agree.

## Tour-by-tour detail

### 1. Aït Bougmez Valley Trek — 3 days
**Affected files:** `tour-ait-bougmez-fr.html`, `tours.html`, `tours-fr.html`

- English page was already internally consistent (hero 3 Days, option card 3 Days, Day 1–3 itinerary, "2 nights in traditional Berber gîtes"); no English edit.
- `tour-ait-bougmez-fr.html`:
  - Hero badge `2 Jours` → `3 Jours`; overview "trek de 2 jours" → "de 3 jours".
  - Two-day itinerary (Marrakech arrival / village life, exploration & return) replaced with a translation of the English three-day route: Day 1 Marrakech → valley, Day 2 Sidi Moussa granary & dinosaur tracks, Day 3 valley exploration → Marrakech.
  - Accommodation `1 Nuit en maison d'hôtes` → `2 Nuits en gîtes traditionnels`; fitness section `2 jours` → `3 jours`; included list `3 nuits en gîtes` → `2 nuits en gîtes`.
  - Booking widget: `data-duration="4"` → `"3"` and badge `4 Jours` → `3 Jours` (the page had no 4-day product).
- Cards: `tours.html` "Aït Bougmez Valley Trek" `4 Days` → `3 Days`; `tours-fr.html` "Vallée Heureuse d'Aït Bouguemez" `4 Jours` → `3 Jours`.

### 2. Rif Mountains & Chefchaouen — 3 days
**Affected file:** `tour-chefchaouen-fr.html`

- English page already correct (hero 3 Days, Day 1–3 itinerary); no English edit.
- Meta/OG/Twitter descriptions `deux jours` → `trois jours`; hero `2 Jours` → `3 Jours`; overview `2 jours` → `3 jours`.
- Two-day itinerary (Marrakech → Chefchaouen, waterfalls & return) replaced with the English route: Day 1 God's Bridge & Akchour, Day 2 Talassemtane National Park, Day 3 Chefchaouen medina.
- Accommodation `1 Nuit` → `2 Nuits` in the riad.

### 3. Essaouira — 1-day day trip
**Affected files:** `tour-essaouira.html`, `tour-essaouira-fr.html`

- English page title, hero (`1 Day`) and morning/lunch/afternoon itinerary were already correct. The leftover "Optional 3-Day Variant" and "Optional 4-Day Coastal Explorer" blocks were removed, so the detailed itinerary is now exclusively one day (see follow-up section below).
- French page: meta/OG/Twitter `escapade de deux jours` → `excursion d'une journée` (also fixes the ungrammatical "de une journée" produced by the first pass); hero `2 Jours` → `1 Jour`; overview `2 jours` → `d'une journée`.
- Two-day itinerary replaced with the English day-trip sequence: morning argan forest & Sidi Kaouki beach walk, seafood lunch, afternoon Mogador medina/ramparts/port, evening return.
- Accommodation `1 Nuit dans un riad` → `Non applicable (excursion d'une journée)`; meals line now matches the English included seafood lunch.

### 4. M'Goun Express Trek — 4 days
**Affected file:** `tour-mgoun-fr.html`

- English page already correct (hero 4 Days, "4-day express trek", Day 1–4 itinerary, 3 nights camping); no English edit.
- Meta/OG/Twitter `cinq jours` → `quatre jours`; overview `5 jours` → `4 jours`.
- Generic five-day itinerary replaced with the English route: Day 1 Tarkeddite Plateau, Day 2 Oulilimt pass, Day 3 summit day (4,071 m), Day 4 Tabant → Marrakech.
- Accommodation `4 Nuits` → `3 Nuits` in bivouac.

### 5. Ouzoud Waterfalls & Bin El Ouidane — 3 days
**Affected file:** `tour-ouzoud-fr.html`

The French page described a different product (a one-day Ouzoud walking tour via "Oukaimeden"), while the English page is a three-day Ouzoud + lake circuit.

- Title/OG/Twitter `Trek d'une Journée` → `Trek de 3 Jours`; descriptions rewritten around the lake and the three-day circuit (HTML entity `&#x27;` preserved in `meta name="description"`).
- H1 `Cascades d'Ouzoud & Trek d'Ouzoud` → `Cascades d'Ouzoud & Lac Bin El Ouidane`; hero region `Région d'Oukaimeden` → `Moyen Atlas & Lacs`; hero `1 Jour` → `3 Jours`.
- Overview and highlights rewritten to the English content (waterfalls, olive groves, water activities, boat trip, Imi N'Ifri, Middle Atlas scenery).
- Day-trip itinerary replaced with the English three days: Day 1 Ouzoud, Day 2 Bin El Ouidane, Day 3 Imi N'Ifri → Marrakech.
- Accommodation line added (`2 nuits : gîte/lodge à Ouzoud puis hôtel au bord du lac`); fitness caveat now refers to the waterfall walk only.

### 6. Jebel Saghro — 5 days
**Affected files:** `tour-saghro.html`, `tour-saghro-fr.html`

- **English:** hero badge `3 Days` contradicted the Day 1–5 detailed itinerary (and the 5-day option card). Corrected `3 Days` → `5 Days`.
- **French:** meta/OG/Twitter `six jours` → `cinq jours`; hero `6 Jours` → `5 Jours`; overview `6 jours` → `5 jours`.
- French itinerary (which had Day 1, a combined "Days 2–4" block, Day 5 summit and Day 6 return) replaced with the five English days: Tagdilt, Almou n'Ouarg, Kouaouch summit → Igli, Igli → Bab n'Ali, Bab n'Ali → Handour & return.
- Accommodation `5 Nuits en bivouac` → `4 Nuits : 1 gîte à Tagdilt + 3 bivouacs`; booking widget `data-duration="6"`/`6 Jours` → `"5"`/`5 Jours`.

### 7. Siroua Massif — 6 days
**Affected files:** `tour-siroua.html`, `tour-siroua-fr.html`

- **English:** hero badge `4 Days` contradicted the Day 1–6 detailed itinerary (and the 6-day option card). Corrected `4 Days` → `6 Days`.
- **French:** the page described a fictional four-day crater-and-natural-pools loop starting at "Tassoumt".
  - Meta/OG/Twitter `quatre jours` → `six jours`; `anciens cratères` → `formations volcaniques`; hero `4 Jours` → `6 Jours`.
  - Overview and highlights rewritten to the English volcanic-massif description; removed unsupported claims about natural swimming pools and craters.
  - Itinerary replaced with the English six days: Taliouine/Tamlakout, Aït Tigga, Tajgalte, Siroua summit (3,304 m), Iriri → Amassine/Azib n'Ouagane, return to Marrakech.
  - Accommodation `3 Nuits` → `5 Nuits` in bivouac; gear list swimsuit bullet replaced with warm clothing; "know before you go" swimming bullets removed; best-time no longer claims the pools are full.

### 8. Todra & Dades Gorges — 4 days
**Affected file:** `tour-todra-dades-fr.html`

- English page already correct (hero 4 Days, "4-day expedition", Day 1–4 itinerary); no English edit.
- Meta/OG/Twitter `trois jours` → `quatre jours`; hero `3 Jours` → `4 Jours`.
- Overview and highlights rewritten to the English high-ridge/canyon content; removed the Roses Valley claim and pool-swimming promise.
- Three-day itinerary (Todra + Dades + Roses Valley) replaced with the English four days: arrival & introductory hike, high ridge traverse, Dades valley / Monkey Fingers, gardens & kasbahs.
- Accommodation `2 Nuits` → `3 Nuits`; best-time now matches the English spring/autumn statement.

## Cross-site corrections

| File | Location | Change |
|------|----------|--------|
| `tours.html` | card 10 (Aït Bougmez) | `4 Days` → `3 Days` |
| `tours-fr.html` | card 10 (Vallée Heureuse) | `4 Jours` → `3 Jours` |
| `tours-fr.html` | "Excursions d'une journée depuis Marrakech" category | Ouzoud replaced by the Essaouira coast & argan forest link, matching the English day-trip category |
| `blog-marrakech-fr.html` | "Excursions depuis Marrakech" | Ouzoud day-trip link/name replaced by Essaouira day trip, matching the English blog |

The English equivalents (`tours.html` day-trip category, `blog-marrakech.html`) already pointed to Essaouira and were not changed. Homepage cards (`index.html`, `index-fr.html`) contain no duration errors for these tours (M'Goun 4 days is correct).

## Validation performed

Validation was run by parsing the saved files in the browser DOM harness (the local `shell` is non-functional in this environment).

1. **Per-page consistency (10 files: 8 French + 2 English):** hero `fa-clock` badge, `itinerary-option-card[data-duration]`, visible option badge, and number of itinerary day blocks all match the authoritative duration. Day titles are sequential (`Jour 1…N` / `Day 1…N`, and Morning/Lunch/Afternoon for the Essaouira day trip).
2. **Stale-duration scan across `public_html/`:** zero matches for every wrong tour/duration pairing, including
   - Siroua with 4 days/quatre jours, Saghro with 3 or 6 days/six jours, Ouzoud with 1 day/journée,
   - Essaouira and Chefchaouen with 2 days/deux jours, Todra with 3 days/trois jours, M'Goun with 5 days/cinq jours, Aït Bougmez with 2 or 4 days.
3. **Stale-route scan:** `Oukaimeden` no longer appears anywhere in `public_html/`; the Siroua crater/pool claims and the Todra Roses Valley claim are gone.
4. **Card validation:** Aït Bougmez cards read 3 Days / 3 Jours; Ouzoud, Saghro, Siroua, Todra, M'Goun, Chefchaouen and Essaouira cards already matched.
5. **Metadata/JSON-LD/JS:** titles and descriptions for all eight English pages carry no contradicting duration (M'Goun and Todra "four-day" = 4 days). Collection-page JSON-LD lists tours without duration claims and needed no change. `js/main.js` contains no duration data for these tours. `js/pricing-system.js` was **not edited**; every required duration key already existed.
6. **Pricing regression check:** the price tables for all eight tours (`tour-ait-bougmez`, `tour-chefchaouen`, `tour-essaouira`, `tour-mgoun`, `tour-ouzoud`, `tour-saghro`, `tour-siroua`, `tour-todra-dades`) were byte-compared via pattern match before and after and are unchanged. No price, inclusion, policy or WhatsApp number was modified.
7. **Link/booking integrity:** all `wa.me` links, anchors (`#book-now`), image paths, layout classes and `data-label` values are preserved; only duration values and route text changed.

## Unresolved ambiguities and derived values

1. **English heroes contradicted their own itineraries (corrected).** `tour-saghro.html` said 3 Days against a 5-day itinerary, and `tour-siroua.html` said 4 Days against a 6-day itinerary. Both hero badges were raised to the itinerary value; the option cards already agreed with the itinerary.
2. **French pages that described a different product were rebuilt, not patched.** Ouzoud, Siroua, Todra & Dades, Chefchaouen and M'Goun all had French routes that did not exist in English (Oukaimeden day trip, crater/pool loop, Roses Valley, 2-day Marrakech–Chefchaouen, generic 5-day M'Goun). These were replaced with faithful translations of the English itineraries. This is the largest content change in the audit and is intentional.
3. **Derived night counts.** The English pages do not always state nights explicitly. French "nuits" figures were derived from the itinerary length and the English overnight notes:
   - Chefchaouen 2 nights, Todra 3 nights, Siroua 5 nights, Ouzoud 2 nights (from the Day 1/Day 2 "Overnight" lines).
   - Aït Bougmez 2 nights and M'Goun 3 nights are stated explicitly in English; Saghro's 4 nights follow from the Day 1 gîte plus camps on Days 2–4.
4. **Aït Bougmez pricing tiers.** `pricing-system.js` still contains a 4-day tier for `tour-ait-bougmez.html` although the page offers only the 3-day itinerary. Left untouched per the "no pricing changes" constraint; flagged for a future decision.
5. **English Ouzoud accommodation detail.** The English page notes overnights in the itinerary but has no accommodation section; the French page's 2-night accommodation line is derived from those overnights.

## Follow-up: Essaouira one-day-only cleanup

A later decision made Essaouira a **one-day trip only**, with no multi-day variants anywhere on the site.

- `tour-essaouira.html`: removed the "Optional 3-Day Variant" and "Optional 4-Day Coastal Explorer" itinerary blocks (the only remaining multi-day content). The detailed itinerary now contains exactly the three one-day segments (Morning / Lunch / Afternoon).
- `tour-essaouira-fr.html`: already carried only the one-day translation of that itinerary; no multi-day block existed. Verified section-by-section against the English route.
- Cards (`tours.html`, `tours-fr.html`) already read `1 Day` / `1 Jour` and were unchanged.
- `js/pricing-system.js` already exposes only the `'1'` duration for `tour-essaouira.html` (150 / 85 / 55 / 40) and was not modified.
- No Essaouira reference elsewhere (blog teasers, day-trip category, 10-day itinerary, JSON-LD, sitemap) offered a 3- or 4-day Essaouira option.
- Validation: DOM parse shows one hero clock (`1 Day` / `1 Jour`), one booking option (`data-duration="1"`), three itinerary segments, no `#optional-variants` node, and zero multi-day strings in either file. Price table re-checked unchanged.

## Explicitly not changed

Design, layout, CSS, images and image paths, booking/pricing functionality and all prices, WhatsApp numbers and message links, page URLs and internal link targets, existing SEO metadata structure, and unrelated content. No backups, ZIPs or deployment artifacts were created, and no unrelated refactoring was performed.
