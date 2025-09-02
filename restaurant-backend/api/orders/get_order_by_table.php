<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$table_id = isset($_GET['table_id']) ? intval($_GET['table_id']) : 0;

$sql_order = "SELECT * FROM `orders` WHERE TableID = $table_id AND Status = 'pending' ORDER BY OrderID DESC LIMIT 1";
$result_order = $conn->query($sql_order);

if ($result_order->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "ไม่พบข้อมูลคำสั่งซื้อ"]);
    exit;
}

$order = $result_order->fetch_assoc();
$order_id = $order['OrderID'];

// ดึง Order Items
$sql_items = "SELECT oi.*, m.Name AS MenuName, m.ImageURL 
              FROM orderitem oi 
              JOIN menu m ON oi.MenuID = m.MenuID 
              WHERE oi.OrderID = $order_id";

$result_items = $conn->query($sql_items);

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
?>
