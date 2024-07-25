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

        fetch('cart.php', {
            method: 'POST',
            body: formData
        }).then(response => response.text())
          .then(data => {
              if (data.includes('successfully')) {
                  // Update quantity displayed on page
                  if (newQuantity === 0) {
                      // If new quantity is 0, remove the row
                      form.closest('tr').remove();
                  } else {
                      const quantityElement = form.querySelector('.quantity');
                      quantityElement.textContent = newQuantity;
                  }
              } else {
                  alert('Error updating quantity');
              }
              location.reload(); // Reload page to reflect changes
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
                  // Remove the row from the table
                  form.closest('tr').remove();
              } else {
                  alert('Error removing item');
              }
              location.reload(); // Reload page to reflect changes
          });
    });
});
