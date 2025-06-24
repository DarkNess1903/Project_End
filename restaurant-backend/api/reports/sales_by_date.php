<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

$sql = "
  SELECT 
    DATE(OrderTime) AS sale_date, 
    SUM(TotalAmount) AS total_amount 
  FROM `Order`
  WHERE Status = 'เสร็จแล้ว'
  GROUP BY sale_date
  ORDER BY sale_date DESC
";

$result = $conn->query($sql);

$sales_by_date = [];
$total_sales = 0;

while ($row = $result->fetch_assoc()) {
    $sales_by_date[] = $row;
    $total_sales += $row['total_amount'];
}

echo json_encode([
  'sales_by_date' => $sales_by_date,
  'total_sales' => $total_sales
]);
