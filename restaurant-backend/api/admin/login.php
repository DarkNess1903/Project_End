<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $conn->prepare("SELECT AdminID, User, Password FROM admin WHERE User = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // ❌ เดิม: password_verify($password, $row['Password'])
    if ($password === $row['Password']) {
        // ✅ Login สำเร็จ
        $token = base64_encode(json_encode([
            "id" => $row['AdminID'],
            "user" => $row['User'],
            "time" => time()
        ]));

        echo json_encode([
            "success" => true,
            "token" => $token,
            "user" => $row['User']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "รหัสผ่านไม่ถูกต้อง"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ไม่พบบัญชีผู้ใช้"]);
}

$stmt->close();
$conn->close();
?>
