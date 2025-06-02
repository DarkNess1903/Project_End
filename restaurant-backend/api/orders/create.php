<?php
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
$items = $data['items']; // [{ "menu_id": 1, "quantity": 2 }, ...]
$total_amount = 0;

// เริ่ม transaction
$conn->begin_transaction();

try {
    // 1. สร้างคำสั่งซื้อ
    $stmt = $conn->prepare("INSERT INTO `Order` (TableID, TotalAmount, Status) VALUES (?, 0, 'pending')");
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    // 2. เพิ่มรายการอาหาร
    foreach ($items as $item) {
        $menu_id = $item['menu_id'];
        $quantity = $item['quantity'];

        // ดึงราคาเมนูจากฐานข้อมูล
        $menu = $conn->query("SELECT Price FROM Menu WHERE MenuID = $menu_id")->fetch_assoc();
        $price = $menu['Price'];
        $subtotal = $price * $quantity;
        $total_amount += $subtotal;

        // บันทึก OrderItem
        $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $order_id, $menu_id, $quantity, $subtotal);
        $stmt->execute();
        $stmt->close();
    }

    // 3. อัปเดตราคารวมใน Order
    $stmt = $conn->prepare("UPDATE `Order` SET TotalAmount = ? WHERE OrderID = ?");
    $stmt->bind_param("di", $total_amount, $order_id);
    $stmt->execute();
    $stmt->close();

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
