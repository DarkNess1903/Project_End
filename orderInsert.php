<?php
include "connectDB.php";

// รับข้อมูลจากฟอร์ม
$name = $_POST['name'] ?? null;
$phone = $_POST['phone'] ?? null;
$address = $_POST['address'] ?? null;
$slip = $_FILES['slip']['name'] ?? null;
$slip_tmp = $_FILES['slip']['tmp_name'] ?? null;
$slip_path = "admin/uploads/" . basename($slip);
$order_time = date('Y-m-d H:i:s');
$status = 'รอดำเนินการ';

// รับข้อมูลสินค้าจากฟอร์ม
$product_names = $_POST['product_name'] ?? [];
$prices = $_POST['price'] ?? [];
$quantities = $_POST['quantity'] ?? [];
$total_prices = [];
foreach ($product_names as $index => $product_name) {
    $price = $prices[$index];
    $quantity = $quantities[$index];
    $total_prices[] = $price * $quantity; // คำนวณราคาทั้งหมด
}

if (empty($product_names) || empty($prices) || empty($quantities) || empty($total_prices)) {
    echo "เกิดข้อผิดพลาด: ข้อมูลสินค้าไม่ครบถ้วน.";
    exit();
}

// สร้างคำสั่ง SQL เพื่อบันทึกข้อมูลลงฐานข้อมูล
$order_number = generateOrderNumber();

foreach ($product_names as $index => $product_name) {
    $price = $prices[$index];
    $quantity = $quantities[$index];
    $total_price = $price * $quantity;

    // ตรวจสอบสต็อกสินค้าก่อน
    $stockCheckSql = "SELECT stock FROM products WHERE product_name = ?";
    $stmtCheck = $conn->prepare($stockCheckSql);
    $stmtCheck->bind_param("s", $product_name);
    $stmtCheck->execute();
    $stmtCheck->bind_result($stock);
    $stmtCheck->fetch();
    $stmtCheck->close();

    if ($stock < $quantity) {
        echo "สินค้าหมดสต็อก: " . $product_name;
        continue; // ข้ามสินค้าที่สต็อกไม่พอ
    }

    // บันทึกคำสั่งซื้อในตาราง Orders
    $sql = "INSERT INTO Orders (order_number, name, phone, address, slip_path, quantity, item_name, price, total_price, order_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssisiss", $order_number, $name, $phone, $address, $slip_path, $quantity, $product_name, $price, $total_price, $order_time, $status);

    // Execute the statement
    if ($stmt->execute()) {
        // ลดจำนวนสต็อกสินค้าหลังจากเพิ่มคำสั่งซื้อแล้ว
        $updateStockSql = "UPDATE products SET stock = stock - ? WHERE product_name = ?";
        $stmtUpdate = $conn->prepare($updateStockSql);
        $stmtUpdate->bind_param("is", $quantity, $product_name);
        $stmtUpdate->execute();
        $stmtUpdate->close();

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
