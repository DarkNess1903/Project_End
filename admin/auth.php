<?php
session_start();

// ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    // ถ้ายังไม่ได้เข้าสู่ระบบ
    header('Location: login.php'); // เปลี่ยนเส้นทางไปยังหน้า Login
    exit;
}
?>
