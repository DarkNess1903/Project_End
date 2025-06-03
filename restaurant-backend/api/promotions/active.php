<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

$today = date('Y-m-d');

$sql = "SELECT * FROM Promotion WHERE Status = 'active' AND StartDate <= ? AND EndDate >= ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $today, $today);
$stmt->execute();
$result = $stmt->get_result();

$promotions = [];
while ($row = $result->fetch_assoc()) {
    $promotions[] = $row;
}

echo json_encode($promotions);

$stmt->close();
$conn->close();
