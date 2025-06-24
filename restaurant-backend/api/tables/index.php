<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Content-Type ต้องตามหลัง header CORS
header('Content-Type: application/json');

require_once '../../config/db.php';

// ดึงข้อมูลโต๊ะทั้งหมด
$sql = "SELECT * FROM dining";
$result = $conn->query($sql);

$tables = [];

while ($row = $result->fetch_assoc()) {
    $tables[] = $row;
}

echo json_encode($tables);
