<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>สินค้า - Hantaphao Project</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/cart.js" defer></script>
</head>
<body>
    <?php include 'topnavbar.php'; ?>

    <div class="container">
        <h1>รายการสินค้า</h1>
        <div class="product-grid" id="product-grid">
            <?php
                include "../connectDB.php";

                $sql = "SELECT * FROM products";
                $result = $conn->query($sql);

                if ($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        echo "<div class='product-item'>";
                        echo "<a href='productDetails.php?id=".$row["id"]."'><img src='".$row["image"]."' alt='Product Image' width='150' height='150'></a><br>";
                        echo "<span class='product-name'>".$row["product_name"]."</span><br>";
                        echo "<span>ราคา: ".$row["price"]." บาท</span><br>";

                        $stockAvailable = isset($row["stock"]) ? $row["stock"] : 0;

                        echo "<div class='action-buttons'>";
                        if ($stockAvailable > 0) {
                            echo "<button onclick='addToCart(".$row["id"].")'>เพิ่มเข้าตะกร้า</button>";
                        } else {
                            echo "<button disabled>สินค้าหมด</button>";
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

    <?php include 'footer.php'; ?>
</body>
</html>
