<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../config/db.php';

// รับข้อมูลจาก JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id'], $data['payment_type'], $data['amount_paid'])) {
    echo json_encode(["success" => false, "message" => "ข้อมูลไม่ครบ"]);
    exit;
}

$order_id = intval($data['order_id']);
$payment_type = $conn->real_escape_string($data['payment_type']);
$amount_paid = floatval($data['amount_paid']);

$conn->begin_transaction();

try {
    // อัปเดตคำสั่งซื้อ
    $update_order_sql = "UPDATE `orders` SET Status='paid', TotalAmount=? WHERE OrderID=?";
    $stmt = $conn->prepare($update_order_sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
    $stmt->bind_param("di", $amount_paid, $order_id);
    $stmt->execute();
    if ($stmt->affected_rows === 0) {
        throw new Exception("ไม่พบคำสั่งซื้อ หรือสถานะไม่เปลี่ยน");
    }
    $stmt->close();

    // บันทึกประวัติการชำระเงิน
    $insert_payment_sql = "INSERT INTO payment (OrderID, PaymentDate, PaymentMethod, Amount) VALUES (?, NOW(), ?, ?)";
    $stmt2 = $conn->prepare($insert_payment_sql);
    if (!$stmt2) throw new Exception("Prepare failed: " . $conn->error);
    $stmt2->bind_param("isd", $order_id, $payment_type, $amount_paid);
    $stmt2->execute();
    $stmt2->close();

    // ดึง TableID จากคำสั่งซื้อ
    $table_query = $conn->prepare("SELECT TableID FROM `orders` WHERE OrderID=?");
    if (!$table_query) throw new Exception("Prepare failed: " . $conn->error);
    $table_query->bind_param("i", $order_id);
    $table_query->execute();
    $table_result = $table_query->get_result();
    $table_row = $table_result->fetch_assoc();
    $table_query->close();

    if ($table_row && isset($table_row['TableID'])) {
        $table_id = $table_row['TableID'];

        // อัปเดตสถานะโต๊ะเป็น available
        $update_table_sql = "UPDATE dining SET Status='available' WHERE TableID=?";
        $update_table_stmt = $conn->prepare($update_table_sql);
        if (!$update_table_stmt) throw new Exception("Prepare failed: " . $conn->error);
        $update_table_stmt->bind_param("i", $table_id);
        $update_table_stmt->execute();
        $update_table_stmt->close();
    }

    // commit transaction
    $conn->commit();

    // ส่ง response สำเร็จไป frontend
    echo json_encode(["success" => true, "message" => "ชำระเงินสำเร็จ"]);

    // เรียก generate_receipt.php
    $receipt_script = __DIR__ . "/generate_receipt.php";
    if (file_exists($receipt_script)) {
        $php_path = PHP_BINARY; // ได้ path PHP ที่กำลังรันอยู่ เช่น /usr/bin/php หรือ C:\xampp\php\php.exe
        $cmd = "\"$php_path\" \"$receipt_script\" $order_id";
        $output = [];
        $return_var = 0;
        exec($cmd . " 2>&1", $output, $return_var);

        // debug log
        file_put_contents(__DIR__ . "/logs/receipt_exec.log",
            date("Y-m-d H:i:s") . " CMD: $cmd\n" .
            "RETURN: $return_var\n" .
            "OUTPUT:\n" . implode("\n", $output) . "\n\n",
            FILE_APPEND
        );
    }

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}

$conn->close();
