<?php
session_start();
include 'connectDB.php'; // เชื่อมต่อฐานข้อมูล

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = intval($_POST['productId']);

    // ดึงข้อมูลสินค้าจากฐานข้อมูล
    $sql = "SELECT * FROM Products WHERE product_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();
    $stmt->close();

    if ($product) {
        if (!isset($_SESSION['cart'][$productId])) {
            // เพิ่มสินค้าลงในตะกร้า พร้อมข้อมูลสินค้า
            $_SESSION['cart'][$productId] = [
                'product' => $product['product_name'],
                'price' => $product['price'],
                'quantity' => 1,
                'imagePath' => $product['image']
            ];
        } else {
            // ถ้าสินค้ามีอยู่แล้วในตะกร้า, เพิ่มจำนวน
            $_SESSION['cart'][$productId]['quantity'] += 1;
        }

        // ส่งการตอบกลับกลับไปยังฝั่งลูกค้า
        $response = ['success' => true, 'message' => 'สินค้าถูกเพิ่มลงในตะกร้าแล้ว!'];
    } else {
        $response = ['success' => false, 'message' => 'ไม่พบสินค้าที่เลือก'];
    }

    header('Content-Type: application/json');
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}
?>
