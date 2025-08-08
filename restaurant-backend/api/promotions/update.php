<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$promotionID = $_POST['PromotionID'] ?? null;
$name = $_POST['Name'] ?? '';
$description = $_POST['Description'] ?? '';
$discountType = $_POST['DiscountType'] ?? '';
$discountValue = $_POST['DiscountValue'] ?? 0;
$startDate = $_POST['StartDate'] ?? '';
$endDate = $_POST['EndDate'] ?? '';

// ตรวจสอบวันที่เพื่อกำหนดสถานะโปรโมชั่น
$today = date('Y-m-d');
$status = 'inactive';
if ($startDate <= $today && $endDate >= $today) {
    $status = 'active';
}

// ตรวจสอบว่า PromotionID ถูกส่งมาหรือไม่
if (!$promotionID) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ไม่พบ PromotionID"]);
    exit;
}

$stmt = $conn->prepare("UPDATE promotion SET Name = ?, Description = ?, DiscountType = ?, DiscountValue = ?, StartDate = ?, EndDate = ?, Status = ? WHERE PromotionID = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Prepare failed"]);
    exit;
}

$stmt->bind_param("sssisssi", $name, $description, $discountType, $discountValue, $startDate, $endDate, $status, $promotionID);

$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "อัปเดตโปรโมชั่นสำเร็จ"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "อัปเดตโปรโมชั่นล้มเหลว"]);
}

$stmt->close();
$conn->close();
?>
