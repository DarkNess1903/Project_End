<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../../config/db.php';

// SQL ดึงยอดขายรวมตามวัน (เฉพาะ order ที่จ่ายแล้ว)
$sql = "
  SELECT 
    DATE(OrderTime) AS sale_date,
    SUM(TotalAmount) AS total_amount
  FROM orders
  WHERE Status = 'paid'
  GROUP BY DATE(OrderTime)
  ORDER BY sale_date ASC
";

$result = $conn->query($sql);

$sales_by_date = [];
$total_sales = 0;

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['total_amount'] = floatval($row['total_amount']);
        $sales_by_date[] = $row;
        $total_sales += $row['total_amount'];
    }
    
    echo json_encode([
        "sales_by_date" => $sales_by_date,
        "total_sales" => $total_sales
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch sales by date"]);
}

$conn->close();
?>
