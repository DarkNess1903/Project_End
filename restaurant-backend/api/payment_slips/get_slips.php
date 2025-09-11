<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$date = $_GET['date'] ?? date('Y-m-d');

$stmt = $conn->prepare("SELECT SlipID, UploadedBy, FileName, FilePath, UploadDate FROM payment_slips WHERE DATE(UploadDate) = ? ORDER BY UploadDate DESC");
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

$slips = [];
while ($row = $result->fetch_assoc()) {
    // ถ้ stored FilePath เป็น server path ให้แปลงเป็น public URL ตามกฎด้านบน
    $slips[] = $row;
}

echo json_encode(["slips" => $slips]);

$stmt->close();
$conn->close();
?>
