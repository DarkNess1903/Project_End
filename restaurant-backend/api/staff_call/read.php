<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$sql = "SELECT sc.CallID, sc.TableID, d.TableNumber, sc.ServiceType, sc.Status, sc.CallTime
        FROM staff_calls sc
        JOIN dining d ON sc.TableID = d.TableID
        WHERE sc.Status = 'pending'
        ORDER BY sc.CallTime DESC";

$result = $conn->query($sql);

$calls = [];

while ($row = $result->fetch_assoc()) {
    $calls[] = [
        "call_id" => $row["CallID"],
        "table_id" => $row["TableID"],
        "table_number" => $row["TableNumber"],
        "message" => $row["ServiceType"],
        "status" => $row["Status"],
        "call_time" => $row["CallTime"]
    ];
}

echo json_encode(["success" => true, "data" => $calls]);

$conn->close();
?>
