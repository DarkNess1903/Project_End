<?php
// ===== CORS Headers =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// ===== Handle OPTIONS preflight request =====
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// เชื่อมต่อฐานข้อมูล
require_once '../../config/db.php';

// รับข้อมูล JSON ที่ส่งเข้ามา
$data = json_decode(file_get_contents('php://input'), true);

// ตรวจสอบว่าได้ส่ง PromotionID มาหรือไม่
if (!$data || empty($data['PromotionID'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'กรุณาระบุ PromotionID'
    ]);
    exit;
}

// แปลงค่า PromotionID เป็นจำนวนเต็ม (ป้องกัน SQL Injection ระดับหนึ่ง)
$PromotionID = intval($data['PromotionID']);

// เตรียมคำสั่ง SQL
$sql = "DELETE FROM promotion WHERE PromotionID = ?";
$stmt = $conn->prepare($sql);

// ตรวจสอบว่า prepare ผ่านหรือไม่
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการเตรียมคำสั่ง: ' . $conn->error
    ]);
    exit;
}

// bind parameters และ execute
$stmt->bind_param("i", $PromotionID);

if ($stmt->execute()) {
    // ตรวจสอบว่ามีแถวใดถูกลบหรือไม่
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'ลบโปรโมชั่นสำเร็จ']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบโปรโมชั่นที่ต้องการลบ']);
    }
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดขณะลบ: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
