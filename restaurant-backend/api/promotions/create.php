<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

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

$stmt = $conn->prepare("INSERT INTO promotion (Name, Description, DiscountType, DiscountValue, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Prepare failed"]);
    exit;
}
$stmt->bind_param("sssisss", $name, $description, $discountType, $discountValue, $startDate, $endDate, $status);
$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "เพิ่มโปรโมชั่นสำเร็จ"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "เพิ่มโปรโมชั่นล้มเหลว"]);
}
$stmt->close();
$conn->close();
?>
