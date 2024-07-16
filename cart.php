<?php
include "connectDB.php";

// Function to update quantity in cart
if (isset($_POST['updateQuantity'])) {
    $id = $_POST['id'];
    $newQuantity = (int)$_POST['updateQuantity'];

    $sql_update = "UPDATE cart SET quantity = $newQuantity, total_price = price * $newQuantity WHERE id = $id";
    if ($conn->query($sql_update) === TRUE) {
        echo "Updated quantity successfully.";
    } else {
        echo "Error updating quantity: " . $conn->error;
    }
}

// Function to remove item from cart
if (isset($_POST['removeItem'])) {
    $id = $_POST['id'];

    // Delete item from cart table
    $sql_remove = "DELETE FROM cart WHERE id = $id";
    if ($conn->query($sql_remove) === TRUE) {
        echo "Removed item successfully.";

        // Optionally, you could handle additional responses or redirect here after successful deletion.
    } else {
        echo "Error removing item: " . $conn->error;
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
    echo "<form method='POST' id='cart-form'>";
    echo "<table border='1'>";
    echo "<tr><th><input type='checkbox' id='select-all'> เลือกทั้งหมด</th><th>ชื่อสินค้า</th><th>ราคา</th><th>จำนวน</th><th>ราคารวม</th><th>แก้ไข</th></tr>";
    
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td><input type='checkbox' class='item-checkbox' name='selectedItems[]' value='".$row["id"]."'></td>";
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

// JavaScript to handle quantity updates
document.querySelectorAll('.quantity-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const newQuantity = formData.get('newQuantity'); // Get newQuantity from form data

        fetch('cart.php', {
            method: 'POST',
            body: formData
        }).then(response => response.text())
          .then(data => {
              if (data.includes('successfully')) {
                  // Update quantity displayed on page
                  const quantityElement = form.querySelector('.quantity');
                  quantityElement.textContent = newQuantity;
              } else {
                  alert('Error updating quantity');
              }
          });
    });
});

// JavaScript to handle item removal
document.querySelectorAll('.remove-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);

        fetch('cart.php', {
            method: 'POST',
            body: formData
        }).then(response => response.text())
          .then(data => {
              if (data.includes('successfully')) {
                  // Remove the row from the table
                  form.closest('tr').remove();
              } else {
                  alert('Error removing item');
              }
          });
    });
});

</script>
