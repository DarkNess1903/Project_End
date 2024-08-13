<?php
include "connectDB.php";
include 'topnavbar.php';

// ตรวจสอบว่ามีการส่งพารามิเตอร์ id ผ่าน URL หรือไม่
if(isset($_GET['id'])) {
    $productId = $_GET['id'];

    // Query ข้อมูลสินค้าจากฐานข้อมูล
    $sql = "SELECT * FROM products WHERE id = $productId";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $productName = $row["product_name"];
        $price = $row["price"];
        $image = $row["image"];
        $details = $row["details"];
        $stock = $row["stock"]; // เพิ่มการดึงค่าของสต็อก
    } else {
        echo "ไม่พบสินค้าที่คุณเลือก";
        exit;
    }
} else {
    echo "ไม่พบรหัสสินค้า";
    exit;
}

$conn->close();
?>

<head>
    <title>Product Details: <?php echo $productName; ?></title>
</head>
<body>
    <h1>Product Details: <?php echo $productName; ?></h1>

    <div class="product-details">
        <img src="<?php echo $image; ?>" alt="Product Image">
        <div class="product-info">
            <h2><?php echo $productName; ?></h2>
            <p class="price">ราคา: ฿<?php echo $price; ?></p>
            <p><?php echo $details; ?></p>
            <p class="stock">จำนวนที่เหลือ: <?php echo $stock; ?> ชิ้น</p>
        </div>
        <div class="product-buttons">
            <?php if ($stock > 0): ?>
                <button onclick="addToCart(<?php echo $productId; ?>)">เพิ่มเข้าตะกร้า</button>
                <button onclick="orderNow(<?php echo $productId; ?>)">สั่งซื้อ</button>
            <?php else: ?>
                <button disabled>สินค้าหมด</button>
            <?php endif; ?>
        </div>
    </div>

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
                        product_name: product.product_name,
                        imagePath: product.image // เพิ่มรูปภาพเข้าไปในข้อมูลสินค้า
                    };

                    // ส่งข้อมูลผ่าน AJAX ไปยังไฟล์ PHP เพื่อบันทึกลงฐานข้อมูล
                    var xhrAdd = new XMLHttpRequest();
                    xhrAdd.open("POST", "cartInsert.php", true);
                    xhrAdd.setRequestHeader("Content-Type", "application/json");
                    xhrAdd.onreadystatechange = function () {
                        if (xhrAdd.readyState === 4 && xhrAdd.status === 200) {
                            console.log(xhrAdd.responseText); // แสดงผลลัพธ์ที่ได้จากการบันทึก
                            alert("เพิ่มสินค้าเข้าตะกร้าแล้ว!");
                        }
                    };
                    xhrAdd.send(JSON.stringify(productData));
                }
            };
            xhr.send();
        }

        function orderNow(productId) {
            // ส่งข้อมูลไปยังหน้า orderForm.php
            var form = document.createElement("form");
            form.setAttribute("method", "post");
            form.setAttribute("action", "orderForm.php");

            var hiddenFieldId = document.createElement("input");
            hiddenFieldId.setAttribute("type", "hidden");
            hiddenFieldId.setAttribute("name", "productId");
            hiddenFieldId.setAttribute("value", productId);

            form.appendChild(hiddenFieldId);

            document.body.appendChild(form);
            form.submit();
        }
    </script>
</body>
</html>
