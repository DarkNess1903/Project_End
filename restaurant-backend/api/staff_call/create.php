<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['table_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing table_id"]);
    exit();
}

$table_id = $data['table_id'];

$stmt = $conn->prepare("INSERT INTO staff_calls (TableID, Status, CallTime) VALUES (?, 'pending', NOW())");
$stmt->bind_param("i", $table_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
