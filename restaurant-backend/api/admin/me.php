<?php
session_start();
header('Content-Type: application/json');

// ตรวจสอบ session ว่ามี admin login หรือไม่
if (isset($_SESSION['admin_id'])) {
    echo json_encode([
        "logged_in" => true,
        "admin_id" => $_SESSION['admin_id']
    ]);
} else {
    http_response_code(401); // Unauthorized
    echo json_encode([
        "logged_in" => false,
        "error" => "Not logged in"
    ]);
}
