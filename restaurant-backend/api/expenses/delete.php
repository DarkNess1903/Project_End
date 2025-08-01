<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->ExpenseID)) {
    http_response_code(400);
    echo json_encode(["message" => "Expense ID is required"]);
    exit;
}

$id = $conn->real_escape_string($data->ExpenseID);

$sql = "DELETE FROM expenses WHERE ExpenseID = $id";

if ($conn->query($sql)) {
    echo json_encode(["message" => "Expense deleted"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete expense"]);
}

$conn->close();
?>
