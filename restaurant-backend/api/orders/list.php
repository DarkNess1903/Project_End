<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับ query string สำหรับกรองสถานะ (status)
$status = $_GET['status'] ?? null;

if ($status) {
    $stmt = $conn->prepare("SELECT * FROM `orders` WHERE Status = ? ORDER BY OrderTime DESC");
    $stmt->bind_param("s", $status);
} else {
    $stmt = $conn->prepare("SELECT * FROM `orders` ORDER BY OrderTime DESC");
}

$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

echo json_encode($orders);

$stmt->close();
$conn->close();
