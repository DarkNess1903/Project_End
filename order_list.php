<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order List</title>
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
    </style>
</head>
<body>
    <h1>Order List</h1>

    <table>
        <thead>
            <tr>
                <th>Order Number</th>
                <th>Timestamp</th>
                <th>Quantity</th>
                <th>Item Name</th>
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
            $sql = "SELECT order_number, order_time, quantity, item_name FROM Orders";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                // แสดงข้อมูลในตาราง
                while($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . $row["order_number"] . "</td>";
                    echo "<td>" . $row["order_time"] . "</td>";
                    echo "<td>" . $row["quantity"] . "</td>";
                    echo "<td>" . $row["item_name"] . "</td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='4'>ไม่พบข้อมูลการสั่งซื้อ</td></tr>";
            }
            $conn->close();
            ?>
        </tbody>
    </table>
</body>
</html>
