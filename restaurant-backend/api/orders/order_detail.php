<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// เชื่อมต่อฐานข้อมูล
require_once '../../config/db.php';

if (!isset($_GET['order_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing order_id"]);
    exit;
}

$order_id = $_GET['order_id'];

// เตรียม statement ด้วย mysqli
$stmt = $conn->prepare("SELECT * FROM orderitem WHERE OrderID = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("i", $order_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$items = [];

while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode($items);

$stmt->close();
$conn->close();
?>
