<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

require_once '../../config/db.php';

if (!isset($_GET['id'])) {
    echo json_encode(["message" => "Missing menu ID."]);
    exit;
}

$menuID = intval($_GET['id']);

$query = "SELECT * FROM menu WHERE MenuID = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $menuID);
$stmt->execute();

$result = $stmt->get_result();
if ($result->num_rows > 0) {
    $menu = $result->fetch_assoc();
    echo json_encode($menu);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Menu not found."]);
}

$stmt->close();
$conn->close();
?>