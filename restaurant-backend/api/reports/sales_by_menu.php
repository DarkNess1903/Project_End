<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../config/db.php';

$sql = "SELECT 
            m.MenuID,
            m.Name,
            SUM(oi.Quantity) AS total_quantity,
            SUM(oi.SubTotal) AS total_sales,
            SUM(oi.Cost * oi.Quantity) AS total_cost,
            (SUM(oi.SubTotal) - SUM(oi.Cost * oi.Quantity)) AS profit
        FROM OrderItem oi
        JOIN `order` o ON oi.OrderID = o.OrderID
        JOIN menu m ON oi.MenuID = m.MenuID
        WHERE o.Status = 'paid'
        GROUP BY m.MenuID, m.Name
        ORDER BY total_quantity DESC";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
