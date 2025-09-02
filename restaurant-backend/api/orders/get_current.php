<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// สำหรับ preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$table_id = $_GET['table_id'] ?? 0;

$sql = "
  SELECT oi.Quantity, oi.SubTotal, oi.Note, oi.Status, 
         m.Name, m.Price, m.ImageURL
  FROM `orders` o
  JOIN OrderItem oi ON o.OrderID = oi.OrderID
  JOIN Menu m ON oi.MenuID = m.MenuID
  WHERE o.TableID = ? AND o.Status = 'pending'
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $table_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
$total = 0;

while ($row = $result->fetch_assoc()) {
  $row['Price'] = (float)$row['Price'];
  $row['Quantity'] = (int)$row['Quantity'];
  $row['Status'] = $row['Status'] ?? 'cooking'; // fallback
  $items[] = $row;
  $total += $row['SubTotal'];
}

echo json_encode([
  "success" => true,
  "items" => $items,
  "total_amount" => $total
]);

