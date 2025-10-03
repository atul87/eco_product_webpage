// EcoShop JavaScript Application

// Application Data
const appData = {
  products: [
    {
      id: 1,
      name: "Bamboo Toothbrush Set",
      category: "natural",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400",
      description: "Biodegradable bamboo toothbrushes with soft bristles",
      eco_rating: 5,
      stock: 50
    },
    {
      id: 2,
      name: "Recycled Paper Notebooks",
      category: "recycled",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      description: "100% recycled paper notebooks in various sizes",
      eco_rating: 4,
      stock: 30
    },
    {
      id: 3,
      name: "Solar Phone Charger",
      category: "eco",
      price: 45.99,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
      description: "Portable solar-powered phone charger",
      eco_rating: 5,
      stock: 15
    },
    {
      id: 4,
      name: "Organic Cotton Bags",
      category: "natural",
      price: 15.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      description: "Reusable organic cotton shopping bags",
      eco_rating: 4,
      stock: 100
    },
    {
      id: 5,
      name: "Upcycled Furniture",
      category: "recycled",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
      description: "Beautiful furniture made from reclaimed wood",
      eco_rating: 5,
      stock: 5
    },
    {
      id: 6,
      name: "LED Smart Bulbs",
      category: "eco",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      description: "Energy-efficient smart LED bulbs",
      eco_rating: 4,
      stock: 75
    }
  ],
  categories: [
    {id: "all", name: "All Products", icon: "🌱"},
    {id: "natural", name: "Natural Products", icon: "🌿"},
    {id: "recycled", name: "Recycled Items", icon: "♻️"},
    {id: "eco", name: "Eco-Friendly Essentials", icon: "🌍"}
  ],
  testimonials: [
    {
      name: "Sarah Johnson",
      review: "Amazing eco-friendly products! Great quality and fast shipping.",
      rating: 5,
      product: "Bamboo Toothbrush Set"
    },
    {
      name: "Mike Chen",
      review: "Love the solar charger. Perfect for camping trips!",
      rating: 5,
      product: "Solar Phone Charger"
    }
  ]
};

// Application State
let appState = {
  cart: [],
  wishlist: [],
  currentCategory: 'all',
  currentSort: 'name',
  searchTerm: '',
  comparison: [],
  isGridView: true,
  user: null
};

// Utility Functions
const utils = {
  formatPrice: (price) => `$${price.toFixed(2)}`,
  
  getStockStatus: (stock) => {
    if (stock === 0) return { class: 'out-of-stock', text: 'Out of Stock' };
    if (stock < 10) return { class: 'low-stock', text: `${stock} left` };
    return { class: 'in-stock', text: 'In Stock' };
  },
  
  generateStars: (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage not available');
    }
  },
  
  getFromStorage: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage not available');
      return defaultValue;
    }
  }
};

