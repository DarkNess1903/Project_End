<?php
function sendLineNotify($message, $accessToken) {
    $url = 'https://notify-api.line.me/api/notify';
    
    $data = array('message' => $message);
    $headers = array(
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Bearer ' . $accessToken
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    
    if(curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
    }
    
    curl_close($ch);
    return $response;
}

// Replace with your actual Line Notify access token
$accessToken = 'Y0l8lajewGFBTsAtHL74ZcdSB9LFnaYElrhg8LapsBv';

// Test message
$message = "ทดสอบการส่งข้อความผ่าน Line Notify";

$response = sendLineNotify($message, $accessToken);
echo "Response: " . $response;
?>
