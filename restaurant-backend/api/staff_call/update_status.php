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

if (!isset($data['call_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing call_id"]);
    exit();
}

$call_id = $data['call_id'];

$stmt = $conn->prepare("UPDATE staff_calls SET Status = 'done' WHERE CallID = ?");
$stmt->bind_param("i", $call_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
