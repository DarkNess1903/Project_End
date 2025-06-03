<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

// ตรวจสอบข้อมูล POST
$name = $_POST['name'] ?? null;
$description = $_POST['description'] ?? null;
$price = $_POST['price'] ?? null;
$cost = $_POST['cost'] ?? null;

if (!$name || !$price) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields (name, price)"]);
    exit;
}

$imageUrl = null;

// อัปโหลดไฟล์รูปภาพถ้ามี
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $targetDir = "../../uploads/";

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $fileName = basename($_FILES["image"]["name"]);
    $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", $fileName); // ป้องกันชื่อไฟล์ไม่ปลอดภัย

    $targetFilePath = $targetDir . $fileName;

    // ตรวจสอบนามสกุลไฟล์ (เช่น jpg, png)
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["error" => "Only JPG, JPEG, PNG & GIF files are allowed"]);
        exit;
    }

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
        $imageUrl = "uploads/" . $fileName; // เก็บ URL สำหรับดึงรูป
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Upload failed"]);
        exit;
    }
}

// เตรียม insert
$stmt = $conn->prepare("INSERT INTO Menu (Name, Description, Price, Cost, ImageURL) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssdds", $name, $description, $price, $cost, $imageUrl);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "menu_id" => $stmt->insert_id,
        "image_url" => $imageUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to insert menu"]);
}

$stmt->close();
$conn->close();
