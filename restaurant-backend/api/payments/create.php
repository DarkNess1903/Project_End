<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['payment_method']) || !isset($data['amount'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$order_id = intval($data['order_id']);
$payment_method = $data['payment_method'];
$amount = floatval($data['amount']);
$payment_date = date('Y-m-d H:i:s');

// 1. บันทึกการชำระเงิน
$stmt = $conn->prepare("INSERT INTO Payment (OrderID, PaymentDate, PaymentMethod, Amount) VALUES (?, ?, ?, ?)");
$stmt->bind_param("issd", $order_id, $payment_date, $payment_method, $amount);

if ($stmt->execute()) {
    // 2. เปลี่ยนสถานะคำสั่งซื้อเป็น 'paid'
    $update = $conn->prepare("UPDATE `Order` SET Status = 'paid' WHERE OrderID = ?");
    $update->bind_param("i", $order_id);
    $update->execute();

    echo json_encode([
        "success" => true,
        "payment_id" => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to process payment"]);
}

$stmt->close();
$conn->close();
