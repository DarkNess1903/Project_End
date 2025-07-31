<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$order_id = $data['order_id'] ?? 0;

if (!$order_id) {
    echo json_encode(["success" => false, "message" => "Missing order_id"]);
    exit;
}

$sql = "UPDATE order SET Status = 'paid' WHERE OrderID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Database error"]);
}

$conn->close();
?>
