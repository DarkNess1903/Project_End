<?php
include "connectDB.php";

// Query to get daily sales
$dailySalesSql = "
    SELECT DATE(order_time) AS date, SUM(price * quantity) AS total 
    FROM orders 
    WHERE order_time >= CURDATE() - INTERVAL 30 DAY
    GROUP BY DATE(order_time)
    ORDER BY DATE(order_time) ASC
";
$dailySalesResult = $conn->query($dailySalesSql);
$dailySales = [];
while ($row = $dailySalesResult->fetch_assoc()) {
    $dailySales[] = $row;
}

// Query to get weekly sales
$weeklySalesSql = "
    SELECT WEEK(order_time, 1) AS week, YEAR(order_time) AS year, SUM(price * quantity) AS total 
    FROM orders 
    WHERE order_time >= CURDATE() - INTERVAL 12 WEEK
    GROUP BY YEAR(order_time), WEEK(order_time, 1)
    ORDER BY YEAR(order_time) ASC, WEEK(order_time, 1) ASC
";
$weeklySalesResult = $conn->query($weeklySalesSql);
$weeklySales = [];
while ($row = $weeklySalesResult->fetch_assoc()) {
    $weeklySales[] = $row;
}

// Query to get monthly sales
$monthlySalesSql = "
    SELECT MONTH(order_time) AS month, YEAR(order_time) AS year, SUM(price * quantity) AS total 
    FROM orders 
    WHERE order_time >= CURDATE() - INTERVAL 1 YEAR
    GROUP BY YEAR(order_time), MONTH(order_time)
    ORDER BY YEAR(order_time) ASC, MONTH(order_time) ASC
";
$monthlySalesResult = $conn->query($monthlySalesSql);
$monthlySales = [];
while ($row = $monthlySalesResult->fetch_assoc()) {
    $monthlySales[] = $row;
}

// Query to get order status counts
$statusSql = "
    SELECT status, COUNT(*) AS count 
    FROM orders 
    GROUP BY status
";
$statusResult = $conn->query($statusSql);
$orderStatus = [];
while ($row = $statusResult->fetch_assoc()) {
    $orderStatus[] = $row;
}

// Return JSON data
header('Content-Type: application/json');
echo json_encode([
    'dailySales' => $dailySales,
    'weeklySales' => $weeklySales,
    'monthlySales' => $monthlySales,
    'orderStatus' => $orderStatus
]);

$conn->close();
?>
