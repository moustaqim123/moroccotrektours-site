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

## تشخيص نموذج الكونتاكت الحيّ (2026-10-28، دليل من الموقع نفسه)
- الموقع الحقيقي يرد 503 `code` غائب حاليًا برسالة "temporarily unavailable" على **كل** POST (بما فيها بلا CSRF) → الحارس يعمل قبل التحقق، أي أن العطل اعتماد/إعدادات لا SMTP ولا النموذج.
- دليل البنية على الاستضافة: أي ملف عشوائي تحت `/vendor/` و`/private/` و`/includes/` يرجع **403** بينما تحت `/css/`, `/images/` يرجع 404 → قواعد حجب صريحة لهذه المجلدات، أي أنها **موجودة داخل `public_html`** (نشر مسطّح).
- لذلك `send-email.php` صار يقبل `private/email-config.php` في الموضعين: خارج جذر الموقع (المفضّل) أو بجانب السكربت داخل `public_html`.
- أُضيف حقل `code` (غير حساس: `autoload_missing` / `library_incomplete` / `config_missing` / `config_incomplete`) ليحدد المالك المرحلة الفاشلة بعد الرفع دون كشف مسارات أو أسرار.
- `vendor/phpmailer/phpmailer/src/PHPMailer.php` **ناقص محليًا** (v7.0.2، الحجم الرسمي 194,030 بايت) — استُعيد عبر المتصفح لكن تعذّر إيداعه لأن الأوامر التنفيذية معطلة: يُستكمل بـ `composer install --no-dev`.

## حدود البيئة
لا Git، ولا خادم PHP/node يتمسك بالحياة، والمتصفح يفشل على localhost (502) والأوامر التنفيذية لا تُرجع إخراجًا — **الاختبار ثابت/تحليلي فقط**؛ أي ادعاء اختبار بصري ممنوع.
