# CLEANUP-REPORT.md — Morocco Trek Tours (moroccotrektours-working)

Date: 2026-10-31
Mode: **Report-only.** Per owner decision, no files were deleted, renamed, moved,
or content-replaced in this pass. Every listing below was verified by reference
tracking across all live HTML (54 pages), CSS, JS, PHP, `sitemap.xml`,
`robots.txt`, `images.json`, `tools/*` (3 scripts + PowerShell), and
`public_html/.htaccess` — not by file names or age.

Environment limit: shell execution returned empty output for every command in
this session (tested again with `echo test-ok`), so scripted deletion is not
possible here. This report is the input for a manual cleanup step.

---

## Category 1 — Test scripts (publicly reachable — highest priority)

Both are plain `.php` files in the *public webroot*. `public_html/.htaccess`
does **not** block either of them (it blocks `*.md/package/composer/server.js`
by name and `vendor|private|includes|tools|_backups` as directories — no rule
matches these two). If they are deployed, anyone can trigger:

- `public_html/smtp-auth-test.php` — attempts a live SMTP connection + auth
  using real credentials from `private/email-config.php`.
- `public_html/test-mailer.php` — makes the site **send a real email** on any
  anonymous GET request.

Reference verification (zero matches in every case):
- `grep 'smtp-auth-test|test-mailer'` across `public_html/**.{html,css,js,xml,txt}` → **0**
- Not referenced by any PHP (`send-email.php`, `send-custom-trip.php`,
  `generate-csrf-token.php`, `includes/*`, `tools/*` all require only
  `vendor/autoload.php`, `private/email-config.php`, `includes/` is unused)
- Listed in `public_html/.gitignore` line 8 as dev-only (never meant to ship)
- Not in `sitemap.xml`, not in `robots.txt`

| File | Verdict |
|---|---|
| `public_html/smtp-auth-test.php` | **DELETE (confirmed)** |
| `public_html/test-mailer.php` | **DELETE (confirmed)** |

Note: identical-purpose copies exist at repo root (`smtp-auth-test.php`,
`test-mailer.php`) — outside the webroot, gitignored, harmless. Retain or delete
along with the web copies, owner's choice; they are not deployment blockers.

---

## Category 2 — Duplicate Markdown / package / development files in the webroot

All of these are webroot duplicates of files that also exist at repo root (e.g.
`package.json` verified byte-identical between root and `public_html/` copy).
All are already blocked from public HTTP access by `public_html/.htaccess`
(`FilesMatch` on `composer.json|composer.lock|package.json|package-lock.json|
cms-manifest.json|server.js|*.md` + deny rules), so the exposure is mitigated —
but they should still not be shipped.

Reference verification:
- `grep 'server\.js|package\.json|composer\.json|composer\.lock|package-lock|cms-manifest'`
  across `public_html/**.{html,css,js,xml,txt}` → **0 matches**
- `grep -i` for any of these names in `tools/*.ps1|*.js|*.php` → **0 matches**
  (build/deploy scripts reference only `images.json`, images dirs, hardening)
- Root `package.json` scripts (`start`, `generate-images`, `watch-images`) call
  `node server.js` / `node tools/…` — the **root** copies, never the public_html ones
- Runtime PHP (`send-email.php`, `send-custom-trip.php`) references none of them
- `sitemap.xml` / `robots.txt` reference none of them

| File | Verdict |
|---|---|
| `public_html/ARCHITECTURE.md` | DELETE (duplicate of root; internal architecture doc) |
| `public_html/CHANGELOG.md` | DELETE (duplicate of root) |
| `public_html/EMAIL-DIAGNOSTIC-REPORT.md` | DELETE (duplicate of root; internal mail diagnosis) |
| `public_html/PERFORMANCE-SEO-OPPORTUNITY-REPORT.md` | DELETE (duplicate of root) |
| `public_html/PREDEPLOYMENT-AUDIT-REPORT.md` | DELETE (duplicate of root) |
| `public_html/PRICING-AUDIT.md` | DELETE (duplicate of root) |
| `public_html/PRICING-MARKET-REVIEW.md` | DELETE (duplicate of root) |
| `public_html/PROJECT-MAP.md` | DELETE (duplicate of root; ironically self-describes as “outside the production folder”) |
| `public_html/SEO-IMPROVEMENTS-REPORT.md` | DELETE (duplicate of root) |
| `public_html/SEO-PHASE2-REPORT.md` | DELETE (duplicate of root) |
| `public_html/composer.json` | DELETE (build metadata; blocked by .htaccess but should not ship) |
| `public_html/composer.lock` | DELETE (same) |
| `public_html/package.json` | DELETE (same; verified byte-identical to root copy) |
| `public_html/package-lock.json` | DELETE (same) |
| `public_html/server.js` | DELETE (local dev server script; never a website file) |
| `public_html/cms-manifest.json` | DELETE (internal page→image manifest; only referenced by itself) |

