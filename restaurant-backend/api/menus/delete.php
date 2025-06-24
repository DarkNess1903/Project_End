<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['MenuID'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing MenuID"]);
    exit;
}

$menu_id = intval($data['MenuID']);
$stmt = $conn->prepare("DELETE FROM menu WHERE MenuID = ?");
$stmt->bind_param("i", $menu_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete menu"]);
}

$stmt->close();
$conn->close();
?>
