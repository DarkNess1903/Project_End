<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

if (!isset($_GET['order_id'])) {
    echo json_encode(["success" => false, "message" => "Missing order_id"]);
    exit;
}

$order_id = intval($_GET['order_id']);

$query = "
    SELECT oi.OrderItemID, oi.MenuID, m.Name, m.ImageURL, oi.Quantity, oi.SubTotal, oi.Note
    FROM orderitem oi
    JOIN menu m ON oi.MenuID = m.MenuID
    WHERE oi.OrderID = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();

$order_items = [];
$total = 0;

while ($row = $result->fetch_assoc()) {
    $menu_id = intval($row['MenuID']);
    $quantity = intval($row['Quantity']);
    $sub_total = floatval($row['SubTotal']);
    $total += $sub_total;

    if (isset($order_items[$menu_id])) {
        // ถ้ามีเมนูนี้แล้ว → เพิ่มจำนวนและรวม SubTotal
        $order_items[$menu_id]['quantity'] += $quantity;
        $order_items[$menu_id]['sub_total'] += $sub_total;
    } else {
        $order_items[$menu_id] = [
            "order_item_id" => $row['OrderItemID'], // ใช้ ID ของรายการแรก
            "menu_id"       => $menu_id,
            "name"          => $row['Name'],
            "quantity"      => $quantity,
            "price"         => round($sub_total / max(1, $quantity), 2),
            "note"          => $row['Note'], // ถ้ามี note หลายอัน อาจต้องปรับรวม
            "sub_total"     => round($sub_total, 2),
            "ImageURL"      => $row['ImageURL'],
        ];
    }
}

// ถ้าอยากได้ array index เริ่มจาก 0
$order_items = array_values($order_items);

// ไม่มีโปรโมชั่น → discount = 0
$discount = 0;
$final_total = $total - $discount;

$response = [
    "success"     => true,
    "order_id"    => $order_id,
    "items"       => $order_items,
    "total"       => round($total, 2),
    "discount"    => round($discount, 2),
    "final_total" => round($final_total, 2)
];

echo json_encode($response);

$stmt->close();
$conn->close();
