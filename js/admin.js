// Admin state
let allOrders = [];

// Redirect non-admin users
if (sessionStorage.getItem("userRole") !== "admin") {
  window.location.href = "login.html";
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  // Refresh orders every 30 seconds
  setInterval(loadOrders, 30000);
});

// Load orders from localStorage or initialize empty array
function getOrders() {
  return JSON.parse(localStorage.getItem('pizzaOrders') || '[]');
}

// Save orders to localStorage
function saveOrders(orders) {
  localStorage.setItem('pizzaOrders', JSON.stringify(orders));
}

// Load and display orders
function loadOrders() {
  const loadingEl = document.getElementById('orders-loading');
  const ordersContainer = document.getElementById('orders-container');
  const noOrdersEl = document.getElementById('no-orders');
  
  loadingEl.style.display = 'flex';
  ordersContainer.innerHTML = '';
  noOrdersEl.style.display = 'none';

  try {
    // Simulate API call with a small delay
    setTimeout(() => {
      const orders = getOrders();
      allOrders = orders;
      
      if (orders.length === 0) {
        noOrdersEl.style.display = 'block';
      } else {
        orders.forEach((order, index) => {
          const orderEl = createOrderElement(order, index);
          ordersContainer.appendChild(orderEl);
        });
      }
      
      loadingEl.style.display = 'none';
    }, 500);
  } catch (error) {
    console.error('Error loading orders:', error);
    showToast('Error loading orders');
    loadingEl.style.display = 'none';
  }
}

// Create order card element
function createOrderElement(order, index) {
  const orderEl = document.createElement('div');
  orderEl.className = 'order-card';
  orderEl.dataset.id = order.id;
  
  const itemsList = order.items.map(item => 
    `${item.name} (${item.quantity} x ₹${item.price})`
  ).join('<br>');
  
  // Use the stored total if available, otherwise calculate it
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = order.deliveryFee || 0;
  const total = order.total || (subtotal + deliveryFee);
  
  orderEl.innerHTML = `
    <div class="order-header">
      <h3>Order #${order.id || (index + 1)}</h3>
      <span class="status ${order.status || 'pending'}">${order.status || 'Pending'}</span>
    </div>
    <div class="order-details">
      <p><strong>Customer:</strong> ${order.customerName || 'Guest'}</p>
      <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
      <p><strong>Address:</strong> ${order.address || 'Pickup'}</p>
      <div class="order-items">
        <strong>Items:</strong>
        <div>${itemsList}</div>
      </div>
      <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
      ${deliveryFee > 0 ? `<p><strong>Delivery Fee:</strong> ₹${deliveryFee.toFixed(2)}</p>` : ''}
      <p class="order-total"><strong>Total:</strong> ₹${total.toFixed(2)}</p>
      <p class="order-time">${new Date(order.timestamp || Date.now()).toLocaleString()}</p>
    </div>
    <div class="order-actions">
      <button class="status-btn" onclick="updateStatus('${order.id || index}')" 
        ${order.status === 'delivered' ? 'disabled' : ''}>
        ${order.status === 'delivered' ? 'Delivered' : 'Mark as Delivered'}
      </button>
    </div>
  `;
  
  return orderEl;
}

// Update order status
async function updateStatus(orderId) {
  try {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.id === parseInt(orderId));
    
    if (orderIndex === -1) {
      showToast('Order not found');
      return;
    }
    
    orders[orderIndex].status = 'delivered';
    saveOrders(orders);
    
    // Update the UI
    const orderEl = document.querySelector(`.order-card[data-id="${orderId}"]`);
    if (orderEl) {
      const statusEl = orderEl.querySelector('.status');
      const button = orderEl.querySelector('.status-btn');
      
      if (statusEl) {
        statusEl.textContent = 'Delivered';
        statusEl.className = 'status delivered';
      }
      
      if (button) {
        button.textContent = 'Delivered';
        button.disabled = true;
      }
    }
    
    showToast('Order marked as delivered!');
  } catch (error) {
    console.error('Error updating order status:', error);
    showToast('Error updating order status');
  }
}

// Logout
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
