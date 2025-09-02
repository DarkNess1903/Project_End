<?php
// CLI หรือ Browser
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

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/api/orders/tfpdf/tfpdf.php';
require_once __DIR__ . '/lib/phpqrcode/qrlib.php';
require __DIR__ . '/vendor/autoload.php';

use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

// ดึงข้อมูล order + table + store
$stmt = $conn->prepare("
    SELECT o.OrderID, o.TotalAmount, o.OrderTime, d.TableNumber,
           s.store_name, s.address, s.contact_phone, s.logo_url
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

// ดึงรายการเมนูอาหาร
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
if (!file_exists($qrcodeDir)) mkdir($qrcodeDir, 0755, true);
$qrcodeFile = $qrcodeDir . "/feedback_" . $order_id . ".png";
QRcode::png($feedbackUrl, $qrcodeFile, QR_ECLEVEL_L, 4);

// PDF size 80mm x 297mm
$pdf = new tFPDF('P', 'mm', array(80, 297));
$pdf->AddPage();
$fontPath = __DIR__ . '/tfpdf/font/unifont/THSarabunNew.ttf';
$pdf->AddFont('THSarabunNew', '', 'THSarabunNew.ttf', true);
$pdf->SetFont('THSarabunNew', '', 12);

// ===============================
// Receipt Header - Logo and Store Info
// ===============================

// Display logo (if exists) - size suitable for 80mm paper
$logoPath = __DIR__ . '/' . $order_data['logo_url'];
if (!empty($order_data['logo_url']) && file_exists($logoPath)) {
    $logoWidth = 20;
    $logoX = ($pdf->GetPageWidth() - $logoWidth) / 2;
    $pdf->Image($logoPath, $logoX, $pdf->GetY(), $logoWidth);
    $pdf->Ln(22);
} else {
    $pdf->Ln(3);
}

// Store Name
$pdf->SetFont('THSarabunNew', '', 14);
$storeName = isset($order_data['store_name']) ? $order_data['store_name'] : 'No Store Name';
$pdf->Cell(0, 5, $storeName, 0, 1, 'L');

// Address and Phone
$pdf->SetFont('THSarabunNew', '', 10);
$address = isset($order_data['address']) ? $order_data['address'] : 'ไม่มีที่อยู่';
if (mb_strlen($address) > 35) {
    $addressLines = explode(' ', $address);
    $line1 = '';
    $line2 = '';
    $currentLength = 0;
    foreach ($addressLines as $word) {
        if ($currentLength + mb_strlen($word) < 35 && empty($line2)) {
            $line1 .= $word . ' ';
            $currentLength += mb_strlen($word) + 1;
        } else {
            $line2 .= $word . ' ';
        }
    }
    $pdf->Cell(0, 4, trim($line1), 0, 1, 'L');
    if (!empty($line2)) {
        $pdf->Cell(0, 4, trim($line2), 0, 1, 'L');
    }
} else {
    $pdf->Cell(0, 4, $address, 0, 1, 'L');
}
$contactPhone = isset($order_data['contact_phone']) ? $order_data['contact_phone'] : 'No Phone';
$pdf->Cell(0, 4, "Tel: " . $contactPhone, 0, 1, 'L');

// Separator
$pdf->Ln(1);
$pdf->Cell(0, 3, str_repeat("=", 30), 0, 1, 'L');
$pdf->Ln(1);

// ===============================
// Receipt Title and Order Info
// ===============================

$pdf->SetFont('THSarabunNew', '', 12);
$pdf->Cell(0, 5, "RECEIPT", 0, 1, 'L');
$pdf->Ln(1);

$pdf->SetFont('THSarabunNew', '', 9);
$tableName = isset($order_data['TableNumber']) ? $order_data['TableNumber'] : 'Take Away';
$pdf->Cell(0, 4, "Table: " . $tableName, 0, 1, 'L');

$orderTime = isset($order_data['OrderTime']) ? date('d/m/Y H:i', strtotime($order_data['OrderTime'])) : date('d/m/Y H:i');
$pdf->Cell(0, 4, "Date: " . $orderTime, 0, 1, 'L');

$pdf->Ln(1);
$pdf->Cell(0, 2, str_repeat("-", 30), 0, 1, 'L');
$pdf->Ln(1);

// ===============================
// Items
// ===============================
// ฟังก์ชันเติมช่องว่างสำหรับข้อความ UTF-8
function mb_str_pad($input, $length, $pad = " ", $type = STR_PAD_RIGHT) {
    $inputLength = mb_strlen($input, "UTF-8");
    $padLength = $length - $inputLength;
    if ($padLength <= 0) return $input;

    switch ($type) {
        case STR_PAD_LEFT:
            return str_repeat($pad, $padLength) . $input;
        case STR_PAD_BOTH:
            $left = floor($padLength / 2);
            $right = $padLength - $left;
            return str_repeat($pad, $left) . $input . str_repeat($pad, $right);
        case STR_PAD_RIGHT:
        default:
            return $input . str_repeat($pad, $padLength);
    }
}

$pdf->SetFont('THSarabunNew', '', 9);

// หัวข้อ
$headerLine = mb_str_pad("Item", 15) 
            . mb_str_pad("Qty", 5, " ", STR_PAD_LEFT) 
            . mb_str_pad("Unit", 8, " ", STR_PAD_LEFT) 
            . mb_str_pad("Total", 10, " ", STR_PAD_LEFT);
$pdf->Cell(0, 5, $headerLine, 0, 1, 'L');
$pdf->Cell(0, 2, str_repeat("-", 40), 0, 1, 'L');

$totalItems = 0;
foreach ($order_items as $item) {
    $itemName = mb_strlen($item['Name']) > 15 ? mb_substr($item['Name'], 0, 12) . "..." : $item['Name'];
    $quantity = $item['Quantity'];
    $unitPrice = number_format($item['SubTotal'] / $quantity, 2);
    $totalPrice = number_format($item['SubTotal'], 2);

    $line = mb_str_pad($itemName, 15)
          . mb_str_pad($quantity, 5, " ", STR_PAD_LEFT)
          . mb_str_pad($unitPrice, 8, " ", STR_PAD_LEFT)
          . mb_str_pad($totalPrice, 10, " ", STR_PAD_LEFT);
    $pdf->Cell(0, 4, $line, 0, 1, 'L');

    $totalItems += $quantity;
}
$pdf->Cell(0, 2, str_repeat("-", 40), 0, 1, 'L');

$pdf->Ln(1);

// ===============================
// Totals
// ===============================

$pdf->SetFont('THSarabunNew', '', 9);
$pdf->Cell(0, 4, "Total Items: " . $totalItems, 0, 1, 'L');

$pdf->SetFont('THSarabunNew', '', 11);
$totalAmount = isset($order_data['TotalAmount']) ? number_format($order_data['TotalAmount'], 2) : '0.00';
$pdf->Cell(0, 5, "TOTAL: " . $totalAmount . " THB", 0, 1, 'L');

$pdf->Ln(2);
$pdf->Cell(0, 3, str_repeat("=", 30), 0, 1, 'L');
$pdf->Ln(3);

// ===============================
// QR Code for Feedback
// ===============================

if (isset($qrcodeFile) && file_exists($qrcodeFile)) {
    $pdf->SetFont('THSarabunNew', '', 8);
    $pdf->Cell(0, 3, "Scan for feedback", 0, 1, 'C');
    $pdf->Ln(1);

    $qrSize = 20;
    $qrX = ($pdf->GetPageWidth() - $qrSize) / 2;
    $pdf->Image($qrcodeFile, $qrX, $pdf->GetY(), $qrSize, $qrSize);
    $pdf->Ln(22);
}

// ===============================
// Footer
// ===============================

$pdf->Cell(0, 3, str_repeat("=", 30), 0, 1, 'L');
$pdf->Ln(1);

$pdf->SetFont('THSarabunNew', '', 10);
$pdf->Cell(0, 4, "Thank you!", 0, 1, 'C');

$pdf->Ln(2);
$pdf->SetFont('THSarabunNew', '', 7);
$pdf->Cell(0, 3, "Printed: " . date('d/m/Y H:i:s'), 0, 1, 'C');

// Save PDF
$receiptDir = __DIR__ . "/uploads/receipts";
if (!file_exists($receiptDir)) mkdir($receiptDir, 0755, true);
$pdfFile = $receiptDir . "/receipt_" . $order_id . ".pdf";
$pdf->Output("F", $pdfFile);
echo "PDF generated: $pdfFile\n";

// Thermal Print
// try {
//     $connector = new WindowsPrintConnector("POS-58"); // ชื่อเครื่องพิมพ์
//     $printer = new Printer($connector);

//     // โลโก้ + ข้อมูลร้าน
//     $printer->setJustification(Printer::JUSTIFY_CENTER);
//     if (!empty($order_data['logo_url']) && file_exists($logoPath)) {
//         $printer->bitImage(file_get_contents($logoPath)); // โลโก้เล็ก
//     }
//     $printer->text($order_data['store_name'] . "\n");
//     $printer->text($order_data['address'] . "\n");
//     $printer->text("โทร: " . $order_data['contact_phone'] . "\n");
//     $printer->text("--------------------------------\n");

//     $printer->setJustification(Printer::JUSTIFY_LEFT);
//     foreach ($order_items as $item) {
//         $line = $item['Name'] . " x" . $item['Quantity'] . "  " . number_format($item['SubTotal'], 2) . " บาท\n";
//         $printer->text($line);
//     }

//     $printer->text("--------------------------------\n");
//     $printer->setJustification(Printer::JUSTIFY_RIGHT);
//     $printer->text("รวมทั้งหมด: " . number_format($order_data['TotalAmount'], 2) . " บาท\n");

//     if (file_exists($qrcodeFile)) {
//         $printer->qrCode($feedbackUrl, Printer::QR_ECLEVEL_L, 6);
//     }

//     $printer->setJustification(Printer::JUSTIFY_CENTER);
//     $printer->text("\nขอบคุณที่ใช้บริการครับ/ค่ะ\n");
//     $printer->cut();
//     $printer->close();
// } catch (Exception $e) {
//     file_put_contents(__DIR__ . '/logs/printer_error.log', date('Y-m-d H:i:s') . " " . $e->getMessage() . "\n", FILE_APPEND);
//     echo "Printer error: " . $e->getMessage() . "\n";
// }

$conn->close();
