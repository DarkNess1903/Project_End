<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = intval($_POST['productId']);
    $change = intval($_POST['change']);

    // ตรวจสอบว่ามีการสร้างตะกร้าหรือไม่
    if (isset($_SESSION['cart']) && array_key_exists($productId, $_SESSION['cart'])) {
        if ($_SESSION['cart'][$productId]['quantity'] + $change <= 0) {
            // ถ้าจำนวนสินค้าน้อยกว่าหรือเท่ากับ 0 ให้ลบสินค้าออกจากตะกร้า
            unset($_SESSION['cart'][$productId]);
            echo "สินค้าถูกลบออกจากตะกร้าแล้ว!";
        } else {
            // ปรับจำนวนสินค้าในตะกร้า
            $_SESSION['cart'][$productId]['quantity'] += $change;
            $_SESSION['cart'][$productId]['totalPrice'] = $_SESSION['cart'][$productId]['price'] * $_SESSION['cart'][$productId]['quantity'];
            echo "จำนวนสินค้าถูกอัพเดตเรียบร้อยแล้ว!";
        }
    } else {
        echo "สินค้านี้ไม่มีในตะกร้า";
    }
}
?>
