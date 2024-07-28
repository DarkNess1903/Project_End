<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายการออเดอร์</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
        .status-form {
            margin: 0;
        }
        .status-form select, .status-form input[type="hidden"] {
            margin: 5px;
        }
    </style>
</head>
<body>
    <h1>รายการออเดอร์</h1>

    <table>
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
            // เชื่อมต่อกับ MySQL Database
            $servername = "localhost";
            $username = "root";
            $password = "";
            $dbname = "order_management";

            // สร้างการเชื่อมต่อ
            $conn = new mysqli($servername, $username, $password, $dbname);

            // ตรวจสอบการเชื่อมต่อ
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            }

            // สร้างคำสั่ง SQL เพื่อดึงข้อมูล Order
            $sql = "SELECT order_id, order_number, name, phone, address,quantity, price, slip_path, status FROM Orders";
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
                    echo "<td><img src='" . $row["slip_path"] . "' alt='Slip Image' width='100'></td>";
                    echo "<td>" . $row["status"] . "</td>";
                    echo "<td>
                            <form class='status-form' action='updateOrderStatus.php' method='POST'>
                                <input type='hidden' name='orderId' value='" . $row["order_id"] . "'>
                                <select name='status' required>
                                    <option value='รอรับเรื่อง'" . ($row["status"] == 'รอรับเรื่อง' ? ' selected' : '') . ">รอรับเรื่อง</option>
                                    <option value='กำลังดำเนินการ'" . ($row["status"] == 'กำลังดำเนินการ' ? ' selected' : '') . ">กำลังดำเนินการ</option>
                                    <option value='เสร็จรอรับสินค้า'" . ($row["status"] == 'เสร็จรอรับสินค้า' ? ' selected' : '') . ">เสร็จรอรับสินค้า</option>
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
</body>
</html>
