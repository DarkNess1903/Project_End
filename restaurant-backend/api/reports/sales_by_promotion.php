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
        pr.PromotionID,
        pr.Name,
        COUNT(DISTINCT op.OrderID) AS total_orders,
        SUM(op.DiscountAmount) AS total_discount
    FROM OrderPromotion op
    JOIN Promotion pr ON op.PromotionID = pr.PromotionID
    JOIN `Order` o ON op.OrderID = o.OrderID
    JOIN Payment p ON o.OrderID = p.OrderID
    WHERE p.PaymentDate BETWEEN ? AND ?
    AND o.Status = 'paid'
    GROUP BY pr.PromotionID, pr.Name
    ORDER BY total_discount DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "promotion_id" => intval($row['PromotionID']),
        "name" => $row['Name'],
        "total_orders" => intval($row['total_orders']),
        "total_discount" => floatval($row['total_discount']),
    ];
}

echo json_encode($data);

$stmt->close();
$conn->close();
