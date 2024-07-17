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
                <img src="bank-image.jpg" alt="Bank Account" width="200" height="200">
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
                <?php
                // เชื่อมต่อฐานข้อมูล
                include 'connectDB.php';

                // คำสั่ง SQL เพื่อดึงข้อมูลสินค้า
                $sql = "SELECT * FROM cart";
                $result = $conn->query($sql);

                // แสดงผลข้อมูล
                if ($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        echo "<p>ชื่อสินค้า: " . $row["product_name"] . "</p>";
                        echo "<p>ราคา: " . $row["price"] . " บาท</p>";
                        echo "<p>จำนวน: " . $row["quantity"] . "</p>";
                        echo "<p>ราคารวม: " . $row["total_price"] . " บาท</p>";
                        echo "<hr>";
                    }
                } else {
                    echo "ไม่พบสินค้าในตะกร้า";
                }

                // ปิดการเชื่อมต่อ
                $conn->close();
                ?>
            </div>

            <button type="submit">ส่งข้อมูล</button>
        </form>
    </div>

</body>
</html>
