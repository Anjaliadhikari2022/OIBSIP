/* ================= CART HELPERS ================= */
function getCart() {
  return JSON.parse(sessionStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  sessionStorage.setItem("cart", JSON.stringify(cart));
}

/* ================= LOGIN CHECK ================= */
function isLoggedIn() {
  return !!sessionStorage.getItem("userRole");
}

/* ================= ADD ITEM ================= */
function addToCart(name, price) {
  if (!isLoggedIn()) {
    showToast("Please login to add items to cart 🔒");
    setTimeout(() => {
      // Store the current page to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = "login.html";
    }, 1200);
    return false;
  }

  let cart = getCart();
  const item = cart.find(p => p.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
  updateButtons();
  showToast(`${name} added to cart `);
  return false; // Prevent default form submission
}

/* ================= ADD ITEM (for menu page) ================= */
function addItem(name, price = 0) {
  if (!isLoggedIn()) {
    showToast("Please login to add items to cart");
    sessionStorage.setItem('redirectAfterLogin', 'menu.html');
    return false;
  }

  let cart = getCart();
  const itemIndex = cart.findIndex(p => p.name === name);

  if (itemIndex !== -1) {
    cart[itemIndex].qty += 1;
  } else {
    cart.push({ 
      name, 
      price: Number(price) || 0, 
      qty: 1,
      quantity: 1 // Adding both qty and quantity for compatibility
    });
  }

  saveCart(cart);
  updateCartCount();
  updateButtons();
  showToast(`${name} added to cart `);
  return false; // Prevent default form submission
}

/* ================= CHANGE QTY ================= */
function changeQty(name, change) {
  let cart = getCart();
  const item = cart.find(p => p.name === name);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(p => p.name !== name);
  }

  saveCart(cart);
  updateCartCount();
  updateButtons();
}

/* ================= BUTTON UI ================= */
function updateButtons() {
  const cart = getCart();

  document.querySelectorAll(".cart-actions").forEach(action => {
    const name = action.dataset.item;
    const addBtn = action.querySelector(".add-btn");
    const qtyBox = action.querySelector(".qty-controls");
    const qtyText = action.querySelector(".qty");

    const item = cart.find(p => p.name === name);

    if (item) {
      addBtn.classList.add("hidden");
      qtyBox.classList.remove("hidden");
      qtyText.innerText = item.qty;
    } else {
      addBtn.classList.remove("hidden");
      qtyBox.classList.add("hidden");
    }
  });
}

/* ================= CART COUNT ================= */
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => {
    const qty = Number(item.qty) || 0;
    return sum + qty;
  }, 0);

  const el = document.getElementById("cart-count");
  if (el) el.textContent = total > 0 ? total : '0';
}

/* ================= NAVBAR ================= */
function controlNavbar() {
  const role = sessionStorage.getItem("userRole");
  const username = localStorage.getItem("username") || "User";

  const loginNav = document.getElementById("nav-login");
  const adminNav = document.getElementById("nav-admin");
  const logoutNav = document.getElementById("nav-logout");
  const cartNav = document.getElementById("nav-cart");
  const userNav = document.getElementById("nav-user");

  if (!loginNav) return;

  if (!role) {
    loginNav.style.display = "block";
    if (logoutNav) logoutNav.style.display = "none";
    if (cartNav) cartNav.style.display = "none";
    if (userNav) userNav.style.display = "none";
    if (adminNav) adminNav.style.display = "none";
    if (cartNav) cartNav.style.display = "block"; // keep visible
  } else {
    loginNav.style.display = "none";
    if (logoutNav) logoutNav.style.display = "block";
    if (cartNav) cartNav.style.display = "block";
    if (userNav) {
      userNav.style.display = "block";
      const usernameSpan = userNav.querySelector('.username');
      if (usernameSpan) {
        usernameSpan.textContent = ` ${username}`;
      }
    }
    if (role === "admin" && adminNav) adminNav.style.display = "block";
  }
}

/* ================= LOGOUT ================= */
function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}

/* ================= TOAST ================= */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

/* ================= CHECK AUTH ON PROTECTED PAGES ================= */
function checkAuthForProtectedPages() {
    const protectedPages = ['cart.html', 'checkout.html', 'profile.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        // Just show a message, don't redirect
        showToast("Please login to access this page");
        // Store the intended page for after login
        sessionStorage.setItem('redirectAfterLogin', currentPage);
        return false;
    }
    return true;
}

/* ================= HANDLE REDIRECT AFTER LOGIN ================= */
function handlePostLoginRedirect() {
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  if (redirectTo && isLoggedIn()) {
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectTo;
  }
}

/* ================= ON LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updateButtons();
    controlNavbar();
    
    // Only check authentication for protected pages
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['cart.html', 'checkout.html', 'profile.html', 'admin.html'];
    
    if (protectedPages.includes(currentPage)) {
        checkAuthForProtectedPages();
    }
    
    // Handle redirect after login
    if (window.location.pathname.includes('login.html') && isLoggedIn()) {
        handlePostLoginRedirect();
    }
});
