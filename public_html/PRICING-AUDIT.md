# Morocco Trek Tours Pricing Audit

**Scope:** 30 visitor-facing English/French tour pages (`public_html/tour-*.html`), their shared pricing scripts, runtime display, and booking/WhatsApp paths. Read-only inspection; no website files, prices, booking behavior, or design were changed. Runtime checks used the existing local preview at `http://localhost:3000` on 2026-10-21. Prices below are recorded as displayed/source values, not assertions of the correct commercial price.

## Executive findings

- All 30 tour pages load a shared pricing script. 29 load `public_html/js/luxury-pricing.js`; only `tour-toubkal-fr.html` loads `public_html/js/luxury-pricing-fr.js`. Consequently 14 French pages use the English script and show English pricing-summary labels and itinerary names after JavaScript runs.
- Both scripts initialize to duration 2, group `2-3`, season `summer`. Both tables return **€150** for that combination. All inspected pages settle to €150 after JavaScript, replacing the page-authored HTML amount. This is a shared Toubkal-oriented default, not page-specific confirmation of a tour rate.
- Several pages' initial itinerary is not two days. On load, the script does not initialize selection state from each page's active itinerary card. The summary can therefore describe a two-day Toubkal itinerary while the page describes a different tour/duration. On the French six-day Saghro page, for example, the runtime price summary says “Classic 2-Day Summit / 2-3 people / Summer” and €150 while the page itself describes a six-day Saghro trek and its HTML price is €680.
- The shared matrix supports durations 1–6 only. Both 10-day pages advertise duration 10, but selecting that itinerary reaches the missing-data branch in `getExactPrice()`, logs an error, and returns €0.
- The HTML prices and shared matrix do not establish which prices are commercially correct. No independent, authoritative per-tour price list was found in the inspected tour HTML or the shared scripts. A business-approved price source is needed before any correction can safely be made.
- The booking form submission handler includes the script-computed price, but its message calls every tour a “Mount Toubkal Trek Booking Request” (French script uses French text but also identifies Mount Toubkal). Sticky booking WhatsApp uses the sticky displayed price and itinerary summary. The script's separate `#bookNowBtn` hard-coded Toubkal handler is dormant in this set: no tour page has an element with that ID.

## Page-by-page record

“HTML price” is the literal starting value inside `#dynamicPrice`. “JS default” is the value produced by the shared script's initial state (`2 days / 2-3 / summer`). “Runtime” is the settled displayed price observed after the script animation. Values are euros per person. The itinerary column records the page-authored selectable duration(s), not an assumption that its price is correct.

| File (`public_html/`) | Tour name / page label | Itinerary duration(s) | Initial HTML price | JS default | Settled runtime | Pricing script |
|---|---|---:|---:|---:|---:|---|
| `tour-10-days.html` | 10-Day Morocco Adventure | 10 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-10-jours.html` | Grande Aventure de 10 Jours au Maroc | 10 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-agafay.html` | Agafay Desert Day Trip / Overnight / Adventure | 1, 2, 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-agafay-fr.html` | Désert d'Agafay / Nuit Désert Agafay / Aventure Désert Agafay | 1, 2, 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-ait-bougmez.html` | The Happy Valley / Happy Valley 3-Day Trek | 3 | €280 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-ait-bougmez-fr.html` | Vallée Heureuse / La Vallée Heureuse | 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-atlas-villages.html` | Atlas Mountain Village Discovery | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-atlas-villages-fr.html` | Villages Berbères de l'Atlas / Découverte Villages Atlas | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-azzaden-tamsoult.html` | Azaden & Tamsoult Tour, flexible options | 1, 2, 3, 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-azzaden-tamsoult-fr.html` | Circuit Azaden & Tamsoult, flexible options | 1, 2, 3, 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-chefchaouen.html` | Rif Mountains & Chefchaouen | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-chefchaouen-fr.html` | Ville Bleue de Chefchaouen / Montagnes Rif & Chefchaouen | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-essaouira.html` | Essaouira Coastal & Argan Forest | 1 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-essaouira-fr.html` | Côte Atlantique & Forêt d'Argan | 1 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-mgoun.html` | M'Goun Express Trek | 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-mgoun-fr.html` | Trek Express M'Goun | 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-ouzoud.html` | Ouzoud Waterfalls & Bin El Ouidane Escape | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-ouzoud-fr.html` | Cascades Ouzoud & Bin El Ouidane | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-saghro.html` | Jebel Saghro Trek | 5 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-saghro-fr.html` | Montagnes du Saghro & Trek du Désert | 6 | €680 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-sahara-erg-chebbi.html` | Sahara Desert & Erg Chebbi Trek | 5 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-sahara-erg-chebbi-fr.html` | Expédition Désert Sahara & Erg Chebbi | 5 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-sahara-merzouga.html` | 3-Day Merzouga Desert Discovery | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-sahara-merzouga-fr.html` | Découverte Désert Merzouga en 3 Jours | 3 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-siroua.html` | Massif du Siroua Trek | 6 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-siroua-fr.html` | Montagnes du Siroua & Trek Volcanique | 6 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-todra-dades.html` | Todra & Dades Gorges Expedition | 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-todra-dades-fr.html` | Expédition Gorges Todra & Dades | 4 | €580 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-toubkal.html` | High Atlas Summit Challenge | selectable 1–6 (default page price is €150) | €150 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing.js` |
| `tour-toubkal-fr.html` | Mont Toubkal : Défi du Sommet du Haut Atlas | selectable 1–6 (2-day option is default) | €150 | €150 (2d, 2–3, summer) | €150 | `js/luxury-pricing-fr.js` |

