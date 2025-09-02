<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับค่า OrderID จาก query string (เช่น /orders/get.php?id=12)
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing order ID"]);
    exit;
}

$order_id = intval($_GET['id']);

// 1. ดึงข้อมูลคำสั่งซื้อหลัก
$order_sql = "SELECT OrderID, TableID, OrderTime, TotalAmount, Status FROM `orders` WHERE OrderID = ?";
$stmt = $conn->prepare($order_sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$order_result = $stmt->get_result();
$order = $order_result->fetch_assoc();
$stmt->close();

if (!$order) {
    http_response_code(404);
    echo json_encode(["error" => "Order not found"]);
    exit;
}

// 2. ดึงรายการอาหารในคำสั่งซื้อ
$items_sql = "
    SELECT oi.MenuID, m.Name, oi.Quantity, oi.SubTotal
    FROM OrderItem oi
    JOIN Menu m ON oi.MenuID = m.MenuID
    WHERE oi.OrderID = ?
";
$stmt = $conn->prepare($items_sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$items_result = $stmt->get_result();

$items = [];
while ($row = $items_result->fetch_assoc()) {
    $items[] = $row;
}

$order['items'] = $items;

echo json_encode($order);
