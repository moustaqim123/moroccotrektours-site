# EMAIL-DIAGNOSTIC-REPORT

**Scope:** diagnosis and local-only fix of the broken form email flow (`send-email.php` 500).
**Nothing was deployed, uploaded, or changed on the live website. No backups or ZIPs were created.**
**Date of investigation:** 2026-10-25 through 2026-10-27 (local workspace `moroccotrektours-working`).

---

## 1. Root cause and evidence

### 1.1 Confirmed root cause — wrong Composer autoload path

`send-email.php` hard-codes:

```php
require_once dirname(__DIR__) . '/vendor/autoload.php';
```

On the published Hostinger account the document root is `public_html`, and the trace
below proves `vendor/` was uploaded **inside** `public_html`. Therefore:

| What the code computes | Actual filesystem location |
|---|---|
| `dirname(__DIR__) . '/vendor/autoload.php'` = `<account-root>/vendor/autoload.php` | does **not** exist |
| `dirname(__DIR__) . '/private/email-config.php'` = `<account-root>/private/email-config.php` | intended sibling layout (possibly correct, see §3.2) |
| URL `/vendor/autoload.php` = `public_html/vendor/autoload.php` | **exists** on the server |

The unresolved `require_once` of a non-existent file is a fatal error. Because
`display_errors = 0` (line 2) and the `Content-Type: application/json` header is
sent **before** the require (line 15), the response is exactly what was observed
live: **HTTP 500, empty body, JSON content type**.

### 1.2 Live evidence (read-only HTTP probes, no modification of the site)

| URL | Status | Body length | Content-Type | Interpretation |
|---|---|---|---|---|
| `/send-email.php` | **500** | 0 | application/json | PHP starts, reaches line 15, fatals at/after the require (line 24) |
| `/generate-csrf-token.php` | 200 | 76 | application/json | Session/PHP handler works; PHP runtime is fine |
| `/vendor/autoload.php` | 200 | 0 | text/html | File exists **inside the docroot** (it executes, produces no output) |
| `/vendor/phpmailer/phpmailer/src/PHPMailer.php` | 200 | 0 | text/html | Exists inside the docroot |
| `/vendor/phpmailer/phpmailer/src/SMTP.php` | 200 | 0 | text/html | Exists inside the docroot |
| `/private/email-config.php` | 404 | — | text/html | No docroot copy of the private config (correct — it must not be public) |
| `/private/` | 404 | — | text/html | No docroot `private/` directory |
| `/vendor/` | 403 | — | text/html | Directory listing denied |
| `/composer.json` | 200 | 477 | application/json | Exposed (pre-existing P0-3, **out of scope of this task**, unchanged) |

Key conclusions:

1. **PHP execution works** (`/generate-csrf-token.php` returns JSON with a body).
2. **PHPMailer exists in production** (`PHPMailer.php` returns 200 = the file is
   present and executes). The SMTP library is **not** broken.
3. The failure occurs **before** any config check: a missing config would return
   the handler's own JSON "temporarily unavailable" message (a body), not an
   empty 500. Only a fatal during dependency loading produces an empty body.
4. **No evidence of an SMTP/auth failure.** The request never reached
   `new PHPMailer()`. The SMTP server and credentials were not and must not be
   assumed to be at fault.

### 1.3 Execution-path trace

```
Form submit (contact-form.js / customize-form.js)
  → POST /send-email.php
    → ini_set / error_reporting (1–4)              OK
    → session_start() (12)                         OK
    → header('Content-Type: application/json') (15) OK   ← the observed JSON header
    → require_once <account-root>/vendor/autoload.php (24)
    → FATAL — path resolves outside the docroot      ← the 500 happens here
    (config load, CSRF, rate limit, PHPMailer SMTP are never reached)
```

### 1.4 Local defect (secondary)

