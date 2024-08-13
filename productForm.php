<head>
    <title>Hantaphao Project</title>
</head>
<body>
    <div id="navbar">Navbar Content</div>

    <div class="container">
        <!-- Product Grid -->
        <div class="product-grid" id="product-grid">
        <?php
            include "connectDB.php";
            include 'topnavbar.php';

            // Query to retrieve products
            $sql = "SELECT * FROM products";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    echo "<div class='product-item'>";
                    echo "<a href='productDetails.php?id=".$row["id"]."'><img src='".$row["image"]."' alt='Product Image' width='150px' height='150px'></a><br>";
                    echo "<span class='product-name'>".$row["product_name"]."</span><br>";
                    echo "<span>ราคา: ".$row["price"]." บาท</span><br>";
                    echo "<div class='action-buttons'>";
                    if ($row["stock"] > 0) {
                        echo "<button onclick='addToCart(".$row["id"].")'>เพิ่มเข้าตะกร้า</button>";
                    } else {
                        echo "<button disabled>สินค้าหมด</button>"; // ปิดการใช้งานปุ่มหากสินค้าในสต็อกหมด
                    }
                    echo "</div>";

                    echo "</div>";
                }
            } else {
                echo "<p>ไม่มีสินค้า</p>";
            }

            $conn->close();
?>

        </div>
    </div>

    <form id="checkout-form" action="orderForm.php" method="POST">
        <input type="hidden" name="cartData" id="cartData">
    </form>

    <script src="js/script.js"></script>

    <div id="footer">Footer Content</div>
</body>
</html>

<script>
    function addToCart(productId) {
        // ดึงข้อมูลสินค้าจากฐานข้อมูลโดยใช้ AJAX
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "getProduct.php?id=" + productId, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var product = JSON.parse(xhr.responseText);

                // ข้อมูลสินค้าที่จะเพิ่มเข้าตะกร้า
                var productData = {
                    product: product.product_name,
                    price: product.price,
                    quantity: 1,
                    totalPrice: product.price,
                    imagePath: product.image // เพิ่มพาธรูปภาพ
                };

                // ส่งข้อมูลผ่าน AJAX ไปยังไฟล์ PHP เพื่อบันทึกลงฐานข้อมูล
                var xhrAdd = new XMLHttpRequest();
                xhrAdd.open("POST", "cartInsert.php", true);
                xhrAdd.setRequestHeader("Content-Type", "application/json");
                xhrAdd.onreadystatechange = function () {
                    if (xhrAdd.readyState === 4 && xhrAdd.status === 200) {
                        console.log(xhrAdd.responseText); // แสดงผลลัพธ์ที่ได้จากการบันทึก
                    }
                };
                xhrAdd.send(JSON.stringify(productData));
            }
        };
        xhr.send();
    }
</script>
