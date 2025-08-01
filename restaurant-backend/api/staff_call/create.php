<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['table_id']) || !isset($data['service_type'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing parameters"]);
    exit();
}

$table_id = $data['table_id'];
$service_type = $data['service_type'];

$stmt = $conn->prepare("INSERT INTO staff_calls (TableID, ServiceType, Status, CallTime) VALUES (?, ?, 'pending', NOW())");
$stmt->bind_param("is", $table_id, $service_type);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>