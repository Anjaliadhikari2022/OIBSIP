document.addEventListener('DOMContentLoaded', () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    
    if (orderId) {
        
        document.getElementById('order-id').textContent = orderId;
        
        
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 45 * 60000); 
        
        
        const options = { hour: 'numeric', minute: '2-digit', hour12: true };
        const formattedTime = deliveryTime.toLocaleTimeString('en-US', options);
        document.getElementById('delivery-time').textContent = `Today, ${formattedTime}`;
        
        
        setTimeout(() => {
            const statusElement = document.querySelector('.status');
            if (statusElement) {
                statusElement.textContent = 'On the way';
                statusElement.style.color = '#2196F3';
                
                
                setTimeout(() => {
                    statusElement.textContent = 'Delivered';
                    statusElement.style.color = '#4CAF50';
                }, 30000);
            }
        }, 10000);
    } else {
        
        window.location.href = 'index.html';
    }
    
    
    updateCartCount();
});


function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
}
