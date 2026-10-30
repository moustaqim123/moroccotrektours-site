# Morocco Trek Tours working-copy change log

Baseline: `moroccotrektours.com (1).zip`, extracted to `public_html/`. The original ZIP is unchanged.

- Added canonical URLs and reciprocal `hreflang` links (`en`, `fr`, `x-default`) for all 27 bilingual page pairs.
- Added `robots.txt` and an XML sitemap listing all 54 canonical pages with language alternates.
- Added `CollectionPage`/`ItemList` JSON-LD to both tour catalog pages using their existing linked tours and page headings.
- Removed six dead `css/logo-entrance.css` requests; the same entrance animation is integrated in `css/styles.css`.
- Moved the PHP-format SMTP example outside the web root; the mail handler now loads a private sibling config, disables displayed errors, and returns a controlled localized failure when the owner has not configured SMTP. No credentials were accessed or added.
- Removed `.git`, backups, demos/tests, unused alternative CSS, development reports/scripts, and the unused legacy `php/mailer.php` from `public_html`.
- Moved `vendor/`, `node_modules/`, package metadata, Node server, and maintenance tools beside (not inside) `public_html`. PHPMailer and Node runtime dependencies are retained because the contact handler/API need them. The server now serves only `public_html`, blocks `.php` downloads because Node cannot execute PHP, and the gallery API reads its manifest there; all 23 active gallery source images exist in the static fallback. The package scripts and image utilities were updated for the new layout.
- Preserved all visitor page bodies, tour content, prices, logos, WhatsApp links, and existing layout styles.

## Owner setup still required

Copy `private/email-config.example.php` to `private/email-config.php`, add the mailbox provider's SMTP values, and place it outside `public_html` adjacent to the directory. The form will return a localized unavailable message until this private file exists. The live Hostinger Node runtime and SMTP delivery were not testable without account access. The source `images.json` also contains seven missing source paths and thumbnail paths under an absent `images/thumbs/` directory. Those entries are outside the active gallery filter, all 23 active gallery images exist, and I left the manifest untouched rather than guess replacements or remove image records.

## Deployment

This working copy has not been deployed. The original ZIP remains the rollback source.


## Verification and remaining input

- Visitor page content was compared with the original ZIP after normalizing documented canonical/hreflang/description tags, the two catalog JSON-LD blocks, redundant logo stylesheet links, and the fragment-target repairs; original tour copy and page content remain unchanged.
- All 54 canonical/hreflang mappings and sitemap alternates validate; JSON-LD parses; local HTML links, image references, and CSS `url()` references resolve.
- The Node service started with `npm start`; home, image API (62 records/23 gallery images), sitemap, robots, Socket.IO, and all 12 corrected hero images returned HTTP 200. Runtime files and `.php` source paths returned 404 from the Node static server.
- The archive’s `images.json` has seven non-gallery source paths that do not exist: `images/tours/mgoun/mgoun_main1.jpg`, `images/tours/mgoun/mgoun.jpg`, `images/tours/saghro/saghro_sunset_rocks.jpg`, `images/tours/sahara/sahara_erg_chebbi1.jpg`, `images/tours/sahara/siroua_main1.jpg`, `images/tours/siroua/siroua_volcanic_pools.jpg`, and `images/tours/siroua/volcanic_canyon.jpg`. It also lists 62 thumbnails under an absent `images/thumbs/` folder. The seven missing source records are outside the active slider’s `images/gallery/` filter, and the current slider does not read the `thumb` field; all 23 active gallery originals exist. I left the manifest untouched because replacement source photos or authorization to drop those stale records are needed.
- PHP syntax/runtime could not be run because PHP CLI is not installed in this workspace. Live email delivery and the Hostinger PHP/Node routing arrangement remain unverified.


## SEO metadata, fragment links, and gallery fallback (2026-10-21)

- Added or retained exactly one unique, page-specific `meta name="description"` on each of the 54 visitor pages. New text reflects the page’s current language and visible subject matter.
- Fixed the 17 audited fragments: `contact.html` now targets its existing message form; `customize-trip.html` now points to the existing case-sensitive `customizeForm` id; 15 tour pages now give the existing `.booking-card` the `book-now` target. The existing booking JavaScript was not changed.
- Verified the active gallery tries the Node `/api/images` endpoint and falls back to `images.json`. Its filter selects the 23 `images/gallery/` records; Socket.IO live reload is guarded by `typeof io !== 'undefined'`. No manifest records, Node source, or dependencies changed.
- No SMTP settings, credentials, hosting configuration, original ZIP, or deployment files were changed.


