<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$order_item_id = $data['order_item_id'];
$status = $data['status'];

$sql = "UPDATE order_items SET Status = ? WHERE OrderItemID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $order_item_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
$conn->close();
?>
