<?php
include 'connectDB.php';

// Query to get number of orders data
$sql = "SELECT DATE(order_date) as date, COUNT(order_id) as order_count
        FROM Orders
        GROUP BY DATE(order_date)";
$result = $conn->query($sql);

$labels = [];
$values = [];
while ($row = $result->fetch_assoc()) {
    $labels[] = $row['date'];
    $values[] = $row['order_count'];
}

header('Content-Type: application/json');
echo json_encode(['labels' => $labels, 'values' => $values]);

$conn->close();
?>
