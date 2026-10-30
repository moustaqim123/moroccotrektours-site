<?php
/**
 * CSRF Token Generator
 * Generates and stores a CSRF token in the session
 */

session_start();

// Generate a secure CSRF token
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Return token as JSON
header('Content-Type: application/json');
header('Cache-Control: no-store, max-age=0');
echo json_encode(['token' => $_SESSION['csrf_token']]);
