<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

if (!$startDate || !$endDate) {
    http_response_code(400);
    echo json_encode(["error" => "Missing start_date or end_date"]);
    exit;
}

$sql = "
    SELECT 
        DATE(p.PaymentDate) AS date,
        COUNT(DISTINCT o.OrderID) AS total_orders,
        SUM(p.Amount) AS total_sales
    FROM `Order` o
    JOIN Payment p ON o.OrderID = p.OrderID
    WHERE p.PaymentDate BETWEEN ? AND ?
    AND o.Status = 'paid'
    GROUP BY DATE(p.PaymentDate)
    ORDER BY DATE(p.PaymentDate)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "date" => $row['date'],
        "total_orders" => intval($row['total_orders']),
        "total_sales" => floatval($row['total_sales']),
    ];
}

echo json_encode($data);

$stmt->close();
$conn->close();
