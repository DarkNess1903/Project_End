<?php
// รองรับ preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    http_response_code(200);
    exit();
}

// Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

// อ่าน input
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['TableNumber']) || empty($data['Status']) || empty($data['Capacity'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$tableNumber = $data['TableNumber'];
$status = $data['Status'];
$capacity = intval($data['Capacity']);

try {
    // ตรวจสอบ TableNumber ซ้ำ
    $checkStmt = $conn->prepare("SELECT TableID FROM dining WHERE TableNumber = ?");
    $checkStmt->bind_param("s", $tableNumber);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "หมายเลขโต๊ะซ้ำ กรุณาเลือกหมายเลขใหม่"]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // insert โต๊ะใหม่
    $stmt = $conn->prepare("INSERT INTO dining (TableNumber, Status, Capacity) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $tableNumber, $status, $capacity);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "TableID" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to create table"]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
