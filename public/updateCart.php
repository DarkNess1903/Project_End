<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ตรวจสอบและจัดการข้อมูลที่ได้รับ
    if (isset($_POST['productId']) && isset($_POST['change'])) {
        $productId = intval($_POST['productId']);
        $change = intval($_POST['change']);

        if (isset($_SESSION['cart']) && array_key_exists($productId, $_SESSION['cart'])) {
            $currentQuantity = $_SESSION['cart'][$productId]['quantity'];

            // ตรวจสอบราคาและดึงข้อมูลจากฐานข้อมูลถ้าจำเป็น
            if (!isset($_SESSION['cart'][$productId]['price'])) {
                $sql = "SELECT price FROM products WHERE product_id = ?";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param('i', $productId);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $product = $result->fetch_assoc();
                    $_SESSION['cart'][$productId]['price'] = $product['price'];
                    $stmt->close();
                } else {
                    $response['message'] = "เกิดข้อผิดพลาดในการเตรียมคำสั่ง SQL";
                    header('Content-Type: application/json');
                    echo json_encode($response, JSON_UNESCAPED_UNICODE);
                    exit();
                }
            }

            // อัพเดตตะกร้าสินค้า
            if ($currentQuantity + $change <= 0) {
                unset($_SESSION['cart'][$productId]);
                $response['success'] = true;
                $response['message'] = "สินค้าถูกลบออกจากตะกร้าแล้ว!";
            } else {
                $_SESSION['cart'][$productId]['quantity'] += $change;
                $_SESSION['cart'][$productId]['totalPrice'] = $_SESSION['cart'][$productId]['price'] * $_SESSION['cart'][$productId]['quantity'];
                $response['success'] = true;
                $response['message'] = "จำนวนสินค้าถูกอัพเดตเรียบร้อยแล้ว!";
            }
        } else {
            $response['message'] = "สินค้านี้ไม่มีในตะกร้า";
        }
    } else {
        $response['message'] = "ข้อมูลไม่ครบถ้วน";
    }
} else {
    $response['message'] = "คำขอไม่ถูกต้อง";
}

header('Content-Type: application/json');
echo json_encode($response, JSON_UNESCAPED_UNICODE); // ใช้ JSON_UNESCAPED_UNICODE เพื่อไม่ให้แปลงเป็น Unicode
?>