The runtime column is the initial settled state, before changing itinerary/group/season. It is not evidence that each page's displayed amount is the approved price for that tour. The two Toubkal pages are the only pages where the shared default's two-day Toubkal label corresponds to the page's own tour; other pages receive that same label by default.

## Shared group-size and season matrix

Both pricing scripts contain the same matrix in `public_html/js/luxury-pricing.js` and `public_html/js/luxury-pricing-fr.js`. Each cell is `winter / summer`, in euros per person. The scripts' comments label the durations as the Express Challenge, Classic Summit (reference), Azzaden Valley Loop, Complete Circuit, Grand Atlas Experience, and Ultimate Experience—names specific to the Toubkal itinerary set. Applying these rates to other tours is not supported by independent page-specific pricing evidence.

| Duration in shared matrix | Solo | 2–3 | 4–7 | 8–12 |
|---:|---:|---:|---:|---:|
| 1 day | €200 / €180 | €150 / €135 | €130 / €120 | €110 / €105 |
| 2 days | €250 / €230 | €175 / €150 | €145 / €135 | €125 / €120 |
| 3 days | €320 / €300 | €225 / €200 | €190 / €175 | €165 / €155 |
| 4 days | €420 / €390 | €290 / €260 | €240 / €225 | €210 / €195 |
| 5 days | €520 / €490 | €360 / €330 | €300 / €280 | €260 / €245 |
| 6 days | €620 / €590 | €430 / €400 | €360 / €335 | €310 / €295 |

**Missing matrix key:** 10 days. The JavaScript explicitly logs “No pricing data for duration” and returns 0 when selected duration is absent. The 10-day pages therefore have an initial €150 default until a selection change, but their 10-day itinerary cannot be priced by this matrix.

## Confirmed inconsistencies and impact

