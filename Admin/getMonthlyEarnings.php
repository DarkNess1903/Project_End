<?php
include '../public/connectDB.php';

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// คำนวณรายได้เฉพาะคำสั่งซื้อที่สถานะเป็น "Completed"
$sql = "SELECT SUM(total_amount) as total FROM orders WHERE MONTH(order_date) = MONTH(CURRENT_DATE()) AND status = 'Completed'";
$result = $conn->query($sql);

if ($result === FALSE) {
    echo "Error: " . $conn->error;
} else {
    $row = $result->fetch_assoc();
    // ส่งคืนข้อมูลรายได้เป็น JSON หรือข้อความธรรมดา
    if ($row) {
        echo $row['total'];
    } else {
        echo '0';
    }
}

$conn->close();
?>
