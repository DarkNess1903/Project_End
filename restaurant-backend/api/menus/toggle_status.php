<?php
// === CORS Fix Header ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 86400");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// === เดิม ===
require_once '../../config/db.php';
$data = json_decode(file_get_contents("php://input"), true);
$menuId = $data['MenuID'];
$status = $data['Status'];

if (!$menuId || !in_array($status, ['active', 'inactive'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$sql = "UPDATE Menu SET Status = ? WHERE MenuID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $menuId);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Status updated']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Update failed']);
}

$conn->close();
?>
