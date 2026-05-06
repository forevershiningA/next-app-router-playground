<?php
/**
 * Unified File Upload Endpoint — DYO Headstone Designer
 *
 * Deploy this file to: public_html/upload.php
 * Update Vercel env var UPLOAD_REMOTE_URL to point here.
 * Set $secret below to match UPLOAD_REMOTE_SECRET in Vercel.
 *
 * Supported subdirs (form field: subdir):
 *   backgrounds  — urn/plaque background images     (image/jpeg, png, webp)
 *   images       — portrait/ceramic photos           (image/jpeg, png, webp)
 *   screenshots  — saved design thumbnails           (image/jpeg, png, webp)
 *   pdfs         — generated quote / order PDFs      (application/pdf)
 *
 * All files saved to: public_html/uploads/{subdir}/{uuid}.ext
 * All files served at: https://www.wiecznapamiec.pl/uploads/{subdir}/{uuid}.ext
 *
 * Apache CORS for the uploads/ directory is handled by uploads/.htaccess
 * (see legacy/uploads_htaccess.txt in the Next.js repo).
 */

header('Content-Type: application/json');

// ─── CORS (upload endpoint itself) ──────────────────────────────────────────
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

// ─── Auth ────────────────────────────────────────────────────────────────────
// Must match UPLOAD_REMOTE_SECRET in your Vercel environment variables.
// Generate with: openssl rand -hex 32
$secret = 'CHANGE_ME_TO_A_STRONG_SECRET';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($authHeader !== 'Bearer ' . $secret) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ─── Subdir whitelist ────────────────────────────────────────────────────────
$allowedSubdirs = ['backgrounds', 'images', 'screenshots', 'pdfs'];
$subdir = trim($_POST['subdir'] ?? 'backgrounds');
if (!in_array($subdir, $allowedSubdirs, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid subdir. Allowed: ' . implode(', ', $allowedSubdirs)]);
    exit;
}

// ─── MIME type rules per subdir ──────────────────────────────────────────────
$mimeRules = [
    'backgrounds' => ['image/jpeg', 'image/png', 'image/webp'],
    'images'      => ['image/jpeg', 'image/png', 'image/webp'],
    'screenshots' => ['image/jpeg', 'image/png', 'image/webp'],
    'pdfs'        => ['application/pdf'],
];
$allowedMimes = $mimeRules[$subdir];

// ─── Validate file ───────────────────────────────────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['file']['error'] ?? -1;
    http_response_code(400);
    echo json_encode(['error' => 'No file or upload error', 'code' => $errCode]);
    exit;
}

$mimeType = mime_content_type($_FILES['file']['tmp_name']);
if (!in_array($mimeType, $allowedMimes, true)) {
    http_response_code(415);
    echo json_encode(['error' => "Unsupported type '$mimeType' for subdir '$subdir'"]);
    exit;
}

$maxBytes = $subdir === 'pdfs' ? 20 * 1024 * 1024 : 10 * 1024 * 1024; // 20 MB for PDFs, 10 MB for images
if ($_FILES['file']['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['error' => 'File too large (max ' . ($maxBytes / 1024 / 1024) . ' MB)']);
    exit;
}

// ─── Extension map ───────────────────────────────────────────────────────────
$extMap = [
    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'image/webp'      => 'webp',
    'application/pdf' => 'pdf',
];
$ext = $extMap[$mimeType] ?? 'bin';

// ─── Save ────────────────────────────────────────────────────────────────────
$uploadDir = __DIR__ . '/uploads/' . $subdir . '/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not create upload directory']);
        exit;
    }
}

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

$publicUrl = 'https://www.wiecznapamiec.pl/forevershining/uploads/' . $subdir . '/' . $filename;
echo json_encode(['url' => $publicUrl]);
