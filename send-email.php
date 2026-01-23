<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
/**
 * Professional Contact Form Email Handler
 * Uses PHPMailer with SMTP authentication
 * Includes input validation, sanitization, and security features
 */

// Start session for CSRF protection and rate limiting
session_start();

// Set response header to JSON
header('Content-Type: application/json');

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production

/**
 * STEP 1: Load PHPMailer library
 * Install via Composer: composer require phpmailer/phpmailer
 * Or download from: https://github.com/PHPMailer/PHPMailer
 */
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * STEP 2: Load configuration
 */
require_once __DIR__ . '/config/email-config.php';

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
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * STEP 5: Input Sanitization
 * Sanitizes user input to prevent XSS and injection attacks
 */
function sanitizeInput($data) {
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
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Only POST is allowed.');
    }
    
    // Check rate limiting
    if (!checkRateLimit()) {
        throw new Exception('Too many requests. Please try again later.');
    }
    
    // Validate CSRF token
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!validateCSRFToken($csrf_token)) {
        throw new Exception('Invalid security token. Please refresh the page and try again.');
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
        $errors[] = 'Name must be at least 2 characters long.';
    }
    
    if (empty($email) || !validateEmail($email)) {
        $errors[] = 'Please provide a valid email address.';
    }
    
    if (empty($message) || strlen($message) < 10) {
        $errors[] = 'Message must be at least 10 characters long.';
    }
    
    // Check for suspicious content (basic spam detection)
    $spam_keywords = ['viagra', 'cialis', 'casino', 'lottery', 'winner'];
    $combined_text = strtolower($name . ' ' . $subject . ' ' . $message);
    foreach ($spam_keywords as $keyword) {
        if (strpos($combined_text, $keyword) !== false) {
            $errors[] = 'Your message contains prohibited content.';
            break;
        }
    }
    
    if (!empty($errors)) {
        throw new Exception(implode(' ', $errors));
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
}
