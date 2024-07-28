<?php
include "../connectDB.php";

// ฟังก์ชันสำหรับดึงจำนวนออเดอร์ที่เสร็จสมบูรณ์
function getCompletedOrdersCount($conn) {
    $sql = "SELECT COUNT(*) AS completed_orders FROM Orders WHERE status = 'เสร็จสมบูรณ์'";
    $result = $conn->query($sql);

    if (!$result) {
        // Error handling
        error_log("SQL Error: " . $conn->error);
        return 0;
    }

    $row = $result->fetch_assoc();
    return $row['completed_orders'];
}

$completedOrdersCount = getCompletedOrdersCount($conn);
echo json_encode(['completed_orders' => $completedOrdersCount]);
?>
