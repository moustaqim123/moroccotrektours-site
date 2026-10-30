<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
/**
 * Professional Contact Form Email Handler
 * Uses PHPMailer with SMTP authentication
 * Includes input validation, sanitization, and security features
 */

// Start session for CSRF protection and rate limiting
session_start();

/**
 * Marks errors the user can fix (validation, CSRF, rate limit).
 * Their message is server-authored and localized, so it is safe to show.
 */
class MTTUserInputException extends \Exception {}

// Set response header to JSON
header('Content-Type: application/json');

// Errors are logged but never displayed to site visitors.

/**
 * STEP 1: Load PHPMailer library
 * Install via Composer: composer require phpmailer/phpmailer
 * Or download from: https://github.com/PHPMailer/PHPMailer
 *
 * Two layouts are supported because the published Hostinger account keeps
 * vendor/ inside public_html while the local/intended layout keeps it beside
 * public_html. Loading from a non-existent path used to fatal before this
 * script could return its own JSON error (the reported HTTP 500).
 */
$autoloadCandidates = [
    dirname(__DIR__) . '/vendor/autoload.php', // vendor beside public_html (intended)
    __DIR__ . '/vendor/autoload.php',          // vendor inside public_html (current production)
];

$autoloadPath = null;
foreach ($autoloadCandidates as $candidate) {
    if (is_file($candidate) && is_readable($candidate)) {
        $autoloadPath = $candidate;
        break;
    }
}

if ($autoloadPath === null) {
    error_log('Contact form is not configured: Composer autoloader was not found.');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'code' => 'autoload_missing',
        'message' => (($_POST['language'] ?? 'en') === 'fr')
            ? 'Le formulaire de contact est temporairement indisponible. Veuillez réessayer plus tard.'
            : 'The contact form is temporarily unavailable. Please try again later.'
    ]);
    exit;
}

require_once $autoloadPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// A Composer autoloader can exist while the PHPMailer package is incomplete
// (this is the current state of the local checkout). Fail with JSON instead of
// a bare 500 until `composer install --no-dev` restores the missing files.
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    error_log('Contact form is not configured: PHPMailer classes are missing from vendor/.');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'code' => 'library_incomplete',
        'message' => (($_POST['language'] ?? 'en') === 'fr')
            ? 'Le formulaire de contact est temporairement indisponible. Veuillez réessayer plus tard.'
            : 'The contact form is temporarily unavailable. Please try again later.'
    ]);
    exit;
}

/**
 * STEP 2: Load configuration
 *
 * The published account was uploaded flat inside public_html, so its
 * private/ directory sits beside this script instead of one level above the
 * document root. Both layouts are accepted; the outside-docroot copy wins
 * when present because it can never be served by the web server.
 */
$configCandidates = [
    dirname(__DIR__) . '/private/email-config.php', // intended: outside the document root
    __DIR__ . '/private/email-config.php',          // published: flat inside public_html
];

$emailConfigPath = null;
foreach ($configCandidates as $candidate) {
    if (is_file($candidate) && is_readable($candidate)) {
        $emailConfigPath = $candidate;
        break;
    }
}

if ($emailConfigPath === null) {
    error_log('Contact form is not configured: private email config is missing or unreadable.');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'code' => 'config_missing',
        'message' => (($_POST['language'] ?? 'en') === 'fr')
            ? 'Le formulaire de contact est temporairement indisponible. Veuillez réessayer plus tard.'
            : 'The contact form is temporarily unavailable. Please try again later.'
    ]);
    exit;
}
require_once $emailConfigPath;

// Never fail with a bare 500 if the private config is incomplete.
$requiredConstants = [
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_ENCRYPTION', 'SMTP_USERNAME', 'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME', 'RECIPIENT_EMAIL', 'RECIPIENT_NAME',
];
$missingConstants = [];
foreach ($requiredConstants as $constantName) {
    if (!defined($constantName)) {
        $missingConstants[] = $constantName;
    }
}
if (!empty($missingConstants)) {
    error_log('Contact form is not configured: missing constants ' . implode(', ', $missingConstants));
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'code' => 'config_incomplete',
        'message' => (($_POST['language'] ?? 'en') === 'fr')
            ? 'Le formulaire de contact est temporairement indisponible. Veuillez réessayer plus tard.'
            : 'The contact form is temporarily unavailable. Please try again later.'
    ]);
    exit;
}
if (!defined('DEBUG_MODE')) {
    define('DEBUG_MODE', false);
}
if (!defined('SEND_AUTO_REPLY')) {
    define('SEND_AUTO_REPLY', true);
}

