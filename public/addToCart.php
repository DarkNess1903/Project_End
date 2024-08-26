<?php
session_start();
include '../connectDB.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = intval($_POST['productId']);
    
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = array();
    }

    if (array_key_exists($productId, $_SESSION['cart'])) {
        $_SESSION['cart'][$productId]['quantity']++;
    } else {
        $_SESSION['cart'][$productId] = array('quantity' => 1);
    }

    $response['success'] = true;
    $response['message'] = "สินค้าถูกเพิ่มลงในตะกร้าแล้ว!";
    echo json_encode($response);
}
?>
