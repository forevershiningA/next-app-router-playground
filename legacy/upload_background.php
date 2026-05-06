<?php
/**
 * Upload Background Image
 *
 * Deploy this file to wiecznapamiec.pl (e.g. public_html/upload-background.php).
 * Set the $secret variable to match UPLOAD_REMOTE_SECRET in your Vercel env vars.
 *
 * Creates uploaded files at: public_html/uploads/backgrounds/
 * Serves them at:            https://www.wiecznapamiec.pl/uploads/backgrounds/{uuid}.jpg
 */

header('Content-Type: application/json');

// CORS: only allow requests from your Vercel app and localhost
$allowedOrigins = [
    'https://forevershining.org',
    'https://www.forevershining.org',
    'http://localhost:3000',
    'http://localhost:3001',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Auth ---
// Match UPLOAD_REMOTE_SECRET in your Vercel environment variables.
// Change this to a strong random string (e.g. openssl rand -hex 32).
$secret = 'CHANGE_ME_TO_A_STRONG_SECRET';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($authHeader !== 'Bearer ' . $secret) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// --- Validate file ---
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['file']['error'] ?? -1;
    http_response_code(400);
    echo json_encode(['error' => 'No file or upload error', 'code' => $errCode]);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$mimeType = mime_content_type($_FILES['file']['tmp_name']);
if (!in_array($mimeType, $allowedTypes, true)) {
    http_response_code(415);
    echo json_encode(['error' => 'Unsupported file type: ' . $mimeType]);
    exit;
}

// Max 10 MB
if ($_FILES['file']['size'] > 10 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['error' => 'File too large']);
    exit;
}

// --- Save file ---
$uploadDir = __DIR__ . '/uploads/backgrounds/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not create upload directory']);
        exit;
    }
}

$ext = match ($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    default      => 'jpg',
};
$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

$publicUrl = 'https://www.wiecznapamiec.pl/uploads/backgrounds/' . $filename;
echo json_encode(['url' => $publicUrl]);
