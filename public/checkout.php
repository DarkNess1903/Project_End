<?php
session_start();
include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล

// ตรวจสอบว่ามีตะกร้าสินค้าใน session หรือไม่ ถ้าไม่มีให้สร้างใหม่
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// ดึงข้อมูลตะกร้าสินค้า
$cart = isset($_SESSION['cart']) ? $_SESSION['cart'] : [];

if (empty($cart)) {
    echo 'ตะกร้าสินค้าของคุณว่างเปล่า!';
    exit();
}

// คำนวณยอดรวมสินค้าในตะกร้า
$totalAmount = 0;
foreach ($cart as $item) {
    if (!isset($item['price']) || !isset($item['quantity'])) {
        echo 'ข้อมูลไม่สมบูรณ์สำหรับสินค้าบางรายการ';
        continue;
    }
    $totalAmount += $item['price'] * $item['quantity'];
}

// ตรวจสอบว่ามีการส่งข้อมูล POST เพื่อบันทึกข้อมูลการชำระเงินและการติดต่อ
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['name'], $_POST['email'], $_POST['phone'], $_POST['address'])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $address = $_POST['address'];

        // การอัปโหลดสลิป
        if (isset($_FILES['slip']) && $_FILES['slip']['error'] == 0) {
            $uploadDir = '../admin/uploads/';
            $uploadFile = $uploadDir . basename($_FILES['slip']['name']);
            
            if (move_uploaded_file($_FILES['slip']['tmp_name'], $uploadFile)) {
                $slipImage = $_FILES['slip']['name'];
            } else {
                echo 'การอัปโหลดสลิปล้มเหลว';
                exit();
            }
        } else {
            echo 'กรุณาอัปโหลดสลิปการชำระเงิน';
            exit();
        }

        // เพิ่มข้อมูลการสั่งซื้อและข้อมูลการติดต่อลงในฐานข้อมูล
        $stmt = $conn->prepare("INSERT INTO orders (order_date, total_amount, customer_name, customer_email, customer_phone, customer_address, status) VALUES (NOW(), ?, ?, ?, ?, ?, 'Pending')");
        $stmt->bind_param('dssss', $totalAmount, $name, $email, $phone, $address);
        $stmt->execute();
        $orderId = $stmt->insert_id; // ดึง ID ของคำสั่งซื้อที่เพิ่งสร้าง

        // ตรวจสอบว่าการเพิ่มข้อมูลในตาราง orders สำเร็จ
        if ($orderId) {
            // บันทึกสินค้าลงในตาราง order_details
            foreach ($cart as $productId => $item) {
                if (isset($item['price']) && isset($item['quantity'])) {
                    $price = $item['price'];
                    $quantity = $item['quantity'];
                    
                    // ตรวจสอบการเตรียมข้อมูล
                    $stmt = $conn->prepare("INSERT INTO order_details (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)");
                    if ($stmt === false) {
                        die('Error preparing statement: ' . $conn->error);
                    }
                    $stmt->bind_param('iidi', $orderId, $productId, $price, $quantity);
                    $stmt->execute();
                    
                    // ตรวจสอบข้อผิดพลาดหลังการ execute
                    if ($stmt->error) {
                        die('Error executing statement: ' . $stmt->error);
                    }
                }
            }

            // บันทึกข้อมูลการชำระเงินลงในตาราง payments
            $stmt = $conn->prepare("INSERT INTO payments (order_id, payment_date, amount, payment_status, slip_image) VALUES (?, NOW(), ?, 'Pending', ?)");
            $stmt->bind_param('ids', $orderId, $totalAmount, $slipImage);
            $stmt->execute();

            // เคลียร์ตะกร้าสินค้า
            unset($_SESSION['cart']);

            // เปลี่ยนเส้นทางไปยังหน้าขอบคุณ
            header("Location: thank_you.php?orderId=" . $orderId);
            exit();
        } else {
            echo 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลการสั่งซื้อ';
        }
    }
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
    <title>Checkout</title>
    <script src="js/script.js"></script> <!-- ลิงก์ไปยังไฟล์ JS ของคุณ -->
</head>
<body>
    <header>
        <!-- ใส่ Navbar ของคุณที่นี่ -->
    </header>

    <div class="checkout-container">
        <h1>ชำระเงิน</h1>

        <!-- แสดงรายการสินค้าที่อยู่ในตะกร้า -->
        <h2>รายการสินค้าที่อยู่ในตะกร้าของคุณ</h2>
        <ul class="product-list">
            <?php foreach ($cart as $item): ?>
                <?php
                // คำนวณราคารวมของแต่ละรายการ
                $totalPrice = $item['price'] * $item['quantity'];
                ?>
                <li>
                    <img src="<?php echo htmlspecialchars($item['imagePath']); ?>" alt="Product Image" width="50px" height="50px">
                    <span><?php echo htmlspecialchars($item['product']); ?></span> -
                    <span><?php echo number_format($item['price'], 2); ?> บาท</span> -
                    <span><?php echo htmlspecialchars($item['quantity']); ?> ชิ้น</span> -
                    <span>ราคารวม: <?php echo number_format($totalPrice, 2); ?> บาท</span>
                </li>
            <?php endforeach; ?>
        </ul>

        <!-- ข้อมูลการชำระเงิน -->
        <div class="payment-info">
            <h2>ยอดรวมที่ต้องชำระ: <?php echo number_format($totalAmount, 2); ?> บาท</h2>
            <p>กรุณาทำการโอนเงินไปที่บัญชีต่อไปนี้:</p>
            <p>บัญชีธนาคาร: ธนาคาร ABC</p>
            <p>เลขที่บัญชี: 123-456-7890</p>
            <p>ชื่อบัญชี: บริษัท XYZ จำกัด</p>

            <!-- QR Code -->
            <div class="qr-code">
                <img src="path_to_qr_code_image/qr_code.png" alt="QR Code">
                <p>สแกน QR Code เพื่อทำการโอนเงิน</p>
            </div>

            <!-- ฟอร์มอัปโหลดสลิป -->
            <form method="POST" action="checkout.php" enctype="multipart/form-data">
                <h2>กรุณากรอกข้อมูลการติดต่อ</h2>
                <label for="name">ชื่อ:</label>
                <input type="text" id="name" name="name" required>
                <label for="email">อีเมล:</label>
                <input type="email" id="email" name="email" required>
                <label for="phone">โทรศัพท์:</label>
                <input type="text" id="phone" name="phone" required>
                <label for="address">ที่อยู่:</label>
                <textarea id="address" name="address" required></textarea>
                <label for="slip">อัปโหลดสลิปการชำระเงิน:</label>
                <input type="file" id="slip" name="slip" required>
                <button type="submit">ดำเนินการต่อ</button>
            </form>
        </div>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>
</body>
</html>
