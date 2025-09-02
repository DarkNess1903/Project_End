<?php
// รองรับ preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit();
}

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

// อ่าน input
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['TableID'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing TableID"]);
    exit;
}

$tableID = intval($data['TableID']);

try {
    $stmt = $conn->prepare("DELETE FROM dining WHERE TableID = ?");
    $stmt->bind_param("i", $tableID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete table"]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
