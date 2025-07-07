<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

// รองรับ preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ดึง setting แถวเดียว
$sql = "SELECT * FROM settings WHERE id=1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();

    echo json_encode([
        "success" => true,
        "settings" => [
            "id" => $row["id"],
            "logo_url" => $row["logo_url"] ? $row["logo_url"] : null,
            "cover_image_url" => $row["cover_image_url"] ? $row["cover_image_url"] : null,
            "store_name" => $row["store_name"] ?? "",
            "service_policy" => $row["service_policy"] ?? "",
            "recommended_menu" => $row["recommended_menu"] ?? "[]"
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "ไม่พบการตั้งค่า"
    ]);
}

$conn->close();
?>
