<?php
// รองรับ preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    http_response_code(200);
    exit();
}

// ปกติ ก็เพิ่ม header CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['fromTableId']) || !isset($data['toTableId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fromTableId or toTableId']);
    exit;
}

$fromTableId = intval($data['fromTableId']);
$toTableId = intval($data['toTableId']);

$conn->begin_transaction();

try {
    // ตรวจสอบว่าโต๊ะปลายทางว่างอยู่หรือไม่
    $checkTarget = $conn->prepare("SELECT Status FROM dining WHERE TableID = ?");
    $checkTarget->bind_param("i", $toTableId);
    $checkTarget->execute();
    $targetResult = $checkTarget->get_result()->fetch_assoc();
    $checkTarget->close();

    if (!$targetResult) throw new Exception("โต๊ะปลายทางไม่ถูกต้อง");
    if ($targetResult['Status'] !== 'available') throw new Exception("โต๊ะปลายทางไม่ว่าง");

    // ค้นหาออร์เดอร์ที่ยังไม่ชำระของโต๊ะต้นทาง
    $getOrder = $conn->prepare("SELECT OrderID FROM `orders` WHERE TableID = ? AND Status IN ('pending','preparing','served') ORDER BY OrderTime DESC LIMIT 1");
    $getOrder->bind_param("i", $fromTableId);
    $getOrder->execute();
    $orderResult = $getOrder->get_result()->fetch_assoc();
    $getOrder->close();

    if (!$orderResult) throw new Exception("ไม่พบออร์เดอร์ที่ยังไม่จ่ายในโต๊ะนี้");

    $orderId = $orderResult['OrderID'];

    // อัปเดต TableID ในตาราง orders
    $updateOrder = $conn->prepare("UPDATE `orders` SET TableID = ? WHERE OrderID = ?");
    $updateOrder->bind_param("ii", $toTableId, $orderId);
    $updateOrder->execute();
    $updateOrder->close();

    // เปลี่ยนสถานะโต๊ะ
    $updateFrom = $conn->prepare("UPDATE dining SET Status = 'available' WHERE TableID = ?");
    $updateFrom->bind_param("i", $fromTableId);
    $updateFrom->execute();
    $updateFrom->close();

    $updateTo = $conn->prepare("UPDATE dining SET Status = 'occupied' WHERE TableID = ?");
    $updateTo->bind_param("i", $toTableId);
    $updateTo->execute();
    $updateTo->close();

    $conn->commit();

    echo json_encode(['success' => true, 'orderId' => $orderId]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'ย้ายโต๊ะล้มเหลว', 'details' => $e->getMessage()]);
}

$conn->close();
?>
