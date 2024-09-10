<?php
include '../public/connectDB.php';

// คำนวณรายได้เฉพาะคำสั่งซื้อที่สถานะเป็น "Completed" ในปีปัจจุบัน
$sql = "SELECT SUM(total_amount) as total FROM orders WHERE YEAR(order_date) = YEAR(CURRENT_DATE()) AND status = 'Completed'";
$result = $conn->query($sql);
$row = $result->fetch_assoc();

// ส่งคืนข้อมูลรายได้เป็น JSON หรือข้อความธรรมดา
if ($row) {
    echo json_encode(['earnings' => $row['total']]);
} else {
    echo json_encode(['earnings' => 0]);
}

$conn->close();
?>
