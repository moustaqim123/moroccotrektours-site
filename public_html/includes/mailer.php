<?php
/**
 * Superseded helper library.
 *
 * During the diagnosis an alternative transport was prototyped here, but the
 * root cause turned out to be a wrong autoload path, so the original PHPMailer
 * implementation was restored instead. send-email.php no longer includes this
 * file; it can be deleted before deployment.
 *
 * Direct requests return 404: this file is not a public endpoint and defines
 * nothing callable from the request itself.
 */

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not found';
exit;

