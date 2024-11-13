<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/stylenav.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <script src="js/cart.js" defer></script> <!-- ใช้ไฟล์ cart.js เพื่อจัดการตะกร้า -->
</head>
<body>
<header>
<nav class="navbar">
        <div class="logo">
        <a href="index.html"><img src="img/Logo.png" alt="Logo" width="100px" height="100px"></a>
        </div>
        <div class="menu-toggle" id="mobile-menu">
            <i class="fas fa-bars"></i>
        </div>
        <ul class="nav-links" id="nav-links">
            <li><a href="#">ข้อมูลชุมชน </a></li>
            <li><a href="products.php">ผลิตภัณฑ์</a></li>
            <li><a href="check_order.php">เช็คออเดอร์</a></li>
            <li><a href="#">คำถามที่พบบ่อย</a></li>
        </ul>
        <div class="cart">
                <a href="cart.php" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cart-count">0</span> <!-- ตัวนับจำนวนสินค้าในตะกร้า -->
                </a>
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
