<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// สำหรับ preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once '../../config/db.php';

// อ่าน JSON ที่รับเข้ามา
$data = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบข้อมูลที่ต้องมี
if (!isset($data['table_id']) || !isset($data['items'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing table_id or items"]);
    exit();
}

$table_id = $data['table_id'];
$items = $data['items'];
$total_amount = 0;

// เริ่ม transaction
$conn->begin_transaction();

try {
    // 1. สร้างคำสั่งซื้อ
    $stmt = $conn->prepare("INSERT INTO `Order` (TableID, TotalAmount, Status, OrderTime)VALUES (?, 0, 'pending', NOW())");
    // ใน schema ไม่มี OrderTime แต่ถ้ามี ควรใส่ NOW() เข้าไป
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    // 2. เพิ่มรายการอาหาร
    foreach ($items as $item) {
        $menu_id = $item['menu_id'];
        $quantity = $item['quantity'];
        $note = $item['note'] ?? '';

        // ดึงราคาเมนูจากฐานข้อมูล
        $menuQuery = $conn->prepare("SELECT Price FROM Menu WHERE MenuID = ?");
        $menuQuery->bind_param("i", $menu_id);
        $menuQuery->execute();
        $result = $menuQuery->get_result();
        $menu = $result->fetch_assoc();
        $menuQuery->close();
        
        $price = $menu['Price'];
        $subtotal = $price * $quantity;
        $total_amount += $subtotal;

        // บันทึก OrderItem
        $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal, Note) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iiids", $order_id, $menu_id, $quantity, $subtotal, $note);
        $stmt->execute();
        $stmt->close();
    }

        // 3. อัปเดตราคารวมใน Order
    $stmt = $conn->prepare("UPDATE `Order` SET TotalAmount = ? WHERE OrderID = ?");
    $stmt->bind_param("di", $total_amount, $order_id);
    $stmt->execute();
    $stmt->close();

    // 3.5. อัปเดตสถานะโต๊ะให้เป็น 'occupied'
    $updateTableStmt = $conn->prepare("UPDATE dining SET Status = 'occupied' WHERE TableID = ?");
    $updateTableStmt->bind_param("i", $table_id);
    $updateTableStmt->execute();
    $updateTableStmt->close();

    // 4. Commit
    $conn->commit();

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "total_amount" => $total_amount
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Failed to create order", "details" => $e->getMessage()]);
}

$conn->close();
?>