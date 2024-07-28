<?php
include "connectDB.php";

// Get the data sent via POST
$data = json_decode(file_get_contents("php://input"));

// Prepare data for database insertion
$name = $conn->real_escape_string($data->product);
$price = (float)$data->price;
$quantity = (int)$data->quantity;
$totalPrice = (float)$data->totalPrice;
$imagePath = $conn->real_escape_string($data->imagePath); // รับพาธรูปภาพ

// Prepare an SQL statement
$stmt = $conn->prepare("INSERT INTO cart (product_name, price, quantity, total_price, image_path) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sidis", $name, $price, $quantity, $totalPrice, $imagePath);

if ($stmt->execute()) {
    echo json_encode(["message" => "Item added to cart successfully"]);
} else {
    echo json_encode(["error" => "Error: " . $stmt->error]);
}

// Close the statement and the database connection
$stmt->close();
$conn->close();
?>
