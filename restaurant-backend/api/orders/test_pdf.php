<?php
require_once __DIR__ . '/tfpdf/tfpdf.php';

$pdf = new tFPDF();
$pdf->AddPage();

// เพิ่มฟอนต์ THSarabun
$pdf->AddFont('THSarabunNew','','THSarabunNew.ttf',true);

// ตั้งฟอนต์เป็น THSarabun ขนาด 18
$pdf->SetFont('THSarabunNew','',18);

$pdf->Cell(0,10,'Eng Hello Kitchen!',0,1);
$pdf->Cell(0,10,'Thai ทดสอบภาษาไทย!',0,1);

$pdf->Output();
