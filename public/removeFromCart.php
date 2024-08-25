<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = intval($_POST['productId']);

    // ตรวจสอบว่ามีการสร้างตะกร้าหรือไม่
    if (isset($_SESSION['cart']) && array_key_exists($productId, $_SESSION['cart'])) {
        unset($_SESSION['cart'][$productId]);
        echo "สินค้าถูกลบออกจากตะกร้าแล้ว!";
    } else {
        echo "สินค้านี้ไม่มีในตะกร้า";
    }
}
?>