The local `vendor/` tree is incomplete:
`vendor/composer/autoload_classmap.php` maps `PHPMailer\PHPMailer\PHPMailer`
to `vendor/phpmailer/phpmailer/src/PHPMailer.php`, but that file is **missing
locally** (upstream v7.0.2 = 194,030 bytes; local `src/` contains only
DSNConfigurator, Exception, OAuth, OAuthTokenProvider, POP3, SMTP).
Any local runtime test of `send-email.php` fails until
`composer install --no-dev` is run. This is documented, not silently patched.

### 1.5 Error logs

- **Local:** no PHP error logs exist anywhere in the workspace (checked; the only
  `.txt`/`.log` file is `public_html/robots.txt`). The local shell cannot start a
  PHP server in this environment, so no local log could be generated.
- **Live:** no server log access was used for this task (no Hostinger panel
  credentials available to the workspace). The live evidence in §1.2 is from
  read-only HTTP responses only.

---

## 2. Files changed

Recovered source of truth: the original handler was recovered **byte-for-byte
from an untouched sibling copy of the workspace** and restored, then only the
items below were changed. The SMTP transport, recipients, subject lines, HTML
message template, plain-text alternative and auto-reply behaviour are otherwise
**identical** to the previously working implementation.

| File | Change | Why |
|---|---|---|
| `public_html/send-email.php` | Restored original PHPMailer handler, then: (1) autoload resolved from two candidates — `<account-root>/vendor/autoload.php` first, then `public_html/vendor/autoload.php`; (2) JSON **503** if no autoloader; (3) JSON **503** via `class_exists()` if the PHPMailer package is incomplete inside an existing `vendor/`; (4) config missing/incomplete-constants now returns JSON **503** instead of HTTP 500; (5) `validateCSRFToken()` / `sanitizeInput()` reject non-string input (PHP 8 `TypeError` guard); (6) hidden **honeypot** field `website` rejected; (7) dispatch to `send-custom-trip.php` when `form_type=customize`; (8) `catch (\Throwable)` safety net always returns JSON instead of a bare 500 | Fixes the confirmed fatal; keeps every other behaviour identical; makes every failure mode a truthful JSON error |
| `public_html/send-custom-trip.php` | **New.** Trip-customization handler. Guarded (direct access → 404). Validates and whitelists `dates`, `travelers` (1–20), `region[]`, `interest[]`, `accommodation`, `name`, `email`, `phone`, `message` (≤500); strips CRLF/NUL from single-line fields (header-injection defence); uses the **same SMTP constants, From, Reply-To and recipient** as the contact form; returns JSON success **only after `$mail->send()` succeeds**; on failure returns JSON 502 with a generic localized message, details only to `error_log`; sends no IP address and stores nothing | Requirement: give the two customization pages a real, secure server-side path without altering the contact flow |
| `public_html/js/customize-form.js` | **New.** Injects the CSRF token, sets hidden `form_type`/`language`, posts to `send-email.php`, renders `success`/`error` only from the server's own `{success,message}` payload, resets the form only on real success, refreshes the token afterwards | Replaces the console-only fake submission |
| `public_html/customize-trip.html` | Removed the inline console-only handler (the `ReferenceError: submitBtn` source); added `method/action`, hidden `form_type`/`language`, honeypot field, `#formStatus` live region, `js/customize-form.js` | Connects the form to the real endpoint; no more fake success dialog |
| `public_html/customize-trip-fr.html` | Same as the EN page, plus removal of the dead `const form = …` submit wrapper left behind by the first pass | Console-only behaviour removed on the FR page too |
| `public_html/css/styles.css` | `.form-status` (+ success/error variants) and `.hp-field` (visually hidden honeypot) | Both pages already load this stylesheet |
| `public_html/generate-csrf-token.php` | `Cache-Control: no-store` on the token response | One-line hardening: CSRF tokens must not be cached |
| `public_html/includes/mailer.php` | Replaced with a 404 stub (superseded intermediate prototype; nothing includes it; can be deleted before deployment) | Removes dead code from a public path |
| `private/email-config.example.php` | Reverted to the **original constant template** (`SMTP_HOST` … `DEBUG_MODE`), exactly as before | Preserves the existing production configuration format; a temporary array-format rewrite made during diagnosis was undone |

