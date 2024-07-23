<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pay Form</title>
</head>
<body>

    <h1>Pay Form</h1>
    
    <div class="order-form">
        <div class="form-group bank-details">
            <div id="bank-details">
                <!-- ใส่รูปบัญชีธนาคาร -->
                <img src="QRcode.jpg" alt="Bank Account" width="200" height="200">
            </div>
            <label for="bank-details">เลขบัญชีธนาคาร : xxxxxxxxxx</label>
        </div>
        <form id="payment-form" action="orderInsert.php" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="name">ชื่อคนสั่ง:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="phone">เบอร์โทร:</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="address">ที่อยู่:</label>
                <textarea id="address" name="address" required></textarea>
            </div>
            <div class="form-group">
                <label for="slip">อัพโหลดภาพสลิปโอนเงิน:</label>
                <input type="file" id="slip" name="slip" accept="image/*" required>
            </div>

            <div id="items-container"> 
                <h2>รายการสินค้าที่จะสั่งซื้อ</h2>
                <!-- Items will be displayed here by JavaScript -->
                <?php
        if(isset($_POST['productId'])) {
            $productId = $_POST['productId'];

            include "connectDB.php";

            // Query ข้อมูลสินค้าจากฐานข้อมูล
            $sql = "SELECT * FROM products WHERE id = $productId";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $productName = $row["product_name"];
                $price = $row["price"];

                // แสดงข้อมูลรายการสินค้าที่จะสั่งซื้อ
                echo "<div class='product-item'>";
                echo "<span>สินค้า:</span><span>$productName</span>";
                echo "</div>";
                echo "<div class='product-item'>";
                echo "<span>ราคา:</span><span>฿$price</span>";
                echo "</div>";
            } else {
                echo "<p>ไม่พบข้อมูลสินค้า</p>";
            }

            $conn->close();
        } else {
            echo "<p>ไม่พบข้อมูลสินค้าที่จะสั่งซื้อ</p>";
        }
        ?>
            </div>

            <button type="submit">ส่งข้อมูล</button>
        </form>
    </div>

    <script>
    // Retrieve the items from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productData = JSON.parse(decodeURIComponent(urlParams.get('productData')));

    // Display the product data in the items container
    const itemsContainer = document.getElementById('items-container');
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
        <p>ชื่อสินค้า: ${productData.product_name}</p>
        <p>ราคา: ${productData.price} บาท</p>
        <p>จำนวน: ${productData.quantity}</p>
        <p>ราคารวม: ${productData.totalPrice} บาท</p>
        <hr>
    `;
    itemsContainer.appendChild(itemDiv);
</script>

