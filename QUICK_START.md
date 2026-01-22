# 🚀 Quick Setup Guide - Contact Form with SMTP

## Step 1: Install PHPMailer (Choose One Method)

### Method A: Using Composer (Recommended)
```bash
composer require phpmailer/phpmailer
```

### Method B: Manual Download
Download from: https://github.com/PHPMailer/PHPMailer/releases
Extract to: `vendor/phpmailer/phpmailer/`

---

## Step 2: Configure SMTP Settings

Edit: `config/email-config.php`

### For Gmail:
```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_ENCRYPTION', 'tls');
define('SMTP_USERNAME', 'yourname@gmail.com');
define('SMTP_PASSWORD', 'your-16-char-app-password');
define('RECIPIENT_EMAIL', 'info@moroccotrektours.com');
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → Generate
3. Copy the 16-character password

### For Outlook:
```php
define('SMTP_HOST', 'smtp-mail.outlook.com');
define('SMTP_USERNAME', 'yourname@outlook.com');
define('SMTP_PASSWORD', 'your-password');
```

---

## Step 3: Test Configuration

1. Open in browser: `http://localhost/test-email.php`
2. Click "Send Test Email"
3. Check your inbox
4. **Delete test-email.php after testing!**

---

## Step 4: Test Contact Form

1. Open: `http://localhost/contact.html`
2. Fill out the form
3. Submit and verify email arrives

---

## 📁 Files Created

```
✅ send-email.php              - Main email handler
✅ config/email-config.php     - SMTP configuration
✅ js/contact-form.js          - Form validation & AJAX
✅ generate-csrf-token.php     - Security token generator
✅ test-email.php              - Test script (delete after use)
✅ composer.json               - Dependency manager
✅ .gitignore                  - Protect sensitive files
```

---

## 🔒 Security Checklist

- [ ] Configure SMTP credentials in `config/email-config.php`
- [ ] Install PHPMailer
- [ ] Test with `test-email.php`
- [ ] Delete `test-email.php` after testing
- [ ] Set `DEBUG_MODE` to `false` in production
- [ ] Add `config/email-config.php` to `.gitignore`

---

## ⚡ Features Included

✅ SMTP with PHPMailer
✅ Input validation & sanitization
✅ CSRF protection
✅ Rate limiting (3 per hour)
✅ Auto-reply to customers
✅ Bilingual (English & French)
✅ Professional HTML emails
✅ Real-time form validation
✅ AJAX submission
✅ Spam detection

---

## 🐛 Common Issues

**"SMTP connect() failed"**
→ Check SMTP credentials
→ For Gmail, use App Password

**"Invalid security token"**
→ Clear browser cache
→ Check `generate-csrf-token.php` is accessible

**Emails not arriving**
→ Check spam folder
→ Verify `RECIPIENT_EMAIL` in config
→ Enable `DEBUG_MODE`

---

## 📚 Full Documentation

See: `CONTACT_FORM_SETUP.md`

---

**Ready to use! 🎉**
