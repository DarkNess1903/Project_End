<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับค่าจาก JSON body
$data = json_decode(file_get_contents("php://input"), true);

$fromTableId = $data['from_table_id'] ?? null;
$toTableId = $data['to_table_id'] ?? null;

if (!$fromTableId || !$toTableId || $fromTableId === $toTableId) {
    echo json_encode(["error" => "ข้อมูลไม่ครบหรือโต๊ะซ้ำกัน"]);
    http_response_code(400);
    exit;
}

// ตรวจสอบว่ามี order ที่ active อยู่บนโต๊ะต้นทาง
$sql = "SELECT * FROM `order` WHERE TableID = ? AND Status != 'จบรายการ' ORDER BY ordertime DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $fromTableId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["error" => "ไม่พบคำสั่งซื้อในโต๊ะต้นทาง"]);
    http_response_code(404);
    exit;
}

$order = $result->fetch_assoc();

// อัปเดต Order ให้เปลี่ยน TableID ไปโต๊ะปลายทาง
$update = $conn->prepare("UPDATE `order` SET TableID = ? WHERE OrderID = ?");
$update->bind_param("ii", $toTableId, $order['OrderID']);
$update->execute();

// เปลี่ยนสถานะโต๊ะ
$conn->query("UPDATE dining SET Status = 'ว่าง' WHERE TableID = $fromTableId");
$conn->query("UPDATE dining SET Status = 'สั่งอาหารแล้ว' WHERE TableID = $toTableId");

echo json_encode(["success" => true, "message" => "ย้ายโต๊ะเรียบร้อยแล้ว"]);