## Follow-up verification (2026-10-21)

- Parsed all 54 visitor pages: one title and one non-empty, unique description per page; canonical, hreflang, and sitemap entries agree and resolve to existing English/French pages. All JSON-LD blocks parse, and every non-empty local fragment link resolves.
- Compared original and current WhatsApp URLs, extracted displayed price strings, and booking/main/pricing/contact JavaScript. They are unchanged. Mobile and pricing stylesheets match the original ZIP byte-for-byte; the main stylesheet contains only the previously logged hero path corrections.
- Served the public directory with a plain static HTTP server: `/api/images` returned 404, `/images.json` returned 200, and the gallery’s 23 filtered image records each resolved to a file. This verifies that the visitor gallery does not require the Node API or Socket.IO for initial display.
- The package has no automated test script. No PHP/SMTP or Hostinger account test was performed; SMTP remains owner-configured and hosting selection remains unchanged.


## Browser audit follow-up (2026-10-21)

- Created and verified a full pre-edit backup at `moroccotrektours-working-backup-2026-10-21`, including public files, private SMTP example, Node dependencies, PHPMailer, and maintenance tools. The original ZIP remains untouched.
- Corrected three confirmed mixed-script typos inherited from the ZIP: `méهارées` to `méharées` in `index-fr.html`, `Véحicule` to `Véhicule` in `tour-10-jours.html`, and Arabic `أو` to French `ou` in `tour-azzaden-tamsoult-fr.html`. These are one-word text repairs; no tour facts, prices, layout, or booking logic changed.
- Rechecked `images.json`: 62 thumbnail paths all point to the absent `images/thumbs/` directory; active slider code does not read `thumb`. All seven missing source paths are outside its `images/gallery/` filter. Candidate same-stem files have different sizes, so they are not confirmed substitutes; the Siroua path in the Sahara folder also has a same-stem file in the Siroua folder, but its different size prevents asserting identical content. No image files or manifest records were changed.

## Browser and regression verification (2026-10-21)

- Opened the local Node preview and visited all 54 English/French visitor routes in the browser; all loaded with a page title. The English/French language selectors navigated between paired pages, and the M’Goun group selector updated the displayed price from €150 to €135 and updated the selected group size.
- Inspected desktop home, tours, M’Goun detail, and contact pages in both languages. Navigation, tour cards, booking controls, WhatsApp/contact links, and contact form fields rendered. Submitting the empty English contact form triggered browser required-field validation; no message was sent. PHP mail delivery was not tested because the preview is Node and no SMTP configuration was added.
- Final syntax checks passed for `server.js`, `main.js`, `booking-engine.js`, `luxury-pricing.js`, and `contact-form.js`. A static scan found 54 HTML pages with exactly one title and one unique non-empty description each, and no Arabic-script or replacement-character leftovers.
- The pre-edit backup was used as the regression baseline: `images.json`, `mobile-fixes.css`, `main.js`, `booking-engine.js`, `luxury-pricing.js`, and `contact-form.js` are byte-identical to the backup. The only page-file edits since backup are the three documented one-word typo corrections.
- All 23 active gallery originals are present. The seven missing `url` records are not selected by the active gallery filter, and none of the 62 `thumb` paths are consumed by the current slider. I retained all manifest entries; available same-stem candidates have differing file sizes and are not verified replacements.
- Mobile viewport emulation and browser developer-console capture were unavailable through the browser interface, so mobile visual behavior and client-side console output were not fully verified in this pass. Responsive CSS was not modified. The local Node server reported no request/runtime errors during the browser pass; its Socket.IO connection succeeded.

## Final pre-deployment audit (2026-10-21)

