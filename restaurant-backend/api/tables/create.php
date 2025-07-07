<?php
// รองรับ preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['TableNumber']) || !isset($data['Status']) || !isset($data['Capacity'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$tableNumber = $data['TableNumber'];
$status = $data['Status'];
$capacity = $data['Capacity'];

// ตรวจสอบ TableNumber ซ้ำ
$checkStmt = $conn->prepare("SELECT TableID FROM dining WHERE TableNumber = ?");
$checkStmt->bind_param("s", $tableNumber);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["error" => "หมายเลขโต๊ะซ้ำ กรุณาเลือกหมายเลขใหม่"]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// insert ถ้าไม่ซ้ำ
$stmt = $conn->prepare("INSERT INTO dining (TableNumber, Status, Capacity) VALUES (?, ?, ?)");
$stmt->bind_param("ssi", $tableNumber, $status, $capacity);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "TableID" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create table"]);
}

$stmt->close();
$conn->close();
?>
