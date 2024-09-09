<?php
// getProduct.php

include 'connectDB.php';

$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;

$sql = "SELECT * FROM products WHERE id = $productId";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $product = $result->fetch_assoc();
    echo json_encode($product);
} else {
    echo json_encode(['error' => 'Product not found']);
}

$conn->close();
?>
