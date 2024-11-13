<?php
session_start();
include 'connectDB.php';

$response = [];

if (isset($_POST['productId'])) {
    $product_id = intval($_POST['productId']);

    // ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
    if (isset($_SESSION['cart'][$product_id])) {
        $quantity_to_remove = $_SESSION['cart'][$product_id]['quantity'];

        // อัปเดตสต็อกสินค้า
        $update_stock_query = "UPDATE Products SET stock = stock + ? WHERE product_id = ?";
        $stmt = $conn->prepare($update_stock_query);
        $stmt->bind_param('ii', $quantity_to_remove, $product_id);
        $stmt->execute();

        // ลบสินค้าจากตะกร้า
        unset($_SESSION['cart'][$product_id]);

        $response['success'] = true;
        $response['message'] = 'ลบสินค้าสำเร็จ';
    } else {
        $response['success'] = false;
        $response['message'] = 'ไม่พบสินค้าที่จะลบ';
    }
} else {
    $response['success'] = false;
    $response['message'] = 'ข้อมูลไม่ถูกต้อง';
}

// คำนวณยอดรวมใหม่
$total = 0;
if (isset($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $item) {
        $total += $item['price'] * $item['quantity'];
    }
}

$response['total'] = $total;

// ส่งผลลัพธ์กลับ
echo json_encode($response);
$conn->close();
?>