// Product Management
const productManager = {
  getAllProducts: () => appData.products,
  
  getProductById: (id) => appData.products.find(p => p.id === parseInt(id)),
  
  getFilteredProducts: () => {
    let products = appData.products;
    
    // Filter by category
    if (appState.currentCategory !== 'all') {
      products = products.filter(p => p.category === appState.currentCategory);
    }
    
    // Filter by search term
    if (appState.searchTerm) {
      const term = appState.searchTerm.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    // Sort products
    products.sort((a, b) => {
      switch (appState.currentSort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'eco-rating':
          return b.eco_rating - a.eco_rating;
        case 'popularity':
          return b.stock - a.stock; // Using stock as popularity indicator
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return products;
  },
  
  searchProducts: (term) => {
    return appData.products.filter(p => 
      p.name.toLowerCase().includes(term.toLowerCase()) ||
      p.description.toLowerCase().includes(term.toLowerCase())
    );
  }
};

// Cart Management
const cartManager = {
  addToCart: (productId, quantity = 1) => {
    const product = productManager.getProductById(productId);
    if (!product) return false;
    
    const existingItem = appState.cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      appState.cart.push({ productId, quantity });
    }
    
    cartManager.updateCartUI();
    cartManager.saveCart();
    return true;
  },
  
  removeFromCart: (productId) => {
    appState.cart = appState.cart.filter(item => item.productId !== productId);
    cartManager.updateCartUI();
    cartManager.saveCart();
  },
  
  updateQuantity: (productId, quantity) => {
    const item = appState.cart.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        cartManager.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        cartManager.updateCartUI();
        cartManager.saveCart();
      }
    }
  },
  
  getCartTotal: () => {
    return appState.cart.reduce((total, item) => {
      const product = productManager.getProductById(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  },
  
  getCartCount: () => {
    return appState.cart.reduce((count, item) => count + item.quantity, 0);
  },
  
  updateCartUI: () => {
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
      cartCount.textContent = cartManager.getCartCount();
    }
    
    if (cartTotal) {
      cartTotal.textContent = cartManager.getCartTotal().toFixed(2);
    }
    
    cartManager.renderCartItems();
  },
  
  renderCartItems: () => {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    if (appState.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }
    
    cartItemsContainer.innerHTML = appState.cart.map(item => {
      const product = productManager.getProductById(item.productId);
      if (!product) return '';
      
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item-image">
          <div class="cart-item-info">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">${utils.formatPrice(product.price)}</div>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="cartManager.updateQuantity(${product.id}, ${item.quantity - 1})">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" 
                   onchange="cartManager.updateQuantity(${product.id}, parseInt(this.value))" min="0">
            <button class="quantity-btn" onclick="cartManager.updateQuantity(${product.id}, ${item.quantity + 1})">+</button>
            <button class="btn btn--sm btn--outline" onclick="cartManager.removeFromCart(${product.id})">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  },
  
  saveCart: () => {
    utils.saveToStorage('cart', appState.cart);
  },
  
  loadCart: () => {
    appState.cart = utils.getFromStorage('cart', []);
    cartManager.updateCartUI();
  }
};

// Wishlist Management
const wishlistManager = {
  addToWishlist: (productId) => {
    if (!appState.wishlist.includes(productId)) {
      appState.wishlist.push(productId);
      wishlistManager.updateWishlistUI();
      wishlistManager.saveWishlist();
      return true;
    }
    return false;
  },
  
  removeFromWishlist: (productId) => {
    appState.wishlist = appState.wishlist.filter(id => id !== productId);
    wishlistManager.updateWishlistUI();
    wishlistManager.saveWishlist();
  },
  
  isInWishlist: (productId) => {
    return appState.wishlist.includes(productId);
  },
  
  updateWishlistUI: () => {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
      wishlistCount.textContent = appState.wishlist.length;
    }
    
    // Update wishlist buttons in product cards
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      const isWishlisted = wishlistManager.isInWishlist(productId);
      btn.textContent = isWishlisted ? '💖' : '🤍';
      btn.title = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';
    });
  },
  
  saveWishlist: () => {
    utils.saveToStorage('wishlist', appState.wishlist);
  },
  
  loadWishlist: () => {
    appState.wishlist = utils.getFromStorage('wishlist', []);
    wishlistManager.updateWishlistUI();
  }
};

// UI Rendering
const uiRenderer = {
  renderCategories: () => {
    const categoryFilters = document.getElementById('category-filters');
    if (!categoryFilters) return;
    
    categoryFilters.innerHTML = appData.categories.map(category => `
      <button class="category-btn ${appState.currentCategory === category.id ? 'active' : ''}" 
              data-category="${category.id}">
        ${category.icon} ${category.name}
      </button>
    `).join('');
  },
  
  renderProducts: () => {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const products = productManager.getFilteredProducts();
    
    if (products.length === 0) {
      productsGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
      return;
    }
    
    productsGrid.className = `products-grid ${appState.isGridView ? 'grid-view' : 'list-view'}`;
    
    productsGrid.innerHTML = products.map(product => {
      const stockStatus = utils.getStockStatus(product.stock);
      const isWishlisted = wishlistManager.isInWishlist(product.id);
      
      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-actions">
              <button class="action-btn" onclick="wishlistManager.${isWishlisted ? 'removeFromWishlist' : 'addToWishlist'}(${product.id})"
                      data-wishlist-btn data-product-id="${product.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                ${isWishlisted ? '💖' : '🤍'}
              </button>
              <button class="action-btn" onclick="showProductDetails(${product.id})" title="Quick View">👁️</button>
              <button class="action-btn" onclick="toggleComparison(${product.id})" title="Compare">⚖️</button>
            </div>
            <div class="eco-rating">
              Eco ${product.eco_rating}/5
            </div>
          </div>
          
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${utils.formatPrice(product.price)}</div>
            
            <div class="product-footer">
              <span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>
              <button class="btn btn--primary btn--sm" onclick="cartManager.addToCart(${product.id})"
                      ${product.stock === 0 ? 'disabled' : ''}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  renderTestimonials: () => {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;
    
    testimonialsGrid.innerHTML = appData.testimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-rating">${utils.generateStars(testimonial.rating)}</div>
        <p class="testimonial-review">${testimonial.review}</p>
        <div class="testimonial-author">- ${testimonial.name}</div>
        <div class="testimonial-product">${testimonial.product}</div>
      </div>
    `).join('');
  }
};

// Search Functionality
const searchManager = {
  init: () => {
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (searchInput) {
      const debouncedSearch = utils.debounce((term) => {
        appState.searchTerm = term;
        uiRenderer.renderProducts();
        searchManager.showSuggestions(term);
      }, 300);
      
      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
      
      searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
          searchManager.showSuggestions(searchInput.value);
        }
      });
      
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          searchManager.hideSuggestions();
        }, 200);
      });
    }
  },
  
  showSuggestions: (term) => {
    const searchSuggestions = document.getElementById('search-suggestions');
    if (!searchSuggestions || !term.trim()) {
      searchManager.hideSuggestions();
      return;
    }
    
    const suggestions = productManager.searchProducts(term).slice(0, 5);
    
    if (suggestions.length === 0) {
      searchManager.hideSuggestions();
      return;
    }
    
    searchSuggestions.innerHTML = suggestions.map(product => `
      <div class="search-suggestion" onclick="selectSearchSuggestion('${product.name}', ${product.id})">
        <strong>${product.name}</strong> - ${utils.formatPrice(product.price)}
      </div>
    `).join('');
    
    searchSuggestions.style.display = 'block';
  },
  
  hideSuggestions: () => {
    const searchSuggestions = document.getElementById('search-suggestions');
    if (searchSuggestions) {
      searchSuggestions.style.display = 'none';
    }
  }
};

// Modal Management
const modalManager = {
  show: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },
  
  hide: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },
  
  init: () => {
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modalManager.hide(modal.id);
        }
      });
    });
    
    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal');
        if (modal) {
          modalManager.hide(modal.id);
        }
      });
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
          modalManager.hide(modal.id);
        });
      }
    });
  }
};

// Form Validation and Handling
const formManager = {
  init: () => {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', formManager.handleNewsletterSubmit);
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', formManager.handleContactSubmit);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', formManager.handleLoginSubmit);
    }
  },
  
  handleNewsletterSubmit: (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#newsletter-email').value;
    
    if (formManager.validateEmail(email)) {
      alert('Thank you for subscribing to our newsletter!');
      e.target.reset();
    } else {
      alert('Please enter a valid email address.');
    }
  },
  
  handleContactSubmit: (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Simulate form submission
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
  },
  
  handleLoginSubmit: (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Simulate login
    if (email && password) {
      appState.user = { email };
      alert('Login successful!');
      modalManager.hide('login-modal');
      updateUserUI();
    }
  },
  
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Navigation and UI Interactions
const navigationManager = {
  init: () => {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
      });
    });
    
    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTopBtn.classList.remove('hidden');
        } else {
          backToTopBtn.classList.add('hidden');
        }
      });
      
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
};

// Event Listeners Setup
const eventManager = {
  init: () => {
    // Category filter buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-category]')) {
        const category = e.target.dataset.category;
        appState.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        uiRenderer.renderProducts();
      }
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        appState.currentSort = e.target.value;
        uiRenderer.renderProducts();
      });
    }
    
    // View toggle buttons
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener('click', () => {
        appState.isGridView = true;
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        uiRenderer.renderProducts();
      });
      
      listViewBtn.addEventListener('click', () => {
        appState.isGridView = false;
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        uiRenderer.renderProducts();
      });
    }
    
    // Modal triggers
    const loginBtn = document.getElementById('login-btn');
    const cartBtn = document.getElementById('cart-btn');
    
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        modalManager.show('login-modal');
      });
    }
    
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        modalManager.show('cart-modal');
      });
    }
  }
};

// Global Functions (called from HTML)
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function showProductDetails(productId) {
  const product = productManager.getProductById(productId);
  if (!product) return;
  
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const body = document.getElementById('product-modal-body');
  
  if (title) title.textContent = product.name;
  if (body) {
    const stockStatus = utils.getStockStatus(product.stock);
    body.innerHTML = `
      <div class="product-detail">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">
        <h3>${product.name}</h3>
        <p class="product-detail-price">${utils.formatPrice(product.price)}</p>
        <p>${product.description}</p>
        <div class="product-detail-info">
          <div class="eco-rating">Eco Rating: ${product.eco_rating}/5</div>
          <div class="stock-status ${stockStatus.class}">${stockStatus.text}</div>
        </div>
        <div class="product-detail-actions" style="margin-top: 24px;">
          <button class="btn btn--primary" onclick="cartManager.addToCart(${product.id}); closeModal('product-modal')"
                  ${product.stock === 0 ? 'disabled' : ''}>
            Add to Cart
          </button>
          <button class="btn btn--outline" onclick="wishlistManager.addToWishlist(${product.id})">
            Add to Wishlist
          </button>
        </div>
      </div>
    `;
  }
  
  modalManager.show('product-modal');
}

function closeModal(modalId) {
  modalManager.hide(modalId);
}

function selectSearchSuggestion(productName, productId) {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = productName;
    appState.searchTerm = productName;
    uiRenderer.renderProducts();
  }
  searchManager.hideSuggestions();
}

function toggleComparison(productId) {
  const index = appState.comparison.indexOf(productId);
  if (index > -1) {
    appState.comparison.splice(index, 1);
  } else {
    if (appState.comparison.length < 3) {
      appState.comparison.push(productId);
    } else {
      alert('You can only compare up to 3 products at a time.');
      return;
    }
  }
  
  updateComparisonUI();
}

function updateComparisonUI() {
  const comparisonPanel = document.getElementById('comparison-panel');
  const comparisonItems = document.getElementById('comparison-items');
  
  if (appState.comparison.length > 0) {
    comparisonPanel.classList.add('active');
    
    comparisonItems.innerHTML = appState.comparison.map(productId => {
      const product = productManager.getProductById(productId);
      return `
        <div class="comparison-item">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
          <h4>${product.name}</h4>
          <div class="comparison-price">${utils.formatPrice(product.price)}</div>
          <div class="comparison-eco">Eco: ${product.eco_rating}/5</div>
          <button class="btn btn--sm btn--outline" onclick="toggleComparison(${productId})">Remove</button>
        </div>
      `;
    }).join('');
  } else {
    comparisonPanel.classList.remove('active');
  }
}

function updateUserUI() {
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn && appState.user) {
    loginBtn.textContent = 'Account';
    loginBtn.onclick = () => alert('Account features coming soon!');
  }
}

// Loading Screen Management
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.remove();
      }, 300);
    }, 1000);
  }
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  modalManager.init();
  formManager.init();
  navigationManager.init();
  eventManager.init();
  searchManager.init();
  
  // Load saved data
  cartManager.loadCart();
  wishlistManager.loadWishlist();
  
  // Render initial UI
  uiRenderer.renderCategories();
  uiRenderer.renderProducts();
  uiRenderer.renderTestimonials();
  
  // Hide loading screen
  hideLoadingScreen();
  
  console.log('EcoShop application initialized successfully!');
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('App is online');
});

window.addEventListener('offline', () => {
  console.log('App is offline');
});

// Export for potential use in other modules
window.EcoShop = {
  appData,
  appState,
  productManager,
  cartManager,
  wishlistManager,
  uiRenderer,
  utils
};