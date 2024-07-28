<?php
include "connectDB.php";

// รับข้อมูลที่ส่งมาจาก form
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบว่า data ถูกต้อง
if (isset($data->product) && isset($data->price) && isset($data->quantity) && isset($data->totalPrice) && isset($data->details)) {
    // เตรียมข้อมูลสำหรับบันทึกลงในฐานข้อมูล
    $name = $conn->real_escape_string($data->product);
    $price = (float)$data->price;
    $quantity = (int)$data->quantity;
    $totalPrice = (float)$data->totalPrice;
    $details = $conn->real_escape_string($data->details);

    // เขียนคำสั่ง SQL เพื่อบันทึกข้อมูล
    $sql = "INSERT INTO cart (product_name, price, quantity, total_price, details) VALUES ('$name', $price, $quantity, $totalPrice, '$details')";

    if ($conn->query($sql) === TRUE) {
        echo "บันทึกข้อมูลเรียบร้อย"; 
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง";
}

// ปิดการเชื่อมต่อกับฐานข้อมูล MySQL
$conn->close();
?>
