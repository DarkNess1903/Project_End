// ฟังก์ชันสำหรับอัพเดต UI ของตะกร้า
function updateCartUI() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "cart.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var cartItemsDiv = document.querySelector('.cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = xhr.responseText;
            }
        }
    };
    xhr.send();
}

// ฟังก์ชันสำหรับเปลี่ยนจำนวนสินค้าในตะกร้า
function changeQuantity(productId, change) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "updateCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                alert(response.message); // แสดงข้อความที่ได้รับจากเซิร์ฟเวอร์
                updateCartUI(); // อัพเดต UI ของตะกร้า
                updateCartCount(); // อัพเดตจำนวนสินค้าในตะกร้า
            } else {
                alert("เกิดข้อผิดพลาด: " + response.message);
            }
        }
    };
    xhr.send("productId=" + productId + "&change=" + change);
}

// ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
function removeFromCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "removeFromCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = xhr.responseText;
            alert(response); // แสดงข้อความที่ได้รับจากเซิร์ฟเวอร์
            updateCartUI(); // อัพเดต UI ของตะกร้า
            updateCartCount(); // อัพเดตจำนวนสินค้าในตะกร้า
        }
    };
    xhr.send("productId=" + productId);
}

// ฟังก์ชันสำหรับอัพเดตจำนวนสินค้าตะกร้า
function updateCartCount() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getCartCount.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var cartCount = parseInt(xhr.responseText) || 0;
            document.querySelector('.cart-count').textContent = cartCount;
        }
    };
    xhr.send();
}

// ฟังก์ชันสำหรับเพิ่มสินค้าเข้าตะกร้า
function addToCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "addToCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response.message); // แสดงข้อความตอบกลับจากเซิร์ฟเวอร์
            if (response.success) {
                updateCartCount(); // อัพเดตจำนวนสินค้าตะกร้าหลังจากเพิ่มสินค้า
            }
        }
    };
    xhr.send("productId=" + productId);
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount(); // เรียกใช้เพื่ออัพเดตจำนวนสินค้าตะกร้าตอนเริ่มต้น
});

