<?php
include "../connectDB.php";

// ฟังก์ชันดึงข้อมูลสถานะคำสั่งซื้อ
function getOrderStatusData($conn) {
    $sql = "SELECT status, COUNT(*) AS count FROM Orders GROUP BY status";
    $result = $conn->query($sql);

    if (!$result) {
        // Error handling
        error_log("SQL Error: " . $conn->error);
        return [];
    }

    $data = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    } else {
        // No results found
        error_log("No results found.");
    }

    return $data;
}

$orderStatusData = getOrderStatusData($conn);
echo json_encode($orderStatusData);
?>
