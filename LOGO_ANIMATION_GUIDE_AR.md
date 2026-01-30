# تأثير دخول الشعار - دليل الاستخدام

## نظرة عامة
تأثير دخول بسيط وأنيق للشعار يظهر مع fade + scale عند تحميل الصفحة، ثم يبقى ثابتًا.

---

## طريقة الاستخدام

### 1. إضافة ملف CSS

أضف هذا السطر في `<head>` بعد `styles.css` في جميع صفحات HTML:

```html
<link rel="stylesheet" href="css/logo-entrance.css">
```

**مثال:**
```html
<head>
    <!-- CSS الرئيسي -->
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- تأثير دخول الشعار -->
    <link rel="stylesheet" href="css/logo-entrance.css">
</head>
```

### 2. HTML الحالي

الكود الحالي للشعار في `index.html` (السطر 191-192):

```html
<div class="logo-container">
    <img loading="lazy" src="images/assets/logo-header.png" 
         alt="Morocco Trek Tours" class="logo-img">
</div>
```

**لا حاجة لتغيير أي شيء!** الكود الحالي يعمل تمامًا.

---

## المميزات

✅ **بسيط وأنيق**: تأثير fade + scale ناعم  
✅ **سريع**: مدة 1.8 ثانية فقط  
✅ **تأثير توهج اختياري**: هالة ذهبية خفيفة (يمكن إزالتها)  
✅ **متجاوب**: يعمل على جميع الأجهزة  
✅ **سهل الوصول**: يحترم إعدادات `prefers-reduced-motion`  
✅ **لا يؤثر على الألوان**: الألوان والظل الحالي يبقى كما هو  

---

## إزالة تأثير التوهج (اختياري)

إذا كنت تريد إزالة الهالة الذهبية الخفيفة، احذف هذا الجزء من `css/logo-entrance.css`:

```css
/* احذف هذا الجزء بالكامل */
.logo-container::before {
    content: '';
    position: absolute;
    width: 120%;
    height: 120%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    animation: glowFadeIn 1.8s ease-out 0.5s forwards;
}

@keyframes glowFadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
```

---

## تخصيص التأثير

### تغيير السرعة

في `css/logo-entrance.css`، غيّر `1.8s` إلى المدة المطلوبة:

```css
.logo-container {
    animation: logoEntrance 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    /*                     ↑ غيّر هذا الرقم */
}
```

**أمثلة:**
- `1.2s` = سريع
- `1.8s` = متوسط (الافتراضي)
- `2.5s` = بطيء

### تغيير حجم البداية

في `@keyframes logoEntrance`، غيّر `scale(0.7)`:

```css
@keyframes logoEntrance {
    0% {
        opacity: 0;
        transform: scale(0.7);  /* ← غيّر هذا الرقم */
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
```

**أمثلة:**
- `scale(0.5)` = يبدأ صغير جدًا
- `scale(0.7)` = متوسط (الافتراضي)
- `scale(0.9)` = يبدأ قريب من الحجم النهائي

---

## الملفات المطلوبة

```
css/
└── logo-entrance.css  ← الملف الجديد
```

---

## التطبيق على جميع الصفحات

لتطبيق التأثير على جميع صفحات الموقع، أضف السطر التالي في `<head>` لكل صفحة:

```html
<link rel="stylesheet" href="css/logo-entrance.css">
```

**الصفحات المطلوب تحديثها:**
- `index.html` ✓
- `index-fr.html` ✓
- `about.html`, `about-fr.html`
- `tours.html`, `tours-fr.html`
- `contact.html`, `contact-fr.html`
- جميع صفحات الجولات (`tour-*.html`)
- جميع صفحات المدونة (`blog-*.html`)

---

## اختبار التأثير

1. افتح `index.html` في المتصفح
2. اضغط `Ctrl + F5` (تحديث كامل)
3. يجب أن ترى الشعار يظهر مع تأثير fade + scale
4. بعد 1.8 ثانية، يبقى الشعار ثابتًا

---

## ملاحظات

- التأثير يعمل **مرة واحدة فقط** عند تحميل الصفحة
- **لا يتكرر** عند التمرير أو التفاعل
- **متوافق** مع جميع المتصفحات الحديثة
- **خفيف الوزن**: لا يؤثر على أداء الموقع

---

*تم الإنشاء: 30 يناير 2026*
