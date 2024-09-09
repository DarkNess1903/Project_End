// ฟังก์ชันสำหรับอัพเดต UI ของตะกร้า
function updateCartUI() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "cart.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var cartItemsDiv = document.querySelector('.cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = xhr.responseText;
                // ตรวจสอบและลบ `topnavbar` ซ้ำหากมี
                var existingNavbar = document.querySelector('.topnavbar');
                if (existingNavbar) {
                    existingNavbar.remove();
                }
                // เพิ่ม `topnavbar` ใหม่ถ้าจำเป็น
                var newNavbar = document.createElement('div');
                newNavbar.className = 'topnavbar';
                // เพิ่มเนื้อหาของ `topnavbar` ตามต้องการ
                document.body.prepend(newNavbar);
            }
        } else if (xhr.readyState === 4) {
            console.error("เกิดข้อผิดพลาดในการโหลดตะกร้า");
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
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        console.log(response.message);
                        updateCartUI();
                        updateCartCount();
                    } else {
                        console.error("เกิดข้อผิดพลาด: " + response.message);
                    }
                } catch (e) {
                    console.error("ไม่สามารถแปลงข้อมูล JSON ได้:", e);
                }
            } else {
                console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + xhr.statusText);
            }
        }
    };
    xhr.send("productId=" + encodeURIComponent(productId) + "&change=" + encodeURIComponent(change));
}

// ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
function removeFromCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "removeFromCart.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    console.log(response.message);
                    updateCartUI();
                    updateCartCount();
                } catch (e) {
                    console.error("ไม่สามารถแปลงข้อมูล JSON ได้:", e);
                }
            } else {
                console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + xhr.statusText);
            }
        }
    };
    xhr.send("productId=" + encodeURIComponent(productId));
}

// ฟังก์ชันสำหรับอัพเดตจำนวนสินค้าตะกร้า
function updateCartCount() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getCartCount.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var cartCount = parseInt(xhr.responseText, 10) || 0;
                    var cartCountElement = document.querySelector('.cart-count');
                    if (cartCountElement) {
                        cartCountElement.textContent = cartCount;
                    }
                } catch (e) {
                    console.error("ไม่สามารถแปลงข้อมูล JSON ได้:", e);
                }
            } else {
                console.error("เกิดข้อผิดพลาดในการอัพเดตจำนวนสินค้า: " + xhr.statusText);
            }
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
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    console.log(response.message);
                    if (response.success) {
                        updateCartCount();
                    } else {
                        console.error("เกิดข้อผิดพลาด: " + response.message);
                    }
                } catch (e) {
                    console.error("ไม่สามารถแปลงข้อมูล JSON ได้:", e);
                }
            } else {
                console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + xhr.statusText);
            }
        }
    };
    xhr.send("productId=" + encodeURIComponent(productId));
}

// เรียกใช้เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
