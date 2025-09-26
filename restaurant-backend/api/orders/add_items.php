<?php
// ======================
// CORS Headers
// ======================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=UTF-8');

require_once '../../config/db.php';
require_once __DIR__ . '/tfpdf/tfpdf.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing order_id or items (must be array)"
    ]);
    exit();
}

$order_id = intval($data['order_id']);
$items = $data['items'];
$total_add = 0;

$conn->begin_transaction();

try {
    $print_items = [];
    $total_add = 0;

    foreach ($items as $item) {
        $menu_id = intval($item['menu_id']);
        $quantity = intval($item['quantity']);
        $note = $item['note'] ?? '';

        // ดึงข้อมูลเมนู
        $menuQuery = $conn->prepare("SELECT Name, Price, Cost FROM Menu WHERE MenuID = ?");
        $menuQuery->bind_param("i", $menu_id);
        $menuQuery->execute();
        $result = $menuQuery->get_result();
        $menu = $result->fetch_assoc();
        $menuQuery->close();

        if (!$menu) throw new Exception("Menu not found: $menu_id");

        $price = floatval($menu['Price']);
        $cost = floatval($menu['Cost']);

        // 🔍 เช็คว่าเมนูนี้มีอยู่ในออร์เดอร์แล้วหรือไม่
        $check = $conn->prepare("SELECT OrderItemID, Quantity FROM OrderItem WHERE OrderID = ? AND MenuID = ?");
        $check->bind_param("ii", $order_id, $menu_id);
        $check->execute();
        $resCheck = $check->get_result();
        $exists = $resCheck->fetch_assoc();
        $check->close();

        if ($exists) {
            // ถ้ามีแล้ว → update จำนวนและ SubTotal
            $newQty = $exists['Quantity'] + $quantity;
            $newSubtotal = $price * $newQty;

            $update = $conn->prepare("UPDATE OrderItem SET Quantity = ?, SubTotal = ? WHERE OrderItemID = ?");
            $update->bind_param("idi", $newQty, $newSubtotal, $exists['OrderItemID']);
            $update->execute();
            $update->close();

            $subtotal = $price * $quantity; // ส่วนนี้เพิ่มเข้าราคารวม order
        } else {
            // ถ้าไม่มี → insert ใหม่
            $subtotal = $price * $quantity;

            $stmt = $conn->prepare("INSERT INTO OrderItem (OrderID, MenuID, Quantity, SubTotal, Cost, Note) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiidss", $order_id, $menu_id, $quantity, $subtotal, $cost, $note);
            $stmt->execute();
            $stmt->close();
        }

        $total_add += $subtotal;

        $print_items[] = [
            "name" => $menu['Name'],
            "quantity" => $quantity,
            "note" => $note,
            "cost" => $cost
        ];
    }

    // อัปเดตราคารวม order
    $stmt_total = $conn->prepare("UPDATE `orders` SET TotalAmount = TotalAmount + ? WHERE OrderID = ?");
    $stmt_total->bind_param("di", $total_add, $order_id);
    $stmt_total->execute();
    $stmt_total->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "added_amount" => $total_add,
        "message" => "เพิ่มรายการอาหารเรียบร้อย"
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();

// ======================
// ฟังก์ชันสร้าง PDF ใบสั่งครัว
// ======================
function generateKitchenReceiptPDF($order_id, $items, $table_id, $width_mm = 58)
{
    $pdf = new tFPDF('P', 'mm', array($width_mm, 297)); // ความสูง 297mm
    $pdf->AddPage();

    // ฟอนต์ไทย Unicode
    $pdf->AddFont('THSarabunNew', '', 'THSarabunNew.ttf', true);
    $pdf->SetFont('THSarabunNew', '', 14);

    // หัวบิล
    $pdf->Cell(0, 6, '*** ใบสั่งครัว ***', 0, 1, 'C');
    $pdf->Ln(2);

    $pdf->SetFont('THSarabunNew', '', 12);
    $pdf->Cell(0, 5, "Order ID: $order_id", 0, 1);
    $pdf->Cell(0, 5, date("Y-m-d H:i:s"), 0, 1);
    $pdf->Ln(3);

    foreach ($items as $item) {
        $pdf->Cell(0, 5, $item['name'] . " x" . $item['quantity'], 0, 1);
        if (!empty($item['note'])) {
            $pdf->Cell(0, 5, "   * " . $item['note'], 0, 1);
        }
    }

    $pdf->Ln(3);
    $pdf->Cell(0, 5, '---------------------------', 0, 1);

    $filename = __DIR__ . "/kitchen_receipt_$order_id.pdf";
    $pdf->Output('F', $filename);

    return $filename;
}

// ======================
// ฟังก์ชันพิมพ์จริงเข้าครัว (option)
// ======================
function printKitchenReceipt($order_id, $items, $table_id)
{
    $printer_ip = "192.168.1.100"; // ใส่ IP เครื่องพิมพ์ครัว
    $printer_port = 9100;

    $fp = @fsockopen($printer_ip, $printer_port);
    if (!$fp) {
        error_log("❌ ไม่สามารถเชื่อมต่อเครื่องพิมพ์ครัวได้");
        return false;
    }

    fwrite($fp, "***** ใบสั่งครัว *****\n");
    fwrite($fp, "Order ID: $order_id\n");
    fwrite($fp, date("Y-m-d H:i:s") . "\n");
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
