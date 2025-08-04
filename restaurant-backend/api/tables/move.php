<?php
require_once '../../config/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

$fromTableId = $data->fromTableId;
$toTableId = $data->toTableId;

// ตรวจสอบว่าโต๊ะปลายทางว่างอยู่หรือไม่
$checkTarget = $conn->prepare("SELECT Status FROM dining WHERE TableID = ?");
$checkTarget->bind_param("i", $toTableId);
$checkTarget->execute();
$targetResult = $checkTarget->get_result()->fetch_assoc();

if (!$targetResult || $targetResult['Status'] !== 'empty') {
    http_response_code(400);
    echo json_encode(['error' => 'โต๊ะปลายทางไม่ว่าง']);
    exit;
}

// ค้นหาออเดอร์ที่ยังไม่ชำระของโต๊ะต้นทาง
$getOrder = $conn->prepare("SELECT OrderID FROM `order` WHERE TableID = ? AND Status IN ('pending','preparing','served') ORDER BY OrderTime DESC LIMIT 1");
$getOrder->bind_param("i", $fromTableId);
$getOrder->execute();
$orderResult = $getOrder->get_result()->fetch_assoc();

if (!$orderResult) {
    http_response_code(404);
    echo json_encode(['error' => 'ไม่พบออเดอร์ที่ยังไม่จ่ายในโต๊ะนี้']);
    exit;
}

$orderId = $orderResult['OrderID'];

// อัปเดต TableID ในตาราง order
$updateOrder = $conn->prepare("UPDATE `order` SET TableID = ? WHERE OrderID = ?");
$updateOrder->bind_param("ii", $toTableId, $orderId);
$updateOrder->execute();

// เปลี่ยนสถานะโต๊ะ
$conn->query("UPDATE dining SET Status = 'empty' WHERE TableID = $fromTableId");
$conn->query("UPDATE dining SET Status = 'occupied' WHERE TableID = $toTableId");

echo json_encode(['success' => true]);
