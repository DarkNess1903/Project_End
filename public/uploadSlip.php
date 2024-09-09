<?php
// uploadSlip.php
include 'connectDB.php'; // ปรับเส้นทางให้ถูกต้อง

// ตรวจสอบว่ามีการส่งข้อมูลหรือไม่
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // ตรวจสอบข้อมูลการชำระเงิน
    $totalAmount = $_POST['totalAmount'];
    $orderId = $_POST['orderId'];

    // ตรวจสอบการอัพโหลดไฟล์
    if (isset($_FILES['slip']) && $_FILES['slip']['error'] == 0) {
        $fileTmpPath = $_FILES['slip']['tmp_name'];
        $fileName = $_FILES['slip']['name'];
        $fileSize = $_FILES['slip']['size'];
        $fileType = $_FILES['slip']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        // ตรวจสอบประเภทไฟล์ที่อนุญาต
        $allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];
        if (in_array($fileExtension, $allowedExts)) {
            // ตั้งค่าเส้นทางในการอัพโหลด
            $uploadFileDir = '../admin/uploads/'; // ปรับเส้นทางที่นี่
            $dest_path = $uploadFileDir . $fileName;

            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                // บันทึกข้อมูลลงฐานข้อมูล
                $sql = "INSERT INTO payments (order_id, amount, slip_path) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('sis', $orderId, $totalAmount, $dest_path);

                if ($stmt->execute()) {
                    echo 'อัพโหลดสลิปสำเร็จ!';
                    
                    // เคลียร์ตะกร้า
                    unset($_SESSION['cart']);
                    
                    // อาจต้องการแสดงข้อความเพิ่มเติมหรือเปลี่ยนเส้นทางไปยังหน้าขอบคุณ
                    // header("Location: thank_you.php");
                } else {
                    echo 'ไม่สามารถบันทึกข้อมูลการชำระเงินได้';
                }
                $stmt->close();
            } else {
                echo 'ไม่สามารถอัพโหลดไฟล์ได้';
            }
        } else {
            echo 'ประเภทไฟล์ไม่ถูกต้อง';
        }
    } else {
        echo 'ไม่มีไฟล์อัพโหลด';
    }

    $conn->close();
}
?>
