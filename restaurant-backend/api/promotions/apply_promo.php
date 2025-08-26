<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['promotion_id'])) {
    echo json_encode(["success" => false, "message" => "ข้อมูลไม่ครบ"]);
    exit;
}

$order_id = intval($data['order_id']);
$promotion_id = intval($data['promotion_id']);

// ตรวจสอบโปรโมชั่นจาก PromotionID
$sql = "SELECT * FROM promotion 
        WHERE Status = 'active' 
        AND PromotionID = ? 
        AND CURDATE() BETWEEN StartDate AND EndDate 
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $promotion_id);
$stmt->execute();
$result = $stmt->get_result();

if ($promo = $result->fetch_assoc()) {
    // คำนวณยอดรวมคำสั่งซื้อก่อนส่วนลด
    $order_sql = "SELECT SUM(SubTotal) as total FROM orderitem WHERE OrderID=?";
    $stmt2 = $conn->prepare($order_sql);
    $stmt2->bind_param("i", $order_id);
    $stmt2->execute();
    $order_result = $stmt2->get_result();
    $order_data = $order_result->fetch_assoc();
    $total = floatval($order_data['total']);

    // คำนวณส่วนลด
    if ($promo['DiscountType'] === 'percent') {
        $discount = $total * ($promo['DiscountValue'] / 100);
    } else {
        $discount = floatval($promo['DiscountValue']);
    }

    $final_total = $total - $discount;
    if ($final_total < 0) $final_total = 0;

    echo json_encode([
        "success" => true,
        "discount" => round($discount, 2),
        "final_total" => round($final_total, 2),
    ]);
} else {
    echo json_encode(["success" => false, "message" => "โปรโมชั่นไม่ถูกต้องหรือหมดอายุ"]);
}

$stmt->close();
if (isset($stmt2)) $stmt2->close();
$conn->close();
