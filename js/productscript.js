const products = [
    { name: 'Product 1', price: 60, image: 'https://via.placeholder.com/150' },
    { name: 'Product 2', price: 120, image: 'https://via.placeholder.com/150' },
    { name: 'Product 3', price: 49, image: 'https://via.placeholder.com/150' },
    // Add more products as needed
];

let cart = [];

function displayProducts() {
    const productList = document.getElementById('product-list');
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

function addToCart(product, price) {
    const itemIndex = cart.findIndex(item => item.product === product);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
        cart[itemIndex].totalPrice += price;
    } else {
        cart.push({ product, price, quantity: 1, totalPrice: price });
    }
    displayCart();
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    cartItems.innerHTML = '';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.product}</td>
            <td>${item.price}</td>
            <td>${item.quantity}</td>
            <td>${item.totalPrice}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        cartItems.appendChild(row);
        totalPrice += item.totalPrice;
    });

    totalPriceElement.textContent = totalPrice;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function checkout() {
    alert('สั่งซื้อสินค้าสำเร็จ!');
    cart = [];
    displayCart();
}

displayProducts();
