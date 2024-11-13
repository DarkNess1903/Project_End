<?php  
session_start();
include 'connectDB.php'; // เชื่อมต่อฐานข้อมูล
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="js/cart.js" defer></script>
    <title>Hantaphao Project</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .rounded-btn {
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;
            margin-top: 20px;
        }

        .rounded-btn:hover {
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    <script>
        function confirmCheckout() {
            const cartItems = document.querySelectorAll('.cart-item');
            if (cartItems.length === 0) {
                alert('ตะกร้าของคุณว่างเปล่า');
                window.location.href = 'products.php';
                return false;
            }
            return confirm('คุณแน่ใจหรือไม่ว่าต้องการดำเนินการสั่งซื้อ?');
        }
        function removeFromCart(productId) {
    // ลบ cart-item ออกจาก UI ทันที
    $(`.cart-item[data-product-id="${productId}"]`).remove(); // ลบ cart-item ที่เกี่ยวข้อง

    $.ajax({
        type: 'POST',
        url: 'removeItem.php', // ไฟล์ที่ทำการลบสินค้า
        data: { productId: productId },
        success: function(response) {
            if (response.success) {
                alert(response.message);
                // อัปเดต UI ของตะกร้า
                updateCartDisplay(); // เรียกใช้ฟังก์ชันเพื่อโหลดข้อมูลใหม่
            } else {
                alert(response.message);
            }
        },
        error: function() {
            alert("เกิดข้อผิดพลาดในการลบสินค้า");
        }
    });
}

function updateCartDisplay() {
    // ลบ cart-items ปัจจุบันออกจาก UI
    $('.cart-items').empty(); // ลบเนื้อหาทั้งหมดใน cart-items
    
    // โหลดข้อมูลใหม่จาก cart.php
    $.ajax({
        url: 'cart.php', // โหลดข้อมูลใหม่จาก cart.php
        type: 'GET',
        success: function(data) {
            // อัปเดต UI ของตะกร้า
            $('.cart-items').html($(data).find('.cart-items').html()); // แทรก cart-items ใหม่
            // อัปเดตยอดรวมถ้าจำเป็น
            updateCartTotal();
        },
        error: function() {
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้า");
        }
    });
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
                        // ตรวจสอบว่ามีสินค้าในสต๊อกหรือไม่
                        if ($product['stock'] <= 0) { // สมมุติว่ามี column ชื่อ 'stock'
                            echo "<script>alert('สินค้านี้หมดแล้ว'); window.location.href = window.location.href;</script>";
                            continue; // ข้ามไปยังสินค้าต่อไป
                        }

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
        <a href="index.html">
            <button class="btn btn-danger rounded-btn">กลับไปหน้าหลัก</button>
        </a>
    </div>
</body>
</html>
