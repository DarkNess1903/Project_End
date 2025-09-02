<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบการส่งค่า
if (!isset($data['order_item_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing order_item_id or status"]);
    exit;
}

$order_item_id = intval($data['order_item_id']);
$status = $data['status'];

// ตรวจสอบว่าค่าสถานะถูกต้องหรือไม่
$valid_statuses = ['cooking', 'served'];
if (!in_array($status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status value"]);
    exit;
}

// === 1) อัปเดตสถานะของ OrderItem รายการเดียว ===
$stmt = $conn->prepare("UPDATE orderitem SET Status = ? WHERE OrderItemID = ?");
$stmt->bind_param("si", $status, $order_item_id);
$success = $stmt->execute();
$stmt->close();

if (!$success) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update item status"]);
    $conn->close();
    exit;
}

// === 2) ตรวจสอบว่า OrderItem ของ order นี้ served ครบหรือยัง ===
// หาค่า OrderID จาก OrderItemID
$stmt2 = $conn->prepare("SELECT OrderID FROM orderitem WHERE OrderItemID = ?");
$stmt2->bind_param("i", $order_item_id);
$stmt2->execute();
$result2 = $stmt2->get_result();
$row2 = $result2->fetch_assoc();
$order_id = $row2['OrderID'];
$stmt2->close();

// ตรวจสอบว่ามีรายการที่ยังไม่เป็น served หรือไม่
$stmt3 = $conn->prepare("SELECT COUNT(*) AS not_served FROM orderitem WHERE OrderID = ? AND Status != 'served'");
$stmt3->bind_param("i", $order_id);
$stmt3->execute();
$result3 = $stmt3->get_result();
$row3 = $result3->fetch_assoc();
$all_served = ($row3['not_served'] == 0);
$stmt3->close();

$table_id = null;
$table_updated = false;

if ($all_served) {
    // ดึง TableID จาก order
    $stmt4 = $conn->prepare("SELECT TableID FROM `orders` WHERE OrderID = ?");
    $stmt4->bind_param("i", $order_id);
    $stmt4->execute();
    $result4 = $stmt4->get_result();
    if ($row4 = $result4->fetch_assoc()) {
        $table_id = $row4['TableID'];

        // อัปเดตโต๊ะให้เป็น reserved
        $stmt5 = $conn->prepare("UPDATE dining SET Status = 'reserved' WHERE TableID = ?");
        $stmt5->bind_param("i", $table_id);
        $table_updated = $stmt5->execute();
        $stmt5->close();
    }
    $stmt4->close();
}

// ส่งผลลัพธ์กลับ
echo json_encode([
    "success" => true,
    "order_item_id" => $order_item_id,
    "new_status" => $status,
    "table_status_updated" => $all_served,
    "table_id" => $table_id,
    "table_updated" => $table_updated
]);

$conn->close();
