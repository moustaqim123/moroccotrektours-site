<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/private/email-config.php';

$mail = new PHPMailer\PHPMailer\PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress(RECIPIENT_EMAIL, RECIPIENT_NAME);

    $mail->Subject = 'Morocco Trek Tours - SMTP Test';
    $mail->Body    = 'This is a test email. Your website SMTP sending system is working.';

    $mail->send();

    echo "EMAIL SENT SUCCESSFULLY\n";

} catch (Throwable $e) {
    echo "EMAIL FAILED\n";
    echo $e->getMessage() . "\n";
}