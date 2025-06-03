<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$discountType = $data['discount_type'] ?? '';
$discountValue = $data['discount_value'] ?? 0;
$startDate = $data['start_date'] ?? '';
$endDate = $data['end_date'] ?? '';
$status = $data['status'] ?? 'active';

if (!$name || !$discountType || !$startDate || !$endDate) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO Promotion (Name, Description, DiscountType, DiscountValue, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdsss", $name, $description, $discountType, $discountValue, $startDate, $endDate, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'promotion_id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create promotion']);
}

$stmt->close();
$conn->close();
