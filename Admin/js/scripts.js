function updateOrderStatus(button) {
    var orderId = $(button).data('order-id');
    $.ajax({
        url: 'update_order_status.php',
        method: 'POST',
        data: {
            order_id: orderId
        },
        success: function(response) {
            // ตรวจสอบการตอบสนอง JSON
            if (response.success) {
                alert('สถานะคำสั่งซื้อได้รับการอัปเดต');
                location.reload(); // รีเฟรชหน้าเพื่ออัปเดตข้อมูล
            } else {
                alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + (response.message || 'Unknown error'));
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
            alert('เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์');
        }
    });
}
