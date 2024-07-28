<?php
include "../connectDB.php";

// ดึงจำนวนคำสั่งซื้อที่อยู่ในสถานะ "Pending" จากฐานข้อมูล
function getPendingRequests($conn) {
    $sql = "SELECT COUNT(*) AS pending_count FROM orders WHERE status = 'รอรับเรื่อง'";
    $result = $conn->query($sql);

    if (!$result) {
        // Error handling
        error_log("SQL Error: " . $conn->error);
        return 0;
    }

    $row = $result->fetch_assoc();
    return $row['pending_count'] ?? 0;
}

$pendingRequests = getPendingRequests($conn);
echo json_encode(['pending_count' => $pendingRequests]);
?>
