<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$tableId = intval($data['tableId'] ?? 0);

if (!$tableId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing tableId"]);
    exit;
}

$conn->begin_transaction();

try {
    // 1️ ยกเลิกออร์เดอร์ที่ยังไม่ชำระ
    $updateOrders = $conn->prepare(
        "UPDATE orders SET Status='cancelled' 
         WHERE TableID=? AND Status IN ('pending','preparing','served')"
    );
    $updateOrders->bind_param("i", $tableId);
    $updateOrders->execute();
    $updateOrders->close();

    // 2️ เปลี่ยนสถานะโต๊ะเป็น available
    $updateTable = $conn->prepare(
        "UPDATE dining SET Status='available' WHERE TableID=?"
    );
    $updateTable->bind_param("i", $tableId);
    $updateTable->execute();
    $updateTable->close();

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();
