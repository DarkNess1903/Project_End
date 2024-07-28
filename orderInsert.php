<?php
include "connectDB.php";

// รับข้อมูลจากฟอร์ม
$name = $_POST['name'];
$phone = $_POST['phone'];
$address = $_POST['address'];
$slip = $_FILES['slip']['name'];
$slip_tmp = $_FILES['slip']['tmp_name'];
$slip_path = "uploads/" . basename($slip);
$order_time = date('Y-m-d H:i:s');
$status = 'รอรับเรื่อง';

// รับข้อมูลสินค้าจากฟอร์ม
$product_names = isset($_POST['product_name']) ? $_POST['product_name'] : [];
$prices = isset($_POST['price']) ? $_POST['price'] : [];
$quantities = isset($_POST['quantity']) ? $_POST['quantity'] : [];
$total_prices = isset($_POST['total_price']) ? $_POST['total_price'] : [];

// ตรวจสอบว่าข้อมูลสินค้าถูกส่งมาครบถ้วน
if (empty($product_names) || empty($prices) || empty($quantities) || empty($total_prices)) {
    echo "กรุณากรอกข้อมูลสินค้าทั้งหมด";
    exit();
}


// สร้างคำสั่ง SQL เพื่อบันทึกข้อมูลลงฐานข้อมูล
$order_number = generateOrderNumber();

foreach ($product_names as $index => $product_name) {
    $price = $prices[$index];
    $quantity = $quantities[$index];
    $total_price = $total_prices[$index];

    $sql = "INSERT INTO Orders (order_number, name, phone, address, slip_path, quantity, item_name, price, order_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssisiss", $order_number, $name, $phone, $address, $slip_path, $quantity, $product_name, $price, $order_time, $status);

    // Execute the statement
    if ($stmt->execute()) {
        // ย้ายไฟล์ภาพสลิปไปเก็บที่ uploads/ (ทำครั้งเดียว)
        if (!isset($fileMoved)) {
            if (move_uploaded_file($slip_tmp, $slip_path)) {
                echo "ข้อมูลถูกบันทึกเรียบร้อยแล้ว!";
                $fileMoved = true;
            } else {
                echo "เกิดข้อผิดพลาดในการอัพโหลดไฟล์ภาพสลิป.";
            }
        }

        // ส่งการแจ้งเตือน
        sendLineNotify("มีคำสั่งซื้อใหม่! \nOrder Number: $order_number\nName: $name\nProduct: $product_name\nQuantity: $quantity\nTotal Price: ฿$total_price\nOrder Time: $order_time\nStatus: $status");
    } else {
        echo "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " . $conn->error;
    }

    // ปิดการเชื่อมต่อ
    $stmt->close();
}

// ลบข้อมูลในตาราง cart หลังจากบันทึกคำสั่งซื้อเสร็จ
$deleteCartSql = "DELETE FROM cart";
if ($conn->query($deleteCartSql) === TRUE) {
    echo "ข้อมูลในตะกร้าถูกลบเรียบร้อยแล้ว!";
} else {
    echo "เกิดข้อผิดพลาดในการลบข้อมูลตะกร้า: " . $conn->error;
}

// ปิดการเชื่อมต่อฐานข้อมูล
$conn->close();

// ฟังก์ชันสร้างเลข Order อัตโนมัติ
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
    $accessToken = 'YOUR_LINE_NOTIFY_ACCESS_TOKEN';
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
