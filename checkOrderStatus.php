<?php
include "connectDB.php";

// ตรวจสอบว่ามีการส่งพารามิเตอร์ phoneNumber ผ่าน POST หรือไม่
if(isset($_POST['phoneNumber'])) {
    $phoneNumber = $conn->real_escape_string($_POST['phoneNumber']);

    // Query ข้อมูลออร์เดอร์จากฐานข้อมูล
    $sql = "SELECT * FROM orders WHERE phone = '$phoneNumber'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // แสดงข้อมูลออร์เดอร์
        echo "<table border='1'>";
        echo "<tr><th>Order ID</th><th>Order Number</th><th>Name</th><th>Phone</th><th>Address</th><th>Slip Path</th><th>Quantity</th><th>Item Name</th><th>Timestamp</th><th>Status</th></tr>";
        
        while($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>".$row["order_id"]."</td>";
            echo "<td>".$row["order_number"]."</td>";
            echo "<td>".$row["name"]."</td>";
            echo "<td>".$row["phone"]."</td>";
            echo "<td>".$row["address"]."</td>";
            echo "<td><img src='".$row["slip_path"]."' alt='Slip Image' width='100px' height='100px'></td>";
            echo "<td>".$row["quantity"]."</td>";
            echo "<td>".$row["item_name"]."</td>";
            echo "<td>".$row["timestamp"]."</td>";
            echo "<td>".$row["status"]."</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "ไม่พบข้อมูลออร์เดอร์สำหรับหมายเลขโทรศัพท์นี้";
    }
} else {
    echo "กรุณากรอกหมายเลขโทรศัพท์";
}

$conn->close();
?>
