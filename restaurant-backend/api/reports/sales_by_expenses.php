<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

$sql = "SELECT ExpenseDate, Amount, Description FROM expenses";

if ($startDate && $endDate) {
    $sql .= " WHERE DATE(ExpenseDate) BETWEEN '$startDate' AND '$endDate'";
} elseif ($startDate) {
    $sql .= " WHERE ExpenseDate >= '$startDate'";
} elseif ($endDate) {
    $sql .= " WHERE ExpenseDate <= '$endDate'";
}

$sql .= " ORDER BY ExpenseDate DESC";

$result = $conn->query($sql);

$expenses = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $expenses[] = [
            'expense_date' => $row['ExpenseDate'],
            'amount' => (float) $row['Amount'],
            'description' => $row['Description'],
        ];
    }
    echo json_encode($expenses);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch expenses"]);
}

$conn->close();
?>
