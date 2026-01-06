document.addEventListener('DOMContentLoaded', () => {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    // Update order details on the page
    if (orderId) {
        // In a real app, you would fetch the order details from your backend
        // For now, we'll use the order ID from the URL
        document.getElementById('order-id').textContent = orderId;
        
        // Calculate estimated delivery time (30-45 minutes from now)
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 45 * 60000); // Add 45 minutes
        
        // Format the delivery time (e.g., "11:45 AM - 12:00 PM")
        const options = { hour: 'numeric', minute: '2-digit', hour12: true };
        const formattedTime = deliveryTime.toLocaleTimeString('en-US', options);
        document.getElementById('delivery-time').textContent = `Today, ${formattedTime}`;
        
        // Update order status (simulate real-time updates)
        setTimeout(() => {
            const statusElement = document.querySelector('.status');
            if (statusElement) {
                statusElement.textContent = 'On the way';
                statusElement.style.color = '#2196F3';
                
                // Simulate order delivered after some time
                setTimeout(() => {
                    statusElement.textContent = 'Delivered';
                    statusElement.style.color = '#4CAF50';
                }, 30000); // After 30 seconds
            }
        }, 10000); // After 10 seconds
    } else {
        // No order ID found, redirect to home
        window.location.href = 'index.html';
    }
    
    // Update cart count in navigation
    updateCartCount();
});

// Update cart count in navigation
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
}
