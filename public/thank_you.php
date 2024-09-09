<?php
session_start();
include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล
include 'topnavbar.php';

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

// ดึงข้อมูลสลิปจากตาราง payments
$sql = "SELECT slip_image FROM payments WHERE order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $orderId);
$stmt->execute();
$payment = $stmt->get_result()->fetch_assoc();
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
    <style>
        /* CSS สำหรับ Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            padding-top: 100px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
        }

        .modal-content {
            background-color: #fefefe;
            margin: auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        .slip-image {
            width: 100%;
            height: auto;
        }
    </style>
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

        <h2>สลิปการชำระเงิน</h2>
        <?php if ($payment && $payment['slip_image']): ?>
            <!-- ปุ่มสำหรับเปิด Modal -->
            <button id="viewSlipBtn">ดูสลิปการชำระเงิน</button>

            <!-- Modal สำหรับแสดงสลิป -->
            <div id="slipModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <img src="../admin/uploads/<?php echo htmlspecialchars($payment['slip_image']); ?>" alt="Slip Image" class="slip-image">
                </div>
            </div>
        <?php else: ?>
            <p>ไม่พบสลิปการชำระเงิน</p>
        <?php endif; ?>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>

    <script>
        // JavaScript สำหรับจัดการการเปิด/ปิด Modal
        var modal = document.getElementById("slipModal");
        var btn = document.getElementById("viewSlipBtn");
        var span = document.getElementsByClassName("close")[0];

        // เมื่อคลิกที่ปุ่ม "ดูสลิปการชำระเงิน" ให้เปิด Modal
        btn.onclick = function() {
            modal.style.display = "block";
        }

        // เมื่อคลิกที่ปุ่ม "x" ให้ปิด Modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // เมื่อคลิกที่ใดๆ นอก Modal ให้ปิด Modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    </script>
</body>
</html>
