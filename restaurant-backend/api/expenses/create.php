<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"), true);

require_once '../../config/db.php';

// ตรวจสอบว่ามีค่าครบหรือไม่
if (!empty($data['Name']) && !empty($data['Amount']) && !empty($data['Category']) && !empty($data['ExpenseDate'])) {

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // เตรียมคำสั่ง SQL
    $stmt = $conn->prepare("INSERT INTO expenses (ExpenseType, Description, Amount, ExpenseDate) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssds", $data['Category'], $data['Note'], $data['Amount'], $data['ExpenseDate']);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Expense saved successfully."]);
    } else {
        echo json_encode(["message" => "Failed to save expense."]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["message" => "Missing required fields."]);
}
