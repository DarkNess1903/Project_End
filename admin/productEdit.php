<?php
include "../connectDB.php";
include 'navbar.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete'])) {
    $productId = (int)$_POST['productId'];
    $sql = "DELETE FROM products WHERE id=$productId";
    if ($conn->query($sql) === TRUE) {
        echo "ลบข้อมูลสำเร็จ!";
    } else {
        echo "เกิดข้อผิดพลาด: " . $conn->error;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['delete'])) {
    if (isset($_POST['productName']) && isset($_POST['price']) && isset($_POST['details']) && isset($_POST['stock']) && isset($_FILES['image'])) {
        $productName = $conn->real_escape_string($_POST['productName']);
        $price = (float)$_POST['price'];
        $details = $conn->real_escape_string($_POST['details']);
        $stock = (int)$_POST['stock'];

        // Path for the first product directory (outside admin folder)
        $targetDir1 = "../product/";

        // Path for the second product directory (inside admin folder)
        $targetDir2 = "product/";

        // Ensure both directories exist
        if (!is_dir($targetDir1)) {
            mkdir($targetDir1, 0777, true);
        }

        if (!is_dir($targetDir2)) {
            mkdir($targetDir2, 0777, true);
        }

        $imageFileType = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
        $targetFile1 = $targetDir1 . basename($_FILES["image"]["name"]);
        $targetFile2 = $targetDir2 . basename($_FILES["image"]["name"]);

        if (isset($_POST['productId']) && $_POST['productId'] != '') {
            $productId = (int)$_POST['productId'];
            $sql = "UPDATE products SET product_name='$productName', price=$price, details='$details', stock=$stock";

            if ($_FILES["image"]["size"] > 0) {
                if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile1) && copy($targetFile1, $targetFile2)) {
                    $sql .= ", image='$targetFile1'";
                } else {
                    echo "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ.";
                }
            }

            $sql .= " WHERE id=$productId";
        } else {
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile1) && copy($targetFile1, $targetFile2)) {
                $sql = "INSERT INTO products (product_name, price, details, image, stock) VALUES ('$productName', $price, '$details', '$targetFile1', $stock)";
            } else {
                echo "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ.";
            }
        }

        if ($conn->query($sql) === TRUE) {
            echo "บันทึกข้อมูลสำเร็จ!";
        } else {
            echo "เกิดข้อผิดพลาด: " . $conn->error;
        }
    } else {
        echo "กรุณากรอกข้อมูลให้ครบถ้วน.";
    }
}

// ดึงข้อมูลสินค้าทั้งหมด
$sql = "SELECT * FROM products";
$result = $conn->query($sql);
?>

<!-- Main Content -->
<div class="container-fluid">
    <h1 class="h3 mb-4 text-gray-800">Product Edit</h1>

    <form id="product-form" action="productEdit.php" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="productId" id="productId">
        <div class="form-group">
            <label for="productName">ชื่อสินค้า:</label>
            <input type="text" id="productName" name="productName" required>
        </div>
        <div class="form-group">
            <label for="price">ราคา:</label>
            <input type="number" id="price" name="price" step="0.01" required>
        </div>
        <div class="form-group">
            <label for="details">รายละเอียด:</label>
            <textarea id="details" name="details" required></textarea>
        </div>
        <div class="form-group">
            <label for="stock">จำนวนสินค้าในสต็อก:</label>
            <input type="number" id="stock" name="stock" required>
        </div>
        <div class="form-group">
            <label for="image">อัพโหลดรูปภาพ:</label>
            <input type="file" id="image" name="image" accept="image/*">
        </div>
        <button type="submit" class="btn btn-primary">บันทึกข้อมูล</button>
    </form>

    <h2 class="h4 mt-5">สินค้าทั้งหมด</h2>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>รายละเอียด</th>
                <th>จำนวนสินค้า</th>
                <th>รูปภาพ</th>
                <th>แก้ไข</th>
                <th>ลบ</th>
            </tr>
        </thead>
        <tbody>
            <?php
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>".$row["id"]."</td>";
                    echo "<td>".$row["product_name"]."</td>";
                    echo "<td>".$row["price"]."</td>";
                    echo "<td>".$row["details"]."</td>";
                    echo "<td>".$row["stock"]."</td>";
                    echo "<td><img src='".$row["image"]."' alt='Product Image' class='img-thumbnail' onclick='openModal(this.src)'></td>";
                    echo "<td><button class='btn btn-warning' onclick='editProduct(".$row["id"].", \"".$row["product_name"]."\", ".$row["price"].", \"".$row["details"]."\", \"".$row["stock"]."\", \"".$row["image"]."\")'>แก้ไข</button></td>";
                    echo "<td><button class='btn btn-danger' onclick='deleteProduct(".$row["id"].")'>ลบ</button></td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='8'>ไม่มีสินค้า</td></tr>";
            }
            ?>
        </tbody>
    </table>

    <form id="delete-form" action="productEdit.php" method="POST" style="display: none;">
        <input type="hidden" name="productId" id="deleteProductId">
        <input type="hidden" name="delete" value="true">
    </form>

    <div id="myModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImg">
    </div>
</div>

<script>
function editProduct(id, name, price, details, stock, image) {
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = name;
    document.getElementById('price').value = price;
    document.getElementById('details').value = details;
    document.getElementById('stock').value = stock;
}

function deleteProduct(id) {
    if (confirm('คุณแน่ใจว่าต้องการลบสินค้านี้?')) {
        document.getElementById('deleteProductId').value = id;
        document.getElementById('delete-form').submit();
    }
}

function openModal(src) {
    document.getElementById('myModal').style.display = "block";
    document.getElementById('modalImg').src = src;
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}
</script>

<?php include 'footer.php'; ?>
