<?php
// ถ้าเรียกผ่าน CLI ใช้ $argv, ถ้าเรียกผ่าน browser ใช้ GET
if (php_sapi_name() === 'cli') {
    if ($argc < 2) {
        echo "Usage: php generate_receipt.php {order_id}\n";
        exit;
    }
    $order_id = intval($argv[1]);
} else {
    if (!isset($_GET['order_id'])) {
        echo "Please provide order_id via GET parameter.\n";
        exit;
    }
    $order_id = intval($_GET['order_id']);
}

// ตั้งค่า error display
ini_set('display_errors', 1);
error_reporting(E_ALL);

// require database + libraries ตามปกติ
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/api/orders/tfpdf/tfpdf.php';
require_once __DIR__ . '/lib/phpqrcode/qrlib.php';
require __DIR__ . '/vendor/autoload.php';

// จากตรงนี้เป็นโค้ด PDF + QR Code เหมือนเดิม

use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

// ดึงข้อมูล order + table + store
$stmt = $conn->prepare("
    SELECT o.OrderID, o.TotalAmount, o.OrderTime, d.TableNumber, s.store_name, s.address, s.contact_phone
    FROM `orders` o
    LEFT JOIN dining d ON o.TableID = d.TableID
    LEFT JOIN settings s ON s.id = 1
    WHERE o.OrderID = ?
");

$stmt->bind_param("i", $order_id);
$stmt->execute();
$order_result = $stmt->get_result();
$order_data = $order_result->fetch_assoc();
$stmt->close();

if (!$order_data) {
    echo "Order ID not found.\n";
    exit;
}

// ดึงรายการเมนูอาหารของ order
$itemStmt = $conn->prepare("
    SELECT m.Name, oi.Quantity, m.Price, oi.SubTotal
    FROM orderitem oi
    LEFT JOIN menu m ON oi.MenuID = m.MenuID
    WHERE oi.OrderID = ?
");
$itemStmt->bind_param("i", $order_id);
$itemStmt->execute();
$itemResult = $itemStmt->get_result();
$order_items = [];
while ($row = $itemResult->fetch_assoc()) {
    $order_items[] = $row;
}
$itemStmt->close();

// สร้าง QR Code
$feedbackUrl = "http://localhost/project_END/food-qr-frontend/feedback?order_id=" . $order_id;
$qrcodeDir = __DIR__ . "/uploads/qrcodes";
if (!file_exists($qrcodeDir) && !mkdir($qrcodeDir, 0755, true)) {
    echo "Failed to create QR code folder.\n";
    exit;
}
$qrcodeFile = $qrcodeDir . "/feedback_" . $order_id . ".png";
QRcode::png($feedbackUrl, $qrcodeFile, QR_ECLEVEL_L, 4);

// สร้าง PDF ขนาด 80mm x 297mm
$pdf = new tFPDF('P', 'mm', array(80, 297));
$pdf->AddPage();

// ฟอนต์ไทย
$fontPath = __DIR__ . '/api/orders/tfpdf/font/unifont/THSarabunNew.ttf';
if (!file_exists($fontPath)) {
    echo "Font file THSarabunNew.ttf not found at $fontPath\n";
    exit;
}
$pdf->AddFont('THSarabunNew','','THSarabunNew.ttf',true);
$pdf->SetFont('THSarabunNew','',12);

// ข้อมูลร้าน
$pdf->Cell(0,8,$order_data['store_name'],0,1,'C');
$pdf->SetFont('THSarabunNew','',12);
$pdf->Cell(0,6,"ที่อยู่: ".$order_data['address'],0,1,'C');
$pdf->Cell(0,6,"โทร: ".$order_data['contact_phone'],0,1,'C');
$pdf->Ln(5);

// ข้อมูลใบเสร็จ
$pdf->Cell(0,6,"ใบเสร็จรับเงิน",0,1,'C');
$pdf->Cell(0,6,"เลขที่ออเดอร์: ".$order_data['OrderID'],0,1);
$tableName = isset($order_data['TableNumber']) ? $order_data['TableNumber'] : '-';
$pdf->Cell(0,6,"โต๊ะ: ".$tableName,0,1);
$pdf->Cell(0,6,"วันที่: ".$order_data['OrderTime'],0,1);
$pdf->Ln(2);

// ตารางรายการเมนู
$pdf->SetFont('THSarabunNew','',12);
$pdf->Cell(40,6,"รายการ",1,0,'C');
$pdf->Cell(15,6,"จำนวน",1,0,'C');
$pdf->Cell(20,6,"ราคา/หน่วย",1,0,'C');
$pdf->Cell(20,6,"รวม",1,1,'C');

$pdf->SetFont('THSarabunNew','',12);
foreach ($order_items as $item) {
    $pdf->Cell(40,6,$item['Name'],1,0);
    $pdf->Cell(15,6,$item['Quantity'],1,0,'C');
    $pdf->Cell(20,6,number_format($item['Price'],2),1,0,'R');
    $pdf->Cell(20,6,number_format($item['SubTotal'],2),1,1,'R');
}

// ยอดรวม
$pdf->SetFont('THSarabunNew','',12);
$pdf->Cell(55,6,"รวมทั้งหมด",1,0,'R');
$pdf->Cell(20,6,number_format($order_data['TotalAmount'],2),1,1,'R');
$pdf->Ln(5);

// QR Code
$pdf->Cell(0,6,"สแกน QR Code เพื่อตอบแบบสอบถาม",0,1,'C');
if (file_exists($qrcodeFile)) {
    $pdf->Image($qrcodeFile, ($pdf->GetPageWidth()-40)/2, $pdf->GetY(), 40, 40);
}
$pdf->Ln(45);

// บันทึก PDF
$receiptDir = __DIR__ . "/uploads/receipts";
if (!file_exists($receiptDir) && !mkdir($receiptDir, 0755, true)) {
    echo "Failed to create receipts folder.\n";
    exit;
}
$pdfFile = $receiptDir . "/receipt_".$order_id.".pdf";

try {
    $pdf->Output("F", $pdfFile);
    echo "PDF generated: $pdfFile\n";
} catch (Exception $e) {
    echo "PDF generation error: ".$e->getMessage()."\n";
}

// สั่งพิมพ์ Thermal (คอมเมนต์ไว้)
// try {
//     $connector = new WindowsPrintConnector("POS-58");
//     $printer = new Printer($connector);

//     $printer->setJustification(Printer::JUSTIFY_CENTER);
//     $printer->text($order_data['store_name']."\n");
//     $printer->text("ที่อยู่: ".$order_data['address']."\n");
//     $printer->text("โทร: ".$order_data['contact_phone']."\n");
//     $printer->text("--------------------------------\n");

//     $printer->setJustification(Printer::JUSTIFY_LEFT);
//     foreach ($order_items as $item) {
//         $line = $item['Name']." x".$item['Quantity']."  ".number_format($item['SubTotal'],2)." บาท\n";
//         $printer->text($line);
//     }

//     $printer->text("--------------------------------\n");
//     $printer->setJustification(Printer::JUSTIFY_RIGHT);
//     $printer->text("รวมทั้งหมด: ".number_format($order_data['TotalAmount'],2)." บาท\n");

//     if (file_exists($qrcodeFile)) {
//         $printer->qrCode($feedbackUrl, Printer::QR_ECLEVEL_L, 6);
//     }

//     $printer->setJustification(Printer::JUSTIFY_CENTER);
//     $printer->text("\nสแกนเพื่อแสดงความคิดเห็น\n");
//     $printer->cut();
//     $printer->close();

// } catch (Exception $e) {
//     file_put_contents(__DIR__ . '/../../logs/printer_error.log', date('Y-m-d H:i:s')." ".$e->getMessage()."\n", FILE_APPEND);
//     echo "Printer error: ".$e->getMessage()."\n";
// }
