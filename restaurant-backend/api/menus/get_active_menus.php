<?php
header('Content-Type: application/json');
require_once '../../config/db.php';

try {
    // Prepare statement
    $stmt = $conn->prepare("SELECT MenuID, Name FROM menu WHERE Status = 'active'");
    $stmt->execute();
    $result = $stmt->get_result(); // ดึงผลลัพธ์จาก mysqli_stmt

    $menus = $result->fetch_all(MYSQLI_ASSOC); // fetch_all ของ mysqli_result

    echo json_encode($menus);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู',
        'error' => $e->getMessage()
    ]);
}
?>
