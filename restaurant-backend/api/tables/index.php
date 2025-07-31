<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require_once '../../config/db.php';

// ปรับ SQL ให้ดึง OrderID ของคำสั่งซื้อที่ยังไม่จ่าย
$sql = "
    SELECT 
        d.TableID, 
        d.TableNumber, 
        d.Status, 
        d.Capacity,
        o.OrderID
    FROM dining d
    LEFT JOIN `order` o 
        ON d.TableID = o.TableID 
        AND o.Status IN ('active', 'pending')  -- เงื่อนไขเฉพาะออร์เดอร์ที่ยังเปิดอยู่
    ORDER BY d.TableNumber ASC
";

$result = $conn->query($sql);

$tables = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $tables[] = $row;
    }
    echo json_encode($tables);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch tables"]);
}

$conn->close();
?>
