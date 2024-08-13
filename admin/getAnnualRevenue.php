<?php
include "../connectDB.php";

// ดึงข้อมูลรายได้ประจำปีจากฐานข้อมูลเฉพาะคำสั่งซื้อที่เสร็จสมบูรณ์
function getAnnualRevenue($conn) {
    $sql = "SELECT 
                SUM(price * quantity) AS total_revenue 
            FROM Orders 
            WHERE YEAR(order_time) = YEAR(CURDATE()) 
              AND status = 'เสร็จสมบูรณ์'";
    $result = $conn->query($sql);

    if (!$result) {
        // Error handling
        error_log("SQL Error: " . $conn->error);
        return 0;
    }

    $row = $result->fetch_assoc();
    return $row['total_revenue'] ?? 0;
}

$annualRevenue = getAnnualRevenue($conn);
echo json_encode(['total_revenue' => $annualRevenue]);
?>
