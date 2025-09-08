<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=UTF-8');

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing order_id or items (must be array)"
    ]);
    exit();
}

$order_id = intval($data['order_id']);
$items = $data['items'];
$total_add = 0;

$conn->begin_transaction();

try {
    $print_items = [];

    foreach ($items as $item) {
        $menu_id = intval($item['menu_id']);
        $quantity = intval($item['quantity']);
        $note = $item['note'] ?? '';

        $menuQuery = $conn->prepare("SELECT Name, Price, Cost FROM Menu WHERE MenuID = ?");
        if (!$menuQuery) throw new Exception($conn->error);
        $menuQuery->bind_param("i", $menu_id);
        $menuQuery->execute();
        $result = $menuQuery->get_result();
        $menu = $result->fetch_assoc();
        $menuQuery->close();

        if (!$menu) throw new Exception("Menu not found: $menu_id");

        $price = floatval($menu['Price']);
        $cost = floatval($menu['Cost']);
        $subtotal = $price * $quantity;
        $total_add += $subtotal;

        $print_items[] = [
            "name" => $menu['Name'],
            "quantity" => $quantity,
            "note" => $note,
            "cost" => $cost
        ];

        $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal, Cost, Note) VALUES (?, ?, ?, ?, ?, ?)");
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param("iiidss", $order_id, $menu_id, $quantity, $subtotal, $cost, $note);
        $stmt->execute();
        $stmt->close();
    }

    // อัปเดตราคารวม order
    $stmt_total = $conn->prepare("UPDATE `orders` SET TotalAmount = TotalAmount + ? WHERE OrderID = ?");
    if (!$stmt_total) throw new Exception($conn->error);
    $stmt_total->bind_param("di", $total_add, $order_id);
    $stmt_total->execute();
    $stmt_total->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "added_amount" => $total_add,
        "message" => "เพิ่มรายการอาหารเรียบร้อย"
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
