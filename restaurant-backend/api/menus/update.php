<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once '../../config/db.php';

$menu_id = $_POST['menu_id'] ?? null;
if (!$menu_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing menu_id"]);
    exit;
}

$name = $_POST['name'] ?? null;
$description = $_POST['description'] ?? null;
$price = $_POST['price'] ?? null;
$cost = $_POST['cost'] ?? null;
$category = $_POST['category'] ?? null;

$image = null;

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
        echo json_encode(["error" => "Invalid file type"]);
        exit;
    }
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
        $image = "uploads/" . $fileName;
    }
}

$fields = [];
$params = [];
$types = '';

if ($name !== null) {
    $fields[] = "Name = ?";
    $params[] = $name;
    $types .= 's';
}
if ($description !== null) {
    $fields[] = "Description = ?";
    $params[] = $description;
    $types .= 's';
}
if ($price !== null) {
    $fields[] = "Price = ?";
    $params[] = $price;
    $types .= 'd';
}
if ($cost !== null) {
    $fields[] = "Cost = ?";
    $params[] = $cost;
    $types .= 'd';
}
if ($category !== null) {
    $fields[] = "Category = ?";
    $params[] = $category;
    $types .= 's';
}
if ($image !== null) {
    $fields[] = "ImageURL = ?";
    $params[] = $image;
    $types .= 's';
}

if (count($fields) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "No fields to update"]);
    exit;
}

$sql = "UPDATE Menu SET " . implode(", ", $fields) . " WHERE MenuID = ?";
$params[] = $menu_id;
$types .= 'i';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update menu"]);
}

$stmt->close();
$conn->close();
?>
