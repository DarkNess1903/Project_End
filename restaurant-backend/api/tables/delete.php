<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../config/db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing table ID"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM dining WHERE TableID = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete table"]);
}

$stmt->close();
$conn->close();
?>
