<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hantaphao Project</title>
    <link rel="stylesheet" href="css/stylenav.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <STYle>
.container {
    width: 80%;
    margin: auto;
    overflow-x: auto; /* Allow horizontal scrolling if necessary */
    padding: 70px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

h2 {
    text-align: left;
    margin-top: 0; /* Adjust margin-top to align properly */
}

table {
    width: 180%; /* Extend the table width beyond 100% */
    border-collapse: collapse;
    margin-bottom: 20px;
    margin-left: auto; /* Align the table to the right */
}

table, th, td {
    border: 1px solid #ddd;
}

th, td {
    padding: 10px; /* Reduced padding for better alignment */
    text-align: center;
}

th {
    background-color: #f2f2f2;
}

img {
    max-width: 100%;
    height: auto;
}

.quantity-form, .remove-form {
    display: inline-block;
}

.quantity-form button, .remove-form button {
    padding: 5px 10px;
    margin: 0 5px;
    border: none;
    background-color: #f2f2f2;
    cursor: pointer;
    border-radius: 5px; /* Added border-radius for consistency */
}

.quantity-form button:hover, .remove-form button:hover {
    background-color: #ddd;
}

button[type="submit"] {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    display: block;
    width: 100%;
    margin-top: 20px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}

button[type="submit"]:hover {
    background-color: #45a049;
}

h3 {
    text-align: center;
    margin-top: 20px;
    color: #333;
    font-size: 24px;
}

/* Additional styling for responsiveness */
@media (max-width: 768px) {
    .container {
        width: 90%;
        padding: 10px;
    }

    table {
        width: 100%; /* Ensure table fits smaller screens */
    }

    th, td {
        padding: 8px;
    }

    button[type="submit"] {
        font-size: 14px;
    }

    h3 {
        font-size: 20px;
    }
}


    </STYle>
</head>
<body>
<nav class="navbar">
        <div class="logo">
            <img src="img/Logo.png" alt="Logo" width="100px" height="100px">
        </div>
        <div class="menu-toggle" id="mobile-menu">
            <i class="fas fa-bars"></i>
        </div>
        <ul class="nav-links" id="nav-links">
            <li><a href="#">เกี่ยวกับโครงการ ▾</a>
                <ul class="dropdown">
                    <li><a href="mushroom.html">โรงเห็ดอัจฉริยะ</a></li>
                    <li><a href="furnance.html">เคาเผาถ่านไร้ควัน</a></li>
                    <li><a href="riceMill.html">โรงสีข้าว</a></li>
                </ul>
            </li>
            <li><a href="#">ผลิตภัณฑ์</a></li>
            <li><a href="#">ข่าวสารจากชุมชน</a></li>
            <li><a href="#">คำถามที่พบบ่อย</a></li>
        </ul>
        <div class="cart">
            <a href="#"><i class="fa fa-shopping-cart"></i></a>
        </div>
    </nav>

    <div class="container">
        <?php
        include "connectDB.php";

        // Function to update quantity in cart
        if (isset($_POST['updateQuantity'])) {
            $id = $_POST['id'];
            $newQuantity = (int)$_POST['updateQuantity'];

            if ($newQuantity <= 0) {
                // Remove item if new quantity is 0 or less
                $sql_remove = "DELETE FROM cart WHERE id = $id";
                if ($conn->query($sql_remove) === TRUE) {
                    echo "Removed item successfully.";
                } else {
                    echo "Error removing item: " . $conn->error;
                }
            } else {
                // Update quantity if new quantity is greater than 0
                $sql_update = "UPDATE cart SET quantity = $newQuantity, total_price = price * $newQuantity WHERE id = $id";
                if ($conn->query($sql_update) === TRUE) {
                    echo "Updated quantity successfully.";
                } else {
                    echo "Error updating quantity: " . $conn->error;
                }
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
            echo "<h2 style='margin-right: -125px;'>ตะกร้าสินค้า</h2>";
            echo "<form method='POST' id='cart-form' action=''>";
            echo "<table border='1'>";
            echo "<br><br><br><tr><th><input type='checkbox' id='select-all' onchange='toggleSelectAll()'> เลือกทั้งหมด</th><th>รูปสินค้า</th><th>ชื่อสินค้า</th><th>ราคา</th><th>จำนวน</th><th>ราคารวม</th><th>แก้ไข</th></tr>";
            
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
    </div>

    <script>
        // Function to toggle select all checkboxes
        function toggleSelectAll() {
            var checkboxes = document.getElementsByClassName('item-checkbox');
            var selectAllCheckbox = document.getElementById('select-all');

            for (var i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = selectAllCheckbox.checked;
            }
        }
    </script>
<footer>
<div class="contact">
            <div>
                <h4>ติดต่อเรา</h4>
                <p>123 หมู่ 4 ตำบลบ้านโฮ่ง อำเภอบ้านโฮ่ง จังหวัดลำพูน</p>
            </div>
            <div>
                <h4>เบอร์ติดต่อ</h4>
                <p>081-234-5678</p>
            </div>
            <div>
                <h4>Email</h4>
                <p>contact@hantaphao.com</p>
            </div>
            <div>
                <h4>สื่อสังคมออนไลน์</h4>
                <a href=""><img src="img/Facebook-icon.png" alt="fb Picture" width="60" height="60"></a>
                <a href=""><img src="img/line-icon.png" alt="line Picture" width="42" height="42" style="position: relative; top: -8px;"></a>
            </div>
        </div>
        <p>©2024 Hantaphao Projects All rights reserved.</p>
</footer>
</body>
</html>
