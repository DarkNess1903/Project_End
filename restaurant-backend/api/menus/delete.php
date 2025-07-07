<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// รองรับ preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['MenuID'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing MenuID"]);
    exit;
}

$menu_id = intval($data['MenuID']);

// ดึงข้อมูลเมนูเพื่อตรวจสอบชื่อไฟล์ภาพ
$getImageStmt = $conn->prepare("SELECT ImageURL FROM menu WHERE MenuID = ?");
$getImageStmt->bind_param("i", $menu_id);
$getImageStmt->execute();
$getImageStmt->bind_result($imageUrl);
$getImageStmt->fetch();
$getImageStmt->close();

// ลบข้อมูลออกจาก DB
$stmt = $conn->prepare("DELETE FROM menu WHERE MenuID = ?");
$stmt->bind_param("i", $menu_id);

if ($stmt->execute()) {
    // ถ้ามีไฟล์ภาพก็ลบในโฟลเดอร์ uploads
    if ($imageUrl) {
        $filePath = "../../" . $imageUrl;  // เพราะ ImageURL เก็บแบบ "uploads/xxxx.jpg"
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete menu"]);
}

$stmt->close();
$conn->close();
?>
