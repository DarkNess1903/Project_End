<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/db.php';

$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

$sql = "SELECT * FROM expenses";

if ($startDate && $endDate) {
    $sql .= " WHERE ExpenseDate BETWEEN '$startDate 00:00:00' AND '$endDate 23:59:59'";
} elseif ($startDate) {
    $sql .= " WHERE ExpenseDate >= '$startDate 00:00:00'";
} elseif ($endDate) {
    $sql .= " WHERE ExpenseDate <= '$endDate 23:59:59'";
}

$sql .= " ORDER BY ExpenseDate DESC";

$result = $conn->query($sql);

$expenses = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['Amount'] = (float) $row['Amount'];
        $expenses[] = $row;
    }
    echo json_encode($expenses);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch expenses"]);
}

$conn->close();
?>
