// cart.js

document.addEventListener('DOMContentLoaded', function() {
    // อัปเดตจำนวนสินค้าตะกร้าเมื่อโหลดหน้า
    updateCartCount();

    function updateCartCount() {
        // สมมติว่าคุณมีฟังก์ชันที่ดึงข้อมูลตะกร้าสินค้า
        let cartCount = localStorage.getItem('cartCount') || 0;
        document.querySelector('.cart-count').textContent = cartCount;
    }
});

function addToCart(productId) {
    // ดึงข้อมูลสินค้าจากฐานข้อมูลโดยใช้ AJAX
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getProduct.php?id=" + productId, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var product = JSON.parse(xhr.responseText);

            var productData = {
                product: product.product_name,
                price: product.price,
                quantity: 1,
                totalPrice: product.price,
                imagePath: product.image
            };

            var xhrAdd = new XMLHttpRequest();
            xhrAdd.open("POST", "cartInsert.php", true);
            xhrAdd.setRequestHeader("Content-Type", "application/json");
            xhrAdd.onreadystatechange = function () {
                if (xhrAdd.readyState === 4 && xhrAdd.status === 200) {
                    console.log(xhrAdd.responseText);
                    alert("เพิ่มสินค้าเข้าตะกร้าแล้ว!");
                    // อัปเดตจำนวนสินค้าตะกร้า
                    let cartCount = parseInt(localStorage.getItem('cartCount') || 0);
                    localStorage.setItem('cartCount', cartCount + 1);
                    updateCartCount();
                }
            };
            xhrAdd.send(JSON.stringify(productData));
        }
    };
    xhr.send();
}
// script.js

function addToCart(productId) {
    // ส่งข้อมูลไปยังเซิร์ฟเวอร์เพื่อเพิ่มสินค้าในตะกร้า
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "addToCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText); // แสดงข้อความตอบกลับจากเซิร์ฟเวอร์
            updateCartCount(); // อัพเดตจำนวนสินค้าที่อยู่ในตะกร้า
        }
    };
    xhr.send("productId=" + productId);
}

function updateCartCount() {
    // ดึงจำนวนสินค้าจากเซิร์ฟเวอร์และอัพเดตจำนวนใน UI
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getCartCount.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.querySelector('.cart-count').textContent = xhr.responseText;
        }
    };
    xhr.send();
}

function removeFromCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "removeFromCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText); // แสดงข้อความตอบกลับจากเซิร์ฟเวอร์
            updateCartCount(); // อัพเดตจำนวนสินค้าที่อยู่ในตะกร้า
            updateCartUI(); // อัพเดต UI ของตะกร้า
        }
    };
    xhr.send("productId=" + productId);
}

function updateCartUI() {
    // ดึงข้อมูลตะกร้าจากเซิร์ฟเวอร์และอัพเดต UI
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getCart.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.querySelector('.cart-items').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}
