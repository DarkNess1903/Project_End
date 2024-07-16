<?php
include "connectDB.php";

// Get the data sent via POST
$data = json_decode(file_get_contents("php://input"));

// Prepare data for database insertion
$name = $conn->real_escape_string($data->product);
$price = (float)$data->price;
$quantity = (int)$data->quantity;
$totalPrice = (float)$data->totalPrice;

// Insert data into the cart table
$sql = "INSERT INTO cart (product_name, price, quantity, total_price) VALUES ('$name', $price, $quantity, $totalPrice)";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Item added to cart successfully"]);
} else {
    echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
}

// Close the database connection
$conn->close();
?>
