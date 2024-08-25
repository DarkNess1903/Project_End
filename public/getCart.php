// getCart.php
<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
    $cart = $_SESSION['cart'];
    foreach ($cart as $productId => $quantity) {
        $sql = "SELECT * FROM products WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $productId);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_assoc();

        echo "<div class='cart-item'>";
        echo "<img src='" . $product['image'] . "' alt='Product Image' width='100px' height='100px'>";
        echo "<span class='product-name'>" . $product['product_name'] . "</span>";
        echo "<span class='product-quantity'>จำนวน: " . $quantity . "</span>";
        echo "<span class='product-price'>ราคา: " . ($product['price'] * $quantity) . " บาท</span>";
        echo "<button onclick='removeFromCart(" . $productId . ")'>ลบ</button>";
        echo "</div>";

        $stmt->close();
    }
} else {
    echo "<p>ตะกร้าสินค้าว่าง</p>";
}

$conn->close();
?>
