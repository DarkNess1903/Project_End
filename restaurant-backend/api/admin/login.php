<?php
session_start();
header('Content-Type: application/json');
require_once '../../config/db.php';

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"), true);
$username = $data['user'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Missing user or password"]);
    exit;
}

// ดึงข้อมูลแอดมิน
$stmt = $conn->prepare("SELECT AdminID, password FROM Admin WHERE user = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid username"]);
    exit;
}

$row = $result->fetch_assoc();

// ตรวจสอบรหัสผ่าน (สมมุติว่าใช้ bcrypt hash)
if ($password !== $row['password']) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid password"]);
    exit;
}

// Login สำเร็จ – สร้าง session
$_SESSION['admin_id'] = $row['AdminID'];
echo json_encode(["success" => true, "admin_id" => $row['AdminID']]);

$stmt->close();
$conn->close();
