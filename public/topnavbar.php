<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <script src="js/script.js" defer></script>
    <script src="js/cart.js" defer></script>

</head>
<body>
    <div class="navbar">
        <div class="navbar-container">
            <!-- Logo -->
            <div class="logo">
                <a href="index.php">
                    <img src="path_to_your_logo_image/logo.png" alt="Your Logo" width="150">
                </a>
            </div>

            <!-- Navigation Links -->
            <ul class="nav-links">
                <li><a href="index.php">หน้าหลัก</a></li>
                <li><a href="products.php">สินค้า</a></li>
                <li><a href="about.php">เกี่ยวกับเรา</a></li>
                <li><a href="contact.php">ติดต่อเรา</a></li>
            </ul>

            <!-- Search Bar -->
            <div class="search-bar">
                <form action="search.php" method="GET">
                    <input type="text" name="query" placeholder="ค้นหาสินค้า...">
                    <button type="submit"><i class="fas fa-search"></i></button>
                </form>
            </div>

            <!-- User & Cart Icons -->
            <div class="navbar-icons">
                <a href="cart.php" class="cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span> <!-- ตัวนับจำนวนสินค้าในตะกร้า -->
                </a>
                <a href="profile.php" class="user-icon">
                    <i class="fas fa-user"></i>
                </a>
            </div>
        </div>
    </div>
</body>
</html>
