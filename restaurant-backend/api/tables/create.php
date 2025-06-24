<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['TableNumber']) || !isset($data['Status']) || !isset($data['Capacity'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO dining (TableNumber, Status, Capacity) VALUES (?, ?, ?)");
$stmt->bind_param("ssi", $data['TableNumber'], $data['Status'], $data['Capacity']);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "TableID" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create table"]);
}

$stmt->close();
$conn->close();
?>
