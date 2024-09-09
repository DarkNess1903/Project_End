<?php
session_start();
include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล

if (!isset($_GET['orderId'])) {
    echo 'คำสั่งซื้อไม่ถูกต้อง';
    exit();
}

$orderId = intval($_GET['orderId']);

// ดึงข้อมูลคำสั่งซื้อ
$sql = "SELECT * FROM orders WHERE order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $orderId);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$order) {
    echo 'ไม่พบคำสั่งซื้อ';
    exit();
}

// ดึงข้อมูลรายการสินค้าที่สั่งซื้อ
$sql = "SELECT * FROM order_details JOIN Products ON order_details.product_id = Products.product_id WHERE order_details.order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $orderId);
$stmt->execute();
$items = $stmt->get_result();
$stmt->close();

$conn->close();
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <title>ขอบคุณสำหรับการสั่งซื้อ</title>
</head>
<body>
    <header>
        <!-- ใส่ Navbar ของคุณที่นี่ -->
    </header>

    <div class="thank-you-container">
        <h1>ขอบคุณสำหรับการสั่งซื้อ!</h1>
        <p>คำสั่งซื้อของคุณได้รับการยืนยันแล้ว</p>
        <h2>รายละเอียดคำสั่งซื้อ</h2>
        <p>หมายเลขคำสั่งซื้อ: <?php echo htmlspecialchars($orderId); ?></p>
        <p>ชื่อ: <?php echo htmlspecialchars($order['customer_name']); ?></p>
        <p>อีเมล: <?php echo htmlspecialchars($order['customer_email']); ?></p>
        <p>โทรศัพท์: <?php echo htmlspecialchars($order['customer_phone']); ?></p>
        <p>ที่อยู่: <?php echo htmlspecialchars($order['customer_address']); ?></p>
        <p>ยอดรวมที่ต้องชำระ: <?php echo number_format($order['total_amount'], 2); ?> บาท</p>
        <p>สถานะคำสั่งซื้อ: <?php echo htmlspecialchars($order['status']); ?></p>

        <h2>รายการสินค้าที่สั่งซื้อ</h2>
        <ul class="product-list">
            <?php while ($item = $items->fetch_assoc()): ?>
                <li>
                    <img src="<?php echo htmlspecialchars($item['image']); ?>" alt="Product Image" width="50px" height="50px">
                    <span><?php echo htmlspecialchars($item['product_name']); ?></span> -
                    <span><?php echo number_format($item['price'], 2); ?> บาท</span> -
                    <span><?php echo htmlspecialchars($item['quantity']); ?> ชิ้น</span> -
                    <span>ราคารวม: <?php echo number_format($item['price'] * $item['quantity'], 2); ?> บาท</span>
                </li>
            <?php endwhile; ?>
        </ul>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>
</body>
</html>
