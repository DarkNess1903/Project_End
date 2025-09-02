<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // ถ้าเรียกจาก React ต่างโดเมน

require_once '../../config/db.php';

$sql = "SELECT id, order_id, feedback_date, rating_food, rating_service, rating_cleanliness, rating_overall, comment FROM feedback ORDER BY feedback_date DESC";
$result = $conn->query($sql);

$feedbacks = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $feedbacks[] = $row;
    }
}

echo json_encode($feedbacks);
$conn->close();
?>
