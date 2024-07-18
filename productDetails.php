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
            // ฟังก์ชันสำหรับเพิ่มสินค้าลงในตะกร้า
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "cart.php", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    alert("เพิ่มสินค้าเข้าตะกร้าแล้ว!");
                }
            };
            xhr.send(JSON.stringify({ id: productId }));
        }

        function orderNow(productId) {
            // ฟังก์ชันสำหรับสั่งซื้อสินค้า
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "orderForm.php", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    alert("สั่งซื้อสินค้าสำเร็จ!");
                }
            };
            xhr.send(JSON.stringify({ id: productId }));
        }
    </script>
</body>
</html>
