<?php
// cartInsert.php

session_start();
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['product']) && isset($data['price']) && isset($data['quantity'])) {
    $cart = isset($_SESSION['cart']) ? $_SESSION['cart'] : [];

    $productId = $data['product'];
    if (isset($cart[$productId])) {
        $cart[$productId]['quantity'] += $data['quantity'];
        $cart[$productId]['totalPrice'] += $data['totalPrice'];
    } else {
        $cart[$productId] = $data;
    }

    $_SESSION['cart'] = $cart;
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>
