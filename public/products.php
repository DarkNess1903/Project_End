<?php 
include "connectDB.php";
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="js/cart.js" defer></script> <!-- ใช้ไฟล์ cart.js เพื่อจัดการตะกร้า -->
    <title>Hantaphao Project</title>
    <link rel="stylesheet" href="css/stylenav.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
</head>
<style>

.product-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* แสดง 4 คอลัมน์ */
    gap: 30px; /* เพิ่มช่องว่างระหว่างสินค้า */
    justify-content: center;
    margin-bottom: 50px; /* เว้นระยะห่างจาก footer */
    padding-top: 100px; /* กำหนดระยะห่างจาก navbar */
}

.product-item {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 60px; /* เพิ่ม padding ในสินค้าแต่ละชิ้น */
    text-align: center;
    transition: transform 0.3s ease; /* เพิ่มการเคลื่อนไหวเล็กน้อยเมื่อ hover */
    margin-bottom:auto;
    margin: 10px;
}

.product-item:hover {
    transform: translateY(-5px); /* ยกขึ้นเมื่อ hover */
}

.product-item img {
    width: 150px;
    height: 150px;
    object-fit: cover;
}

.product-name {
    font-size: 18px;
    color: #333;
    margin-top: 10px;
    margin-bottom: 5px;
}

.action-buttons {
    margin-top: 10px;
}

.action-buttons button {
    background-color: #f0a500;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 5px;
}

.action-buttons button:hover {
    background-color: #e59800;
}

.action-buttons button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}


</style>
<body>
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
    <div class= "title"><h2 class="text-center">ผลิตภัณฑ์ของชุมชน</h2></div>
    <div class="container">
    
        <div class="product-grid" id="product-grid">
            
            <?php
                // ป้องกัน SQL Injection โดยใช้ Prepared Statements
                $stmt = $conn->prepare("SELECT * FROM Products");
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        // ใช้ htmlspecialchars เพื่อป้องกัน XSS
                        $productId = htmlspecialchars($row["product_id"]);
                        $productName = htmlspecialchars($row["product_name"]);
                        $productImage = htmlspecialchars($row["image"]);
                        $productPrice = htmlspecialchars($row["price"]);
                        $stockAvailable = isset($row["stock"]) ? intval($row["stock"]) : 0;

                        echo "<div class='product-item'>";
                        echo "<a href='productDetails.php?id=".$productId."'>";
                        echo "<img src='../Admin/product/".htmlspecialchars($productImage)."' alt='Product Image' width='150' height='150'>";
                        echo "</a><br>";
                        echo "<span class='product-name'>".$productName."</span><br>";
                        echo "<span>ราคา: ".$productPrice." บาท</span><br>";

                        echo "<div class='action-buttons'>";
                        if ($stockAvailable > 0) {
                            echo "<button onclick='addToCart(".$productId.")'>เพิ่มเข้าตะกร้า</button>";
                        } else {
                            echo "<button disabled>สินค้าหมด</button>";
                        }
                        echo "</div>";

                        echo "</div>";
                    }
                } else {
                    echo "<p>ไม่มีสินค้า</p>";
                }

                $stmt->close();
                $conn->close();
            ?>
        </div>
    </div>
</body>
<footer>
        <div class="contact">
            <div>
                <h4>ติดต่อเรา</h4>
                <p>123 หมู่ 4 ตำบลบ้านโฮ่ง อำเภอบ้านโฮ่ง จังหวัดลำพูน</p>
            </div>
            <div>
                <h4>เบอร์ติดต่อ</h4>
                <p>081-234-5678</p>
            </div>
            <div>
                <h4>Email</h4>
                <p>contact@hantaphao.com</p>
            </div>
            <div>
                <h4>สื่อสังคมออนไลน์</h4>
                <a href=""><img src="img/Facebook-icon.png" alt="fb Picture" width="60" height="60"></a>
                <a href=""><img src="img/line-icon.png" alt="line Picture" width="42" height="42" style="position: relative; top: -8px;"></a>
            </div>
        </div>
        <p>©2024 Hantaphao Projects All rights reserved.</p>
    </footer>
    <script>
        let slideIndex = 1;
        showSlides(slideIndex);

        function plusSlides(n) {
            showSlides(slideIndex += n);
        }

        function currentSlide(n) {
            showSlides(slideIndex = n);
        }

        function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("mySlides");
            let dots = document.getElementsByClassName("dot");
            if (n > slides.length) {slideIndex = 1}
            if (n < 1) {slideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            slides[slideIndex-1].style.display = "block";
            dots[slideIndex-1].className += " active";
            
        }
    </script>
    <script src="js/navscript1.js"></script>
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
</html>