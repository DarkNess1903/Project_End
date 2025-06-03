<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
require_once '../../config/db.php';

// ดึงข้อมูลเมนูทั้งหมด
$sql = "SELECT MenuID, Name, Description, Price, ImageURL FROM Menu";
$result = $conn->query($sql);

$menus = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $menus[] = $row;
    }
    echo json_encode($menus);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch menus"]);
}

$conn->close();
?>
