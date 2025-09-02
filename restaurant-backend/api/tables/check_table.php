<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// ตอบ OPTIONS request ทันที
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/db.php';

// ตรวจสอบ parameter
if (!isset($_GET['table'])) {
    echo json_encode([
        'exists' => false,
        'error' => 'Missing table parameter'
    ]);
    exit;
}

$table = intval($_GET['table']);

try {
    $query = "SELECT 1 FROM dining WHERE TableNumber = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    if (!$stmt) throw new Exception("Prepare statement failed: " . $conn->error);

    $stmt->bind_param("i", $table);
    $stmt->execute();
    $stmt->store_result();

    $exists = $stmt->num_rows > 0;

    echo json_encode(['exists' => $exists]);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        'exists' => false,
        'error' => $e->getMessage()
    ]);
}
?>
