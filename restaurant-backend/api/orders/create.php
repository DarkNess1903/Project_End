<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once '../../config/db.php';

// โหลด tFPDF สำหรับสร้าง PDF ภาษาไทย
require_once __DIR__ . '/tfpdf/tfpdf.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['table_id']) || !isset($data['items'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing table_id or items"]);
    exit();
}

$table_id = $data['table_id'];
$items = $data['items'];
$total_amount = 0;

$conn->begin_transaction();

try {
    // สร้าง orders
    $stmt = $conn->prepare("INSERT INTO `orders` (TableID, TotalAmount, Status, OrderTime) VALUES (?, 0, 'pending', NOW())");
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    $print_items = [];

    foreach ($items as $item) {
        $menu_id = $item['menu_id'];
        $quantity = $item['quantity'];
        $note = $item['note'] ?? '';

        $menuQuery = $conn->prepare("SELECT Name, Price, Cost FROM Menu WHERE MenuID = ?");
        $menuQuery->bind_param("i", $menu_id);
        $menuQuery->execute();
        $result = $menuQuery->get_result();
        $menu = $result->fetch_assoc();
        $menuQuery->close();

        $price = $menu['Price'];
        $cost  = $menu['Cost'];
        $subtotal = $price * $quantity;
        $total_amount += $subtotal;

        $print_items[] = [
            "name" => $menu['Name'],
            "quantity" => $quantity,
            "note" => $note,
            "cost" => $cost
        ];

        // บันทึก OrderItem
        $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal, Cost, Note) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiidss", $order_id, $menu_id, $quantity, $subtotal, $cost, $note);
        $stmt->execute();
        $stmt->close();
    }

    // อัปเดตราคารวม
    $stmt = $conn->prepare("UPDATE `orders` SET TotalAmount = ? WHERE OrderID = ?");
    $stmt->bind_param("di", $total_amount, $order_id);
    $stmt->execute();
    $stmt->close();

    // อัปเดตสถานะโต๊ะ
    $updateTableStmt = $conn->prepare("UPDATE dining SET Status = 'occupied' WHERE TableID = ?");
    $updateTableStmt->bind_param("i", $table_id);
    $updateTableStmt->execute();
    $updateTableStmt->close();

    $conn->commit();

    // สร้าง PDF จำลอง (ภาษาไทย-อังกฤษ)
    $pdfFile = generateKitchenReceiptPDF($order_id, $print_items, $table_id);

    // พิมพ์จริง (เก็บไว้)
    // printKitchenReceipt($order_id, $print_items, $table_id);

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "total_amount" => $total_amount,
        "pdf" => $pdfFile
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Failed to create order", "details" => $e->getMessage()]);
}

$conn->close();

// ======================
// สร้าง PDF ภาษาไทยสำหรับ Thermal 58mm / 80mm
// ======================
function generateKitchenReceiptPDF($order_id, $items, $table_id, $width_mm = 58) {
    // แปลง mm → point สำหรับ tFPDF
    // tFPDF ใช้หน่วย mm เป็น default
    $pdf = new tFPDF('P','mm',array($width_mm, 297)); // ความสูง 297mm ยาวพอให้รายการทั้งหมด

    $pdf->AddPage();

    // ฟอนต์ไทย Unicode
    $pdf->AddFont('THSarabunNew','','THSarabunNew.ttf',true);
    $pdf->SetFont('THSarabunNew','',14);

    // หัวบิล
    $pdf->Cell(0,6,'*** ใบสั่งครัว ***',0,1,'C');
    $pdf->Ln(2);

    $pdf->SetFont('THSarabunNew','',12);
    $pdf->Cell(0,5,"โต๊ะ: $table_id",0,1);
    $pdf->Cell(0,5,"Order ID: $order_id",0,1);
    $pdf->Cell(0,5,date("Y-m-d H:i:s"),0,1);
    $pdf->Ln(3);

    // รายการอาหาร
    foreach ($items as $item) {
        $pdf->Cell(0,5,$item['name']." x".$item['quantity'],0,1);
        if (!empty($item['note'])) {
            $pdf->Cell(0,5,"   * ".$item['note'],0,1);
        }
    }

    $pdf->Ln(3);
    $pdf->Cell(0,5,'---------------------------',0,1);

    // บันทึกไฟล์ PDF
    $filename = __DIR__ . "/kitchen_receipt_$order_id.pdf";
    $pdf->Output('F', $filename);

    return $filename;
}

// ======================
// ฟังก์ชันพิมพ์จริง (เก็บไว้)
// ======================
// function printKitchenReceipt($order_id, $items, $table_id) {
//     $printer_ip = "192.168.1.100";
//     $printer_port = 9100;

//     $fp = @fsockopen($printer_ip, $printer_port);
//     if (!$fp) {
//         error_log("❌ ไม่สามารถเชื่อมต่อเครื่องพิมพ์ครัวได้");
//         return false;
//     }

//     fwrite($fp, "***** ใบสั่งครัว *****\n");
//     fwrite($fp, "โต๊ะ: $table_id\n");
//     fwrite($fp, "Order ID: $order_id\n");
//     fwrite($fp, date("Y-m-d H:i:s")."\n");
//     fwrite($fp, "---------------------------\n");

//     foreach ($items as $item) {
//         $line = $item['name'] . " x" . $item['quantity'];
//         fwrite($fp, $line . "\n");
//         if (!empty($item['note'])) {
//             fwrite($fp, "  *" . $item['note'] . "\n");
//         }
//     }

//     fwrite($fp, "---------------------------\n\n\n");
//     fclose($fp);

//     return true;
// }
