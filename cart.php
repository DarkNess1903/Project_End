<?php
// Connect to MySQL database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "order_management";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to update quantity in cart
if (isset($_POST['updateQuantity'])) {
    $id = $_POST['id'];
    $newQuantity = $_POST['newQuantity'];

    $sql_update = "UPDATE cart SET quantity = $newQuantity WHERE id = $id";
    if ($conn->query($sql_update) === TRUE) {
        echo "Updated quantity successfully.";
    } else {
        echo "Error updating quantity: " . $conn->error;
    }
}

// Function to remove item from cart
if (isset($_POST['removeItem'])) {
    $id = $_POST['id'];

    $sql_remove = "DELETE FROM cart WHERE id = $id";
    if ($conn->query($sql_remove) === TRUE) {
        echo "Removed item successfully.";
    } else {
        echo "Error removing item: " . $conn->error;
    }
}

// Function to handle checkout
if (isset($_POST['checkout'])) {
    $selectedItems = $_POST['selectedItems'];
    if (!empty($selectedItems)) {
        foreach ($selectedItems as $itemId) {
            // Process each selected item (e.g., mark as purchased, move to another table, etc.)
            // For demonstration, we will just remove it from the cart
            $sql_checkout = "DELETE FROM cart WHERE id = $itemId";
            $conn->query($sql_checkout);
        }
        echo "Checked out successfully.";
    } else {
        echo "No items selected for checkout.";
    }
}

// Query to retrieve cart items
$sql = "SELECT * FROM cart";
$result = $conn->query($sql);

// Calculate total price
$totalPrice = 0;

// Check if there are results
if ($result->num_rows > 0) {
    echo "<h2>ตะกร้าสินค้า</h2>";
    echo "<form method='POST'>";
    echo "<table border='1'>";
    echo "<tr><th><input type='checkbox' id='select-all'> เลือกทั้งหมด</th><th>ชื่อสินค้า</th><th>ราคา</th><th>จำนวน</th><th>ราคารวม</th><th>แก้ไข</th></tr>";
    
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td><input type='checkbox' class='item-checkbox' name='selectedItems[]' value='".$row["id"]."'></td>";
        echo "<td>".$row["product_name"]."</td>";
        echo "<td>".$row["price"]."</td>";
        echo "<td>";
        echo "<form method='POST'>";
        echo "<input type='hidden' name='id' value='".$row["id"]."'>";
        echo "<input type='hidden' name='currentQuantity' value='".$row["quantity"]."'>";
        echo "<button type='submit' name='decrementQuantity' value='".$row["quantity"]."'>-</button>";
        echo " " . $row["quantity"] . " ";
        echo "<button type='submit' name='incrementQuantity' value='".$row["quantity"]."'>+</button>";
        echo "</form>";
        echo "</td>";
        echo "<td>".$row["total_price"]."</td>";
        echo "<td>";
        echo "<form method='POST'>";
        echo "<input type='hidden' name='id' value='".$row["id"]."'>";
        echo "<button type='submit' name='removeItem'>Remove</button>";
        echo "</form>";
        echo "</td>";
        echo "</tr>";

        // Calculate total price
        $totalPrice += $row["total_price"];
    }
    echo "</table>";
    
    // Checkout button
    echo "<button type='submit' name='checkout'>Checkout</button>";
    echo "</form>";

    // Display total price
    echo "<h3>Total Price: " . $totalPrice . " บาท</h3>";
} else {
    echo "ไม่มีสินค้าในตะกร้า";
}

// Close connection
$conn->close();
?>

<script>
// JavaScript for select all functionality
document.getElementById('select-all').onclick = function() {
    var checkboxes = document.querySelectorAll('.item-checkbox');
    for (var checkbox of checkboxes) {
        checkbox.checked = this.checked;
    }
};
</script>