- Reviewed this log and the prior backup, then created and hash-verified a fresh full pre-audit backup at `moroccotrektours-working-backup-final-audit-2026-10-21` before updating this log. No site source, style, price, or booking files were changed in this audit.
- Passed static SEO checks on all 54 visitor pages: each has one title, one unique non-empty description, one expected canonical, and exactly the `en`, `fr`, and `x-default` alternates. Sitemap XML parses with 54 page URLs and 162 alternate links, all listing existing page files. `robots.txt` allows crawling and references the sitemap.
- Passed static local-reference checks for visitor HTML; no unresolved local href/src files were found (excluding PHP and Socket.IO runtime routes). The Node preview returned 200 for home, English/French tours and contact pages, a tour page, `images.json`, `/api/images`, and the Socket.IO client. It returned 404 for `generate-csrf-token.php` and `send-email.php` by design because this Node server does not execute PHP; private config, package metadata, Node entrypoint, and Composer dependencies also returned 404.
- Browser checks confirmed English-to-French language navigation and required-field validation on English and French contact forms. Empty forms were not sent. Desktop home/contact/tour pages rendered. All local active gallery images rendered on the home page. Browser developer-console capture and an explicit viewport-size override were unavailable; mobile/tablet layout checks therefore remain unperformed in a real sized viewport. Responsive breakpoints exist in `styles.css` at 1024px, 768px, and 480px, and responsive styles were unchanged.
- Confirmed a booking display/data mismatch on `tour-mgoun.html` and `tour-mgoun-fr.html`: the visible active itinerary is the 4-day M’Goun Express Trek, while the shared pricing script initializes the booking summary as a 2-day Classic Summit at €150. `tour-10-days.html` and `tour-10-jours.html` show a 10-day itinerary while the same script initializes the same unrelated 2-day/€150 summary; the shared price table has no 10-day entry. Several other tour pages also declare active durations different from the shared script’s hard-coded default. I did not alter the price table or booking behavior because the correct per-tour rates are not present in the project; owner confirmation of the intended price per tour/season/group is required before fixing this.
- Reviewed `send-email.php`, `generate-csrf-token.php`, Composer dependencies, and the example SMTP config. No private `email-config.php` or real credentials are present; the example contains placeholders and is outside the web root. The contact handler requires PHP execution, sibling `vendor/autoload.php`, sibling private config, and a configured SMTP mailbox. PHP CLI and live SMTP/Hostinger access were unavailable, so PHP syntax and delivery were not runtime-tested. Keep DEBUG_MODE false in the owner-created config.
- Hostinger deployment blocker: deploy this as a PHP/HTML site so both PHP endpoints execute. Do not use the current Node app as the domain’s site server: this project’s `server.js` explicitly 404s PHP paths. The gallery works from `images.json` without its Node API/Socket.IO for visitor display. Hostinger’s current help center describes PHP/HTML and Node.js as separate website types and says an existing PHP website cannot be switched to Node.js in place; check the account’s exact plan/runtime before any deployment. Keep `vendor/` and `private/` as siblings to `public_html/` as expected by the handler’s `dirname(__DIR__)` paths.
- The seven previously reported missing `images.json` source paths and 62 absent thumbnail paths remain unresolved, outside the active 23-image gallery; no manifest entries or images were removed/replaced.
- Original ZIP remains untouched. No production credentials were accessed, no email was sent, no Hostinger settings were changed, and nothing was deployed.
- Additional booking evidence: `tour-mgoun.html` / `tour-mgoun-fr.html` have a page-authored initial `dynamicPrice` of €580 (HTML lines 685/667) and an active 4-day itinerary (lines 617/598); the browser-rendered shared script overwrites that with €150 and labels it a 2-day Classic Summit. `tour-10-days.html` / `tour-10-jours.html` similarly author €580 in HTML (lines 752/735) and select a 10-day itinerary (lines 683/666), while the runtime summary shows the unrelated 2-day €150 entry. The 10-day duration is absent from the shared table. This strengthens the pricing/booking blocker; no rates were changed.
- The 10-day pair’s translated slugs are `tour-10-days.html` and `tour-10-jours.html`; their canonical and reciprocal `en`/`fr`/`x-default` URLs agree with the sitemap despite not following the simple `-fr` suffix pattern.

## Pricing safety fixes (2026-10-21)

