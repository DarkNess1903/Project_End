<?php
// เชื่อมต่อกับ MySQL Database
$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "order_management";

// สร้างการเชื่อมต่อ
$conn = new mysqli($servername, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// คำสั่ง SQL เพื่อดึงข้อมูลการสั่งซื้อ
$sql = "SELECT * FROM Orders";
$result = $conn->query($sql);

// ตรวจสอบผลลัพธ์
if ($result->num_rows > 0) {
    echo "<h2>รายการการสั่งซื้อ</h2>";
    echo "<table>";
    echo "<tr><th>Order Number</th><th>Quantity</th><th>Item Name</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["order_number"] . "</td><td>" . $row["quantity"] . "</td><td>" . $row["item_name"] . "</td></tr>";
    }
    echo "</table>";
} else {
    echo "ไม่พบข้อมูลการสั่งซื้อ";
}

// ปิดการเชื่อมต่อฐานข้อมูล
$conn->close();
?>