Retained deliberately (do **not** delete):
- `public_html/.gitignore` — required for repo correctness (ignores
  `private/email-config.php`, `_backups/`, `vendor/`, `smtp-auth-test.php`, logs,
  `.vscode/`). Minor residual risk: dotfiles are not covered by the `.htaccess`
  FilesMatch, so confirm production also blocks dotfile serving (standard on
  Hostinger/Apache: `Files beginning with a dot` rule) — noted in Risks.
- All `*.php` in the webroot root (`send-email.php`, `send-custom-trip.php`,
  `generate-csrf-token.php`) — live endpoints (CSRF token is fetched by
  `js/contact-form.js` and `js/customize-form.js`).
- `public_html/includes/mailer.php` — dead but safe: it is a self-returning-404
  stub with **zero** references (documented in `EMAIL-DIAGNOSTIC-REPORT.md` and
  `PROJECT-MAP.md` as “can be deleted before deployment”), and the whole
  `includes/` directory is HTTP-blocked. Deleting it is optional low-priority
  dead-code pruning.

---

## Category 3 — Three unused logo SVGs in the webroot

Every page uses raster logo assets instead:
- header logo: `images/assets/logo-header.png` (all pages, `<img class="logo-img">`,
  plus JSON-LD `image`)
- favicon / apple-touch-icon: `images/assets/icon-brand.png` (all pages)
- brand vector for future use: `images/assets/logo-icon.svg` (KEPT — small,
  brand asset; referenced in internal docs as the future lightweight logo)

Reference verification: `grep -i 'svg|logo'` across
`public_html/**.{html,css,js,xml,txt,json,php}` → the only `.svg`-file
references are the files’ own content; zero pages reference these three.

Pre-approved for deletion in prior audit `public_html/PROJECT-MAP.md` (point 1).

| File | Verdict |
|---|---|
| `public_html/logo-combined.svg` | DELETE (confirmed, 0 refs) |
| `public_html/logo-symbol-professional.svg` | DELETE (confirmed, 0 refs) |
| `public_html/logo-text-only.svg` | DELETE (confirmed, 0 refs) |

---

## Unused website assets — result: NONE

Cross-reference checks completed this pass (grep across
`**.{html,css,js,json}` vs. on-disk inventory):

- **CSS:** all 4 used — `styles.css`, `mobile-fixes.css` (all pages),
  `luxury-pricing.css` (tour pages), `site-common.css` (only
  `customize-trip.html` / `customize-trip-fr.html` — confirmed live `<link>` at
  both pages’ line 44).
- **JS:** all 9 used — `main.js`, `pricing-system.js`,
  `contact-form.js`, `customize-form.js`,
  `luxury-pricing-quote.js`, `luxury-pricing-quote-fr.js`,
  `luxury-pricing-toubkal.js`, `luxury-pricing-toubkal-fr.js`
  (tour/contact/customize pages, verified by `<script src=…>` in HTML).
- **Images:** every loose file in `images/` root (32 files — `0_fes/2_fes/4_fes`,
  `argan_1`, `atlas_12/13`, `atlas_village1`, `Essaouira-blue-boats`,
  `flaavor_hamam`, `flavor_tagine/tea`, `guide_coastal_vibes1/garden/jamaa/souks`,
  `happy_valley_main1`, `hight_atlas`, `ouzoud_card`,
  `petit-desert-en-4X4-Agadir`, `remparts-incontournable-essaouira-scaled`,
  `sahara_1`, `sahara_merzouga_desert_discovery`, `sahara_morocco`, `tagin`,
  `toubkal_summit`) is referenced directly by blog/tours/index pages or by
  `images.json` (gallery manifest, fetched by `main.js`).
- **Tour/blog images:** each `images/tours/<tour>/…` and `images/blog/…` file is
  referenced by its tour/blog page (`og:image`, JSON-LD, hero `--style`,
  cards) — including the non-`1` variants (`mgoun_main.jpg`, `siroua_main.jpg`,
  `tour-10-days-main.jpg`) used on `index(.html)/-fr` cards and
  `tours-fr.html`.
- **HTML:** all 54 pages are live site pages (27 EN + 27 FR); no page is
  orphaned — `sitemap.xml`/internal links cover the public set. No HTML pages
  are deletion candidates.

Conclusion: nothing on the asset side should be deleted. The only files that
should ever go are the three categories above.

---

## Retained (explicit keep-list, verified required)

