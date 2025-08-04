<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/db.php';

if (!isset($_GET['table'])) {
  echo json_encode(['exists' => false, 'error' => 'Missing table parameter']);
  exit;
}

$table = intval($_GET['table']);

$query = "SELECT COUNT(*) as count FROM dining WHERE TableNumber = ?";
$stmt = $conn->prepare($query);
if (!$stmt) {
  echo json_encode(['exists' => false, 'error' => 'Prepare statement failed']);
  exit;
}
$stmt->bind_param("i", $table);
$stmt->execute();
$result = $stmt->get_result();
if (!$result) {
  echo json_encode(['exists' => false, 'error' => 'Query failed']);
  exit;
}
$row = $result->fetch_assoc();

echo json_encode(['exists' => $row['count'] > 0]);
?>
