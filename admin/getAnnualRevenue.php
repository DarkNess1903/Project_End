<?php
include "../connectDB.php";

// ดึงข้อมูลรายได้ประจำปีจากฐานข้อมูล
function getAnnualRevenue($conn) {
    $sql = "SELECT 
                SUM(price * quantity) AS total_revenue 
            FROM orders 
            WHERE YEAR(order_time) = YEAR(CURDATE())";
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
