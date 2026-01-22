<?php
/**
 * Contact Form Handler for Morocco Trek Tours
 * Uses PHPMailer with Hostinger SMTP
 */

// 1. Load PHPMailer classes
// You MUST upload the PHPMailer folder to your server for this to work.
// Download it from: https://github.com/PHPMailer/PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get form data
    $name    = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
    $email   = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $subject = isset($_POST['subject']) ? strip_tags(trim($_POST['subject'])) : 'New Contact from Website';
    $message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

    // Validate
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'info@moroccotrektours.com'; // Replace with your actual email
        $mail->Password   = 'YOUR_SMTP_PASSWORD';        // Replace with your actual password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Use 465
        $mail->Port       = 465;

        // Recipients
        $mail->setFrom('info@moroccotrektours.com', 'Morocco Trek Tours Website');
        $mail->addAddress('info@moroccotrektours.com'); // Admin email
        $mail->addReplyTo($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        // Construct the body
        $body = "<h2>New Contact Form Submission</h2>";
        $body .= "<p><strong>Name:</strong> {$name}</p>";
        $body .= "<p><strong>Email:</strong> {$email}</p>";
        $body .= "<p><strong>Subject:</strong> {$subject}</p>";
        $body .= "<p><strong>Message:</strong><br>" . nl2br($message) . "</p>";
        
        $mail->Body = $body;
        $mail->AltBody = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\nMessage:\n{$message}";

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'Thank you! Your message has been sent.']);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
}
