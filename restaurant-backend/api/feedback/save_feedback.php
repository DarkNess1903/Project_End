<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$order_id = $data['order_id'] ?? null;
$table_name = $data['table_name'] ?? null;
$rating_food = $data['rating_food'] ?? 0;
$rating_service = $data['rating_service'] ?? 0;
$rating_cleanliness = $data['rating_cleanliness'] ?? 0;
$rating_overall = $data['rating_overall'] ?? 0;
$comment = $data['comment'] ?? '';
$contact_email = $data['contact_email'] ?? '';
$contact_phone = $data['contact_phone'] ?? '';

$sql = "INSERT INTO feedback 
    (order_id, table_name, rating_food, rating_service, rating_cleanliness, rating_overall, comment, contact_email, contact_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("siiiiisss", $order_id, $table_name, $rating_food, $rating_service, $rating_cleanliness, $rating_overall, $comment, $contact_email, $contact_phone);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "บันทึกเรียบร้อย"]);
} else {
    echo json_encode(["success" => false, "message" => "บันทึกไม่สำเร็จ"]);
}

$stmt->close();
$conn->close();
?>
