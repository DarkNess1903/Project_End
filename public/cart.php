<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ตะกร้าสินค้า - Hantaphao Project</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="js/cart.js" defer></script> <!-- ลิงก์ไปยังไฟล์ JavaScript -->
</head>
<body>
    <?php include 'topnavbar.php'; ?>

    <div class="container">
        <h1>ตะกร้าสินค้า</h1>
        <div class="cart-items">
            <?php
                session_start();
                include '../connectDB.php'; // เชื่อมต่อฐานข้อมูล

                if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
                    $total = 0;
                    foreach ($_SESSION['cart'] as $productId => $item) {
                        $sql = "SELECT * FROM products WHERE id = ?";
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param('i', $productId);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        $product = $result->fetch_assoc();

                        $itemPrice = $product['price'];
                        $itemTotalPrice = $itemPrice * $item['quantity'];
                        $total += $itemTotalPrice;

                        echo "<div class='cart-item'>";
                        echo "<img src='".$product['image']."' alt='Product Image' width='100' height='100'>";
                        echo "<span>".$product['product_name']."</span><br>";
                        echo "<span>ราคา: ".$itemPrice." บาท</span><br>";
                        echo "<span>จำนวน: <button onclick='changeQuantity($productId, -1)'>&ndash;</button> ".$item['quantity']." <button onclick='changeQuantity($productId, 1)'>+</button></span><br>";
                        echo "<span>ราคารวม: ".$itemTotalPrice." บาท</span><br>";
                        echo "<button onclick='removeFromCart($productId)'>ลบ</button>";
                        echo "</div>";

                        $stmt->close();
                    }
                    echo "<div class='cart-total'>ยอดรวม: ".$total." บาท</div>";
                } else {
                    echo "<p>ตะกร้าของคุณว่างเปล่า</p>";
                }
                $conn->close();
            ?>
        </div>
        <a href="checkout.php" class="checkout-button">ไปที่ชำระเงิน</a>
    </div>

    <?php include 'footer.php'; ?>
</body>
</html>
