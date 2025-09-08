<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$uploadedBy = $_POST['uploaded_by'] ?? 'unknown';
if (!isset($_FILES['files'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No files uploaded"]);
    exit();
}

$files = $_FILES['files'];
$uploadDir = __DIR__ . '/uploads/' . ($_POST['date'] ?? date('Y-m-d')) . '/';
if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

$uploadedFiles = [];

for ($i = 0; $i < count($files['name']); $i++) {
    $tmpName = $files['tmp_name'][$i];
    $originalName = basename($files['name'][$i]);
    $ext = pathinfo($originalName, PATHINFO_EXTENSION);
    $newFileName = uniqid() . "." . $ext;
    $targetPath = $uploadDir . $newFileName;

    if (move_uploaded_file($tmpName, $targetPath)) {
        $uploadDate = $_POST['date'] . ' ' . date('H:i:s');
        $stmt = $conn->prepare("INSERT INTO payment_slips (UploadedBy, FileName, FilePath, UploadDate) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $uploadedBy, $newFileName, $targetPath, $uploadDate);
        $stmt->execute();
        $stmt->close();
        $uploadedFiles[] = $newFileName;
    }
}

$conn->close();

echo json_encode([
    "success" => true,
    "uploaded_files" => $uploadedFiles,
]);
