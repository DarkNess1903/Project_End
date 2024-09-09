<?php
session_start();
if (isset($_SESSION['cart'])) {
    // นับจำนวนประเภทสินค้าที่มีอยู่ในตะกร้า
    $cartCount = count($_SESSION['cart']);
    echo $cartCount;
} else {
    echo 0;
}
?>
