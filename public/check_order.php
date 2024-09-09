<?php
session_start();
include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล
include 'topnavbar.php'; 

// ตรวจสอบว่ามีการส่งข้อมูล POST หรือไม่
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['phone'])) {
    $phone = trim($_POST['phone']);

    // ตรวจสอบการเตรียมข้อมูล
    if (empty($phone) || !preg_match('/^\d{10}$/', $phone)) {
        echo 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)';
        exit();
    }

    // ดึงข้อมูลคำสั่งซื้อตามเบอร์โทรศัพท์ พร้อมกับข้อมูลการชำระเงิน
    $stmt = $conn->prepare("
        SELECT o.*, p.slip_image 
        FROM orders o
        LEFT JOIN payments p ON o.order_id = p.order_id
        WHERE o.customer_phone = ?
    ");
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
    <style>
        .check-order-container {
            padding: 20px;
            max-width: 800px;
            margin: auto;
            font-family: Arial, sans-serif;
        }
        .order-list {
            list-style-type: none;
            padding: 0;
        }
        .order-list li {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
        }
        .button {
            background-color: #007bff;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
            padding-top: 60px;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
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
    </style>
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
                            <?php if (!empty($order['slip_image'])): ?>
                                <button class="button" onclick="showSlip('../admin/uploads/<?php echo htmlspecialchars($order['slip_image']); ?>')">ดูสลิป</button>
                            <?php else: ?>
                                <p><em>ยังไม่มีสลิปการชำระเงิน</em></p>
                            <?php endif; ?>
                        </li>
                    <?php endwhile; ?>
                </ul>
            <?php else: ?>
                <p>ไม่พบคำสั่งซื้อสำหรับเบอร์โทรศัพท์นี้</p>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <!-- Modal -->
    <div id="slipModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <img id="slipImage" src="" alt="Slip Image" style="width: 100%; height: auto;">
        </div>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>

    <script>
        function showSlip(src) {
            var modal = document.getElementById("slipModal");
            var img = document.getElementById("slipImage");
            img.src = src;
            modal.style.display = "block";
        }

        function closeModal() {
            var modal = document.getElementById("slipModal");
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            var modal = document.getElementById("slipModal");
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    </script>
</body>
</html>
