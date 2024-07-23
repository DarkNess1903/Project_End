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
$sql = "INSERT INTO Orders (order_number, name, phone, address, slip_path, quantity, item_name, price, order_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$order_number = generateOrderNumber(); // ฟังก์ชันสร้างเลข Order อัตโนมัติ
$quantity = 1; // จำนวนสินค้าที่สั่งซื้อ
$item_name = "Product"; // ชื่อสินค้า (ในที่นี้เป็นตัวอย่าง)
$price = 100; // ราคา (ตัวอย่าง)
$order_time = date('Y-m-d H:i:s'); // วันที่และเวลาในปัจจุบัน
$status = 'รอรับเรื่อง'; // สถานะเริ่มต้น

$stmt->bind_param("sssssisiss", $order_number, $name, $phone, $address, $slip_path, $quantity, $item_name, $price, $order_time, $status);

// Execute the statement
if ($stmt->execute()) {
    // ย้ายไฟล์ภาพสลิปไปเก็บที่ uploads/
    if (move_uploaded_file($slip_tmp, $slip_path)) {
        echo "ข้อมูลถูกบันทึกเรียบร้อยแล้ว!";
        // ส่งการแจ้งเตือน
        sendLineNotify("มีคำสั่งซื้อใหม่! \nOrder Number: $order_number\nName: $name\nPrice: ฿$price\nOrder Time: $order_time\nStatus: $status");
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
    global $conn;
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

// ฟังก์ชันส่งการแจ้งเตือนผ่าน Line Notify
function sendLineNotify($message) {
    $accessToken = 'Y0l8lajewGFBTsAtHL74ZcdSB9LFnaYElrhg8LapsBv';
    $apiUrl = 'https://notify-api.line.me/api/notify';

    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/x-www-form-urlencoded'
    ];

    $data = [
        'message' => $message
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}
?>