/**
 * STEP 3: Security - Rate Limiting
 * Prevent spam by limiting submissions per IP address
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $rate_limit_key = 'rate_limit_' . md5($ip);
    
    // Allow 3 submissions per hour per IP
    if (!isset($_SESSION[$rate_limit_key])) {
        $_SESSION[$rate_limit_key] = ['count' => 0, 'time' => time()];
    }
    
    $rate_data = $_SESSION[$rate_limit_key];
    
    // Reset counter if more than 1 hour has passed
    if (time() - $rate_data['time'] > 3600) {
        $_SESSION[$rate_limit_key] = ['count' => 1, 'time' => time()];
        return true;
    }
    
    // Check if limit exceeded
    if ($rate_data['count'] >= 3) {
        return false;
    }
    
    // Increment counter
    $_SESSION[$rate_limit_key]['count']++;
    return true;
}

/**
 * STEP 4: Security - CSRF Token Validation
 * Validates CSRF token to prevent cross-site request forgery
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token']) || !is_string($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * STEP 5: Input Sanitization
 * Sanitizes user input to prevent XSS and injection attacks
 */
function sanitizeInput($data) {
    if (!is_string($data)) {
        return '';
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * STEP 6: Email Validation
 * Validates email format and checks for disposable email domains
 */
function validateEmail($email) {
    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    
    // Check for header injection attempts
    if (preg_match("/[\r\n]/", $email)) {
        return false;
    }
    
    // Optional: Block disposable email domains
    $disposable_domains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
    $domain = substr(strrchr($email, "@"), 1);
    if (in_array(strtolower($domain), $disposable_domains)) {
        return false;
    }
    
    return true;
}

/**
 * STEP 7: Main Request Handler
 */
try {
    // Language-aware, user-correctable errors (validation/CSRF/rate limits)
    // are raised as MTTUserInputException so the catch block can show their
    // server-authored, localized text. Transport failures stay generic.
    $lang = (($_POST['language'] ?? 'en') === 'fr') ? 'fr' : 'en';

    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new MTTUserInputException($lang === 'fr'
            ? 'Méthode de requête invalide. Seule la méthode POST est autorisée.'
            : 'Invalid request method. Only POST is allowed.');
    }
    
    // Check rate limiting
    if (!checkRateLimit()) {
        throw new MTTUserInputException($lang === 'fr'
            ? 'Trop de tentatives. Veuillez réessayer plus tard.'
            : 'Too many requests. Please try again later.');
    }
    
    // Validate CSRF token
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!validateCSRFToken($csrf_token)) {
        throw new MTTUserInputException($lang === 'fr'
            ? 'Votre session a expiré. Veuillez actualiser la page et réessayer.'
            : 'Your session expired. Please refresh the page and try again.');
    }

    // Hidden honeypot field: real visitors never fill it in.
    if (isset($_POST['website']) && trim((string) $_POST['website']) !== '') {
        throw new MTTUserInputException('Invalid submission.');
    }

    /**
     * Trip customization requests use the same SMTP configuration, CSRF token
     * and rate limit as the contact form, but a different message layout.
     * The included handler sends its own JSON response and exits.
     */
    if (($_POST['form_type'] ?? '') === 'customize') {
        define('MTT_CUSTOM_FORM', true);
        require __DIR__ . '/send-custom-trip.php';
        exit;
    }
    
    /**
     * STEP 8: Retrieve and Sanitize Form Data
     */
    $name = sanitizeInput($_POST['name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $subject = sanitizeInput($_POST['subject'] ?? 'Contact Form Submission');
    $message = sanitizeInput($_POST['message'] ?? '');
    $language = sanitizeInput($_POST['language'] ?? 'en'); // 'en' or 'fr'
    
    /**
     * STEP 9: Validate Required Fields
     */
    $errors = [];
    
    if (empty($name) || strlen($name) < 2) {
        $errors[] = $lang === 'fr' ? 'Le nom doit contenir au moins 2 caractères.' : 'Name must be at least 2 characters long.';
    }
    
    if (empty($email) || !validateEmail($email)) {
        $errors[] = $lang === 'fr' ? 'Veuillez fournir une adresse email valide.' : 'Please provide a valid email address.';
    }
    
    if (empty($message) || strlen($message) < 10) {
        $errors[] = $lang === 'fr' ? 'Le message doit contenir au moins 10 caractères.' : 'Message must be at least 10 characters long.';
    }
    
    // Check for suspicious content (basic spam detection)
    $spam_keywords = ['viagra', 'cialis', 'casino', 'lottery', 'winner'];
    $combined_text = strtolower($name . ' ' . $subject . ' ' . $message);
    foreach ($spam_keywords as $keyword) {
        if (strpos($combined_text, $keyword) !== false) {
            $errors[] = $lang === 'fr' ? 'Votre message contient un contenu interdit.' : 'Your message contains prohibited content.';
            break;
        }
    }
    
    if (!empty($errors)) {
        throw new MTTUserInputException(implode(' ', $errors));
    }
    
    /**
     * STEP 10: Initialize PHPMailer
     */
    $mail = new PHPMailer(true);
    
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION; // 'tls' or 'ssl'
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    
    // Enable verbose debug output (disable in production)
    if (DEBUG_MODE) {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->Debugoutput = function($str, $level) {
            error_log("SMTP Debug level $level: $str");
        };
    }
    
    /**
     * STEP 11: Set Email Recipients
     */
    // From: The customer's email (reply-to)
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    
    // Reply-To: Customer's email so you can reply directly
    $mail->addReplyTo($email, $name);
    
    // To: Your business email
    $mail->addAddress(RECIPIENT_EMAIL, RECIPIENT_NAME);
    
    // Optional: Add CC or BCC
    // $mail->addCC('cc@example.com');
    // $mail->addBCC('bcc@example.com');
    
    /**
     * STEP 12: Email Content
     */
    $mail->isHTML(true);
    
    // Set subject based on language
    if ($language === 'fr') {
        $mail->Subject = 'Nouveau message de contact: ' . $subject;
    } else {
        $mail->Subject = 'New Contact Form Message: ' . $subject;
    }
    
    // HTML email body
    $htmlBody = '
    <!DOCTYPE html>
    <html lang="' . $language . '">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .email-header {
                background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
            }
            .email-body {
                padding: 30px;
            }
            .info-row {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eeeeee;
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: bold;
                color: #d35400;
                margin-bottom: 5px;
            }
            .info-value {
                color: #555;
            }
            .message-box {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                border-left: 4px solid #d35400;
            }
            .email-footer {
                background: #f4f4f4;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>' . ($language === 'fr' ? 'Nouveau Message de Contact' : 'New Contact Message') . '</h1>
            </div>
            <div class="email-body">
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Nom' : 'Name') . ':</div>
                    <div class="info-value">' . htmlspecialchars($name) . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Email' : 'Email') . ':</div>
                    <div class="info-value"><a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a></div>
                </div>
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Sujet' : 'Subject') . ':</div>
                    <div class="info-value">' . htmlspecialchars($subject) . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Message' : 'Message') . ':</div>
                    <div class="message-box">' . nl2br(htmlspecialchars($message)) . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Date de réception' : 'Received') . ':</div>
                    <div class="info-value">' . date('F j, Y, g:i a') . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">' . ($language === 'fr' ? 'Adresse IP' : 'IP Address') . ':</div>
                    <div class="info-value">' . htmlspecialchars($_SERVER['REMOTE_ADDR']) . '</div>
                </div>
            </div>
            <div class="email-footer">
                <p>' . ($language === 'fr' ? 'Ce message a été envoyé via le formulaire de contact de Morocco Trek Tours' : 'This message was sent via the Morocco Trek Tours contact form') . '</p>
                <p>&copy; ' . date('Y') . ' Morocco Trek Tours. ' . ($language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.') . '</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    $mail->Body = $htmlBody;
    
    // Plain text alternative for email clients that don't support HTML
    $textBody = ($language === 'fr' ? 'Nouveau Message de Contact' : 'New Contact Message') . "\n\n";
    $textBody .= ($language === 'fr' ? 'Nom' : 'Name') . ": $name\n";
    $textBody .= "Email: $email\n";
    $textBody .= ($language === 'fr' ? 'Sujet' : 'Subject') . ": $subject\n\n";
    $textBody .= ($language === 'fr' ? 'Message' : 'Message') . ":\n$message\n\n";
    $textBody .= ($language === 'fr' ? 'Date de réception' : 'Received') . ": " . date('F j, Y, g:i a') . "\n";
    $textBody .= "IP: " . $_SERVER['REMOTE_ADDR'];
    
    $mail->AltBody = $textBody;
    
    /**
     * STEP 13: Send Email
     */
    $mail->send();
    
    /**
     * STEP 14: Optional - Send Auto-Reply to Customer
     */
   if (SEND_AUTO_REPLY) {
        $autoReply = new PHPMailer(true);
        $autoReply->isSMTP();
        $autoReply->Host       = SMTP_HOST;
        $autoReply->SMTPAuth   = true;
        $autoReply->Username   = SMTP_USERNAME;
        $autoReply->Password   = SMTP_PASSWORD;
        $autoReply->SMTPSecure = SMTP_ENCRYPTION;
        $autoReply->Port       = SMTP_PORT;
        $autoReply->CharSet    = 'UTF-8';
        
        $autoReply->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $autoReply->addAddress($email, $name);
        $autoReply->isHTML(true);

        // تعريف الألوان الخاصة بك
        $primaryColor = '#004d4d'; // أخضر غامق يميل للأزرق (Teal/Dark Green)
        $goldColor = '#d4af37';    // أصفر ذهبي (Goldenrod)
        
        if ($language === 'fr') {
            $autoReply->Subject = 'Votre demande d\'aventure est confirmée ! - Morocco Trek Tours';
            $autoReplyBody = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee;'>
                <div style='background-color: $primaryColor; padding: 20px; text-align: center;'>
                    <h1 style='color: $goldColor; margin: 0;'>Morocco Trek Tours</h1>
                </div>
                <div style='padding: 20px;'>
                    <h2 style='color: $primaryColor;'>Bonjour $name,</h2>
                    <p>Merci de nous avoir contactés ! Nous sommes ravis que vous envisagiez d'explorer le Maroc avec nous.</p>
                    <p>Nous avons bien reçu votre message et l'un de nos experts locaux vous répondra personnellement d'ici 24 heures.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                    <p><strong>Détails de votre message :</strong></p>
                    <div style='background-color: #f9f9f9; padding: 15px; border-left: 5px solid $goldColor; font-style: italic;'>
                        " . nl2br(htmlspecialchars($message)) . "
                    </div>
                    <p style='margin-top: 30px;'>À bientôt pour une aventure inoubliable !</p>
                    <p>Cordialement,<br><strong style='color: $primaryColor;'>L'équipe Morocco Trek Tours</strong></p>
                </div>
                <div style='background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;'>
                    &copy; " . date('Y') . " Morocco Trek Tours. Tous droits réservés.
                </div>
            </div>";
        } else {
            $autoReply->Subject = 'Adventure Awaits! We received your message - Morocco Trek Tours';
            $autoReplyBody = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee;'>
                <div style='background-color: $primaryColor; padding: 20px; text-align: center;'>
                    <h1 style='color: $goldColor; margin: 0;'>Morocco Trek Tours</h1>
                </div>
                <div style='padding: 20px;'>
                    <h2 style='color: $primaryColor;'>Hello $name,</h2>
                    <p>Thank you for reaching out! We are thrilled that you are considering exploring Morocco with us.</p>
                    <p>We have successfully received your message, and one of our local experts will get back to you personally within 24 hours.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                    <p><strong>A summary of your request:</strong></p>
                    <div style='background-color: #f9f9f9; padding: 15px; border-left: 5px solid $goldColor; font-style: italic;'>
                        " . nl2br(htmlspecialchars($message)) . "
                    </div>
                    <p style='margin-top: 30px;'>See you soon for an unforgettable adventure!</p>
                    <p>Best regards,<br><strong style='color: $primaryColor;'>The Morocco Trek Tours Team</strong></p>
                </div>
                <div style='background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;'>
                    &copy; " . date('Y') . " Morocco Trek Tours. All rights reserved.
                </div>
            </div>";
        }
        
        $autoReply->Body = $autoReplyBody;
        $autoReply->send();
    }
    
    /**
     * STEP 15: Success Response
     */
    echo json_encode([
        'success' => true,
        'message' => $language === 'fr' 
            ? 'Merci! Votre message a été envoyé avec succès. Nous vous répondrons bientôt.' 
            : 'Thank you! Your message has been sent successfully. We will respond soon.'
    ]);
    
} catch (MTTUserInputException $e) {
    /**
     * STEP 16a: User-correctable errors — server-authored localized text.
     */
    error_log('Contact Form Input Error: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    /**
     * STEP 16: Error Handling
     */
    // Log error for debugging
    error_log('Contact Form Error: ' . $e->getMessage());
    
    // Send user-friendly error message
    $errorMessage = DEBUG_MODE 
        ? $e->getMessage() 
        : 'Sorry, there was an error sending your message. Please try again or contact us directly.';
    
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ]);
} catch (\Throwable $e) {
    // Last-resort guard: keep the endpoint returning JSON instead of a bare 500.
    error_log('Contact Form Fatal: ' . get_class($e) . ': ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => (($_POST['language'] ?? 'en') === 'fr')
            ? 'Désolé, une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer ou nous contacter directement.'
            : 'Sorry, there was an error sending your message. Please try again or contact us directly.'
    ]);
}
