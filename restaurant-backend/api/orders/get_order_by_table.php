<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$table_id = isset($_GET['table_id']) ? intval($_GET['table_id']) : 0;

if ($table_id <= 0) {
    echo json_encode(["success" => false, "message" => "table_id ไม่ถูกต้อง"]);
    exit;
}

// ✅ ดึงออเดอร์ที่โต๊ะนี้ยังไม่ปิด (ทุกสถานะ ยกเว้น paid)
$sql_order = "SELECT * FROM `orders` 
              WHERE TableID = ? AND Status != 'paid' 
              ORDER BY OrderID DESC 
              LIMIT 1";
$stmt = $conn->prepare($sql_order);
$stmt->bind_param("i", $table_id);
$stmt->execute();
$result_order = $stmt->get_result();

if ($result_order->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "ไม่พบคำสั่งซื้อที่ยังไม่ปิดบิล"]);
    exit;
}

$order = $result_order->fetch_assoc();
$order_id = $order['OrderID'];

// ✅ ดึงรายการอาหารของบิลนี้
$sql_items = "SELECT oi.OrderItemID, oi.MenuID, oi.Quantity, oi.SubTotal, oi.Note, oi.Status,
                     m.Name AS MenuName, m.ImageURL, m.Price
              FROM orderitem oi 
              JOIN menu m ON oi.MenuID = m.MenuID 
              WHERE oi.OrderID = ?";
$stmt_items = $conn->prepare($sql_items);
$stmt_items->bind_param("i", $order_id);
$stmt_items->execute();
$result_items = $stmt_items->get_result();

$items = [];
while ($row = $result_items->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    "success" => true,
    "order" => $order,
    "items" => $items
]);

$conn->close();
