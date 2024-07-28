<?php include 'navbar.php'; ?>

<div id="content-wrapper" class="d-flex flex-column">
    <div id="content">
        <div class="container-fluid">
            <h1 class="h3 mb-4 text-gray-800">รายการออเดอร์</h1>

            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Order Number</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Slip Image</th>
                        <th>Status</th>
                        <th>Update Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        include "../connectDB.php";

                        // สร้างคำสั่ง SQL เพื่อดึงข้อมูล Order
                        $sql = "SELECT order_id, order_number, name, phone, address, quantity, price, slip_path, status FROM Orders";
                        $result = $conn->query($sql);

                        if ($result->num_rows > 0) {
                            // แสดงข้อมูลในตาราง
                            while($row = $result->fetch_assoc()) {
                                echo "<tr>";
                                echo "<td>" . $row["order_number"] . "</td>";
                                echo "<td>" . $row["name"] . "</td>";
                                echo "<td>" . $row["phone"] . "</td>";
                                echo "<td>" . $row["address"] . "</td>";
                                echo "<td>" . $row["quantity"] . "</td>";
                                echo "<td>" . $row["price"] . "</td>";
                                echo "<td><img src='" . $row["slip_path"] . "' alt='Slip Image' class='slip-img'></td>";
                                echo "<td>" . $row["status"] . "</td>";
                                echo "<td>
                                        <form class='status-form' action='updateOrderStatus.php' method='POST'>
                                            <input type='hidden' name='orderId' value='" . $row["order_id"] . "'>
                                            <select name='status' required>
                                                <option value='รอดำเนินการ'" . ($row["status"] == 'รอดำเนินการ' ? ' selected' : '') . ">รอดำเนินการ</option>
                                                <option value='กำลังดำเนินการ'" . ($row["status"] == 'กำลังดำเนินการ' ? ' selected' : '') . ">กำลังดำเนินการ</option>
                                                <option value='เสร็จสมบูรณ์'" . ($row["status"] == 'เสร็จสมบูรณ์' ? ' selected' : '') . ">เสร็จสมบูรณ์</option>
                                            </select>
                                            <button type='submit'>อัปเดต</button>
                                        </form>
                                      </td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr><td colspan='9'>ไม่พบข้อมูลการสั่งซื้อ</td></tr>";
                        }
                        $conn->close();
                    ?>
                </tbody>
            </table>

            <!-- The Modal -->
            <div id="myModal" class="modal">
                <span class="close">&times;</span>
                <img class="modal-content" id="img01">
                <div id="caption"></div>
            </div>
        </div>
    </div>
</div>
</div>
</body>
</html>

<script>
document.addEventListener("DOMContentLoaded", function() {
var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

document.querySelectorAll(".slip-img").forEach(function(image) {
image.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}
});

var span = document.getElementsByClassName("close")[0];
span.onclick = function() { 
modal.style.display = "none";
}
});
</script>