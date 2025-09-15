<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../../config/db.php';

$uploadedBy = $_POST['uploaded_by'] ?? 'unknown';
$date = date('Y-m-d'); // บังคับเป็นวันปัจจุบัน

$uploadDirServer = __DIR__ . '/uploads/' . $date . '/';
if (!file_exists($uploadDirServer)) mkdir($uploadDirServer, 0777, true);

$uploadedFiles = [];
if (!isset($_FILES['files'])) {
    echo json_encode(["success" => false, "error" => "No files uploaded"]);
    exit();
}

$files = $_FILES['files'];
for ($i = 0; $i < count($files['name']); $i++) {
    $tmpName = $files['tmp_name'][$i];
    $originalName = basename($files['name'][$i]);
    $ext = pathinfo($originalName, PATHINFO_EXTENSION);
    $newFileName = uniqid() . "." . $ext;
    $targetPathServer = $uploadDirServer . $newFileName;

    if (move_uploaded_file($tmpName, $targetPathServer)) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $publicUrl = $protocol . '://' . $host . '/project_END/restaurant-backend/api/payment_slips/uploads/' . $date . '/' . $newFileName;

        $stmt = $conn->prepare("INSERT INTO payment_slips (UploadedBy, FileName, FilePath, UploadDate) VALUES (?, ?, ?, ?)");
        $uploadDateTime = $date . ' ' . date('H:i:s');
        $stmt->bind_param("ssss", $uploadedBy, $newFileName, $publicUrl, $uploadDateTime);
        $stmt->execute();
        $stmt->close();

        $uploadedFiles[] = ['file' => $newFileName, 'url' => $publicUrl];
    }
}

$conn->close();
echo json_encode(["success" => true, "uploaded_files" => $uploadedFiles]);
