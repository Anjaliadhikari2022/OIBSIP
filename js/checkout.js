// Initialize the checkout page
document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();
  setupFormSubmission();
  updateNavbar();
});

// Load cart items and display them in the order summary
function loadCartItems() {
  // First try to get cart from session storage (from checkout flow)
  let cart = JSON.parse(sessionStorage.getItem('checkoutCart') || '[]');
  
  // If not found in checkout cart, try to get from cart functions
  if (!cart || cart.length === 0) {
    cart = window.cartFunctions?.getCart?.() || [];
  }

  // Ensure all items have the correct structure
  const validatedCart = cart.map(item => ({
    name: item.name || 'Unknown Item',
    price: Number(item.price) || 0,
    quantity: Number(item.quantity || item.qty || 1),
    qty: Number(item.qty || item.quantity || 1)
  }));

  const orderItemsEl = document.getElementById('order-items');
  const subtotal = validatedCart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Update the cart in session storage with validated data
  sessionStorage.setItem('checkoutCart', JSON.stringify(validatedCart));

  if (!cart || cart.length === 0) {
    orderItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    updateTotals(0);
    
    // Disable the form if cart is empty
    const form = document.getElementById('delivery-form');
    if (form) {
      form.querySelectorAll('input, button, textarea, select').forEach(el => {
        el.disabled = true;
      });
    }
    
    return;
  }

  let itemsHtml = '';
  
  validatedCart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    
    itemsHtml += `
      <div class="order-item">
        <div class="item-details">
          <span class="item-name">${item.name} × ${item.quantity}</span>
          <span class="item-price">₹${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  });

  orderItemsEl.innerHTML = itemsHtml;
  updateTotals(subtotal);
}

// Update order totals
function updateTotals(subtotal) {
  const deliveryFee = 40; // Fixed delivery fee
  const total = subtotal + deliveryFee;
  
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('delivery-fee').textContent = `₹${deliveryFee.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
  
  // Store the total in session storage for the confirmation page
  sessionStorage.setItem('orderTotal', total.toString());
  
  // Disable place order button if cart is empty
  const placeOrderBtn = document.querySelector('.place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = subtotal === 0;
  }
}

// Handle form submission
function setupFormSubmission() {
  const form = document.getElementById('delivery-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    
    const orderData = {
      id: generateOrderId(),
      items: cart,
      customerName: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      instructions: form.instructions.value.trim(),
      paymentMethod: form.payment.value,
      status: 'pending',
      timestamp: new Date().toISOString(),
      subtotal: parseInt(document.getElementById('subtotal').textContent.replace('₹', '')),
      deliveryFee: 40,
      total: parseInt(document.getElementById('total').textContent.replace('₹', ''))
    };
    
    try {
      await submitOrder(orderData);
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast('Error placing order. Please try again.');
    }
  });
}

// Generate a unique order ID
function generateOrderId() {
  return 'ORD' + Date.now().toString().slice(-6);
}

// Submit order to storage
async function submitOrder(orderData) {
  // In a real app, you would send this to your backend
  // For now, we'll store it in localStorage
  const orders = JSON.parse(localStorage.getItem('pizzaOrders') || '[]');
  orders.push(orderData);
  localStorage.setItem('pizzaOrders', JSON.stringify(orders));
  
  // Clear the cart
  clearCart();
  updateCartCount();
  
  // Redirect to confirmation page
  window.location.href = `confirmation.html?orderId=${orderData.id}`;
}

// Helper function to get cart from session storage
function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}

// Helper function to clear cart
function clearCart() {
  sessionStorage.removeItem('cart');
}

// Update cart count in navigation
function updateNavbar() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = count;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
