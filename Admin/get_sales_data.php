<?php
// เชื่อมต่อฐานข้อมูล
include '../public/connectDB.php';

// ดึงข้อมูลยอดขายสำหรับแต่ละสินค้า
$sql = "SELECT p.product_name, SUM(oi.quantity) as total_sold
        FROM order_details oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'Completed' 
        GROUP BY p.product_name 
        ORDER BY total_sold DESC";

$result = $conn->query($sql);

$sales_data = [];

while ($row = $result->fetch_assoc()) {
    $sales_data[] = [
        'product_name' => $row['product_name'],
        'total_sold' => $row['total_sold']
    ];
}

// ส่งข้อมูลออกมาเป็น JSON
echo json_encode($sales_data);

$conn->close();
?>