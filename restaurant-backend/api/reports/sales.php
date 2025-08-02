<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../config/db.php';

// ยอดขายรวม
$totalSql = "SELECT SUM(TotalAmount) AS total_sales FROM `order` WHERE Status = 'paid'";
$totalResult = $conn->query($totalSql)->fetch_assoc();

// จำนวนออเดอร์
$countSql = "SELECT COUNT(*) AS order_count FROM `order` WHERE Status = 'paid'";
$countResult = $conn->query($countSql)->fetch_assoc();

// รายได้เฉลี่ยต่อวัน
$avgSql = "SELECT AVG(daily_total) AS avg_daily_sales FROM (
            SELECT DATE(OrderTime) AS date, SUM(TotalAmount) AS daily_total
            FROM `order`
            WHERE Status = 'paid'
            GROUP BY DATE(OrderTime)
          ) AS daily";
$avgResult = $conn->query($avgSql)->fetch_assoc();

echo json_encode([
    'total_sales' => $totalResult['total_sales'] ?? 0,
    'order_count' => $countResult['order_count'] ?? 0,
    'avg_daily_sales' => round($avgResult['avg_daily_sales'] ?? 0, 2)
]);
?>
