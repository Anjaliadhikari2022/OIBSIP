window.onload = () => {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("role").value = "";
};

// LOGIN VALIDATION
function validateLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const error = document.getElementById("password-error");

  error.innerText = "";

  if (!email) {
    error.innerText = "Please enter your email ❌";
    return false;
  }

  if (password.length < 6) {
    error.innerText = "Password must be at least 6 characters ❌";
    return false;
  }

  if (!role) {
    showToast("Please select a role ❌");
    return false;
  }

  // Store user data
  const username = email.split('@')[0]; // Use part of email as username
  localStorage.setItem("username", username);
  localStorage.setItem("role", role);
  sessionStorage.setItem("userRole", role);

  showToast("Login successful ✅");

  // Check for redirect URL after login
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  
  setTimeout(() => {
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (redirectTo) {
      // Remove the redirect URL from storage
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectTo;
    } else {
      window.location.href = "index.html";
    }
  }, 1200);

  return false;
}

// PASSWORD EYE TOGGLE
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye-slash");
});

// TOAST
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
