<?php
include "../connectDB.php";

// ดึงข้อมูลคำสั่งซื้อใหม่จากฐานข้อมูล
function getNewOrders($conn) {
    $sql = "SELECT 
                order_id, 
                DATE_FORMAT(order_time, '%Y-%m-%d') AS order_date, 
                status 
            FROM Orders 
            WHERE status = 'รอรับเรื่อง' 
            ORDER BY order_time DESC 
            LIMIT 5"; // ปรับจำนวนที่ต้องการได้
    $result = $conn->query($sql);

    if (!$result) {
        // Error handling
        error_log("SQL Error: " . $conn->error);
        return [];
    }

    $data = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    return $data;
}

$newOrders = getNewOrders($conn);

// Set content type to JSON
header('Content-Type: application/json');
echo json_encode($newOrders);
?>
