<?php
include "connectDB.php";

// Function to update quantity in cart
if (isset($_POST['updateQuantity'])) {
    $id = $_POST['id'];
    $newQuantity = (int)$_POST['updateQuantity'];

    // Retrieve current product details
    $sql_check = "SELECT product_name, quantity FROM cart WHERE id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("i", $id);
    $stmt_check->execute();
    $stmt_check->bind_result($product_name, $current_quantity);
    $stmt_check->fetch();
    $stmt_check->close();

    // Check stock
    $sql_stock = "SELECT stock FROM products WHERE product_name = ?";
    $stmt_stock = $conn->prepare($sql_stock);
    $stmt_stock->bind_param("s", $product_name);
    $stmt_stock->execute();
    $stmt_stock->bind_result($stock);
    $stmt_stock->fetch();
    $stmt_stock->close();

    if ($newQuantity > $stock) {
        echo "Not enough stock available.";
    } else if ($newQuantity <= 0) {
        // Remove item if new quantity is 0 or less
        $sql_remove = "DELETE FROM cart WHERE id = ?";
        $stmt_remove = $conn->prepare($sql_remove);
        $stmt_remove->bind_param("i", $id);
        if ($stmt_remove->execute()) {
            echo "Removed item successfully.";
            
        } else {
            echo "Error removing item: " . $conn->error;
        }
        $stmt_remove->close();
    } else {
        // Update quantity if new quantity is greater than 0
        $sql_update = "UPDATE cart SET quantity = ?, total_price = price * ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("iii", $newQuantity, $newQuantity, $id);
        if ($stmt_update->execute()) {
            echo "Updated quantity successfully.";
        } else {
            echo "Error updating quantity: " . $conn->error;
        }
        $stmt_update->close();
    }
}

// Function to remove item from cart
if (isset($_POST['removeItem'])) {
    $id = $_POST['id'];

    $sql_remove = "DELETE FROM cart WHERE id = ?";
    $stmt_remove = $conn->prepare($sql_remove);
    $stmt_remove->bind_param("i", $id);
    if ($stmt_remove->execute()) {
        echo "Removed item successfully.";
    } else {
        echo "Error removing item: " . $conn->error;
    }
    $stmt_remove->close();
}

// Function to handle checkout
if (isset($_POST['checkout'])) {
    $selectedItems = $_POST['selectedItems'];

    // Store selected items in localStorage
    echo "<script>";
    echo "var selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];";
    echo "selectedItems.push(" . json_encode($selectedItems) . ");";
    echo "localStorage.setItem('selectedItems', JSON.stringify(selectedItems));";
    echo "function submitForm() { document.getElementById('cart-form').submit(); }";
    echo "</script>";

    // Redirect to orderForm.php after storing items
    echo "<script>window.location.href = 'orderFormCart.php';</script>";
    exit();
}

// Query to retrieve cart items
$sql = "SELECT * FROM cart";
$result = $conn->query($sql);

// Calculate total price
$totalPrice = 0;

// Check if there are results
if ($result->num_rows > 0) {
    echo "<h2>ตะกร้าสินค้า</h2>";
    echo "<form method='POST' id='cart-form' action=''>";
    echo "<table border='1'>";
    echo "<tr><th><input type='checkbox' id='select-all' onchange='toggleSelectAll()'> เลือกทั้งหมด</th><th>รูปสินค้า</th><th>ชื่อสินค้า</th><th>ราคา</th><th>จำนวน</th><th>ราคารวม</th><th>แก้ไข</th></tr>";

    // Output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td><input type='checkbox' class='item-checkbox' name='selectedItems[]' value='".$row["id"]."'></td>";
        echo "<td><img src='".$row["image_path"]."' alt='".$row["product_name"]."' width='100' height='100'></td>";
        echo "<td>".$row["product_name"]."</td>";
        echo "<td>".$row["price"]."</td>";
        echo "<td>";
        echo "<form method='POST' class='quantity-form'>";
        echo "<input type='hidden' name='id' value='".$row["id"]."'>";
        echo "<button type='submit' name='updateQuantity' value='".($row["quantity"] - 1)."'>-</button>";
        echo " <span class='quantity'>".$row["quantity"]."</span> ";
        echo "<button type='submit' name='updateQuantity' value='".($row["quantity"] + 1)."'>+</button>";
        echo "</form>";
        echo "</td>";
        echo "<td>".$row["total_price"]."</td>";
        echo "<td>";
        echo "<form method='POST' class='remove-form'>";
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
    echo "<button type='submit' name='checkout'>สั่งซื้อ</button>";
    echo "</form>";

    // Display total price
    echo "<h3>Total Price: " . $totalPrice . " บาท</h3>";
} else {
    echo "ไม่มีสินค้าในตะกร้า";
}

// Close connection
$conn->close();
?>
