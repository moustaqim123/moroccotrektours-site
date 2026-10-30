<?php
declare(strict_types=1);

/**
 * verify-mail-setup.php
 *
 * CLI-only check of the deployable contact-form layout inside public_html/.
 * Prints PASS/FAIL lines and, at most, the NAMES of missing constants.
 * It never prints, echoes or logs any configuration value or secret, and it
 * never sends an email.
 *
 * Run:  php tools/verify-mail-setup.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$root     = dirname(__DIR__);
$autoload = $root . '/public_html/vendor/autoload.php';
$config   = $root . '/public_html/private/email-config.php';

$requiredConstants = [
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_ENCRYPTION', 'SMTP_USERNAME', 'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME', 'RECIPIENT_EMAIL', 'RECIPIENT_NAME',
];

$results           = [];
$missingConstants  = [];

$results['vendor/autoload.php present and readable']   = is_file($autoload) && is_readable($autoload);
$results['private/email-config.php present and readable'] = is_file($config) && is_readable($config);

if ($results['vendor/autoload.php present and readable']) {
    require_once $autoload;
    $results['PHPMailer classes load via autoloader'] =
        class_exists('PHPMailer\\PHPMailer\\PHPMailer')
        && class_exists('PHPMailer\\PHPMailer\\SMTP')
        && class_exists('PHPMailer\\PHPMailer\\Exception');
} else {
    $results['PHPMailer classes load via autoloader'] = false;
}

if ($results['private/email-config.php present and readable']) {
    require_once $config;
    foreach ($requiredConstants as $name) {
        if (!defined($name)) {
            $missingConstants[] = $name;
        }
    }
    $results['all required e-mail constants defined'] = $missingConstants === [];
    // Compared, never printed.
    $results['RECIPIENT_EMAIL targets the business inbox'] =
        defined('RECIPIENT_EMAIL') && RECIPIENT_EMAIL === 'info@moroccotrektours.com';
} else {
    $results['all required e-mail constants defined'] = false;
    $results['RECIPIENT_EMAIL targets the business inbox'] = false;
}

$vendorHtaccess  = $root . '/public_html/vendor/.htaccess';
$privateHtaccess = $root . '/public_html/private/.htaccess';
$rootHtaccess    = $root . '/public_html/.htaccess';

$results['vendor/.htaccess denies HTTP access'] = is_file($vendorHtaccess)
    && strpos((string) file_get_contents($vendorHtaccess), 'Require all denied') !== false;
$results['private/.htaccess denies HTTP access'] = is_file($privateHtaccess)
    && strpos((string) file_get_contents($privateHtaccess), 'Require all denied') !== false;
$results['root .htaccess blocks vendor/ and private/'] = is_file($rootHtaccess)
    && strpos((string) file_get_contents($rootHtaccess), '^vendor') !== false
    && strpos((string) file_get_contents($rootHtaccess), '^private') !== false;

foreach ($results as $label => $ok) {
    printf("%-52s %s\n", $label, $ok ? 'PASS' : 'FAIL');
}

if ($missingConstants !== []) {
    echo 'Missing constants (names only): ' . implode(', ', $missingConstants) . PHP_EOL;
}

exit(in_array(false, $results, true) ? 1 : 0);
