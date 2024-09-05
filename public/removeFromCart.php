<?php
session_start();
include '../connectDB.php'; // ใช้เส้นทางที่ถูกต้อง

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['productId'])) {
        $productId = intval($_POST['productId']);

        // ตรวจสอบว่ามีการสร้างตะกร้าหรือไม่
        if (isset($_SESSION['cart']) && array_key_exists($productId, $_SESSION['cart'])) {
            unset($_SESSION['cart'][$productId]);
            $response['success'] = true;
            $response['message'] = "สินค้าถูกลบออกจากตะกร้าแล้ว!";
        } else {
            $response['message'] = "สินค้านี้ไม่มีในตะกร้า";
        }
    } else {
        $response['message'] = "ข้อมูลสินค้าไม่ถูกต้อง";
    }
} else {
    $response['message'] = "คำขอไม่ถูกต้อง";
}

header('Content-Type: application/json');
echo json_encode($response, JSON_UNESCAPED_UNICODE); // ใช้ JSON_UNESCAPED_UNICODE เพื่อไม่ให้แปลงเป็น Unicode
?>
