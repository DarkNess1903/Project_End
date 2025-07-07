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

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['TableID'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing TableID"]);
    exit;
}

$tableID = intval($data['TableID']);

$stmt = $conn->prepare("DELETE FROM dining WHERE TableID = ?");
$stmt->bind_param("i", $tableID);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete table"]);
}

$stmt->close();
$conn->close();
?>
