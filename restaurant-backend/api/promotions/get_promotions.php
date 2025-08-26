<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../../config/db.php';

date_default_timezone_set("Asia/Bangkok"); // ตั้ง timezone ให้ตรง
$today = date("Y-m-d");

try {
    $sql = "SELECT PromotionID, Name, Description, DiscountType, DiscountValue, StartDate, EndDate
            FROM promotion
            WHERE Status = 'active'
            AND StartDate <= ? 
            AND EndDate >= ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $today, $today);
    $stmt->execute();
    $result = $stmt->get_result();

    $promotions = [];
    while ($row = $result->fetch_assoc()) {
        // แปลงวันที่ให้อ่านง่ายขึ้น (ถ้าจะใช้บน frontend)
        $row['StartDate'] = date("Y-m-d", strtotime($row['StartDate']));
        $row['EndDate']   = date("Y-m-d", strtotime($row['EndDate']));
        $promotions[] = $row;
    }

    echo json_encode([
        "success" => true,
        "promotions" => $promotions
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
