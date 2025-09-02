<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../../config/db.php';

$start_date = $_GET['start_date'] ?? date("Y-m-01"); // เริ่มต้นเดือนนี้
$end_date   = $_GET['end_date'] ?? date("Y-m-d");

// ดึงเมนูขายดี Top 5
$sql = "SELECT m.Name AS MenuName, 
               SUM(oi.Quantity) as total_qty, 
               SUM(oi.SubTotal) as total_sales
        FROM orderitem oi
        JOIN menu m ON oi.MenuID = m.MenuID
        JOIN `orders` o ON oi.OrderID = o.OrderID
        WHERE DATE(o.OrderTime) BETWEEN ? AND ?
          AND o.Status = 'paid'
        GROUP BY oi.MenuID
        ORDER BY total_qty DESC
        LIMIT 5";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $start_date, $end_date);
$stmt->execute();
$result = $stmt->get_result();

$topMenus = [];
while ($row = $result->fetch_assoc()) {
    $topMenus[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $topMenus
]);

$stmt->close();
$conn->close();
