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

require_once '../../config/db.php';

$name = $_POST['name'] ?? null;
$description = $_POST['description'] ?? null;
$price = isset($_POST['price']) ? floatval($_POST['price']) : null;
$cost = isset($_POST['cost']) ? floatval($_POST['cost']) : 0;
$category = $_POST['category'] ?? 'main'; // default main

if (!$name || $price === null) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields (name, price)"]);
    exit;
}

$imageUrl = null;

// อัปโหลดรูป
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $targetDir = "../../uploads/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9\._-]/", "", basename($_FILES["image"]["name"]));
    $targetFilePath = $targetDir . $fileName;

    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["error" => "Only JPG, JPEG, PNG & GIF files are allowed"]);
        exit;
    }

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
        $imageUrl = "uploads/" . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Upload failed"]);
        exit;
    }
}

// ตรวจสอบว่าชื่อ table ในฐานข้อมูลคือ Menu (case sensitive)
$stmt = $conn->prepare("INSERT INTO Menu (Name, Description, Price, Cost, ImageURL, Category) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssddss", $name, $description, $price, $cost, $imageUrl, $category);

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
?>
