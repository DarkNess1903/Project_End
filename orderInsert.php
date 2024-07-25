<?php
include "connectDB.php";

// รับข้อมูลจากฟอร์ม
$name = $_POST['name'];
$phone = $_POST['phone'];
$address = $_POST['address'];
$slip = $_FILES['slip']['name']; // ชื่อไฟล์ของภาพสลิป
$slip_tmp = $_FILES['slip']['tmp_name']; // ไฟล์ที่อัพโหลดชั่วคราว
$slip_path = "uploads/" . basename($slip); // พาธของไฟล์ที่ต้องการย้าย

// สร้างคำสั่ง SQL เพื่อบันทึกข้อมูลลงฐานข้อมูล
$sql = "INSERT INTO Orders (order_number, name, phone, address, slip_path, quantity, item_name) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$order_number = generateOrderNumber(); // ฟังก์ชันสร้างเลข Order อัตโนมัติ
$quantity = 1; // จำนวนสินค้าที่สั่งซื้อ
$item_name = "Product"; // ชื่อสินค้า (ในที่นี้เป็นตัวอย่าง)

$stmt->bind_param("sssssis", $order_number, $name, $phone, $address, $slip_path, $quantity, $item_name);

// Execute the statement
if ($stmt->execute()) {
    // ย้ายไฟล์ภาพสลิปไปเก็บที่ uploads/
    if (move_uploaded_file($slip_tmp, $slip_path)) {
        echo "ข้อมูลถูกบันทึกเรียบร้อยแล้ว!";
    } else {
        echo "เกิดข้อผิดพลาดในการอัพโหลดไฟล์ภาพสลิป.";
    }
} else {
    echo "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " . $conn->error;
}

// ปิดการเชื่อมต่อฐานข้อมูล
$stmt->close();
$conn->close();

// ฟังก์ชันสร้างเลข Order อัตโนมัติ (เช่น O20240001)
function generateOrderNumber() {
    $prefix = 'O';
    $year = date('Y');
    $last_order_number = getLastOrderNumber();
    
    if ($last_order_number === false) {
        return $prefix . $year . '0001';
    } else {
        $last_number = substr($last_order_number, -4);
        $new_number = intval($last_number) + 1;
        return $prefix . $year . sprintf('%04d', $new_number);
    }
}

// ฟังก์ชันหาเลข Order ล่าสุด
function getLastOrderNumber() {
    global $conn;
    $sql = "SELECT order_number FROM Orders ORDER BY order_id DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['order_number'];
    } else {
        return false;
    }
}
?>
