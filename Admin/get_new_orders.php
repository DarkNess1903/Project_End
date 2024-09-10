<?php
// เชื่อมต่อฐานข้อมูล
include '../public/connectDB.php';

// ดึงข้อมูลคำสั่งซื้อที่สถานะเป็น 'Pending'
$sql = "SELECT order_id, order_date FROM orders WHERE status = 'Pending' ORDER BY order_date DESC";
$result = $conn->query($sql);

$pending_orders = [];

while ($row = $result->fetch_assoc()) {
    $pending_orders[] = $row;
}

// ส่งข้อมูลออกมาเป็น JSON
echo json_encode($pending_orders);

$conn->close();
?>