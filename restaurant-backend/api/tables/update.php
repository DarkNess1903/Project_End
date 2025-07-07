<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['TableID'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing TableID"]);
    exit;
}

$tableID = intval($data['TableID']);

// ตรวจสอบค่า status
$allowedStatus = ['available', 'occupied', 'reserved'];
if (isset($data['Status']) && !in_array($data['Status'], $allowedStatus)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status value"]);
    exit;
}

// ถ้าแก้ไข TableNumber → ตรวจสอบไม่ให้ซ้ำกับโต๊ะอื่น
if (isset($data['TableNumber'])) {
    $checkStmt = $conn->prepare("SELECT TableID FROM dining WHERE TableNumber = ? AND TableID != ?");
    $checkStmt->bind_param("si", $data['TableNumber'], $tableID);
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
}

$fields = [];
$params = [];
$types = '';

if (isset($data['TableNumber'])) {
    $fields[] = "TableNumber = ?";
    $params[] = $data['TableNumber'];
    $types .= 's';
}
if (isset($data['Status'])) {
    $fields[] = "Status = ?";
    $params[] = $data['Status'];
    $types .= 's';
}
if (isset($data['Capacity'])) {
    $fields[] = "Capacity = ?";
    $params[] = $data['Capacity'];
    $types .= 'i';
}

if (count($fields) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "No fields to update"]);
    exit;
}

$sql = "UPDATE dining SET " . implode(", ", $fields) . " WHERE TableID = ?";
$params[] = $tableID;
$types .= 'i';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update table"]);
}

$stmt->close();
$conn->close();
?>
