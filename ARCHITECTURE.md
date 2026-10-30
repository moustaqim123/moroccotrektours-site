# توثيق البنية — Morocco Trek Tours (بعد تنظيف 2026-10-28)

## 1. بنية المجلدات النهائية
```
moroccotrektours-working/
├── public_html/                 ← جذر الموقع (يُرفع للإنتاج كما هو)
│   ├── *.html                   ← 54 صفحة (EN أصل / FR نسخة لفظية لكل صفحة)
│   ├── css/
│   │   ├── styles.css           ← الأساس (المتغيرات، الهيدر/الشعار/مبدّل اللغة — بلوك السلطة)
│   │   ├── mobile-fixes.css     ← قواعد الهاتف (حجز أبعاد الشعار قبل التحميل)
│   │   ├── luxury-pricing.css   ← قسم التسعيرات + قواعد هاتف صفحات الرحلات
│   │   └── site-common.css      ← تنسيقات صفحتي التخصيص فقط
│   ├── js/
│   │   ├── main.js              ← كل السلوك العام (معرض/lightbox/قائمة/لغة/شعار/تنقّل)
│   │   ├── pricing-system.js    ← مصدر الحقيقة الوحيد للأسعار
│   │   ├── luxury-pricing-{toubkal,quote}{,-fr}.js ← مجرد اختيار لغة التسميات
│   │   ├── contact-form.js / customize-form.js ← نماذج (CSRF + بريد)
│   │   └── cta-whatsapp-analytics.js
│   ├── images/ …                ← hero/، tours/، destinations/، blog/، assets/
│   ├── images.json              ← بيانات المعرض (يقرؤه main.js ويصفي images/gallery/)
│   ├── send-email.php / send-custom-trip.php / generate-csrf-token.php
│   └── sitemap.xml / robots.txt
├── private/email-config.example.php  ← مخطط إعدادات البريد (بلا أسرار)
├── vendor/ (Composer + PHPMailer)    ← لا يُحذف وولا يُعدل
├── tools/, server.js, package.json   ← أدوات تطوير (توليد images.json وتشغيل محلي)
└── PROJECT-MAP.md / ARCHITECTURE.md  ← توثيق (خارج الإنتاج)
```

## 2. ترتيب تحميل CSS/JS في كل صفحة
```
Google Fonts → Font Awesome → styles.css → mobile-fixes.css [→ luxury-pricing.css على صفحات الرحلات]
<أنماط داخلية للصفحة (نجوم الهيرو/الشريط)> …
<body> … js/main.js (قبل نهاية body) [→ pricing-system.js ثم محوّل luxury-pricing-*]
[→ contact-form.js / customize-form.js حسب الصفحة]
```
تُلغي الأنماط المُصرَّح بها (`body .lang-switcher…` و`body .navbar .logo-container img` في styles.css)
أي نسخ قديمة داخلية عبر خصوصية أعلى — لا تعلم ذا مسار أي قاعدة جديدة عند تعديل الهيدر/اللغة.

## 3. كيف تعمل الأنظمة
- **الشعار:** `<div class="logo-container"><img …logo-header.png></div>` واحد لكل صفحة. `main.js`
  يُحمّل anime.js 3.2.2 ديناميكيًا ويرسم `images/assets/logo-icon.svg` بخطوط ثم يعيد PNG. لا أنيميشن CSS للشعار.
- **مبدّل اللغة:** مالك وحيد `main.js` (فئتا `is-ready`/`is-open`). الروابط داخل `<ul class="lang-dropdown">` صريحة (EN↔FR) — لا إعادة توجيه آلية.
- **الأسعار:** خريطة `tours` في `pricing-system.js` (دولار/شخص حسب المدة وعداد 1 / 2-3 / 4-7 / 8-12). الموسمية: Toubkal 2-يوم فقط. صفحات FR تنحصر بروابط EN عند الطلب.
- **النماذج:** POST إلى `send-email.php` مع CSRF من `generate-csrf-token.php`؛ نجاح فقط على `payload.success === true`.
  - كونتاكت: honeypot خفي `website` (`.hp-field`)؛ أخطاء الإدخال معرَّفة EN/FR (`MTTUserInputException` في send-email.php — 2026-10-28).
  - مسار الإعدادات يقبل الموضعين: `dirname(__DIR__)/private/email-config.php` (المفضّل، خارج جذر الموقع) أو `__DIR__/private/email-config.php` (النشر المسطّح داخل public_html).
  - رموز `code` في ردود 503: `autoload_missing` / `library_incomplete` / `config_missing` / `config_incomplete` (بلا مسارات أو أسرار).
  - احتياطي التعديلات: `_backups/2026-10-28-contact/`.

## 4. التشغيل والاختبار محليًا
- `npm start` (server.js) ثم فتح `http://localhost:PORT/…`؛ أو `php -S` إذا توفر PHP.
- اختبارات متاحة محليًا: فحص بنية HTML، مراجع الوسائط، منطق JS/PHP (ثابت)، وأداة `npm run generate-images`.
- **غير متاح في بيئة العمل الحالية:** خادم يتمسّك بالحياة / متصفح عبر البروكسي (502). أي تحقق بصري = من الصاحب.

## 5. ملفات لا يُحذف (مطلقة)
`logo-header.png` · `logo-icon.svg` · `icon-brand.png` · كل `images/hero/` و`tours/` و`blog/` و`destinations/` ·
`vendor/` · كل PHP · `sitemap.xml` · `robots.txt` · `.htaccess` إن ظهر (الإنتاج يعتمد إعادة توجيهاتهم إهمالًا معلومًا) · `_backups/`.

## 6. بند حرج للصاحب: معرض الرئيسية
`images.json` يشير إلى `images/gallery/*.jpg` و`images/thumbs/*` لا توجد في النسخة المحلية →
معرض index(+-fr): **تم إصلاحه 2026-10-28** — 23 مصغّرة منسوخة من
`.gemini/…/tensor-coronal/images/thumbs/gallery` إلى `public_html/images/gallery/*.jpg.jpg`،
و`images.json` يشير إليها (url = thumb = نفس الملف، لأن الصور الكاملة غير متوفرة في المصدر).
التحقق: 23/23 مطابقة (16 و19 غير موجودة في المصدر أيضًا).
من بيئة التوليد قبل الرفع (أو حذف المدخلات المعطوبة قصدًا — كان ذلك يتطلب قرار محتوى من الصاحب، لم يُنفَّذ).
