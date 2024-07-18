<?php
include "connectDB.php";

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

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Details: <?php echo $productName; ?></title>
    <style>
        /* CSS เพิ่มเติมสำหรับรายละเอียดสินค้า */
        .product-details {
            border: 1px solid #ccc;
            padding: 16px;
            margin: 16px;
            display: flex;
            align-items: center;
            width: 600px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            flex-direction: column;
        }
        .product-details img {
            max-width: 200px;
            height: auto;
            margin-bottom: 16px;
        }
        .product-details .product-info {
            text-align: center;
        }
        .product-details .product-info h2 {
            font-size: 1.5em;
            margin: 0;
        }
        .product-details .product-info p {
            margin: 8px 0;
        }
        .product-details .product-info .price {
            font-size: 1.2em;
            color: #b12704;
        }
        .product-details .product-buttons {
            margin-top: 16px;
        }
        .product-details .product-buttons button {
            padding: 10px 20px;
            margin: 0 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Product Details: <?php echo $productName; ?></h1>

    <div class="product-details">
        <img src="<?php echo $image; ?>" alt="Product Image">
        <div class="product-info">
            <h2><?php echo $productName; ?></h2>
            <p class="price">ราคา: ฿<?php echo $price; ?></p>
            <p><?php echo $details; ?></p>
        </div>
        <div class="product-buttons">
            <button onclick="addToCart(<?php echo $productId; ?>)">เพิ่มเข้าตะกร้า</button>
            <button onclick="orderNow(<?php echo $productId; ?>)">สั่งซื้อ</button>
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
                        image: product.image // เพิ่มรูปภาพเข้าไปในข้อมูลสินค้า
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
