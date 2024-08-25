<?php
// checkout.php
session_start();
include '../connectDB.php';

// ดึงข้อมูลตะกร้าสินค้า
$cart = isset($_SESSION['cart']) ? $_SESSION['cart'] : [];

if (empty($cart)) {
    echo 'ตะกร้าสินค้าของคุณว่างเปล่า!';
    exit();
}

$totalAmount = 0;
foreach ($cart as $item) {
    $totalAmount += $item['totalPrice'];
}

// ตรวจสอบว่ามีข้อมูลการติดต่อจากฟอร์มหรือไม่
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];

    // สร้าง orderId เป็นเอกลักษณ์
    $orderId = uniqid();
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Checkout</title>
    <script src="js/script.js"></script>
</head>
<body>
    <header>
        <!-- ใส่ Navbar ของคุณที่นี่ -->
    </header>

    <div class="checkout-container">
        <h1>ชำระเงิน</h1>

        <!-- ข้อมูลการติดต่อ -->
        <form method="POST" action="checkout.php">
            <h2>กรุณากรอกข้อมูลการติดต่อ</h2>
            <label for="name">ชื่อ:</label>
            <input type="text" id="name" name="name" required>
            <label for="email">อีเมล:</label>
            <input type="email" id="email" name="email" required>
            <label for="phone">โทรศัพท์:</label>
            <input type="text" id="phone" name="phone" required>
            <label for="address">ที่อยู่:</label>
            <textarea id="address" name="address" required></textarea>
            <button type="submit">ดำเนินการต่อ</button>
        </form>

        <?php if ($_SERVER['REQUEST_METHOD'] == 'POST'): ?>
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

                <!-- แสดงรายการสินค้าที่จะซื้อ -->
                <h2>รายการสินค้าที่จะซื้อ</h2>
                <ul class="product-list">
                    <?php foreach ($cart as $item): ?>
                        <li>
                            <img src="<?php echo $item['imagePath']; ?>" alt="Product Image" width="50px" height="50px">
                            <span><?php echo $item['product']; ?></span> -
                            <span><?php echo number_format($item['price'], 2); ?> บาท</span> -
                            <span><?php echo $item['quantity']; ?> ชิ้น</span>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <!-- ฟอร์มอัพโหลดสลิป -->
                <form id="upload-form" action="uploadSlip.php" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="totalAmount" value="<?php echo $totalAmount; ?>">
                    <input type="hidden" name="orderId" value="<?php echo $orderId; ?>">
                    <label for="slip">อัพโหลดสลิปการชำระเงิน:</label>
                    <input type="file" name="slip" id="slip" required>
                    <button type="submit">อัพโหลด</button>
                </form>
            </div>
        <?php endif; ?>
    </div>

    <footer>
        <!-- ใส่ Footer ของคุณที่นี่ -->
    </footer>
</body>
</html>
