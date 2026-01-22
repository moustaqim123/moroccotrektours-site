# Contact Form Email Handler - Installation & Setup Guide

## 📋 Overview

This is a professional, production-ready PHP email handler for your Morocco Trek Tours contact forms. It includes:

- ✅ **PHPMailer** with SMTP authentication
- ✅ **Input validation** and sanitization
- ✅ **CSRF protection** against cross-site request forgery
- ✅ **Rate limiting** to prevent spam
- ✅ **Header injection prevention**
- ✅ **Auto-reply** functionality
- ✅ **Bilingual support** (English & French)
- ✅ **AJAX submission** with real-time validation
- ✅ **Professional HTML email templates**

---

## 🚀 Quick Start

### Step 1: Install PHPMailer

You need to install PHPMailer library. Choose one of these methods:

#### Option A: Using Composer (Recommended)

```bash
# Navigate to your project directory
cd c:\Users\user\.gemini\antigravity\playground\tensor-coronal

# Install PHPMailer via Composer
composer require phpmailer/phpmailer
```

#### Option B: Manual Installation

1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer/releases
2. Extract the files to `vendor/phpmailer/phpmailer/src/` in your project directory
3. The structure should be:
   ```
   tensor-coronal/
   ├── vendor/
   │   └── phpmailer/
   │       └── phpmailer/
   │           └── src/
   │               ├── PHPMailer.php
   │               ├── SMTP.php
   │               └── Exception.php
   ```

---

### Step 2: Configure SMTP Settings

Edit `config/email-config.php` and update the following:

```php
// Your SMTP server details
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_ENCRYPTION', 'tls');
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');

// Where emails will be sent
define('RECIPIENT_EMAIL', 'info@moroccotrektours.com');
```

#### 📧 Gmail Setup (Most Common)

1. **Enable 2-Step Verification**:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this password in `SMTP_PASSWORD`

3. **Update config**:
   ```php
   define('SMTP_HOST', 'smtp.gmail.com');
   define('SMTP_PORT', 587);
   define('SMTP_ENCRYPTION', 'tls');
   define('SMTP_USERNAME', 'yourname@gmail.com');
   define('SMTP_PASSWORD', 'abcd efgh ijkl mnop'); // 16-char app password
   ```

#### 📧 Other Email Providers

See `config/email-config.php` for examples of:
- Outlook/Hotmail
- Yahoo
- SendGrid
- Mailgun
- Amazon SES

---

### Step 3: Set File Permissions (Linux/Mac only)

```bash
# Make config file readable only by owner
chmod 600 config/email-config.php

# Make PHP files executable
chmod 755 send-email.php
chmod 755 generate-csrf-token.php
```

---

### Step 4: Test the Form

1. **Open your contact page** in a browser:
   - `http://localhost/contact.html` (English)
   - `http://localhost/contact-fr.html` (French)

2. **Fill out the form** and submit

3. **Check for errors**:
   - Open browser console (F12) for JavaScript errors
   - Check PHP error logs for server-side issues

---

## 🔒 Security Features

### 1. CSRF Protection
- Unique token generated for each session
- Validates token on form submission
- Prevents cross-site request forgery attacks

### 2. Rate Limiting
- Limits to 3 submissions per hour per IP address
- Prevents spam and abuse
- Automatically resets after 1 hour

### 3. Input Sanitization
- Removes HTML tags and special characters
- Prevents XSS (Cross-Site Scripting) attacks
- Validates email format

### 4. Header Injection Prevention
- Checks for newline characters in email addresses
- Prevents email header manipulation
- Blocks malicious email injection attempts

### 5. Spam Detection
- Blocks common spam keywords
- Optional disposable email blocking
- IP address logging

---

## 📁 File Structure

```
tensor-coronal/
├── config/
│   └── email-config.php          # SMTP configuration (KEEP SECURE!)
├── js/
│   └── contact-form.js            # Frontend form handling
├── vendor/
│   └── phpmailer/                 # PHPMailer library
├── send-email.php                 # Main email handler
├── generate-csrf-token.php        # CSRF token generator
├── contact.html                   # English contact form
└── contact-fr.html                # French contact form
```

---

## 🎨 Customization

### Change Email Template Design

Edit the HTML template in `send-email.php` (around line 220):

