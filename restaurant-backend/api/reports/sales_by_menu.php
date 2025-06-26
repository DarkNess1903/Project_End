<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
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
        m.MenuID,
        m.Name,
        SUM(oi.Quantity) AS total_quantity,
        SUM(oi.SubTotal) AS total_sales
    FROM OrderItem oi
    JOIN orders o ON oi.OrderID = o.OrderID
    JOIN Menu m ON oi.MenuID = m.MenuID
    JOIN Payment p ON o.OrderID = p.OrderID
    WHERE p.PaymentDate BETWEEN ? AND ?
      AND o.Status = 'paid'
    GROUP BY m.MenuID, m.Name
    ORDER BY total_sales DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "menu_id" => intval($row['MenuID']),
        "name" => $row['Name'],
        "total_quantity" => intval($row['total_quantity']),
        "total_sales" => floatval($row['total_sales']),
    ];
}

echo json_encode($data);

$stmt->close();
$conn->close();
?>
