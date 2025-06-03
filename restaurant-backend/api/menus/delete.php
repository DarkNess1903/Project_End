<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing menu id"]);
    exit;
}

$menu_id = intval($_GET['id']);

$stmt = $conn->prepare("DELETE FROM Menu WHERE MenuID = ?");
$stmt->bind_param("i", $menu_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete menu"]);
}

$stmt->close();
$conn->close();