```php
$htmlBody = '
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Customize your email styles here */
        .email-header {
            background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
        }
    </style>
</head>
<body>
    <!-- Your custom email template -->
</body>
</html>
';
```

### Change Auto-Reply Message

Edit the auto-reply section in `send-email.php` (around line 290):

```php
$autoReplyBody = "
    <h2>Hello $name,</h2>
    <p>Your custom auto-reply message here...</p>
";
```

### Modify Form Validation

Edit validation rules in `js/contact-form.js`:

```javascript
// Example: Change minimum message length
else if (name === 'message' && value && value.length < 20) {
    isValid = false;
    errorMessage = 'Message must be at least 20 characters long.';
}
```

---

## 🐛 Troubleshooting

### Problem: "SMTP connect() failed"

**Solution:**
- Check your SMTP credentials in `config/email-config.php`
- Verify your firewall allows outbound connections on port 587
- For Gmail, ensure you're using an App Password, not your regular password

### Problem: "Invalid security token"

**Solution:**
- Clear your browser cookies and cache
- Ensure `generate-csrf-token.php` is accessible
- Check that PHP sessions are enabled on your server

### Problem: "Too many requests"

**Solution:**
- Wait 1 hour for the rate limit to reset
- Or clear your PHP session
- Adjust rate limit in `send-email.php` (line 33)

### Problem: Emails not arriving

**Solution:**
- Check your spam/junk folder
- Verify `RECIPIENT_EMAIL` in config
- Enable debug mode: `define('DEBUG_MODE', true);`
- Check PHP error logs

### Problem: Form doesn't submit

**Solution:**
- Open browser console (F12) and check for JavaScript errors
- Ensure `js/contact-form.js` is loaded
- Verify your server supports PHP and AJAX requests

---

## 🔧 Advanced Configuration

### Enable Debug Mode

In `config/email-config.php`:

```php
define('DEBUG_MODE', true);
```

This will show detailed error messages. **Disable in production!**

### Adjust Rate Limiting

In `send-email.php`, find the `checkRateLimit()` function:

```php
// Change from 3 to your desired limit
if ($rate_data['count'] >= 5) {  // Allow 5 submissions
    return false;
}

// Change from 3600 (1 hour) to your desired time
if (time() - $rate_data['time'] > 7200) {  // 2 hours
```

### Add CC/BCC Recipients

In `send-email.php`, after line 235:

```php
$mail->addCC('manager@moroccotrektours.com');
$mail->addBCC('archive@moroccotrektours.com');
```

### Disable Auto-Reply

In `config/email-config.php`:

```php
define('SEND_AUTO_REPLY', false);
```

---

## 🌐 Production Deployment

### 1. Security Checklist

- [ ] Set `DEBUG_MODE` to `false`
- [ ] Use strong SMTP password
- [ ] Add `config/email-config.php` to `.gitignore`
- [ ] Set restrictive file permissions (600 for config)
- [ ] Use HTTPS for your website
- [ ] Enable PHP error logging (not display)

### 2. Performance Optimization

- [ ] Enable PHP OPcache
- [ ] Use a dedicated SMTP service (SendGrid, Mailgun)
- [ ] Implement email queuing for high traffic
- [ ] Add honeypot field for additional spam protection

### 3. Monitoring

- [ ] Set up email delivery monitoring
- [ ] Log all form submissions
- [ ] Monitor rate limit triggers
- [ ] Track bounce rates

---

## 📝 .gitignore

Add this to your `.gitignore` file:

```
# Email configuration (contains sensitive credentials)
config/email-config.php

# Composer dependencies
/vendor/

# PHP session files
/tmp/
*.session
```

---

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Enable debug mode** to see detailed errors
3. **Review PHP error logs** on your server
4. **Test SMTP credentials** using a simple PHPMailer test script

---

## 📄 License

This code is provided as-is for Morocco Trek Tours. Feel free to modify and use as needed.

---

## ✅ Testing Checklist

Before going live, test:

- [ ] Form submission works (English)
- [ ] Form submission works (French)
- [ ] Email arrives at correct address
- [ ] Auto-reply is sent to customer
- [ ] Email formatting looks good
- [ ] Validation works for all fields
- [ ] Error messages display correctly
- [ ] Rate limiting prevents spam
- [ ] CSRF protection is active
- [ ] Works on mobile devices

---

**Created for Morocco Trek Tours**  
Last Updated: January 2026
