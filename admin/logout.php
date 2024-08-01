<?php
session_start();
session_unset(); // ลบข้อมูล session
session_destroy(); // ทำลาย session
header('Location: login.php'); // เปลี่ยนเส้นทางไปยังหน้า Login
exit;

?>
