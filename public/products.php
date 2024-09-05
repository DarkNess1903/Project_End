<?php 
include 'topnavbar.php'; 
include "../connectDB.php";
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>สินค้า - Hantaphao Project</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> <!-- ลิงก์ไปยังไฟล์ CSS ของคุณ -->
    <script src="js/cart.js" defer></script> <!-- ใช้ไฟล์ cart.js เพื่อจัดการตะกร้า -->
</head>
<body>
    <div class="container">
        <h1>รายการสินค้า</h1>
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
                        echo "<img src='".htmlspecialchars($productImage)."' alt='Product Image' width='150' height='150'>";
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
<?php include 'footer.php'; ?>
</html>
