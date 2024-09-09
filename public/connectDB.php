<?php
// connectDB.php

$servername = "localhost";  // ชื่อเซิร์ฟเวอร์ฐานข้อมูล
$username = "root";         // ชื่อผู้ใช้ฐานข้อมูล
$password = "";             // รหัสผ่านฐานข้อมูล
$dbname = "best"; // ชื่อฐานข้อมูล

// สร้างการเชื่อมต่อ
$conn = new mysqli($servername, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("การเชื่อมต่อล้มเหลว: " . $conn->connect_error);
}

// ตั้งค่าชุดตัวอักษรเป็น UTF-8 เพื่อรองรับภาษาไทย
$conn->set_charset("utf8");
?>
