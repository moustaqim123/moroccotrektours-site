<?php
/**
 * Trip customization handler.
 *
 * This file is not a public endpoint: send-email.php validates the request
 * method, CSRF token, honeypot and rate limit first, loads the private mail
 * configuration, and then includes this file. Direct requests receive a 404.
 *
 * It uses the same SMTP constants, sender and recipient as the contact form,
 * but builds a "custom trip request" message instead of a contact message.
 */

if (!defined('MTT_CUSTOM_FORM')) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * Header-safe single-line value.
 *
 * @param mixed $value
 * @param int   $maxLength
 * @return string
 */
function mttCustomLine($value, $maxLength)
{
    $value = (string) $value;
    $value = str_replace(chr(0), '', $value);
    $value = preg_replace('/[\r\n\t]+/', ' ', $value);
    $value = trim($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }
    return substr($value, 0, $maxLength);
}

/**
 * Multi-line body value (line breaks preserved, capped).
 *
 * @param mixed $value
 * @param int   $maxLength
 * @return string
 */
function mttCustomBlock($value, $maxLength)
{
    $value = (string) $value;
    $value = str_replace(chr(0), '', $value);
    $value = str_replace(array("\r\n", "\r"), "\n", $value);
    $value = trim($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }
    return substr($value, 0, $maxLength);
}

/**
 * @param mixed $value
 * @return string
 */
