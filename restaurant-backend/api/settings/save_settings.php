<?php
// รองรับ preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

// รับค่าจาก form
$store_name = $_POST['store_name'] ?? '';
$service_policy = $_POST['service_policy'] ?? '';
$recommended_menu = $_POST['recommended_menu'] ?? '[]';

// โหลดค่าเก่า (สำหรับกรณี user ไม่เลือกไฟล์ใหม่)
$old_logo = '';
$old_cover = '';
$resultOld = $conn->query("SELECT logo_url, cover_image_url FROM settings WHERE id=1");
if ($resultOld && $resultOld->num_rows > 0) {
    $old = $resultOld->fetch_assoc();
    $old_logo = $old['logo_url'] ?? '';
    $old_cover = $old['cover_image_url'] ?? '';
}

// ===== อัปโหลดโลโก้ =====
if (isset($_FILES['logo_image']) && $_FILES['logo_image']['error'] === UPLOAD_ERR_OK) {
    $targetDir = "../../uploads/";
    if (!file_exists($targetDir)) mkdir($targetDir, 0755, true);

    $fileName = time() . '_logo_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", basename($_FILES["logo_image"]["name"]));
    $targetFilePath = $targetDir . $fileName;

    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png'];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "logo: รองรับเฉพาะ JPG, PNG"]);
        exit;
    }
    if (move_uploaded_file($_FILES["logo_image"]["tmp_name"], $targetFilePath)) {
        $logo_url = "uploads/" . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "อัปโหลดโลโก้ล้มเหลว"]);
        exit;
    }
} else {
    $logo_url = $old_logo;  // ใช้ค่าเดิมถ้าไม่ได้อัปโหลดใหม่
}

// ===== อัปโหลด cover =====
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    $targetDir = "../../uploads/";
    if (!file_exists($targetDir)) mkdir($targetDir, 0755, true);

    $fileName = time() . '_cover_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", basename($_FILES["cover_image"]["name"]));
    $targetFilePath = $targetDir . $fileName;

    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png'];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "cover: รองรับเฉพาะ JPG, PNG"]);
        exit;
    }
    if (move_uploaded_file($_FILES["cover_image"]["tmp_name"], $targetFilePath)) {
        $cover_image_url = "uploads/" . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "อัปโหลดภาพหน้าปกล้มเหลว"]);
        exit;
    }
} else {
    $cover_image_url = $old_cover;  // ใช้ค่าเดิมถ้าไม่ได้อัปโหลดใหม่
}

// ===== บันทึกข้อมูลด้วย INSERT ON DUPLICATE KEY UPDATE =====
$sql = "INSERT INTO settings (id, store_name, service_policy, recommended_menu, logo_url, cover_image_url)
        VALUES (1, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          store_name = VALUES(store_name),
          service_policy = VALUES(service_policy),
          recommended_menu = VALUES(recommended_menu),
          logo_url = VALUES(logo_url),
          cover_image_url = VALUES(cover_image_url)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("sssss", $store_name, $service_policy, $recommended_menu, $logo_url, $cover_image_url);

$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true, "message" => "บันทึกสำเร็จ"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "บันทึกล้มเหลว: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
