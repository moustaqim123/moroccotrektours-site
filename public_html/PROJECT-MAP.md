# خريطة مشروع Morocco Trek Tours — 2026-10-28

> توثيق داخلي (خارج مجلد الإنتاج). مصدر الأدلة: تتبّع المراجع في كل HTML/CSS/JS/PHP وليس أسماء الملفات.

## البنية العامة
```
moroccotrektours-working/
├── public_html/            ← جذر الإنتاج (كل الصفحات + CSS/JS/PHP/الصور)
│   ├── *.html              ← 54 صفحة (EN + FR)
│   ├── css/  js/  images/  includes/
│   ├── send-email.php / send-custom-trip.php / generate-csrf-token.php
│   ├── sitemap.xml / robots.txt / images.json
│   └── logo-*.svg          ← غير مستخدمة (حذفها معطّل ببيئة الأوامر — بند يدوي، ما تزال موجودة)
├── private/                ← email-config.example.php (نموذج — بلا أسرار)
├── _backups/               ← نسخ سابقة موثقة (خارج الإنتاج — تبقى)
├── tools/                  ← generate-images-json.js / watch-images.js (dev)
├── vendor/                 ← PHPMailer عبر Composer (required: send-email.php)
├── package.json / server.js ← أدوات تطوير (تشغيل محلي)
└── docs تقارير سابقة (*.md)
```

## ملفات رئيسية ووظيفتها
| الملف | الوظيفة | تستخدمه | الحالة |
|---|---|---|---|
| css/styles.css | التنسيق الأساسي + بلوك السلطة للغة والشعار | كل الصفحات | يتوّج (سلطة زر اللغة B9) |
| css/mobile-fixes.css | قواعد الهاتف (حجم الشعار قبل التحميل) | كل الصفحات | مستخدم |
| css/luxury-pricing.css | تنسيق قسم التسعير الفاخر + قواعد هاتف | صفحات الرحلات فقط | مستخدم |
| css/site-common.css | تنسيقات صفحتي التخصيص | customize-trip(.html/-fr) فقط | مستخدم (مسار كان بمَيل عكسي — أُصلح) |
| js/main.js (1644 سطرًا) | معرض+lightbox، منزلق، قائمة الهاتف، أنيميشن الشعار anime.js، مبدّل اللغة، تنقل الأقسام، WhatsApp | كل الصفحات | حديث — بلا ازدواج |
| js/pricing-system.js | مصدر الحقيقة للأسعار (خريطة tours) | 30 صفحة رحلات | محور البيانات المشتركة |
| js/luxury-pricing-{toubkal,quote}(-fr).js | محوّلات تسميات لغوية فقط | صفحات الرحلات | بسيطة |
| js/contact-form.js / customize-form.js | إرسال send-email.php + CSRF | contact*/customize-trip* | بلا نجاح وهمي |
| send-email.php / send-custom-trip.php | البريد (PHPMailer من vendor/) | النماذج | تبقى كما هي |
| generate-csrf-token.php | توكن CSRF | النماذج | تبقى |
| images.json | قائمة صور المعرض (يقرؤها main.js) | index/gallery | مستخدم — لا يُحذف |
| sitemap.xml / robots.txt | SEO | الزواحف | تُحفظ |

## مرشّحات الحذف (تصنيف المرحلة 3.6)
1. **آمن للحذف (حذف يدوي مطلوب — الأوامر التنفيذية خاملة، الملف موجودة):** `public_html/logo-text-only.svg`، `logo-symbol-professional.svg`، `logo-combined.svg` — صفر مراجع في كل HTML/CSS/JS/PHP. وكذلك `public_html/includes/mailer.php` (stub 404، بلا مراجع).
2. **قاعدة ميتة أُزيلت:** `.lang-dropdown.active` في luxury-pricing.css — لا شيء يضيف الفئة (السلوك الحقيقي `is-open`).
3. **يحتاج تحقق:** الصور التي لا تظهر في خريطة images.json (تدقيق مرجعي لاحق قبل أي حذف — لم يُحذف شيء).
4. **يُحتفظ به مطلقًا:** الشعارات (logo-header.png/logo-icon.svg/icon-brand.png)، صور الرحلات والهيرو، الخطوط، vendor/، ملفات PHP، sitemap/robots، _backups/.

## قواعد السلوك المعتمدة (قد لا تُكسر)
- مبدّل اللغة: مالك وحيد `js/main.js` بفئات `is-ready/is-open`؛ الأنماط المُصرَّح بها `body .lang-switcher … !important` في styles.css تتفوق على النسخ القديمة داخلية الصفحات.
- الشعار: الدخول عبر anime.js فقط (حُذف `logoDepthApproach` القديم في D9).
- الأسعار: خريطة `tours` في pricing-system.js؛ Toubkal 2-يوم موسمي فقط؛ `tour-10-jours.html` تُعالج كـ alias للـ EN.
- الواتساب: 212659565040، كل الروابط percent-encoded.
- النماذج: CSRF + نجاح فقط عند `payload.success === true`؛ صفحتا الكونتاكت تحملان honeypot خفي `website` (منذ 2026-10-28)؛ أخطاء الإدخال/الجلسة معرَّفة EN/FR عبر `MTTUserInputException`.

## نسخة احتياطية 2026-10-28
`_backups/2026-10-28-contact/` (README + original-snippets.md) — خارج public_html.
`_backups/2026-10-28-contact-config-path/original-snippets.md` — قبل تعديل مسار إعدادات البريد (العطل الحقيقي).

## تشخيص نموذج الكونتاكت الحيّ (2026-10-30)
- الموقع الحقيقي يرد 503 ومعه `code` بعد رفع `send-email.php` الجديد: **`autoload_missing`** — أي أن `vendor/autoload.php` غير موجود لا بجانب `public_html` ولا داخله. النموذج وCSRF وSMTP ليست سبب العطل.
- تصحيح استنتاج سابق: الـ403 على `/vendor/`, `/private/`, `/includes/` مصدره قواعد `public_html/.htaccess` (RewriteRule + RedirectMatch) وليس دليلًا على وجود الملفات.
- البنية القابلة للنشر: `public_html/vendor/` + `public_html/private/email-config.php` + `.htaccess` في كل منهما. يجهّزها `tools/prepare-mail-deploy.ps1` (نسخ فقط، بلا طباعة أسرار) ويتحقق منها `tools/verify-mail-setup.php` (PASS/FAIL وأسماء الثوابت الناقصة فقط).
- `vendor/` محليًا مكتمل عبر Composer (phpmailer 7.1.1): `autoload.php` + `composer/autoload_real.php` + `autoload_static.php` + `autoload_classmap.php` متسقة وتشير إلى `src/PHPMailer.php`.

## حدود البيئة (2026-10-30)
- أداة تنفيذ الأوامر معطّلة تمامًا في هذه الجلسة: كل أمر يرجع فراغًا ولا ينشئ أي ملف (اختُبرت `New-Item`, `robocopy`, `php -l`, ووضع الخلفية). لذلك النسخ وفحص PHP يجب أن ينفّذهما المالك عبر السكربت.
- لا خادم محلي؛ المتصفح يرفض `file://` وlocalhost عبر البروكسي — **الاختبار البصري/PHP غير ممكن هنا**.
