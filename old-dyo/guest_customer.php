<?php

error_reporting(E_ERROR);
header('content-type: application/json; charset=utf-8');
header('access-control-allow-origin: *');

require_once('dyo5.php');

function respond($data) {
    echo json_encode($data);
    exit;
}

$customer_email = strtolower(trim($_POST['customer_email'] ?? ''));
$customer_phone = trim($_POST['customer_phone'] ?? '');

if (!preg_match('/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i', $customer_email)) {
    respond(['status' => 'invalid_email']);
}

$customer_phone = preg_replace('/[^0-9 +()\\-]/', '', $customer_phone);

$db = NewADOConnection(database_type);
$db->Connect(host, user, password, database);

// A guest must not silently be attached to an existing account. The caller can
// sign in through the normal account flow in that case.
$existing = $db->getAll("SELECT customer_id FROM shine_customer WHERE customer_email = '$customer_email'");
if (!empty($existing)) {
    respond(['status' => 'account_exists']);
}

// The random password is an internal credential used only by the legacy save
// and order endpoints. No registration email is sent and it is never displayed.
$customer_password = bin2hex(random_bytes(24));
$data = (object) [
    'customer_firstname' => 'Guest',
    'customer_lastname' => 'Customer',
    'customer_email' => $customer_email,
    'customer_password' => $customer_password,
    'customer_phone' => $customer_phone
];

$customer = Customer::getInstance();
$customer->init($data);
$result = $customer->register();

if ($result === 'failure') {
    respond(['status' => 'failed']);
}

$created = $db->getAll("SELECT customer_id, customer_password FROM shine_customer WHERE customer_email = '$customer_email' AND customer_password = OLD_PASSWORD('$customer_password')");
if (empty($created)) {
    respond(['status' => 'failed']);
}

respond([
    'status' => 'success',
    'customer_id' => $created[0]['customer_id'],
    'customer_email' => $customer_email,
    // The legacy Order class compares the stored hash directly, while the
    // Design class accepts either form. Keep the browser session compatible
    // with both by returning the stored value.
    'customer_password' => $created[0]['customer_password']
]);
