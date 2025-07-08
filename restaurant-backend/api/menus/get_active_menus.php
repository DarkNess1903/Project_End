<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

require_once '../../config/db.php';

// ✅ ดึงเฉพาะเมนูที่เปิดขาย (Status = 'active')
$sql = "SELECT MenuID, Name, Description, Price, Cost, ImageURL, Status, Category FROM Menu WHERE Status = 'active'";
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
