<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['TableID'], $data['TableNumber'], $data['Status'], $data['Capacity'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare("UPDATE dining SET TableNumber = ?, Status = ?, Capacity = ? WHERE TableID = ?");
$stmt->bind_param("ssii", $data['TableNumber'], $data['Status'], $data['Capacity'], $data['TableID']);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update table"]);
}

$stmt->close();
$conn->close();
?>
