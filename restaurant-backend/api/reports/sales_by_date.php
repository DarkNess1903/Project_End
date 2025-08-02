<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once '../../config/db.php';

// รับค่า GET
$period = $_GET['period'] ?? 'daily';
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

switch ($period) {
    case 'monthly':
        $groupBy = "DATE_FORMAT(OrderTime, '%Y-%m')";
        $where = "Status = 'paid'";
        break;
    case 'yearly':
        $groupBy = "YEAR(OrderTime)";
        $where = "Status = 'paid'";
        break;
    case 'week':
        $groupBy = "DATE(OrderTime)";
        $where = "Status = 'paid' AND OrderTime >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
        break;
    case 'custom':
        $groupBy = "DATE(OrderTime)";
        $where = "Status = 'paid'";
        if ($startDate && $endDate) {
            $where .= " AND DATE(OrderTime) BETWEEN '$startDate' AND '$endDate'";
        }
        break;
    default:
        $groupBy = "DATE(OrderTime)";
        $where = "Status = 'paid'";
        break;
}

$sql = "SELECT $groupBy AS period, SUM(TotalAmount) AS total_sales 
        FROM `order`
        WHERE $where
        GROUP BY period
        ORDER BY period ASC";


$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
