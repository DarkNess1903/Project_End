// cart.js

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    function updateCartCount() {
        let cartCount = localStorage.getItem('cartCount') || 0;
        document.querySelector('.cart-count').textContent = cartCount;
    }

    window.addToCart = function(productId) {
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
                        let cartCount = parseInt(localStorage.getItem('cartCount') || 0);
                        localStorage.setItem('cartCount', cartCount + 1);
                        updateCartCount();
                    }
                };
                xhrAdd.send(JSON.stringify(productData));
            }
        };
        xhr.send();
    };
});

// js/cart.js

function changeQuantity(productId, change) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "updateCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // อัพเดต UI ของตะกร้าหลังจากเปลี่ยนแปลง
            document.querySelector('.cart-items').innerHTML = xhr.responseText;
            updateCartCount(); // อัพเดตจำนวนสินค้าในตะกร้า
        }
    };
    xhr.send("productId=" + productId + "&change=" + change);
}

function removeFromCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "removeFromCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // อัพเดต UI ของตะกร้าหลังจากลบสินค้า
            document.querySelector('.cart-items').innerHTML = xhr.responseText;
            updateCartCount(); // อัพเดตจำนวนสินค้าในตะกร้า
        }
    };
    xhr.send("productId=" + productId);
}

function updateCartCount() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getCartCount.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.querySelector('.cart-count').textContent = xhr.responseText;
        }
    };
    xhr.send();
}