- Before editing, copied the full working project to the sibling backup `moroccotrektours-working-backup-pricing-2026-10-21-172404`. The backup contains the same 3,943 files as the working copy; SHA-256 checks matched the audit, change log, and both pricing scripts.
- Restricted the existing group/season matrix to the English and French Toubkal tour pages. Initialized the Toubkal itinerary, group, and season from the page's existing `.active` selections. The numeric matrix data is unchanged.
- Preserved all existing HTML `dynamicPrice` and sticky price values on all 30 tour pages. Other tours now retain their page-authored amounts with a localized “price requires confirmation” notice; they do not use the Toubkal matrix. Unsupported or absent rates keep the HTML fallback and never render a computed €0.
- Updated English and French booking messages to use the visible page heading as the tour name, localized labels, and an explicit confirmation caveat for unapproved page prices. Kept the existing WhatsApp destination. Localized the French sticky booking route while preserving the Toubkal French page's existing scroll-to-form behavior.
- Switched the 14 French pages listed in the pricing audit from `luxury-pricing.js` to `luxury-pricing-fr.js`.
- Files changed: `public_html/js/luxury-pricing.js`, `public_html/js/luxury-pricing-fr.js`, and pricing-script includes in `tour-10-jours.html`, `tour-agafay-fr.html`, `tour-ait-bougmez-fr.html`, `tour-atlas-villages-fr.html`, `tour-azzaden-tamsoult-fr.html`, `tour-chefchaouen-fr.html`, `tour-essaouira-fr.html`, `tour-mgoun-fr.html`, `tour-ouzoud-fr.html`, `tour-saghro-fr.html`, `tour-sahara-erg-chebbi-fr.html`, `tour-sahara-merzouga-fr.html`, `tour-siroua-fr.html`, and `tour-todra-dades-fr.html`.

### Verification

- `node --check` passed for both pricing scripts.
- Browser-loaded all 30 English/French tour pages; all displayed a price and the non-Toubkal pages displayed the appropriate localized confirmation notice.
- Changed group size on the 10-day English page; its €580 HTML amount remained unchanged, its 10-day selection stayed in the summary, and no €0 quote appeared.
- Verified Toubkal matrix examples in the browser: 2 days / 4–7 / summer = €135; 2 days / 4–7 / winter = €145. French Toubkal initialized to the existing active two-day, 2–3, summer selection and €150.
- Compared all 30 page-authored `dynamicPrice` and sticky prices with the pre-edit backup: unchanged. Compared all tour-page WhatsApp URLs: unchanged. Compared CSS files with backup: unchanged. Confirmed all 14 French script references are localized and every English tour page uses the English script. Confirmed both scripts' pricing-matrix blocks are byte-for-byte unchanged from backup.
- Booking message construction was reviewed in source; forms and WhatsApp links were not submitted/opened, so no external message was sent. Browser console capture and explicit mobile viewport emulation were unavailable; no CSS was changed, but mobile visual regression was not independently measured.
- No commercial pricing data was added. Existing non-Toubkal amounts remain marked as requiring owner confirmation. Nothing was deployed and no Hostinger setting was changed.

## Homepage image path repairs (2026-10-21)

- Before editing, created the full sibling backup `moroccotrektours-working-backup-images-2026-10-21`. Verified it contained every pre-edit working-copy file with matching file sizes; SHA-256 hashes matched for the change log, both homepage files, and both homepage stylesheets.
- Restored `public_html/images/hero/hero_home.jpg` and `public_html/images/tours/mgoun/mgoun_main.jpg` from the exact matching paths in the preserved original ZIP. Both references were correct; the files were missing from the working copy. The English and French homepages share these paths.
- The homepage hero's mobile image, Toubkal card image, and 10-day tour card image already existed. Verified all homepage hero and tour-card image references against files after restoration; no CSS, dimensions, page markup, or image references changed.
- Verified restored file sizes and SHA-256 hashes against the original ZIP entries. No other image records or assets were changed; nothing was deployed.

## Image and header follow-up (2026-10-22)

- Restored the confirmed existing `logo-header.png` brand wordmark and missing tour-card source files at their referenced paths. Assets were taken from the local repository history, archived working-copy images, or the adjacent local image tree; no replacement image was generated or downloaded.
- The shared logo depth animation caused the header mark to scale and shift during its 2.5-second entrance. Disabled that animation and reserved desktop and mobile logo box dimensions with the confirmed 1024:567 image ratio. The header's existing fixed positioning and navigation were preserved.
- Verified the pre-image-fix backup against all 139 files currently in `public_html`; every mapped file had a matching SHA-256 hash. The backup also contains additional files, including the French tours catalog, absent from current `public_html` at time of inspection. No deployment occurred.

- Follow-up catalog audit found eight more missing card files with exact, subject-matching repository versions (M’Goun, Saghro, Erg Chebbi, 10-day tour, Happy Valley, Ouzoud, Todra/Dades, and Essaouira); restored them at their existing referenced paths.
- Restored public_html/tours-fr.html from the verified pre-fix backup because that bilingual catalog was missing from the current public directory; its HTML remains the unchanged backed-up page.

## Homepage and Guide image restoration (2026-10-22)

