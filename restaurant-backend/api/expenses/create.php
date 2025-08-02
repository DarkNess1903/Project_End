<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

require_once '../../config/db.php';

if (!empty($data['Description']) && !empty($data['Amount']) && !empty($data['ExpenseType']) && !empty($data['ExpenseDate'])) {

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("INSERT INTO expenses (ExpenseType, Description, Amount, ExpenseDate) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssds", $data['ExpenseType'], $data['Description'], $data['Amount'], $data['ExpenseDate']);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Expense saved successfully."]);
    } else {
        echo json_encode(["message" => "Failed to save expense", "error" => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["message" => "Missing required fields"]);
}
?>
