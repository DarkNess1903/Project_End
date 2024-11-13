<?php
// เชื่อมต่อฐานข้อมูล
include '../public/connectDB.php';

// คำนวณรายได้รวมตามเดือนที่สถานะเป็น "Completed"
$sql = "SELECT MONTH(order_date) as month, SUM(total_amount) as earnings
        FROM orders 
        WHERE status = 'Completed' 
        GROUP BY MONTH(order_date) 
        ORDER BY MONTH(order_date)";

$result = $conn->query($sql);

$labels = [];
$data = [];

while ($row = $result->fetch_assoc()) {
    // สร้างชื่อเดือนในรูปแบบของภาษาไทย
    $monthNum  = $row['month'];
    $dateObj   = DateTime::createFromFormat('!m', $monthNum);
    $monthName = $dateObj->format('F'); // ชื่อเดือนในภาษาอังกฤษ

    $labels[] = $monthName; // ใส่ชื่อเดือนใน array
    $data[] = $row['earnings']; // ใส่รายได้ใน array
}

// ส่งข้อมูลออกมาเป็น JSON
echo json_encode([
    'labels' => $labels,
    'data' => $data
]);

$conn->close();
?>
