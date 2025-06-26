<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

// ดึงข้อมูลตั้งค่าร้านอาหารจากตาราง settings สมมติว่าตารางชื่อ settings มีฟิลด์
// id (primary key), logo_url, cover_image_url, store_name, service_policy, recommended_menu, categories (json/string)

$sql = "SELECT * FROM settings WHERE id = 1 LIMIT 1";  // สมมติใช้ id=1 สำหรับข้อมูลตั้งค่าเดียว

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // สมมติฟิลด์ categories เก็บเป็น JSON string ในฐานข้อมูล
    if (!empty($row['categories'])) {
        $row['categories'] = json_decode($row['categories'], true);
    } else {
        $row['categories'] = [];
    }

    echo json_encode([
        "success" => true,
        "settings" => $row
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Settings not found"
    ]);
}

$conn->close();
?>