- Restored the 25 referenced homepage/Guide image paths from exact matching paths in local Git history. Also restored 11 missing hero background images used by the homepage, About/guide-profile pages, and Guide articles. Each restored file was checked against its Git blob; no page references, image styling, or layout rules were changed.
- The paths include the Toubkal and 10-day homepage cards; Guide landing cards; Atlas, Coastal, Culture, Fes, Marrakech, and Sahara article images; the Idriss profile portrait; and the English/French hero backgrounds.
- Created `pre-home-guide-image-fix-2026-10-22` before editing and verified all 150 pre-edit `public_html` files against the backup with SHA-256; zero mismatches.
- Browser checks opened the homepage, About/guide-profile pages, and all 12 English/French Guide pages. At 390×844, the English homepage and French Guide landing page were visually inspected, including the homepage tour cards. The homepage and one French Guide article reported no browser console errors; browser console logs were not captured for every route.
- A local reference scan found no unresolved `<img src>` paths in any HTML page and no missing image/background references on the homepage, About/guide-profile pages, or Guide pages. Other missing CSS background-image variants remain on contact/customize/tour pages and were outside this request's page scope.
- Local preview HTTP GET verification returned 200 for all 36 restored image files. A browser DOM check confirmed the English homepage tour-card images and the French About-page guide portraits loaded with nonzero natural dimensions.

## Hero imagery and language switcher (2026-10-22)

- Restored the exact existing `hero_tours.jpg`, `hero_contact.jpg`, and `hero_customize.jpg` desktop hero assets from the local pre-image-fix backup to their existing `public_html/images/hero/` references. Their mobile variants `hero_contact_mobile.jpg` and `hero_customize_mobile.jpg` were not present in the current site or verified backup.
- Reworked the shared language-switcher behavior in `public_html/js/main.js` to use each page’s existing localized `.html` links directly, mark the active language accessibly, and open/close the menu by click, outside click, or Escape on desktop and mobile. Removed filename reconstruction that could misroute localized tour filenames.
- Backup `pre-hero-language-switcher-2026-10-22` was verified before edits: 186/186 `public_html` files and the changelog matched SHA-256. No deployment occurred. - Browser checks opened Tours, Customize Trip, and Contact in English and French, plus both homepages, both tour catalogs, both Guide catalogs, and the English/French Atlas Guide articles at the browser’s narrow mobile viewport. Tours rendered its mobile hero; Customize Trip and Contact retained the green fallback because their intended mobile hero files are missing. The switcher opened on mobile, exposed both choices and the active language, and a click navigated from `tours.html` to `tours-fr.html`. Static audit found all 108 language links across 54 HTML pages point to existing files. Desktop viewport emulation and browser console/network log inspection were unavailable; form submission and booking actions were not triggered.
- Mobile preview exposed page-inline `!important` dropdown visibility rules that suppressed the existing click toggle. Updated the shared toggle to explicitly reveal/hide the menu while preserving each breakpoint’s positioning. Verified the menu opened in the local mobile browser after this change.

## Missing tour catalog, logo, homepage assets, and Customize page restoration (2026-10-22)

- Restored `public_html/tours-fr.html` from the verified `pre-hero-language-switcher-2026-10-22/public_html/tours-fr.html` backup because it was the only missing tour/catalog destination found by the internal HTML link audit.
- Restored the exact referenced logo and homepage assets `images/assets/logo-header.png`, `images/hero/hero_home.jpg`, and `images/tours/mgoun/mgoun_main.jpg` from that same verified backup.
- Restored `customize-trip.html` and `customize-trip-fr.html` from repository `HEAD`; the French page now matches the modern form version, fields, choices, and behavior recorded in Git. The English accommodation values remain $25, $45, $85, and $150 as before. No pricing JavaScript was changed.
- Before edits, created and SHA-256 verified full backup `pre-reported-issues-2026-10-22` (4,160 files, 124,929,297 bytes; 0 mismatches). Local verification completed for homepage, restored French tour catalog, and Customize form; see task report for scope and limitations.; no deployment occurred.


### Recovered assets and page restorations (2026-10-22)

- Restored the missing French tour catalog and Customize pages from the verified local backup / repository HEAD.
- Recovered exact catalog card images from the verified pre-hero backup to satisfy existing English and French tour references; no substitute images were used.
- Restored the referenced shared stylesheet and original logo animation icon from repository history.
- Restored the existing header logo, homepage hero, and M’Goun card image from the verified backup.
- No pricing scripts or price values were changed. No deployment was performed.
