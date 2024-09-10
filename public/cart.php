<?php  
  session_start();
  include 'connectDB.php'; // เชื่อมต่อฐานข้อมูล
  include 'topnavbar.php';
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <script src="js/cart.js" defer></script> <!-- ใช้ไฟล์ cart.js เพื่อจัดการตะกร้า -->
    <script>
        function confirmCheckout() {
            return confirm('คุณแน่ใจหรือไม่ว่าต้องการดำเนินการสั่งซื้อ?');
        }
    </script>
    <title>ตะกร้าสินค้า - Hantaphao Project</title>
</head>
<body class="cart-page">
    <div class="container cart-container">
        <h1 class="cart-title">ตะกร้าสินค้า</h1>
        <div class="cart-items">
            <?php
                if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
                    $total = 0;
                    foreach ($_SESSION['cart'] as $productId => $item) {
                        // ตรวจสอบว่า $item เป็น array และมี key 'quantity'
                        if (is_array($item) && isset($item['quantity'])) {
                            // ดึงข้อมูลจากฐานข้อมูล
                            $sql = "SELECT * FROM Products WHERE product_id = ?";
                            $stmt = $conn->prepare($sql);
                            $stmt->bind_param('i', $productId);
                            $stmt->execute();
                            $result = $stmt->get_result();
                            $product = $result->fetch_assoc();
                
                            if ($product) {
                                $itemPrice = $product['price'];
                                $itemTotalPrice = $itemPrice * $item['quantity'];
                                $total += $itemTotalPrice;
                
                                echo "<div class='cart-item'>";
                                echo "<img class='product-image' src='../Admin/product/".htmlspecialchars($product['image'])."' alt='Product Image' width='100' height='100'>";
                                echo "<span class='product-name'>".htmlspecialchars($product['product_name'])."</span><br>";
                                echo "<span class='product-price'>ราคา: ".htmlspecialchars($itemPrice)." บาท</span><br>";
                                echo "<span class='product-quantity'>จำนวน: <button class='quantity-button' onclick='changeQuantity($productId, -1)'>&ndash;</button> ".htmlspecialchars($item['quantity'])." <button class='quantity-button' onclick='changeQuantity($productId, 1)'>+</button></span><br>";
                                echo "<span class='item-total-price'>ราคารวม: ".htmlspecialchars($itemTotalPrice)." บาท</span><br>";
                                echo "<button class='remove-button' onclick='removeFromCart($productId)'>ลบ</button>";
                                echo "</div>";
                            } else {
                                echo "<p class='error-message'>ไม่พบสินค้าที่เลือก</p>";
                            }
                
                            $stmt->close();
                        } else {
                            echo "<p class='error-message'>ตะกร้าสินค้ามีข้อมูลผิดพลาด</p>";
                        }
                    }
                    echo "<div class='cart-total'>ยอดรวม: ".htmlspecialchars($total)." บาท</div>";
                } else {
                    echo "<p class='empty-cart-message'>ตะกร้าของคุณว่างเปล่า</p>";
                }     
                $conn->close();
            ?>
        </div>
        <a href="checkout.php" class="checkout-button" onclick="return confirmCheckout()">สั่งซื้อ</a>
    </div>
</body>
<?php include 'footer.php'; ?>
</html>