| Path | Why it stays |
|---|---|
| 54 `public_html/*.html` | live pages (all verified intact; footer/copyright checks from Addendum 1–2 still pass) |
| `public_html/css/*` (4), `public_html/js/*` (9) | all referenced |
| `public_html/images/**` | all referenced (see above) |
| `public_html/images.json` | gallery data source (`main.js:6,134` fetches it) |
| `public_html/send-email.php`, `send-custom-trip.php`, `generate-csrf-token.php` | live mail + CSRF endpoints (token fetched by contact-form.js/customize-form.js) |
| `public_html/vendor/`, root `vendor/` | PHPMailer (both autoload paths accepted by `send-email.php`) |
| `public_html/private/`, root `private/` | `email-config.php` (+example) both accepted by `send-email.php`; HTTP-blocked |
| `public_html/includes/.htaccess` | part of the blocked-dir isolation pattern (keep if the folder exists) |
| `public_html/sitemap.xml`, `robots.txt``, `public_html/.htaccess` | SEO + deployment config — never touched |
| `public_html/images/assets/logo-header.png`, `icon-brand.png`, `logo-icon.svg` | brand assets in live use / brand reserve |
| `tools/` (4 scripts) | images.json generation + mail deploy/verify workflow; zero references to any deletion candidate |
| `_backups/` | rollback records (gitignored, out of production) |
| root `*.md` reports, `package.json/lock`, `composer.json/lock`, `cms-manifest.json`, `server.js`, `smtp-auth-test.php`, `test-mailer.php` | dev-only artifacts outside the webroot; retain (owner may prune later without deployment impact) |
| `public_html/.gitignore` | repo correctness |

---

## Risks & unresolved candidates (no action taken, for the record)

1. **`smtp-auth-test.php` + `test-mailer.php` are live-reachable today** while
   they exist (Category 1). The `.htaccess` FilesMatch does not match them, and
   they end in `.php`. Delete before/with the next deployment — this is the one
   finding with real production impact.
2. **`images/thumbs/` does not exist locally**, yet `images.json` lists
   `images/thumbs/gallery/<path>.jpg` for every record and `main.js:16-23`
   prefers `thumb` over `url` (`img.src = thumb || url`). If the production
   server also lacks the `thumbs/` tree, some gallery tiles may load nothing
   depending on browser fallback behavior. Not fixable by deletion — flag for
   the owner (either deploy the thumbs or strip `.thumb` from `images.json` —
   a content change, out of scope here).
3. **`images.json` ↔ disk mismatch (informational):** manifest record
   `agafay_desert.jpg` → `images/tours/agafay/agafay_desert.jpg` while disk has
   `agafay_desert1.jpg` (which the pages reference). Historical report noted
   “23 dead images.json records.” Not a cleanup item; listed so nobody mistakes
   these as unused disk files to delete.
4. **`cms-manifest.json`** references `images/saghro_main.jpg`,
   `images/agafay_desert1.jpg` etc. with paths that partially differ from disk
   (`saghro_main1.jpg`). It is only an internal manifest (nothing consumes it),
   so deletion is still safe; do not infer image usage from it.
5. **Dotfile exposure:** `public_html/.gitignore` (and `.htaccess` magnitudes)
   are not covered by the FilesMatch deny rule. Standard Apache/LiteSpeed
   blocks dotfiles by default — verify on production (a config check, not this
   repo).
6. **Root-level dev copies** (`server.js`, test scripts, manifests, reports)
   remain at repo root per the standing conservative stance; none are deployable
   files. If the owner wants a deeper prune later, they are independent of this
   report’s three categories.
7. **Unresolved candidates:** none. Every asset inventory question raised in the
   earlier audit (`logo-*.svg`, `generate-csrf-token.php`, `includes/`,
   `images/` orphans, unused CSS/JS) was resolved this pass: 15 files/CSS/JS
   confirmed used, 21 files confirmed deletion-safe, 0 images unused.

---

## Suggested manual deletion list (owner runs this, not the agent)

```powershell
# From repo root — Category 1 (critical), 2, 3 in one shot:
Remove-Item -Force `
  public_html\smtp-auth-test.php, `
  public_html\test-mailer.php, `
  public_html\ARCHITECTURE.md, public_html\CHANGELOG.md, `
  public_html\EMAIL-DIAGNOSTIC-REPORT.md, `
  public_html\PERFORMANCE-SEO-OPPORTUNITY-REPORT.md, `
  public_html\PREDEPLOYMENT-AUDIT-REPORT.md, `
  public_html\PRICING-AUDIT.md, public_html\PRICING-MARKET-REVIEW.md, `
  public_html\PROJECT-MAP.md, `
  public_html\SEO-IMPROVEMENTS-REPORT.md, `
  public_html\SEO-PHASE2-REPORT.md, `
  public_html\composer.json, public_html\composer.lock, `
  public_html\package.json, public_html\package-lock.json, `
  public_html\server.js, `
  public_html\cms-manifest.json, `
  public_html\logo-combined.svg, `
  public_html\logo-symbol-professional.svg, `
  public_html\logo-text-only.svg

# Optional dead code (self-404 stub, 0 references):
Remove-Item -Force public_html\includes\mailer.php
```

After running, re-verify: `Get-ChildItem public_html\*.html | Measure-Object` → 54;
`git status` to review; nothing else in the tree changes.

## Post-cleanup verification status (this pass)

- No files were modified in this pass → all previous validations are unchanged:
  54/54 `<footer>`/`</footer>` balance, 54/54 `© <span class="footer-year">2026</span>`
  copyright + year scripts, zero `2024–` remnants, 260 `?v=20261030` asset refs intact.
- Internal links / asset references: no broken references introduced (no edits).
- Local-only work; no upload, no deploy, no commit, no push.
