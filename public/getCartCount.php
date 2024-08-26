<?php
session_start();
if (isset($_SESSION['cart'])) {
    $cartCount = array_sum(array_column($_SESSION['cart'], 'quantity'));
    echo $cartCount;
} else {
    echo 0;
}
?>
