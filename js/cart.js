// JavaScript to handle quantity updates
document.querySelectorAll('.quantity-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const newQuantity = parseInt(formData.get('updateQuantity'), 10);

        if (newQuantity < 0) {
            alert('Quantity cannot be negative.');
            return;
        }

        // ตรวจสอบจำนวนสินค้าในสต็อกก่อนอัปเดต
        fetch('getProduct.php?id=' + formData.get('productId'))
            .then(response => response.json())
            .then(product => {
                if (newQuantity > product.stock) {
                    alert('จำนวนสินค้าเกินกว่าสต็อกที่มีอยู่.');
                } else {
                    return fetch('cart.php', {
                        method: 'POST',
                        body: formData
                    });
                }
            })
            .then(response => response.text())
            .then(data => {
                if (data && data.includes('successfully')) {
                    // อัปเดตจำนวนในหน้าเพจ
                    if (newQuantity === 0) {
                        form.closest('tr').remove();
                    } else {
                        form.querySelector('.quantity').textContent = newQuantity;
                    }
                    location.reload(); // รีเฟรชหน้าเพจหลังการอัปเดต
                } else {
                    alert('Error updating quantity');
                }
            });
    });
});

// JavaScript to handle item removal
document.querySelectorAll('.remove-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);

        fetch('cart.php', {
            method: 'POST',
            body: formData
        }).then(response => response.text())
          .then(data => {
              if (data.includes('successfully')) {
                  form.closest('tr').remove();
              } else {
                  alert('Error removing item');
              }
              location.reload(); // รีเฟรชหน้าเพจหลังจากลบสินค้า
          });
    });
});

// JavaScript to handle adding items to cart
function addToCart(productId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "getProduct.php?id=" + productId, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var product = JSON.parse(xhr.responseText);

            if (product.stock > 0) {
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
                        alert('สินค้าเพิ่มเข้าตะกร้าเรียบร้อยแล้ว');
                        console.log(xhrAdd.responseText);
                    }
                };
                xhrAdd.send(JSON.stringify(productData));
            } else {
                alert("สินค้าหมดแล้ว ไม่สามารถเพิ่มเข้าตะกร้าได้");
            }
        }
    };
    xhr.send();
}
