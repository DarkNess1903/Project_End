<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// สำหรับ preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once '../../config/db.php';

// อ่าน JSON ที่รับเข้ามา
$data = json_decode(file_get_contents("php://input"), true);

// ตรวจสอบข้อมูลที่ต้องมี
if (!isset($data['table_id']) || !isset($data['items'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing table_id or items"]);
    exit();
}

$table_id = $data['table_id'];
$items = $data['items'];
$total_amount = 0;

// เริ่ม transaction
$conn->begin_transaction();

try {
    // 1. สร้างคำสั่งซื้อ
    $stmt = $conn->prepare("INSERT INTO `Order` (TableID, TotalAmount, Status, OrderTime)VALUES (?, 0, 'pending', NOW())");
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    // 2. เพิ่มรายการอาหาร
    $print_items = []; // เก็บข้อมูลไปพิมพ์/จำลอง
    foreach ($items as $item) {
        $menu_id = $item['menu_id'];
        $quantity = $item['quantity'];
        $note = $item['note'] ?? '';

        // ดึงราคาและชื่อเมนูจากฐานข้อมูล
        $menuQuery = $conn->prepare("SELECT Name, Price, Cost FROM Menu WHERE MenuID = ?");
        $menuQuery->bind_param("i", $menu_id);
        $menuQuery->execute();
        $result = $menuQuery->get_result();
        $menu = $result->fetch_assoc();
        $menuQuery->close();

        $price = $menu['Price'];
        $cost = $menu['Cost'];
        $subtotal = $price * $quantity;
        $total_amount += $subtotal;

        // เก็บไว้พิมพ์/จำลอง
        $print_items[] = [
            "name" => $menu['Name'],
            "quantity" => $quantity,
            "note" => $note
        ];

        // บันทึก OrderItem
        $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal, Cost, Note) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiidds", $order_id, $menu_id, $quantity, $subtotal, $cost, $note);
        $stmt->execute();
        $stmt->close();
    }

    // 3. อัปเดตราคารวมใน Order
    $stmt = $conn->prepare("UPDATE `Order` SET TotalAmount = ? WHERE OrderID = ?");
    $stmt->bind_param("di", $total_amount, $order_id);
    $stmt->execute();
    $stmt->close();

    // 3.5. อัปเดตสถานะโต๊ะให้เป็น 'occupied'
    $updateTableStmt = $conn->prepare("UPDATE dining SET Status = 'occupied' WHERE TableID = ?");
    $updateTableStmt->bind_param("i", $table_id);
    $updateTableStmt->execute();
    $updateTableStmt->close();

    // 4. Commit
    $conn->commit();

    // ------------------------
    // ✅ ทดสอบ: จำลองบิลออก PDF
    generateKitchenReceiptPDF($order_id, $print_items, $table_id);

    // ❌ ของจริง: ถ้ามีเครื่องปริ้นครัวให้ uncomment
    // printKitchenReceipt($order_id, $print_items, $table_id);
    // ------------------------

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "total_amount" => $total_amount
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Failed to create order", "details" => $e->getMessage()]);
}

$conn->close();


// ======================
// ฟังก์ชันจำลองบิลครัวเป็น PDF
// ======================
require_once('fpdf/fpdf.php'); // อย่าลืมติดตั้ง FPDF

function generateKitchenReceiptPDF($order_id, $items, $table_id) {
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial','B',16);

    $pdf->Cell(0,10,'*** ใบสั่งครัว ***',0,1,'C');
    $pdf->SetFont('Arial','',12);
    $pdf->Cell(0,10,"โต๊ะ: $table_id",0,1);
    $pdf->Cell(0,10,"Order ID: $order_id",0,1);
    $pdf->Cell(0,10,date("Y-m-d H:i:s"),0,1);
    $pdf->Ln(5);

    foreach ($items as $item) {
        $pdf->Cell(0,10,$item['name']." x".$item['quantity'],0,1);
        if (!empty($item['note'])) {
            $pdf->Cell(0,10,"   * ".$item['note'],0,1);
        }
    }

    $pdf->Ln(10);
    $filename = "kitchen_receipt_$order_id.pdf";
    $pdf->Output('F', $filename); // เซฟไฟล์ไว้ที่ server
}

// ======================
// ฟังก์ชันพิมพ์จริง (คอมเมนต์ไว้)
// ======================
/*
function printKitchenReceipt($order_id, $items, $table_id) {
    $printer_ip = "192.168.1.100"; // เปลี่ยนเป็น IP เครื่องพิมพ์ครัว
    $printer_port = 9100;

    $fp = @fsockopen($printer_ip, $printer_port);
    if (!$fp) {
        error_log("ไม่สามารถเชื่อมต่อเครื่องพิมพ์ครัวได้");
        return false;
    }

    fwrite($fp, "***** ใบสั่งครัว *****\n");
    fwrite($fp, "โต๊ะ: $table_id\n");
    fwrite($fp, "Order ID: $order_id\n");
    fwrite($fp, date("Y-m-d H:i:s")."\n");
    fwrite($fp, "---------------------------\n");

    foreach ($items as $item) {
        $line = $item['name'] . " x" . $item['quantity'];
        fwrite($fp, $line . "\n");
        if (!empty($item['note'])) {
            fwrite($fp, "  *" . $item['note'] . "\n");
        }
    }

    fwrite($fp, "---------------------------\n\n\n");
    fclose($fp);

    return true;
}
*/
?>
