<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit();
}

// ปกติ ก็เพิ่ม header CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require_once '../../config/db.php';

$sql = "SELECT TableID, TableNumber, Status, Capacity FROM dining ORDER BY TableNumber ASC";
$result = $conn->query($sql);

$tables = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $tables[] = $row;
    }
    echo json_encode($tables);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch tables"]);
}

$conn->close();
?>
