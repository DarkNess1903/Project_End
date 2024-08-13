<?php
class ThailandTime {
    private $dateTime;

    public function __construct() {
        $this->dateTime = new DateTime('now', new DateTimeZone('Asia/Bangkok'));
    }

    public function getCurrentTime($format = 'Y-m-d H:i:s') {
        return $this->dateTime->format($format);
    }

    public function formatTime($format) {
        return $this->dateTime->format($format);
    }

    public function updateTime() {
        $this->dateTime = new DateTime('now', new DateTimeZone('Asia/Bangkok'));
    }
}
?>
