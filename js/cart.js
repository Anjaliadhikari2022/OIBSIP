// Cart functionality

// Make cart functions globally available
window.cartFunctions = {
    getCart: function() {
        const cart = sessionStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    saveCart: function(cart) {
        sessionStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
    },
    updateCartCount: function() {
        const cart = this.getCart();
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
        return count;
    },
    calculateCartTotal: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            return total + (item.price * (item.quantity || 1));
        }, 0);
    }
};

// Initialize the cart when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const userRole = sessionStorage.getItem("userRole");
  
  if (userRole !== "user") {
    // Show a message but don't redirect automatically
    showToast('Please login to view your cart', 'info');
    sessionStorage.setItem('redirectAfterLogin', 'cart.html');
  }
  
  // Always render the cart (it will be empty if not logged in)
  renderCart();
  window.cartFunctions.updateCartCount();
});

// Calculate the total price of items in the cart
function calculateCartTotal(cart) {
  return cart.reduce((total, item) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);
}

// Update the cart summary with current totals
function updateCartSummary(cart) {
  const cartSummary = document.getElementById('cart-summary');
  const subtotal = calculateCartTotal(cart);
  const deliveryFee = 40; // Fixed delivery fee
  const total = subtotal + deliveryFee;
  
  if (cartSummary) {
    document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
    document.getElementById('cart-total').textContent = `₹${total}`;
  }
  
  // Update checkout button state
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }
}

// Render the cart items
function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById('cart-container');
  const emptyCartMsg = document.getElementById('empty-cart');
  const cartSummary = document.getElementById('cart-summary');
  
  if (cart.length === 0) {
    if (emptyCartMsg) emptyCartMsg.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
    if (cartContainer) cartContainer.innerHTML = '';
    return;
  }
  
  if (emptyCartMsg) emptyCartMsg.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'block';
  
  let cartHTML = '';
  
  cart.forEach((item, index) => {
    cartHTML += `
      <div class="cart-item">
        <div class="item-info">
          <h3>${item.name}</h3>
          <p class="item-price">₹${item.price * (item.quantity || 1)}</p>
        </div>
        <div class="item-actions">
          <div class="qty-controls">
            <button onclick="decreaseQty(${index}, event)" class="qty-btn">-</button>
            <span>${item.quantity || 1}</span>
            <button onclick="increaseQty(${index}, event)" class="qty-btn">+</button>
          </div>
          <button onclick="removeItem(${index}, event)" class="remove-btn">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
  });
  
  if (cartContainer) {
    cartContainer.innerHTML = cartHTML;
  }
  
  updateCartSummary(cart);
}

// Increase item quantity
function increaseQty(index, event) {
  if (event) event.stopPropagation();
  
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart[index].quantity = (cart[index].quantity || 1) + 1;
    saveCart(cart);
    renderCart();
    updateCartCount();
  }
}

// Decrease item quantity
function decreaseQty(index, event) {
  if (event) event.stopPropagation();
  
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      // If quantity is 1, remove the item
      if (confirm('Remove this item from your cart?')) {
        cart.splice(index, 1);
        showToast('Item removed from cart', 'success');
      } else {
        return; // User cancelled
      }
    }
    
    saveCart(cart);
    renderCart();
    updateCartCount();
    
    if (cart.length === 0) {
      showToast('Your cart is empty', 'info');
    }
  }
}

// Remove item from cart
function removeItem(index, event) {
  if (event) event.stopPropagation();
  
  if (confirm('Are you sure you want to remove this item?')) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
      updateCartCount();
      showToast('Item removed from cart', 'success');
      
      if (cart.length === 0) {
        showToast('Your cart is empty', 'info');
      }
    }
  }
}

// Proceed to checkout
function proceedToCheckout() {
  const cart = getCart();
  
  if (!cart || cart.length === 0) {
    showToast('Your cart is empty', 'warning');
    return;
  }
  
  // Ensure all items have the correct structure
  const validatedCart = cart.map(item => ({
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity || item.qty || 1),
    qty: Number(item.qty || item.quantity || 1)
  }));
  
  // Save the validated cart to session storage
  sessionStorage.setItem('checkoutCart', JSON.stringify(validatedCart));
  
  // Check if user is logged in
  if (sessionStorage.getItem("userRole") !== "user") {
    sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
    showToast('Please login to proceed to checkout', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } else {
    window.location.href = 'checkout.html';
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  // Set message and type
  toast.textContent = message;
  
  // Remove all type classes
  toast.classList.remove('success', 'error', 'warning', 'info');
  
  // Add the specified type class
  if (type) {
    toast.classList.add(type);
  }
  
  // Add icon based on type
  let icon = 'info-circle';
  switch(type) {
    case 'success':
      icon = 'check-circle';
      break;
    case 'error':
      icon = 'exclamation-circle';
      break;
    case 'warning':
      icon = 'exclamation-triangle';
      break;
  }
  
  // Add icon to toast
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  
  // Show toast with animation
  toast.classList.add('show');
  
  // Hide after delay
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Get cart from sessionStorage
function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}

// Save cart to sessionStorage
function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in navigation
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = count;
  
  // Update cart summary visibility
  const cartSummary = document.getElementById('cart-summary');
  const emptyCartMsg = document.getElementById('empty-cart');
  
  if (count > 0) {
    if (cartSummary) cartSummary.style.display = 'block';
    if (emptyCartMsg) emptyCartMsg.style.display = 'none';
  } else {
    if (cartSummary) cartSummary.style.display = 'none';
    if (emptyCartMsg) emptyCartMsg.style.display = 'block';
  }
}
