<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

require_once '../../config/db.php';

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing menu id"]);
    exit;
}

$menu_id = intval($_GET['id']);
$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? null;
$description = $data['description'] ?? null;
$price = $data['price'] ?? null;
$cost = $data['cost'] ?? null;
$image = $data['image'] ?? null;

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
    $fields[] = "cost = ?";
    $params[] = $cost;
    $types .= 'd';
}
if ($image !== null) {
    $fields[] = "image = ?";
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
