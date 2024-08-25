// getCartCount.php
<?php
session_start();

if (isset($_SESSION['cart'])) {
    echo array_sum($_SESSION['cart']);
} else {
    echo "0";
}
?>
