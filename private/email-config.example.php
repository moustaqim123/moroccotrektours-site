<?php
// Copy to email-config.php in this private directory and enter values from your SMTP provider.
// Keep this file outside public_html; never put real credentials in a ZIP or source control.
define('SMTP_HOST', 'your-smtp-hostname');
define('SMTP_PORT', 587);
define('SMTP_ENCRYPTION', 'tls');
define('SMTP_USERNAME', 'your-mailbox@example.com');
define('SMTP_PASSWORD', 'replace-with-your-mailbox-password-or-app-password');
define('SMTP_FROM_EMAIL', 'your-mailbox@example.com');
define('SMTP_FROM_NAME', 'Morocco Trek Tours - Contact Form');
define('RECIPIENT_EMAIL', 'info@moroccotrektours.com');
define('RECIPIENT_NAME', 'Morocco Trek Tours');
define('SEND_AUTO_REPLY', true);
define('DEBUG_MODE', false);
