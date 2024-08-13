<?php
include "../connectDB.php";

// ตรวจสอบว่ามีการส่งพารามิเตอร์ orderId และ status ผ่าน POST หรือไม่
if(isset($_POST['orderId']) && isset($_POST['status'])) {
    $orderId = $conn->real_escape_string($_POST['orderId']);
    $status = $conn->real_escape_string($_POST['status']);

    // Query อัปเดตสถานะของออร์เดอร์ในฐานข้อมูล
    $sql = "UPDATE Orders SET status = '$status' WHERE order_id = '$orderId'";
    
    if ($conn->query($sql) === TRUE) {
        echo "สถานะของออร์เดอร์ถูกอัปเดตเรียบร้อยแล้ว";
    } else {
        echo "เกิดข้อผิดพลาด: " . $conn->error;
    }
} else {
    echo "กรุณากรอกหมายเลขออร์เดอร์และสถานะ";
}

$conn->close();
?>
