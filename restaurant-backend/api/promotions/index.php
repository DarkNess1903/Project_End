<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/db.php';

$sql = "SELECT * FROM promotion ORDER BY StartDate DESC";
$result = $conn->query($sql);

$promotions = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $promotions[] = $row;
    }
}

echo json_encode($promotions);

$conn->close();
?>
