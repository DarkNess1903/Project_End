<?php
include "../connectDB.php";

// ดึงข้อมูลรายได้รายเดือนจากฐานข้อมูล
function getEarningsOverview($conn) {
    $sql = "SELECT 
                DATE_FORMAT(order_time, '%Y-%m') AS month, 
                SUM(price * quantity) AS total_revenue 
            FROM Orders 
            WHERE order_time >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY month 
            ORDER BY month ASC";
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

    // Debugging: print out the data array
    error_log(print_r($data, true));

    return $data;
}

$earningsOverview = getEarningsOverview($conn);
echo json_encode($earningsOverview);
?>
