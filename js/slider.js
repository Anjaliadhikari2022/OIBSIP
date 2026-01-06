class PizzaSlider {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.slides = this.container.querySelectorAll('.pizza-slide');
    this.dots = this.container.querySelectorAll('.slider-dot');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoPlay = options.autoPlay || false;
    this.interval = options.interval || 5000;
    this.autoPlayInterval = null;
    
    this.init();
  }
  
  init() {
    
    this.updateActiveSlide(0);
    
   
    if (this.dots.length > 0) {
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
    }
    
   
    this.initTouchEvents();
    
    
    if (this.autoPlay && this.totalSlides > 1) {
      this.startAutoPlay();
      
      
      this.container.addEventListener('mouseenter', () => {
        this.pauseAutoPlay();
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.startAutoPlay();
      });
    }
    
   
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  updateActiveSlide(index) {
    
    this.currentSlide = (index + this.totalSlides) % this.totalSlides;
    
    
    this.slides.forEach((slide, i) => {
      slide.style.opacity = i === this.currentSlide ? '1' : '0.5';
      slide.style.transform = i === this.currentSlide ? 'scale(1.02)' : 'scale(0.98)';
    });
    
    
    if (this.dots.length > 0) {
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === this.currentSlide);
      });
    }
    
    
    if (this.slides[this.currentSlide]) {
      this.slides[this.currentSlide].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }
  
  nextSlide() {
    this.updateActiveSlide(this.currentSlide + 1);
  }
  
  prevSlide() {
    this.updateActiveSlide(this.currentSlide - 1);
  }
  
  goToSlide(index) {
    this.updateActiveSlide(index);
  }
  
  startAutoPlay() {
    if (this.autoPlayInterval) return;
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }
  
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  initTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
    
    
    this.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
  
  handleSwipe() {
    const swipeThreshold = 50; 
    const difference = touchStartX - touchEndX;
    
    if (Math.abs(difference) < swipeThreshold) return;
    
    if (difference > 0) {
      
      this.nextSlide();
    } else {
      
      this.prevSlide();
    }
  }
  
  handleResize() {
    
  }
}

// Add to cart functionality
function addPizzaToCart(name, price) {
  const cart = window.cartFunctions.getCart();
  const priceValue = parseFloat(price.replace(/[^0-9.]/g, ''));
  const existingItemIndex = cart.findIndex(item => item.name === name);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
  } else {
    cart.push({
      name: name,
      price: priceValue,
      quantity: 1
    });
  }
  
  window.cartFunctions.saveCart(cart);
  showToast(`${name} added to cart!`, 'success');
}


document.addEventListener('DOMContentLoaded', () => {
  
  const sliderElement = document.getElementById('pizza-slider');
  if (!sliderElement) return;
  
  const pizzaSlider = new PizzaSlider('pizza-slider', {
    autoPlay: true,
    interval: 5000
  });
  
  
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      
      if (sessionStorage.getItem('userRole') !== 'user') {
        sessionStorage.setItem('redirectAfterLogin', 'index.html');
        showToast('Please login to add items to cart', 'warning');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      }
      
      const pizzaCard = e.target.closest('.pizza-slide');
      const pizzaName = pizzaCard.querySelector('.pizza-title').textContent;
      const pizzaPrice = pizzaCard.querySelector('.pizza-price').textContent;
      
      
      addPizzaToCart(pizzaName, pizzaPrice);
      
      
      const addButton = e.target.closest('.add-to-cart');
      addButton.innerHTML = '<i class="fas fa-check"></i> Added';
      addButton.style.backgroundColor = '#27ae60';
      
     
      setTimeout(() => {
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add to Cart';
        addButton.style.backgroundColor = '';
      }, 1500);
    });
  });
});
