<?php
// cartInsert.php

session_start();
$data = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบว่ามีการส่งข้อมูลสินค้าที่จำเป็นมาครบถ้วน
if (isset($data['product']) && isset($data['price']) && isset($data['quantity'])) {
    // ดึงตะกร้าจาก session ถ้าไม่มีให้สร้างเป็น array เปล่า
    $cart = isset($_SESSION['cart']) ? $_SESSION['cart'] : [];

    $productId = $data['product'];
    $price = floatval($data['price']);
    $quantity = intval($data['quantity']);
    $totalPrice = $price * $quantity;

    if (isset($cart[$productId])) {
        // ถ้าสินค้ามีอยู่ในตะกร้าแล้ว เพิ่มจำนวนและราคาต่อสินค้า
        $cart[$productId]['quantity'] += $quantity;
        $cart[$productId]['totalPrice'] += $totalPrice; // เพิ่มราคาสำหรับสินค้าชิ้นนี้
    } else {
        // ถ้ายังไม่มีสินค้านี้ในตะกร้า ให้เพิ่มข้อมูลใหม่
        $cart[$productId] = [
            'product' => $productId,
            'price' => $price,
            'quantity' => $quantity,
            'totalPrice' => $totalPrice // กำหนดราคาเริ่มต้น
        ];
    }

    // อัปเดตตะกร้าใน session
    $_SESSION['cart'] = $cart;

    // ส่งข้อมูลกลับเป็น JSON
    echo json_encode(['status' => 'success', 'cart' => $cart]);
} else {
    // ถ้าข้อมูลไม่ถูกต้อง ส่งข้อความแสดงข้อผิดพลาดกลับ
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>
