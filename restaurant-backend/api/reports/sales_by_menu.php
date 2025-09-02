<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
// สำหรับ preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once '../../config/db.php';

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$where = "o.Status = 'paid'";
if ($startDate && $endDate) {
    $where .= " AND DATE(o.OrderTime) BETWEEN '$startDate' AND '$endDate'";
}

$sql = "SELECT 
            m.MenuID,
            m.Name,
            SUM(oi.Quantity) AS total_quantity,
            SUM(oi.SubTotal) AS total_sales,
            SUM(oi.Cost * oi.Quantity) AS total_cost,
            (SUM(oi.SubTotal) - SUM(oi.Cost * oi.Quantity)) AS profit
        FROM orderitem oi
        JOIN `orders` o ON oi.OrderID = o.OrderID
        JOIN menu m ON oi.MenuID = m.MenuID
        WHERE $where
        GROUP BY m.MenuID, m.Name
        ORDER BY total_quantity DESC";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
