
document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();
  setupFormSubmission();
  updateNavbar();
});


function loadCartItems() {
  
  let cart = JSON.parse(sessionStorage.getItem('checkoutCart') || '[]');
  
  
  if (!cart || cart.length === 0) {
    cart = window.cartFunctions?.getCart?.() || [];
  }

  
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

  
  sessionStorage.setItem('checkoutCart', JSON.stringify(validatedCart));

  if (!cart || cart.length === 0) {
    orderItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    updateTotals(0);
    
    
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


function updateTotals(subtotal) {
  const deliveryFee = 40; 
  const total = subtotal + deliveryFee;
  
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('delivery-fee').textContent = `₹${deliveryFee.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
  
  
  sessionStorage.setItem('orderTotal', total.toString());
  
 
  const placeOrderBtn = document.querySelector('.place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = subtotal === 0;
  }
}


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


function generateOrderId() {
  return 'ORD' + Date.now().toString().slice(-6);
}


async function submitOrder(orderData) {
  
  const orders = JSON.parse(localStorage.getItem('pizzaOrders') || '[]');
  orders.push(orderData);
  localStorage.setItem('pizzaOrders', JSON.stringify(orders));
  
  
  clearCart();
  updateCartCount();
  
  
  window.location.href = `confirmation.html?orderId=${orderData.id}`;
}


function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}


function clearCart() {
  sessionStorage.removeItem('cart');
}


function updateNavbar() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = count;
}


function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
