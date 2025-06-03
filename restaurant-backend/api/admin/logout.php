<?php
session_start();
header('Content-Type: application/json');

// เคลียร์ session ทั้งหมด
session_unset();
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logged out successfully"
]);
