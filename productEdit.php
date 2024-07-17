<?php
include "connectDB.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // กรณีเพิ่มสินค้าหรือแก้ไขข้อมูลสินค้า
    $productName = $conn->real_escape_string($_POST['productName']);
    $price = (float)$_POST['price'];

    // จัดการการอัพโหลดรูปภาพ
    $targetDir = "product/";
    $imageFileType = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
    $targetFile = $targetDir . basename($_FILES["image"]["name"]);

    // เช็คถ้าผู้ใช้ต้องการแก้ไขสินค้าปัจจุบัน
    if (isset($_POST['productId']) && $_POST['productId'] != '') {
        $productId = (int)$_POST['productId'];
        $sql = "UPDATE products SET product_name='$productName', price=$price";

        // ถ้ามีการอัพโหลดรูปใหม่
        if ($_FILES["image"]["size"] > 0) {
            move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile);
            $sql .= ", image='$targetFile'";
        }

        $sql .= " WHERE id=$productId";
    } else {
        // กรณีเพิ่มสินค้าใหม่
        move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile);
        $sql = "INSERT INTO products (product_name, price, image) VALUES ('$productName', $price, '$targetFile')";
    }

    if ($conn->query($sql) === TRUE) {
        echo "บันทึกข้อมูลสำเร็จ!";
    } else {
        echo "เกิดข้อผิดพลาด: " . $conn->error;
    }
}

// ดึงข้อมูลสินค้าทั้งหมด
$sql = "SELECT * FROM products";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Edit</title>
</head>
<body>
    <h1>Product Edit</h1>
    
    <form id="product-form" action="productEdit.php" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="productId" id="productId">
        <div class="form-group">
            <label for="productName">ชื่อสินค้า:</label>
            <input type="text" id="productName" name="productName" required>
        </div>
        <div class="form-group">
            <label for="price">ราคา:</label>
            <input type="number" id="price" name="price" required>
        </div>
        <div class="form-group">
            <label for="image">อัพโหลดรูปภาพ:</label>
            <input type="file" id="image" name="image" accept="image/*">
        </div>
        <button type="submit">บันทึกข้อมูล</button>
    </form>

    <h2>สินค้าทั้งหมด</h2>
    <table border="1">
        <tr>
            <th>รหัสสินค้า</th>
            <th>ชื่อสินค้า</th>
            <th>ราคา</th>
            <th>รูปภาพ</th>
            <th>แก้ไข</th>
        </tr>
        <?php
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>".$row["id"]."</td>";
                echo "<td>".$row["product_name"]."</td>";
                echo "<td>".$row["price"]."</td>";
                echo "<td><img src='".$row["image"]."' alt='Product Image' width='100px'></td>";
                echo "<td><button onclick='editProduct(".$row["id"].", \"".$row["product_name"]."\", ".$row["price"].", \"".$row["image"]."\")'>แก้ไข</button></td>";
                echo "</tr>";
            }
        } else {
            echo "<tr><td colspan='5'>ไม่มีสินค้า</td></tr>";
        }
        ?>
    </table>

    <script>
    function editProduct(id, name, price, image) {
        document.getElementById('productId').value = id;
        document.getElementById('productName').value = name;
        document.getElementById('price').value = price;
        // เนื่องจากไม่สามารถตั้งค่า input[type="file"] ผ่าน JavaScript ได้
    }
    </script>
</body>
</html>
