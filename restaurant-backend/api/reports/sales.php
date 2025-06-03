<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับพารามิเตอร์ช่วงเวลา (option)
$startDate = $_GET['start_date'] ?? null; // format: YYYY-MM-DD
$endDate = $_GET['end_date'] ?? null;

if (!$startDate || !$endDate) {
    http_response_code(400);
    echo json_encode(["error" => "Missing start_date or end_date"]);
    exit;
}

// Query รวมยอดเงินและจำนวนคำสั่งซื้อที่ชำระแล้วในช่วงเวลานี้
$sql = "
    SELECT 
        COUNT(DISTINCT o.OrderID) AS total_orders,
        SUM(p.Amount) AS total_sales
    FROM `Order` o
    JOIN Payment p ON o.OrderID = p.OrderID
    WHERE p.PaymentDate BETWEEN ? AND ?
    AND o.Status = 'paid'
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

echo json_encode([
    "start_date" => $startDate,
    "end_date" => $endDate,
    "total_orders" => intval($data['total_orders']),
    "total_sales" => floatval($data['total_sales']),
]);

$stmt->close();
$conn->close();
