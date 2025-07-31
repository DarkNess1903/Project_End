<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

if (!isset($_GET['order_id'])) {
    echo json_encode(["message" => "Missing order_id"]);
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
    $sub_total = floatval($row['SubTotal']);
    $total += $sub_total;

    $order_items[] = [
        "order_item_id" => $row['OrderItemID'],
        "menu_id" => $row['MenuID'],
        "name" => $row['Name'],
        "quantity" => intval($row['Quantity']),
        "price" => round($sub_total / intval($row['Quantity']), 2),
        "note" => $row['Note'],
        "sub_total" => round($sub_total, 2),
        "ImageURL" => $row['ImageURL'],
    ];
}

// ตรวจสอบโปรโมชั่น
$discount = 0;
$promo_query = "
    SELECT * FROM promotion
    WHERE Status = 1
    AND CURDATE() BETWEEN StartDate AND EndDate
    LIMIT 1
";
$promo_result = $conn->query($promo_query);
if ($promo_row = $promo_result->fetch_assoc()) {
    if ($promo_row['DiscountType'] == 'percent') {
        $discount = $total * ($promo_row['DiscountValue'] / 100);
    } else {
        $discount = $promo_row['DiscountValue'];
    }
}

$response = [
    "order_id" => $order_id,
    "items" => $order_items,
    "total" => round($total, 2),
    "discount" => round($discount, 2),
    "final_total" => round($total - $discount, 2)
];

echo json_encode($response);

$stmt->close();
$conn->close();
