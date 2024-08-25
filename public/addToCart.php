// addToCart.php
<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = intval($_POST['productId']);
    
    // ตรวจสอบว่ามีการสร้างตะกร้าหรือไม่
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = array();
    }

    // เพิ่มสินค้าลงในตะกร้า
    if (array_key_exists($productId, $_SESSION['cart'])) {
        $_SESSION['cart'][$productId]++;
    } else {
        $_SESSION['cart'][$productId] = 1;
    }

    echo "สินค้าถูกเพิ่มลงในตะกร้าแล้ว!";
}
?>
