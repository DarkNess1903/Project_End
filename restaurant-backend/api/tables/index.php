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
header("Content-Type: application/json; charset=utf-8");

require_once '../../config/db.php';

$sql = "
    SELECT 
        d.TableID, 
        d.TableNumber, 
        d.Status, 
        d.Capacity,
        o.OrderID
    FROM dining d
    LEFT JOIN `orders` o 
        ON d.TableID = o.TableID 
        AND o.Status IN ('active', 'pending')
    ORDER BY d.TableNumber ASC
";

$result = $conn->query($sql);

$tables = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $tables[] = $row;
    }
    echo json_encode(["success" => true, "data" => $tables]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to fetch tables"]);
}

$conn->close();
?>