1. **Page-authored prices are overwritten on all 30 pages.** Each page has its own `#dynamicPrice` starting number, but the script immediately calls `updatePrice()` using the shared two-day Toubkal default. The settled value is €150 everywhere. Distinct HTML values observed are €580 on 26 pages, €280 on `tour-ait-bougmez.html`, €680 on `tour-saghro-fr.html`, and €150 on the two Toubkal pages. This establishes an overwrite; it does not establish which source value is correct.
2. **Default tour/duration is not initialized from each page.** For a page whose selectable tour is not Toubkal or whose only/active itinerary differs from two days, the visible summary and price can initially describe “Classic 2-Day Summit.” The script changes duration only in itinerary-card click handlers; it does not read the page's itinerary selection into `currentSelection` during initialization. This is visible on the runtime French Saghro page (six-day content, summary says two-day Classic Summit, €150). Similar risk applies to the other non-Toubkal pages in the page table.
3. **10-day selection is unpriced.** Both `tour-10-days.html` and `tour-10-jours.html` have a duration-10 card, but the shared table stops at duration 6. Selecting the 10-day option returns €0 with a console error. This is a confirmed missing price key, not a proposed replacement price.
4. **French language mismatch.** `tour-10-jours.html`, `tour-agafay-fr.html`, `tour-ait-bougmez-fr.html`, `tour-atlas-villages-fr.html`, `tour-azzaden-tamsoult-fr.html`, `tour-chefchaouen-fr.html`, `tour-essaouira-fr.html`, `tour-mgoun-fr.html`, `tour-ouzoud-fr.html`, `tour-saghro-fr.html`, `tour-sahara-erg-chebbi-fr.html`, `tour-sahara-merzouga-fr.html`, `tour-siroua-fr.html`, and `tour-todra-dades-fr.html` load the English pricing script. Their page text is French, but the script uses English labels for the current itinerary, group, season, and booking message.
5. **Tour identity in booking form message is misleading.** In both scripts, the booking form's WhatsApp message uses a hard-coded Mount Toubkal tour name while using the current selected duration/group/season and `getExactPrice()`. Thus the numeric value in the message follows the computed display value, but for non-Toubkal pages the tour name can be wrong. The French script similarly says Mont Toubkal. This is distinct from confirming that the calculated amount is the right commercial rate.
6. **Sticky WhatsApp path uses its own displayed state.** `scrollToBooking()` reads `#stickyItinerary`, `#stickyMeta`, and `#stickyPrice`, then includes these values in the WhatsApp text. When these DOM values are current, the numeric amount matches the sticky displayed amount. It can therefore carry the same incorrect initial default or $0 for an unsupported duration. The `#bookNowBtn` handler in the English script hard-codes a Toubkal message, but no one of the 30 audited pages contains an element with `id="bookNowBtn"`; it is not an active route for this page set.

## Source evidence

- `public_html/js/luxury-pricing.js:3-53` and `public_html/js/luxury-pricing-fr.js:3-53`: default selection and six-duration exact-price matrix; identical numeric tables.
- `public_html/js/luxury-pricing.js:55-58` and `public_html/js/luxury-pricing-fr.js:55-58`: initial calls to `updatePrice()`, `updateBreakdown()`, and `updateStickyBooking()`.
- `public_html/js/luxury-pricing.js:69-168` and `public_html/js/luxury-pricing-fr.js:69-127`: duration, group, and season selections are changed by click listeners.
- `public_html/js/luxury-pricing.js:188-212` and `public_html/js/luxury-pricing-fr.js:145-165`: missing duration/group/season returns 0; English script logs the missing duration.
- `public_html/js/luxury-pricing.js:215-245` and `public_html/js/luxury-pricing-fr.js:168-194`: writes/animates the computed value into `#dynamicPrice` and `#stickyPrice`.
- `public_html/js/luxury-pricing.js:404-432` and `public_html/js/luxury-pricing-fr.js:336-365`: form WhatsApp text includes computed price and hard-coded Toubkal tour identity.
- `public_html/js/luxury-pricing.js:503-520` and `public_html/js/luxury-pricing-fr.js:377-399`: sticky booking WhatsApp text reads sticky price/summary.
- Page HTML holds each initial price in `#dynamicPrice`; script tags for each page are listed in the page table above. For concrete examples: `public_html/tour-saghro-fr.html` has six-day tour text, `#dynamicPrice` value `680`, and loads `js/luxury-pricing.js`; `public_html/tour-ait-bougmez.html` has `#dynamicPrice` value `280`; `public_html/tour-10-days.html` and `public_html/tour-10-jours.html` expose duration 10.

## What the project data does and does not establish

The project contains (a) per-page initial HTML amounts and (b) a shared duration/group/season matrix in each pricing script. The two scripts' matrices match numerically. The initial HTML values are inconsistent across tour pages, and JavaScript replaces them at runtime. The shared script's own comments describe Toubkal itinerary names, but do not prove whether that same tariff table was intended for other pages. No independently maintained per-tour pricing catalog was identified during this audit. Therefore this report flags contradictions and missing coverage, but does **not** nominate any amount as the correct rate. Confirm intended rates and applicability with the owner before changing pricing.

## Verification performed / not performed

- **Performed:** inspected all 30 English/French tour page sources and both pricing scripts; compared literal HTML `#dynamicPrice`, page duration options, script includes, matrix data, and booking construction; loaded the 30 pages in the local browser preview and observed the settled default price; specifically confirmed French Toubkal settles to €150 and French Saghro displays the mismatched two-day English summary at €150.
- **Not performed:** submitting a booking form or opening WhatsApp, contacting a real recipient, or exhaustively clicking every combination of every itinerary/group/season on all 30 pages. The duration-10 missing-table result is confirmed by the source branch and table, without sending a booking. No prices were edited.

