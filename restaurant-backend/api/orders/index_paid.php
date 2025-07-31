<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

require_once '../../config/db.php';

$sql = "SELECT o.OrderID, o.TableID, o.OrderTime, o.TotalAmount, o.Status, p.PaymentMethod
        FROM `order` o
        LEFT JOIN payment p ON o.OrderID = p.OrderID
        WHERE o.Status = 'paid'
        ORDER BY o.OrderTime DESC";
$result = $conn->query($sql);

$orders = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // แปลง TotalAmount ให้เป็น number
        $row['TotalAmount'] = (float) $row['TotalAmount'];
        $orders[] = $row;
    }
    echo json_encode($orders);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch paid orders"]);
}

$conn->close();
?>
