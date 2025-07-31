<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบการส่งค่า
if (!isset($data['order_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing order_id or status"]);
    exit;
}

$order_id = intval($data['order_id']);
$new_status = $data['status'];

// ตรวจสอบสถานะที่อนุญาต
$valid_statuses = ['pending', 'preparing', 'served', 'paid'];

if (!in_array($new_status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status"]);
    exit;
}

// อัปเดตสถานะ
$stmt = $conn->prepare("UPDATE `order` SET Status = ? WHERE OrderID = ?");
$stmt->bind_param("si", $new_status, $order_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "order_id" => $order_id, "new_status" => $new_status]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update status"]);
}

$stmt->close();
$conn->close();
