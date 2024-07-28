<?php
include 'connectDB.php';

// Query to get total sales data
$sql = "SELECT DATE(order_date) as date, SUM(total_price) as total_sales
        FROM Orders
        GROUP BY DATE(order_date)";
$result = $conn->query($sql);

$labels = [];
$values = [];
while ($row = $result->fetch_assoc()) {
    $labels[] = $row['date'];
    $values[] = $row['total_sales'];
}

header('Content-Type: application/json');
echo json_encode(['labels' => $labels, 'values' => $values]);

$conn->close();
?>