function mttCustomEscape($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

/**
 * One label/value row in the notification email.
 *
 * @param string $label
 * @param string $valueHtml Already escaped
 * @return string
 */
function mttCustomRow($label, $valueHtml)
{
    return '<div class="info-row">'
        . '<div class="info-label">' . mttCustomEscape($label) . ':</div>'
        . '<div class="info-value">' . $valueHtml . '</div>'
        . '</div>';
}

$customLanguage = (isset($_POST['language']) && $_POST['language'] === 'fr') ? 'fr' : 'en';

$customName    = mttCustomLine(isset($_POST['name']) ? $_POST['name'] : '', 100);
$customEmail   = mttCustomLine(isset($_POST['email']) ? $_POST['email'] : '', 254);
$customPhone   = mttCustomLine(isset($_POST['phone']) ? $_POST['phone'] : '', 30);
$customDates   = mttCustomLine(isset($_POST['dates']) ? $_POST['dates'] : '', 120);
$customMessage = mttCustomBlock(isset($_POST['message']) ? $_POST['message'] : '', 500);

$customTravelers = isset($_POST['travelers']) ? (int) $_POST['travelers'] : 0;

$customRegions = array();
$regionNames = array(
    'atlas'  => array('en' => 'Atlas Mountains', 'fr' => 'Montagnes de l\'Atlas'),
    'sahara' => array('en' => 'Sahara Desert', 'fr' => 'Désert du Sahara'),
    'cities' => array('en' => 'Imperial Cities', 'fr' => 'Villes impériales'),
    'coast'  => array('en' => 'Atlantic Coast', 'fr' => 'Côte Atlantique'),
);
if (isset($_POST['region'])) {
    foreach ((array) $_POST['region'] as $region) {
        if (is_string($region) && isset($regionNames[$region])) {
            $customRegions[] = $region;
        }
    }
}
$customRegions = array_values(array_unique($customRegions));

$customInterests = array();
$interestNames = array(
    'hiking'      => array('en' => 'Hiking / Trekking', 'fr' => 'Randonnée'),
    'culture'     => array('en' => 'Culture & History', 'fr' => 'Culture & Histoire'),
    'food'        => array('en' => 'Food & Cooking', 'fr' => 'Cuisine & Gastronomie'),
    'relax'       => array('en' => 'Relaxation', 'fr' => 'Relaxation'),
    'photography' => array('en' => 'Photography', 'fr' => 'Photographie'),
    'adventure'   => array('en' => 'Adventure', 'fr' => 'Aventure'),
);
if (isset($_POST['interest'])) {
    foreach ((array) $_POST['interest'] as $interest) {
        if (is_string($interest) && isset($interestNames[$interest])) {
            $customInterests[] = $interest;
        }
    }
}
$customInterests = array_values(array_unique($customInterests));

$customAccommodation = isset($_POST['accommodation']) ? mttCustomLine($_POST['accommodation'], 20) : '';
$accommodationNames = array(
    'standard' => array('en' => 'Standard', 'fr' => 'Standard'),
    'premium'  => array('en' => 'Premium', 'fr' => 'Premium'),
    'luxury'   => array('en' => 'Luxury', 'fr' => 'Luxe'),
    'camping'  => array('en' => 'Camping', 'fr' => 'Bivouac'),
);
if ($customAccommodation !== '' && !isset($accommodationNames[$customAccommodation])) {
    $customAccommodation = '';
}

$customErrors = array();

if ($customName === '' || (function_exists('mb_strlen') ? mb_strlen($customName, 'UTF-8') : strlen($customName)) < 2) {
    $customErrors[] = $customLanguage === 'fr'
        ? 'Veuillez indiquer votre nom.'
        : 'Please enter your name.';
}

if (!validateEmail($customEmail)) {
    $customErrors[] = $customLanguage === 'fr'
        ? 'Veuillez saisir une adresse email valide.'
        : 'Please enter a valid email address.';
}

if ($customDates === '') {
    $customErrors[] = $customLanguage === 'fr'
        ? 'Veuillez indiquer vos dates de voyage approximatives.'
        : 'Please tell us your approximate travel dates.';
}

if ($customTravelers < 1 || $customTravelers > 20) {
    $customErrors[] = $customLanguage === 'fr'
        ? 'Veuillez choisir entre 1 et 20 voyageurs.'
        : 'Please choose between 1 and 20 travellers.';
}

if ($customPhone !== '' && !preg_match('/^[0-9+().\-\s]{6,30}$/', $customPhone)) {
    $customErrors[] = $customLanguage === 'fr'
        ? 'Veuillez saisir un numéro de téléphone valide ou laisser le champ vide.'
        : 'Please enter a valid phone number or leave it empty.';
}

if (!empty($customErrors)) {
    http_response_code(422);
    echo json_encode(array(
        'success' => false,
        'message' => implode(' ', $customErrors),
        'errors'  => $customErrors,
    ));
    exit;
}

$regionText = empty($customRegions)
    ? ($customLanguage === 'fr' ? 'Non précisé' : 'Not specified')
    : implode(', ', array_map(function ($key) use ($regionNames, $customLanguage) {
        return $regionNames[$key][$customLanguage];
    }, $customRegions));

$interestText = empty($customInterests)
    ? ($customLanguage === 'fr' ? 'Non précisé' : 'Not specified')
    : implode(', ', array_map(function ($key) use ($interestNames, $customLanguage) {
        return $interestNames[$key][$customLanguage];
    }, $customInterests));

$accommodationText = $customAccommodation === ''
    ? ($customLanguage === 'fr' ? 'Non précisé' : 'Not specified')
    : $accommodationNames[$customAccommodation][$customLanguage];

$receivedAt = date('F j, Y, g:i a');

if ($customLanguage === 'fr') {
    $emailSubject = 'Nouvelle demande de voyage personnalisé: ' . $customDates;
    $emailHeading = 'Nouvelle Demande de Voyage Personnalisé';
    $emailFooter  = 'Ce message a été envoyé via le formulaire de personnalisation de Morocco Trek Tours';
    $successText  = 'Merci ! Votre demande a bien été envoyée. Nous vous répondrons sous 24 heures.';
    $errorText    = 'Désolé, une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer ou nous écrire à info@moroccotrektours.com.';
    $labels = array(
        'name'          => 'Nom',
        'email'         => 'Email',
        'phone'         => 'Téléphone',
        'dates'         => 'Dates approximatives',
        'travelers'     => 'Voyageurs',
        'regions'       => 'Régions souhaitées',
        'interests'     => 'Centres d\'intérêt',
        'accommodation' => 'Style d\'hébergement',
        'message'       => 'Demandes spéciales',
        'received'      => 'Reçu le',
    );
} else {
    $emailSubject = 'New Custom Trip Request: ' . $customDates;
    $emailHeading = 'New Custom Trip Request';
    $emailFooter  = 'This message was sent via the Morocco Trek Tours customization form';
    $successText  = 'Thank you! Your request has been sent. We will get back to you within 24 hours.';
    $errorText    = 'Sorry, there was an error sending your request. Please try again or email info@moroccotrektours.com.';
    $labels = array(
        'name'          => 'Name',
        'email'         => 'Email',
        'phone'         => 'Phone',
        'dates'         => 'Approximate dates',
        'travelers'     => 'Travellers',
        'regions'       => 'Preferred regions',
        'interests'     => 'Interests',
        'accommodation' => 'Accommodation style',
        'message'       => 'Special requests',
        'received'      => 'Received',
    );
}

$customRows = mttCustomRow($labels['name'], mttCustomEscape($customName))
    . mttCustomRow($labels['email'], '<a href="mailto:' . mttCustomEscape($customEmail) . '">' . mttCustomEscape($customEmail) . '</a>')
    . ($customPhone !== '' ? mttCustomRow($labels['phone'], mttCustomEscape($customPhone)) : '')
    . mttCustomRow($labels['dates'], mttCustomEscape($customDates))
    . mttCustomRow($labels['travelers'], mttCustomEscape((string) $customTravelers))
    . mttCustomRow($labels['regions'], mttCustomEscape($regionText))
    . mttCustomRow($labels['interests'], mttCustomEscape($interestText))
    . mttCustomRow($labels['accommodation'], mttCustomEscape($accommodationText))
    . ($customMessage !== '' ? mttCustomRow($labels['message'], '<div class="message-box">' . nl2br(mttCustomEscape($customMessage)) . '</div>') : '')
    . mttCustomRow($labels['received'], mttCustomEscape($receivedAt));

$customHtml = '<!DOCTYPE html>
<html lang="' . $customLanguage . '">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .email-header { background: linear-gradient(135deg, #d35400 0%, #e67e22 100%); color: #ffffff; padding: 30px; text-align: center; }
        .email-header h1 { margin: 0; font-size: 24px; }
        .email-body { padding: 30px; }
        .info-row { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eeeeee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #d35400; margin-bottom: 5px; }
        .info-value { color: #555; }
        .message-box { background: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #d35400; }
        .email-footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header"><h1>' . mttCustomEscape($emailHeading) . '</h1></div>
        <div class="email-body">' . $customRows . '</div>
        <div class="email-footer">
            <p>' . mttCustomEscape($emailFooter) . '</p>
            <p>&copy; ' . date('Y') . ' Morocco Trek Tours</p>
        </div>
    </div>
</body>
</html>';

$customText = $emailHeading . "\n\n"
    . $labels['name'] . ': ' . $customName . "\n"
    . $labels['email'] . ': ' . $customEmail . "\n"
    . ($customPhone !== '' ? $labels['phone'] . ': ' . $customPhone . "\n" : '')
    . $labels['dates'] . ': ' . $customDates . "\n"
    . $labels['travelers'] . ': ' . $customTravelers . "\n"
    . $labels['regions'] . ': ' . $regionText . "\n"
    . $labels['interests'] . ': ' . $interestText . "\n"
    . $labels['accommodation'] . ': ' . $accommodationText . "\n"
    . ($customMessage !== '' ? $labels['message'] . ":\n" . $customMessage . "\n" : '')
    . $labels['received'] . ': ' . $receivedAt . "\n";

try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    if (DEBUG_MODE) {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->Debugoutput = function ($str, $level) {
            error_log("SMTP Debug level $level: $str");
        };
    }

    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addReplyTo($customEmail, $customName);
    $mail->addAddress(RECIPIENT_EMAIL, RECIPIENT_NAME);

    $mail->isHTML(true);
    $mail->Subject = $emailSubject;
    $mail->Body    = $customHtml;
    $mail->AltBody = $customText;

    $mail->send();

    echo json_encode(array(
        'success' => true,
        'message' => $successText,
    ));
} catch (\Throwable $e) {
    error_log('Custom Trip Form Error: ' . $e->getMessage());
    http_response_code(502);
    echo json_encode(array(
        'success' => false,
        'message' => $errorText,
    ));
}