**Explicitly NOT changed:** prices, seasonal/group pricing, optional tour
durations, Essaouira (1-day) content, URLs/images/WhatsApp number, language
switcher, contact form UX and `contact-form.js`, SMTP settings/keywords, the
contact email template and auto-reply copy — all preserved byte-identical.

---

## 3. Tests performed and results

### 3.1 Performed

| Test | Method | Result |
|---|---|---|
| Root-cause isolation | Read-only live HTTP probes (§1.2) + source trace of the recovered handler | Confirmed: fatal at the `dirname(__DIR__) . '/vendor/autoload.php'` require; not SMTP, not credentials, not config |
| Contact-path integrity | Byte-for-byte comparison of the restored handler against the untouched sibling copy of the workspace | Identical except the listed §2 items |
| Missing-class guard logic | Desktop verification of the local vendor tree vs `vendor/composer/autoload_classmap.php` + GitHub API (`ref v7.0.2`, `PHPMailer.php` = 194,030 bytes) | Local package incomplete; new `class_exists()` branch will return JSON 503 instead of a 500 |
| Customize pages wiring | Grep across both HTML files | `submitBtn`: 0 matches; console-only/`alert()` handlers: removed (FR lines ~1571–1573, EN lines ~1731–1733 verified); both pages send `form_type=customize` + `language` + honeypot + `#formStatus`; both load `js/customize-form.js` |
| Client handler review | Full read of `js/customize-form.js` | Syntax consistent (ES5-style, `'use strict'`, IIFE); correctness paths: missing token → explicit reload message; HTTP error / non-JSON → generic error, **no** success message; success only when `payload.success === true`; form reset and token refresh follow a confirmed success |
| Dead-code check | Grep for `includes/mailer` | No remaining references in the codebase (only the stale mention in the historic `CHANGELOG.md`); file was reduced to a self-404 stub |
| Unrelated-file safety | Grep of `js/main.js` | `images.json` fetch fallback (lines 6–7, 130–135) untouched; gallery/manifest behaviour unchanged |
| CSRF endpoint behaviour | Live GET `/generate-csrf-token.php` | 200, JSON, 76 bytes (works; now hardened with `no-store`) |

### 3.2 Request-handling behaviour (by design, static review — not runtime-executed)

| Request | Result |
|---|---|
| GET `/send-email.php` | JSON `success:false` ("only POST is allowed") |
| POST without/with-invalid CSRF token | JSON `success:false`, status unchanged behaviour (message "Invalid security token…") |
| POST with CSRF + filled `website` honeypot | Rejected with `success:false` |
| Merge-fields POST (`name[]=a&name[]=b`, etc.) | `sanitizeInput()`/`validateCSRFToken()` treat non-strings as invalid → rejected with JSON (previously a PHP `TypeError`/bare 500 under PHP 8) |
| `POST form_type=customize` with missing dates / bad travelers / bad region value | JSON `422` with a localized message(s); unknown `region`/`interest`/`accommodation` values silently dropped by whitelist, never echoed into headers |
| `POST form_type=customize` valid | Same PHPMailer SMTP path and recipients as the contact form; JSON `success:true` **only after** `$mail->send()` |
| Direct GET `/send-custom-trip.php` | 404 "Not found" (guard constant not defined) |
| Direct GET `/includes/mailer.php` | 404 "Not found" |

### 3.3 NOT performed (cannot be performed here — and not claimed)

- **`php -l` / any PHP execution:** no PHP binary is available and the local
  shell cannot start a PHP server in this environment. Syntax was verified by
  careful static review only.
- **`composer install --no-dev`:** cannot be run locally; local runtime testing
  of either handler is therefore impossible until the local `vendor/` is
  completed (`PHPMailer.php` missing — §1.4).
- **Authorized end-to-end email delivery:** there is no `private/email-config.php`
  and no SMTP credentials in this workspace, and no delivery test was authorized.
  **No claim is made that email delivery works.** "Success" responses are only
  emitted after the transport accepts a message, which is why the new handlers
  cannot lie — but whether a real message lands in the inbox must be proven on
  Hostinger (§5).
