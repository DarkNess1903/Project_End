<?php
// เชื่อมต่อฐานข้อมูล MySQL
$servername = "localhost";
$username = "root";         // เปลี่ยนตาม user ของคุณ
$password = "";             // เปลี่ยนตาม password ของคุณ
$dbname = "restaurant_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}
?>
