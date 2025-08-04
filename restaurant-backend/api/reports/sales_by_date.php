<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$period = $_GET['period'] ?? 'daily';
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$where = "o.Status = 'paid'";

// เงื่อนไขช่วงวันที่
$dateFilter = '';
if ($period === 'custom' && $startDate && $endDate) {
    $dateFilter = "AND DATE(o.OrderTime) BETWEEN '$startDate' AND '$endDate'";
} elseif ($period === 'week') {
    $dateFilter = "AND o.OrderTime >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
}

switch ($period) {
    case 'month':
    case 'monthly':
        $groupBy = "DATE_FORMAT(o.OrderTime, '%Y-%m')";
        break;
    case 'year':
    case 'yearly':
        $groupBy = "YEAR(o.OrderTime)";
        break;
    default:
        $groupBy = "DATE(o.OrderTime)";
        break;
}

// === 1. ดึงยอดขายตามช่วงเวลา ===
$sql = "SELECT $groupBy AS period, SUM(o.TotalAmount) AS total_sales 
        FROM `order` o
        WHERE $where $dateFilter
        GROUP BY period
        ORDER BY period ASC";

$result = $conn->query($sql);
$data = [];
$totalSales = 0;
while ($row = $result->fetch_assoc()) {
    $row['total_sales'] = (float)$row['total_sales'];
    $data[] = $row;
    $totalSales += $row['total_sales'];
}

// === 2. นับจำนวนออเดอร์ ===
$orderCountSql = "SELECT COUNT(*) AS total_orders 
    FROM `order` o 
    WHERE o.Status = 'paid' $dateFilter";

$orderCountResult = $conn->query($orderCountSql);
$totalOrders = 0;
if ($orderCountResult) {
    $row = $orderCountResult->fetch_assoc();
    $totalOrders = (int)$row['total_orders'];
}

// === 3. ต้นทุนและกำไรขั้นต้น ===
$costSql = "SELECT 
    SUM(oi.Cost * oi.Quantity) AS total_cost, 
    SUM(oi.SubTotal) AS total_revenue
FROM OrderItem oi
JOIN `order` o ON oi.OrderID = o.OrderID
WHERE o.Status = 'paid' $dateFilter";

$costResult = $conn->query($costSql);
$totalCost = 0;
$netRevenue = 0;
if ($costResult) {
    $costRow = $costResult->fetch_assoc();
    $totalCost = (float)$costRow['total_cost'];
    $netRevenue = (float)$costRow['total_revenue'] - $totalCost;
}

// === 4. คำนวณภาษี ===
$tax = $totalSales * 0.07;

// === 5. ส่งกลับ ===
$summary = [
    'total_sales' => $totalSales,
    'total_orders' => $totalOrders,
    'total_cost' => $totalCost,
    'net_revenue' => $netRevenue,
    'tax' => $tax,
];

echo json_encode([
    'sales' => $data,
    'summary' => $summary
]);
?>
