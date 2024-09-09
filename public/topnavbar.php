<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <script src="js/cart.js" defer></script> <!-- ใช้ไฟล์ cart.js เพื่อจัดการตะกร้า -->
</head>
<body>
<header>
    <nav class="navbar">
        <div class="navbar-container">
            <!-- Logo -->
            <div class="logo">
                <a href="index.php">
                    <img src="images/logo.png" alt="Your Logo" width="150"> <!-- แก้ไขลิงก์ภาพโลโก้ -->
                </a>
            </div>

            <!-- Navigation Links -->
            <ul class="nav-links">
                <li><a href="index.php">หน้าหลัก</a></li>
                <li><a href="products.php">สินค้า</a></li>
                <li><a href="check_order.php">เช็คออเดอร์</a></li>
                <li><a href="#">เกี่ยวกับเรา</a></li>
                <li><a href="#">ติดต่อเรา</a></li>
            </ul>

            <!-- User & Cart Icons -->
            <div class="navbar-icons">
                <a href="cart.php" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cart-count">0</span> <!-- ตัวนับจำนวนสินค้าในตะกร้า -->
                </a>
            </div>
        </div>
    </nav>
</header>

<script>
    // ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้า
    function updateCartCount() {
        fetch('cartItemCount.php')  // เรียกไปยังไฟล์ PHP ที่คืนค่าจำนวนสินค้าที่อยู่ในตะกร้า
            .then(response => response.json())
            .then(data => {
                document.getElementById('cart-count').textContent = data.cartCount; // อัปเดตจำนวนในตะกร้า
            })
            .catch(error => console.error('Error:', error));
    }

    // เรียกใช้งานฟังก์ชันเพื่ออัปเดตจำนวนตะกร้าเมื่อโหลดหน้าเว็บ
    document.addEventListener('DOMContentLoaded', updateCartCount);
</script>

</body>
</html>
