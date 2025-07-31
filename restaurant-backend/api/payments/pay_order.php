<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['order_id']) ||
    !isset($data['payment_type']) ||
    !isset($data['amount_paid'])
) {
    echo json_encode(["success" => false, "message" => "ข้อมูลไม่ครบ"]);
    exit;
}

$order_id = intval($data['order_id']);
$payment_type = $conn->real_escape_string($data['payment_type']);
$amount_paid = floatval($data['amount_paid']);

$conn->begin_transaction();

try {
    $update_order_sql = "UPDATE `order` SET Status='paid', TotalAmount=? WHERE OrderID=?";
    $stmt = $conn->prepare($update_order_sql);
    $stmt->bind_param("di", $amount_paid, $order_id);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("ไม่พบคำสั่งซื้อ หรือสถานะไม่เปลี่ยน");
    }

    // บันทึกประวัติการชำระเงิน
    $insert_payment_sql = "INSERT INTO payment (OrderID, PaymentDate, PaymentMethod, Amount) VALUES (?, NOW(), ?, ?)";
    $stmt2 = $conn->prepare($insert_payment_sql);
    if (!$stmt2) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt2->bind_param("isd", $order_id, $payment_type, $amount_paid);
    $stmt2->execute();

    $conn->commit();

    // ✅ ดึง TableID จาก order
    $table_query = $conn->prepare("SELECT TableID FROM `order` WHERE OrderID = ?");
    $table_query->bind_param("i", $order_id);
    $table_query->execute();
    $table_result = $table_query->get_result();
    $table_row = $table_result->fetch_assoc();

    if ($table_row && isset($table_row['TableID'])) {
        $table_id = $table_row['TableID'];

        // ✅ อัปเดตสถานะ dining เป็น available
        $update_table_sql = "UPDATE dining SET Status='available' WHERE TableID=?";
        $update_table_stmt = $conn->prepare($update_table_sql);
        $update_table_stmt->bind_param("i", $table_id);
        $update_table_stmt->execute();
        $update_table_stmt->close();
    }

    $table_query->close();

    echo json_encode(["success" => true, "message" => "ชำระเงินสำเร็จ"]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}

if (isset($stmt)) $stmt->close();
if (isset($stmt2)) $stmt2->close();
$conn->close();
