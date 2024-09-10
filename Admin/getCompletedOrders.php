<?php
include '../public/connectDB.php';

// ดึงจำนวนคำสั่งซื้อที่เสร็จสมบูรณ์จากฐานข้อมูล
$query = "SELECT COUNT(*) AS completed_orders FROM orders WHERE status = 'Completed'";
$result = $conn->query($query);

$completedOrders = [];

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $completedOrders = $row;
}

// ปิดการเชื่อมต่อฐานข้อมูล
$conn->close();

// ส่งข้อมูลในรูปแบบ JSON
header('Content-Type: application/json');
echo json_encode($completedOrders);
?>
