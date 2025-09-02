<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$order_id = $data['order_id'] ?? null;
$rating_food = $data['rating_food'] ?? 0;
$rating_service = $data['rating_service'] ?? 0;
$rating_cleanliness = $data['rating_cleanliness'] ?? 0;
$rating_overall = $data['rating_overall'] ?? 0;
$comment = $data['comment'] ?? '';

$sql = "INSERT INTO feedback 
    (order_id, rating_food, rating_service, rating_cleanliness, rating_overall, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("siiiis", $order_id, $rating_food, $rating_service, $rating_cleanliness, $rating_overall, $comment);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "บันทึกเรียบร้อย"]);
} else {
    echo json_encode(["success" => false, "message" => "บันทึกไม่สำเร็จ"]);
}

$stmt->close();
$conn->close();
?>
