<?php
include "connectDB.php";

// Get the data sent via POST
$data = json_decode(file_get_contents("php://input"));

// Prepare data for database insertion
$productName = $conn->real_escape_string($data->product);
$price = (float)$data->price;
$quantity = (int)$data->quantity;
$totalPrice = (float)$data->totalPrice;
$imagePath = $conn->real_escape_string($data->imagePath);

// Check product stock
$sql_check_stock = "SELECT stock FROM products WHERE product_name = ?";
$stmt_check_stock = $conn->prepare($sql_check_stock);
$stmt_check_stock->bind_param("s", $productName);
$stmt_check_stock->execute();
$stmt_check_stock->bind_result($stock);
$stmt_check_stock->fetch();
$stmt_check_stock->close();

if ($quantity > $stock) {
    echo json_encode(["error" => "Not enough stock available."]);
    $conn->close();
    exit();
}

// Check if the product already exists in the cart
$sql_check_cart = "SELECT quantity FROM cart WHERE product_name = ?";
$stmt_check_cart = $conn->prepare($sql_check_cart);
$stmt_check_cart->bind_param("s", $productName);
$stmt_check_cart->execute();
$stmt_check_cart->bind_result($existingQuantity);
$stmt_check_cart->fetch();
$stmt_check_cart->close();

if ($existingQuantity !== null) {
    // Update quantity if the product already exists in the cart
    $newQuantity = $existingQuantity + $quantity;
    
    if ($newQuantity > $stock) {
        echo json_encode(["error" => "Not enough stock available."]);
        $conn->close();
        exit();
    }
    
    $sql_update = "UPDATE cart SET quantity = ?, total_price = price * ? WHERE product_name = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("iis", $newQuantity, $newQuantity, $productName);

    if ($stmt_update->execute()) {
        echo json_encode(["message" => "Cart updated successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $stmt_update->error]);
    }
    
    $stmt_update->close();
} else {
    // Insert new product into the cart
    $stmt_insert = $conn->prepare("INSERT INTO cart (product_name, price, quantity, total_price, image_path) VALUES (?, ?, ?, ?, ?)");
    $stmt_insert->bind_param("sidis", $productName, $price, $quantity, $totalPrice, $imagePath);

    if ($stmt_insert->execute()) {
        echo json_encode(["message" => "Item added to cart successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $stmt_insert->error]);
    }
    
    $stmt_insert->close();
}

// Close the database connection
$conn->close();
?>
