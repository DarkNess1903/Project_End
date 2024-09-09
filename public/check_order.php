<?php
session_start();
include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล

// ตรวจสอบว่ามีการส่งข้อมูล POST หรือไม่
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['phone'])) {
    $phone = $_POST['phone'];

    // ตรวจสอบการเตรียมข้อมูล
    if (empty($phone)) {
        echo 'กรุณากรอกเบอร์โทรศัพท์';
        exit();
    }

    // ดึงข้อมูลคำสั่งซื้อตามเบอร์โทรศัพท์
    $stmt = $conn->prepare("SELECT * FROM orders WHERE customer_phone = ?");
    $stmt->bind_param('s', $phone);
    $stmt->execute();
    $orders = $stmt->get_result();
    $stmt->close();
} else {
    $orders = null;
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <title>ตรวจสอบคำสั่งซื้อ</title>
</head>
<body>
    <header>
        <!-- ใส่ Navbar ของคุณที่นี่ -->
    </header>

    <div class="check-order-container">
        <h1>ตรวจสอบคำสั่งซื้อ</h1>

        <!-- ฟอร์มกรอกเบอร์โทรศัพท์ -->
        <form method="POST" action="check_order.php">
            <label for="phone">กรุณากรอกเบอร์โทรศัพท์:</label>
            <input type="text" id="phone" name="phone" required>
            <button type="submit">ตรวจสอบ</button>
        </form>

        <?php if ($orders !== null): ?>
            <?php if ($orders->num_rows > 0): ?>
                <h2>รายการคำสั่งซื้อของคุณ</h2>
                <ul class="order-list">
                    <?php while ($order = $orders->fetch_assoc()): ?>
                        <li>
                            <p><strong>หมายเลขคำสั่งซื้อ:</strong> <?php echo htmlspecialchars($order['order_id']); ?></p>
                            <p><strong>วันที่สั่งซื้อ:</strong> <?php echo htmlspecialchars($order['order_date']); ?></p>
                            <p><strong>ยอดรวม:</strong> <?php echo number_format($order['total_amount'], 2); ?> บาท</p>
                            <p><strong>สถานะ:</strong> <?php echo htmlspecialchars($order['status']); ?></p>
                        </li>
                    <?php endwhile; ?>
                </ul>
            <?php else: ?>
                <p>ไม่พบคำสั่งซื้อสำหรับเบอร์โทรศัพท์นี้</p>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>
</body>
</html>
