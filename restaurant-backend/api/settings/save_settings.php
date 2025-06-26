<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

// โฟลเดอร์เก็บไฟล์อัปโหลด (ปรับตาม path จริง)
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// ฟังก์ชันช่วยอัปโหลดไฟล์
function uploadFile($fileInputName, $uploadDir) {
    if (!isset($_FILES[$fileInputName]) || $_FILES[$fileInputName]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $fileTmpPath = $_FILES[$fileInputName]['tmp_name'];
    $fileName = basename($_FILES[$fileInputName]['name']);
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExt = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($fileExt, $allowedExt)) {
        return null;
    }

    // สร้างชื่อไฟล์ใหม่ป้องกันชนกัน
    $newFileName = uniqid() . '.' . $fileExt;
    $destPath = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        return $newFileName; // คืนชื่อไฟล์ใหม่
    } else {
        return null;
    }
}

// รับค่าจากฟอร์ม
$shopName = $_POST['shop_name'] ?? '';
$terms = $_POST['terms'] ?? '';
$recommendedMenusJson = $_POST['recommended_menus'] ?? '[]';
$categoriesJson = $_POST['categories'] ?? '[]';

$recommendedMenus = json_decode($recommendedMenusJson, true);
$categories = json_decode($categoriesJson, true);

if (!is_array($recommendedMenus)) $recommendedMenus = [];
if (!is_array($categories)) $categories = [];

// อัปโหลดรูปภาพ (ถ้ามี)
$coverImageFile = uploadFile('cover_image', $uploadDir);
$logoImageFile = uploadFile('logo_image', $uploadDir);

// ตัวอย่างเก็บข้อมูลลงฐานข้อมูลแบบง่าย
// สมมติเรามีตาราง settings แค่ 1 แถวเก็บค่าทั้งหมด (update ถ้ามี, insert ถ้าไม่มี)

// สร้างตารางตัวอย่าง
/*
CREATE TABLE settings (
    id INT PRIMARY KEY,
    shop_name VARCHAR(255),
    terms TEXT,
    recommended_menus TEXT,
    categories TEXT,
    cover_image VARCHAR(255),
    logo_image VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

// เช็คว่ามีข้อมูลในตารางหรือยัง
$sqlCheck = "SELECT id, cover_image, logo_image FROM settings WHERE id = 1 LIMIT 1";
$resultCheck = $conn->query($sqlCheck);

if ($resultCheck && $resultCheck->num_rows > 0) {
    // มีแถวแล้ว => update
    $row = $resultCheck->fetch_assoc();

    // กำหนดชื่อไฟล์ภาพที่ต้องเก็บ (ถ้าไม่มีไฟล์ใหม่ให้เก็บของเดิม)
    $coverImageToSave = $coverImageFile ? $coverImageFile : $row['cover_image'];
    $logoImageToSave = $logoImageFile ? $logoImageFile : $row['logo_image'];

    $stmt = $conn->prepare("UPDATE settings SET shop_name=?, terms=?, recommended_menus=?, categories=?, cover_image=?, logo_image=? WHERE id=1");
    $stmt->bind_param(
        "ssssss",
        $shopName,
        $terms,
        json_encode($recommendedMenus, JSON_UNESCAPED_UNICODE),
        json_encode($categories, JSON_UNESCAPED_UNICODE),
        $coverImageToSave,
        $logoImageToSave
    );
    $success = $stmt->execute();
    $stmt->close();
} else {
    // ไม่มีแถว => insert
    $stmt = $conn->prepare("INSERT INTO settings (id, shop_name, terms, recommended_menus, categories, cover_image, logo_image) VALUES (1, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param(
        "ssssss",
        $shopName,
        $terms,
        json_encode($recommendedMenus, JSON_UNESCAPED_UNICODE),
        json_encode($categories, JSON_UNESCAPED_UNICODE),
        $coverImageFile,
        $logoImageFile
    );
    $success = $stmt->execute();
    $stmt->close();
}

if ($success) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save settings"]);
}

$conn->close();