- **Browser runtime test of the customize pages:** no locally bindable server is
  available in this environment, so `fetch()`-based submission was not exercise
  tested in a browser; only static review (§3.1) applies.

---

## 4. Missing configuration and credentials

1. **`private/email-config.php` (production).** The sibling-of-`public_html`
   private config. Template: `private/email-config.example.php` (original
   constant style). Required constants — all already in use by the restored
   handler, none invented:
   `SMTP_HOST, SMTP_PORT (587), SMTP_ENCRYPTION ('tls'), SMTP_USERNAME,
   SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME, RECIPIENT_EMAIL
   (info@moroccotrektours.com), RECIPIENT_NAME`, plus optional
   `SEND_AUTO_REPLY (true)`, `DEBUG_MODE (false — leave false in production; when
   true it writes the SMTP dialogue to the PHP error log only).
   **The file must stay outside `public_html`.** No credentials exist anywhere in
   this repository, and none were invented or copied into public files.
2. **Production `vendor/` placement.** The fix works with the *current* layout
   (vendor inside `public_html`) via the second autoload candidate. Moving
   `vendor/` beside `public_html` is cleaner and equally supported (first
   candidate). Either is fine; **do not** remove `vendor/` without keeping one of
   the two locations.
3. **Local `composer install --no-dev`** — required only if local PHP testing is
   wanted; it is not a deployment requirement (production vendor is complete).

> If after deployment the form returns the localized "temporarily unavailable"
> JSON 503, the cause is item 1 (missing/unreadable private config). If it
> returns the generic "there was an error…" JSON, check the PHP error log for
> `Contact Form Error:` / `Custom Trip Form Error:` lines — the exact reason is
> always logged server-side, never shown to visitors.

---

## 5. Manual checks still required on Hostinger

No `.htaccess`/rules were written in this task; everything below is a live check,
not an assumption:

1. **PHP version** ≥ 7.4 in hPanel (per `composer.json`).
2. **Deploy /verify the private config**: `private/email-config.php` exists at
   `<account-root>/private/` with real SMTP values; `https://<domain>/private/…`
   remains 404/403 (must never leak).
3. **Contact form end-to-end**: submit from `contact.html`; expect
   `{success:true}` only on real delivery; verify the branded message and the
   auto-reply arrive; verify the `Reply-To` header.
4. **Customize form end-to-end** (EN + FR): fill, submit; expect
   `{success:true}` only after real delivery; verify the two notification
   emails ("New Custom Trip Request: …" / "Nouvelle demande de voyage
   personnalisé: …") arrive; verify on failure that the on-page message is an
   error, never a fake success.
5. **Negative tests in the browser/Postman** (against the deployed copy):
   expired-session POST (expect `success:false`, page says "session expired",
   page reload fixes), filled honeypot POST, GET on the endpoint, direct GET of
   `/send-custom-trip.php` (expect 404).
6. **PHP error log** (hPanel → Logs): confirm fatals are gone
   (`require_once`-related messages disappear) and that any returned-error lines
   (`Contact Form Error: …`, `Custom Trip Form Error: …`, autoloader/config
   messages) are readable for debugging without leaking secrets
   (`DEBUG_MODE=false` keeps the SMTP dialogue out unless explicitly enabled).
7. **Edge (Microsoft Edge) sanity pass** on both customize pages: no console
   errors, honeypot not visible, status region appears on submit.
8. **Sibling-layout verification (optional but recommended)**: if `vendor/` is
   later moved out of `public_html`, confirm the first autoload candidate
   resolves and `/vendor/...` URLs stop being publicly served.

---

## 6. Remaining blockers (outside this task's scope — unchanged)

- **P0-3 (exposed project files)** — `/composer.json` still returns 200 live
  (§1.2). Public file protection/deny rules are still pending and were not part
  of this email fix.
- **P0-4 (EN/FR itinerary conflicts)** — Erg Chebbi and Atlas Villages French
  pages still diverge from the English source of truth; unchanged here.
- **Local `vendor/` incompleteness** — see §1.4; required only for local runtime
  testing, not for deployment.

