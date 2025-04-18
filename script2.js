// Data and state
let hotelsData = [];
let trendingData = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let vegPreference = 'all';
let currentCategory = 'all';
let selectedHotel = null;
let currentUser = null;
let selectedCity = localStorage.getItem('selectedCity') || '';

// DOM Elements
let menuItemsContainer;
let categoryButtons;
let foodTypeButtons;
let cartIcon;
let closeCartBtn;
let cartContainer;
let cartItemsContainer;
let cartCountElement;
let subtotalElement;
let totalElement;
let overlay;
let checkoutBtn;
let orderModal;
let closeModalBtn;
let contactForm;
let formMessageContainer;
let enlargedImageModal;

// Mobile Navigation and User Authentication Elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const mobileNav = document.getElementById('mobileNav');
const navOverlay = document.createElement('div');
navOverlay.classList.add('nav-overlay');
document.body.appendChild(navOverlay);

// Login/Signup/Forgot Password Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const desktopLoginBtn = document.getElementById('desktopLoginBtn');
const desktopSignupBtn = document.getElementById('desktopSignupBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const forgotPasswordModal =document.getElementById('forgotPasswordModal');
const profileModal = document.getElementById('profileModal');
const profileSection = document.getElementById('profileSection');
const desktopProfileSection = document.getElementById('desktopProfileSection');
const userActions = document.getElementById('userActions');
const desktopUserActions = document.getElementById('desktopUserActions');
const usernameDisplay = document.getElementById('usernameDisplay');
const desktopUsernameDisplay = document.getElementById('desktopUsernameDisplay');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const closeButtons = document.querySelectorAll('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const logoutBtn = document.getElementById('logoutBtn');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileCity = document.getElementById('profileCity');
const profilePhoto = document.getElementById('profilePhoto');
const profileAvatar = document.getElementById('profileAvatar');
const profileMessage = document.getElementById('profileMessage');
const profileCitySelect = document.getElementById('profileCitySelect');

// Create enlarged image modal
function createEnlargedImageModal() {
    enlargedImageModal = document.createElement('div');
    enlargedImageModal.id = 'enlargedImageModal';
    enlargedImageModal.className = 'enlarged-image-modal';
    enlargedImageModal.innerHTML = '<img id="enlargedImage" src="" alt="Enlarged item">';
    document.body.appendChild(enlargedImageModal);
}

// Fetch data from index.json
async function fetchData() {
    try {
        const response = await fetch('index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        hotelsData = data.hotels || [];
        trendingData = data.trending || [];
        localStorage.setItem('hotelsData', JSON.stringify(hotelsData));
        initHotels();
        initTrendingDishes();
    } catch (error) {
        console.error('Error fetching data:', error);
        const hotelCards = document.querySelector('.hotel-cards');
        if (hotelCards) {
            hotelCards.innerHTML = '<p>Error loading hotels. Please try again later.</p>';
        }
    }
}

// Initialize hotels section based on selected city
function initHotels() {
    const hotelCards = document.querySelector('.hotel-cards');
    if (!hotelCards) {
        console.error('Hotel cards container not found');
        return;
    }

    hotelCards.innerHTML = '<p>Loading hotels...</p>';
    if (hotelsData.length === 0) {
        hotelCards.innerHTML = '<p>No hotels available.</p>';
        return;
    }

    filterHotelsByCity();
}

// Filter hotels based on selected city
function filterHotelsByCity() {
    const hotelCards = document.querySelector('.hotel-cards');
    if (!hotelCards) return;

    hotelCards.innerHTML = '';
    const filteredHotels = selectedCity
        ? hotelsData.filter(hotel => hotel.location === selectedCity)
        : hotelsData;

    if (filteredHotels.length === 0) {
        hotelCards.innerHTML = '<p>No hotels available in the selected city.</p>';
        return;
    }

    filteredHotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.classList.add('hotel-card');
        hotelCard.innerHTML = `
            <div class="hotel-img">
                <img src="${hotel.image || 'https://via.placeholder.com/200'}" alt="${hotel.name}">
            </div>
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <div class="hotel-location">📍 ${hotel.location}</div>
                <div class="hotel-rating">★ ${hotel.rating || 'N/A'}</div>
                <button class="view-menu-btn" data-id="${hotel.id}">View Menu</button>
            </div>
        `;
        hotelCards.appendChild(hotelCard);
    });

    document.querySelectorAll('.view-menu-btn').forEach(button => {
        button.addEventListener('click', () => {
            const hotelId = parseInt(button.getAttribute('data-id'));
            showHotelMenu(hotelId);
        });
    });
}

function isBreakfastTime() {
    const now = new Date();
    const hours = now.getHours();
    return (hours >= 6 && hours < 11) || (hours >= 18 && hours < 22);
}

function showHotelMenu(hotelId) {
    selectedHotel = hotelsData.find(h => h.id === hotelId);
    if (!selectedHotel) {
        console.error('Hotel not found for ID:', hotelId);
        return;
    }

    document.getElementById('hotels').style.display = 'none';
    const hotelMenuSection = document.getElementById('hotelMenuSection');
    if (hotelMenuSection) {
        hotelMenuSection.style.display = 'block';
        hotelMenuSection.scrollIntoView({ behavior: 'smooth' });
    }

    const header = document.getElementById('hotelMenuHeader');
    if (header) {
        header.innerHTML = `
            <h2 class="section-title">${selectedHotel.name} Menu</h2>
            <button id="backToHotels" class="back-to-hotels-btn">Back to Hotels</button>
        `;
        document.getElementById('backToHotels').addEventListener('click', backToHotels);
    }

    if (!selectedHotel.foodItems || selectedHotel.foodItems.length === 0) {
        if (menuItemsContainer) {
            menuItemsContainer.innerHTML = '<p>No menu items available for this hotel.</p>';
        }
        return;
    }

    displayMenuItems('all', vegPreference);
    setupFilterListeners();

    startTimeCheck();
}

function backToHotels() {
    const hotelsSection = document.getElementById('hotels');
    const hotelCards = document.querySelector('.hotel-cards');
    const hotelMenuSection = document.getElementById('hotelMenuSection');

    if (hotelsSection && hotelCards) {
        hotelsSection.style.display = 'block';
        hotelCards.style.display = 'grid';
        hotelCards.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    }
    if (hotelMenuSection) {
        hotelMenuSection.style.display = 'none';
    }

    selectedHotel = null;
    vegPreference = 'all';
    currentCategory = 'all';

    filterHotelsByCity();
    stopTimeCheck();
}

let timeCheckInterval = null;
function startTimeCheck() {
    stopTimeCheck();
    timeCheckInterval = setInterval(() => {
        displayMenuItems(currentCategory, vegPreference);
        setupFilterListeners();
    }, 60000);
}

function stopTimeCheck() {
    if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
        timeCheckInterval = null;
    }
}

function displayMenuItems(category, vegPref) {
    if (!selectedHotel || !menuItemsContainer) {
        return;
    }

    menuItemsContainer.innerHTML = '';
    currentCategory = category;

    let filteredItems = selectedHotel.foodItems || [];

    if (!isBreakfastTime()) {
        filteredItems = filteredItems.filter(item => item.category !== 'Breakfast');
    }

    if (category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (vegPref === 'veg') {
        filteredItems = filteredItems.filter(item => item.isVeg);
    } else if (vegPref === 'nonveg') {
        filteredItems = filteredItems.filter(item => !item.isVeg);
    }

    if (!isBreakfastTime() && category === 'Breakfast') {
        menuItemsContainer.innerHTML = `
            <p class="time-message">
                Breakfast is available from 6:00 AM to 11:00 AM and 6:00 PM to 10:00 PM.
            </p>
        `;
        return;
    }

    if (filteredItems.length === 0) {
        menuItemsContainer.innerHTML = '<p>No items available for this filter.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.classList.add('menu-item');
        menuItemElement.innerHTML = `
            <div class="item-img">
                <img src="${item.image || 'https://via.placeholder.com/200'}" alt="${item.name}" class="clickable-img">
                <span class="veg-indicator ${item.isVeg ? 'veg' : 'nonveg'}"></span>
            </div>
            <div class="item-info">
                <div class="item-title">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">₹${item.price.toFixed(2)}</span>
                </div>
                <p class="item-desc">${item.description || 'No description available'}</p>
                <button class="add-to-cart" data-id="${item.id}">Add to Cart</button>
            </div>
        `;
        menuItemsContainer.appendChild(menuItemElement);
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.clickable-img').forEach(img => {
        img.addEventListener('click', () => {
            const src = img.src;
            document.getElementById('enlargedImage').src = src;
            enlargedImageModal.style.display = 'flex';
        });
    });
}

function setupFilterListeners() {
    categoryButtons = document.querySelectorAll('#hotelMenuSection .category-btn');
    foodTypeButtons = document.querySelectorAll('#hotelMenuSection .food-type-btn');

    const categoryFilterContainer = document.querySelector('#hotelMenuSection .category-filters');
    if (categoryFilterContainer) {
        const categories = ['all', 'Starters', 'Main Course', 'Desserts', 'Snacks', 'Beverages'];
        if (isBreakfastTime()) {
            categories.splice(3, 0, 'Breakfast');
        }

        categoryFilterContainer.innerHTML = '';
        categories.forEach(cat => {
            const button = document.createElement('button');
            button.classList.add('category-btn');
            button.setAttribute('data-category', cat);
            button.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            if (cat === currentCategory) {
                button.classList.add('active');
            }
            categoryFilterContainer.appendChild(button);
        });

        categoryButtons = document.querySelectorAll('#hotelMenuSection .category-btn');
    }

    categoryButtons.forEach(button => {
        button.removeEventListener('click', handleCategoryClick);
        button.addEventListener('click', handleCategoryClick);
    });

    foodTypeButtons.forEach(button => {
        button.removeEventListener('click', handleFoodTypeClick);
        button.addEventListener('click', handleFoodTypeClick);
    });

    function handleCategoryClick() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const category = this.getAttribute('data-category');
        displayMenuItems(category, vegPreference);
    }

    function handleFoodTypeClick() {
        foodTypeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        vegPreference = this.getAttribute('data-type');
        displayMenuItems(currentCategory, vegPreference);
    }
}

function initTrendingDishes() {
    const trendingWrapper = document.querySelector('.trending-wrapper');
    if (!trendingWrapper) return;

    trendingWrapper.innerHTML = '';
    const filteredTrending = selectedCity
        ? trendingData.filter(item => {
              const hotel = hotelsData.find(h => h.id === item.hotelId);
              return hotel && hotel.location === selectedCity;
          })
        : trendingData;

    filteredTrending.forEach(item => {
        const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
        trendingWrapper.innerHTML += `
            <div class="trending-item">
                <img src="${item.image || 'https://via.placeholder.com/200'}" alt="${item.name}" class="clickable-img">
                <div class="trending-content">
                    <h3>${item.name}</h3>
                    <span class="trending-price">₹${item.price.toFixed(2)}</span>
                    <p class="trending-desc">${item.description || 'No description available'}</p>
                    <div class="trending-action">
                        <div class="trending-rating">
                            <span class="trending-veg-indicator ${item.isVeg ? 'veg' : 'nonveg'}"></span>
                            <span>★ ${rating}</span>
                        </div>
                        <button class="trending-btn" data-id="${item.id}">Add</button>
                    </div>
                </div>
            </div>
        `;
    });

    document.querySelectorAll('.trending-btn').forEach(button => {
        button.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.clickable-img').forEach(img => {
        img.addEventListener('click', () => {
            const src = img.src;
            document.getElementById('enlargedImage').src = src;
            enlargedImageModal.style.display = 'flex';
        });
    });

    const trendingContainer = document.querySelector('.trending-container');
    if (trendingContainer) {
        trendingContainer.addEventListener('mouseenter', () => {
            trendingWrapper.style.animationPlayState = 'paused';
        });
        trendingContainer.addEventListener('mouseleave', () => {
            trendingWrapper.style.animationPlayState = 'running';
        });
    }
}

function addToCart(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    let menuItem = null;

    menuItem = trendingData.find(item => item.id === itemId);
    let hotelId = null;

    if (menuItem) {
        hotelId = menuItem.hotelId || null;
    } else if (selectedHotel) {
        menuItem = selectedHotel.foodItems.find(item => item.id === itemId);
        hotelId = selectedHotel.id;
    }

    if (!menuItem) {
        console.error('Item not found for ID:', itemId);
        return;
    }

    const cartItem = { ...menuItem, quantity: 1, hotelId };
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    updateCart();
    showNotification(`${menuItem.name} added to cart!`);
}

function updateCart() {
    if (!cartItemsContainer || !cartCountElement || !subtotalElement || !totalElement || !checkoutBtn) return;

    cartItemsContainer.innerHTML = '';
    let cartCount = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.image || 'https://via.placeholder.com/200'}" alt="${item.name}">
                        <span class="veg-indicator ${item.isVeg ? 'veg' : 'nonveg'}"></span>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-top">
                            <span class="cart-item-name">${item.name}</span>
                            <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
            cartCount += item.quantity;
            subtotal += item.price * item.quantity;
        });

        document.querySelectorAll('.decrease').forEach(button => button.addEventListener('click', decreaseQuantity));
        document.querySelectorAll('.increase').forEach(button => button.addEventListener('click', increaseQuantity));
        document.querySelectorAll('.remove-item').forEach(button => button.addEventListener('click', removeItem));
    }

    cartCountElement.textContent = cartCount;
    const deliveryFee = cart.length > 0 ? 39 : 0;
    const taxAmount = subtotal * 0.05;
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${taxAmount.toFixed(2)}`;
    totalElement.textContent = `₹${(subtotal + deliveryFee + taxAmount).toFixed(2)}`;
    checkoutBtn.disabled = cart.length === 0;

    localStorage.setItem('cart', JSON.stringify(cart));
}

function decreaseQuantity(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
    } else {
        removeItem(e);
    }
    updateCart();
}

function increaseQuantity(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    const cartItem = cart.find(item => item.id === itemId);
    cartItem.quantity += 1;
    updateCart();
}

function removeItem(e) {
    const itemId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

function toggleCart(forceOpen = false) {
    if (!cartContainer || !overlay) return;

    if (forceOpen) {
        cartContainer.classList.add('open');
        overlay.style.display = 'block';
        overlay.style.zIndex = '1400';
        cartContainer.style.zIndex = '1500';
    } else {
        cartContainer.classList.toggle('open');
        if (cartContainer.classList.contains('open')) {
            overlay.style.display = 'block';
            overlay.style.zIndex = '1400';
            cartContainer.style.zIndex = '1500';
        } else {
            overlay.style.display = 'none';
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }, 10);
}

function closeAll() {
    if (cartContainer) cartContainer.classList.remove('open');
    if (orderModal) orderModal.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
    if (enlargedImageModal) enlargedImageModal.style.display = 'none';
    closeAllModals();
}

function placeOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty.');
        return;
    }

    if (!currentUser) {
        const hotelIds = [...new Set(cart.map(item => item.hotelId).filter(id => id !== null))];
        const cities = hotelIds.map(id => {
            const hotel = hotelsData.find(h => h.id === id);
            return hotel ? hotel.location : null;
        }).filter(city => city !== null);

        const uniqueCities = [...new Set(cities)];
        if (uniqueCities.length > 1) {
            showNotification('Please select items from a single city for delivery. We cannot deliver items from multiple cities in one order.');
            return;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = `IPayment.html`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    if (!name || !email || !message) {
        showFormMessage('Please fill in all fields', 'error');
        return;
    }
    showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
    contactForm.reset();
}

function showFormMessage(message, type) {
    if (formMessageContainer) {
        formMessageContainer.innerHTML = `<div class="form-message ${type}">${message}</div>`;
        formMessageContainer.style.display = 'block';
        setTimeout(() => formMessageContainer.style.display = 'none', 5000);
    }
}

function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('no-scroll');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => closeModal(modal));
}

function setupModalEventListeners() {
    if (loginBtn) loginBtn.addEventListener('click', e => { e.preventDefault(); openModal(loginModal); });
    if (signupBtn) signupBtn.addEventListener('click', e => { e.preventDefault(); openModal(signupModal); });
    if (desktopLoginBtn) desktopLoginBtn.addEventListener('click', e => { e.preventDefault(); openModal(loginModal); });
    if (desktopSignupBtn) desktopSignupBtn.addEventListener('click', e => { e.preventDefault(); openModal(signupModal); });
    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', e => { e.preventDefault(); closeModal(loginModal); openModal(forgotPasswordModal); });
    if (switchToSignup) switchToSignup.addEventListener('click', e => { e.preventDefault(); closeModal(loginModal); openModal(signupModal); });
    if (switchToLogin) switchToLogin.addEventListener('click', e => { e.preventDefault(); closeModal(signupModal); openModal(loginModal); });
    closeButtons.forEach(button => button.addEventListener('click', closeAllModals));
    window.addEventListener('click', e => { if (e.target.classList.contains('modal')) closeAllModals(); });
    if (profileSection) profileSection.addEventListener('click', () => { openModal(profileModal); updateProfileModal(); });
    if (desktopProfileSection) desktopProfileSection.addEventListener('click', () => { openModal(profileModal); updateProfileModal(); });

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const loginMessage = document.getElementById('loginMessage');
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                loginMessage.textContent = 'Login successful!';
                loginMessage.className = 'message success';
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateUserInterface();
                setTimeout(() => { closeModal(loginModal); loginForm.reset(); loginMessage.textContent = ''; }, 1500);
            } else {
                loginMessage.textContent = 'Invalid email or password';
                loginMessage.className = 'message error';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const city = document.getElementById('signupCity').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const signupMessage = document.getElementById('signupMessage');
            if (password !== confirmPassword) {
                signupMessage.textContent = 'Passwords do not match';
                signupMessage.className = 'message error';
                return;
            }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(user => user.email === email)) {
                signupMessage.textContent = 'Email already in use';
                signupMessage.className = 'message error';
                return;
            }
            const newUser = { name, email, phone, city, password, photo: null };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            selectedCity = city;
            localStorage.setItem('selectedCity', selectedCity);
            filterHotelsByCity();
            updateUserInterface();
            signupMessage.textContent = 'Account created successfully!';
            signupMessage.className = 'message success';
            setTimeout(() => { closeModal(signupModal); signupForm.reset(); signupMessage.textContent = ''; }, 1500);
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');
            if (newPassword !== confirmNewPassword) {
                forgotPasswordMessage.textContent = 'Passwords do not match';
                forgotPasswordMessage.className = 'message error';
                return;
            }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) {
                forgotPasswordMessage.textContent = 'Email not found';
                forgotPasswordMessage.className = 'message error';
                return;
            }
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            if (currentUser && currentUser.email === email) {
                currentUser.password = newPassword;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            forgotPasswordMessage.textContent = 'Password reset successfully!';
            forgotPasswordMessage.className = 'message success';
            setTimeout(() => {
                closeModal(forgotPasswordModal);
                forgotPasswordForm.reset();
                forgotPasswordMessage.textContent = '';
                openModal(loginModal);
            }, 1500);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            selectedCity = '';
            localStorage.removeItem('currentUser');
            localStorage.removeItem('selectedCity');
            filterHotelsByCity();
            updateUserInterface();
            closeModal(profileModal);
        });
    }

    if (profilePhoto) {
        profilePhoto.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Image = reader.result;
                    currentUser.photo = base64Image;
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userIndex = users.findIndex(u => u.email === currentUser.email);
                    if (userIndex !== -1) {
                        users[userIndex].photo = base64Image;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateProfileModal();
                    showNotification('Profile photo updated!');
                };
                reader.readAsDataURL(file);
            } else {
                profileMessage.textContent = 'Please select a valid image file.';
                profileMessage.className = 'message error';
            }
        });
    }

    if (profileCitySelect) {
        profileCitySelect.addEventListener('change', () => {
            selectedCity = profileCitySelect.value;
            localStorage.setItem('selectedCity', selectedCity);
            if (currentUser) {
                currentUser.city = selectedCity;
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].city = selectedCity;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            filterHotelsByCity();
            showNotification(`City changed to ${selectedCity || 'All Cities'}`);
        });
    }
}

function updateUserInterface() {
    if (currentUser) {
        if (profileSection) {
            profileSection.style.display = 'block';
            usernameDisplay.textContent = currentUser.name.split(' ')[0];
            const profileIcon = profileSection.querySelector('.profile-icon');
            profileIcon.innerHTML = currentUser.photo ? `<img src="${currentUser.photo}" alt="Profile">` : '👤';
        }
        if (desktopProfileSection) {
            desktopProfileSection.style.display = 'block';
            desktopUsernameDisplay.textContent = currentUser.name.split(' ')[0];
            const profileIcon = desktopProfileSection.querySelector('.profile-icon');
            profileIcon.innerHTML = currentUser.photo ? `<img src="${currentUser.photo}" alt="Profile">` : '👤';
        }
        if (userActions) userActions.style.display = 'none';
        if (desktopUserActions) desktopUserActions.style.display = 'none';
    } else {
        if (profileSection) profileSection.style.display = 'none';
        if (desktopProfileSection) desktopProfileSection.style.display = 'none';
        if (userActions) userActions.style.display = 'flex';
        if (desktopUserActions) desktopUserActions.style.display = 'flex';
    }
}

function updateProfileModal() {
    if (currentUser) {
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        if (profilePhone) profilePhone.textContent = currentUser.phone;
        if (profileCity) profileCity.textContent = currentUser.city || 'Not set';
        if (profileAvatar) {
            profileAvatar.innerHTML = currentUser.photo ? `<img src="${currentUser.photo}" alt="Profile">` : '👤';
        }
        if (profileCitySelect) {
            profileCitySelect.value = currentUser.city || '';
        }
    }
}

function init() {
    menuItemsContainer = document.getElementById('hotelMenuItems');
    cartIcon = document.getElementById('cartIcon');
    closeCartBtn = document.getElementById('closeCart');
    cartContainer = document.getElementById('cart');
    cartItemsContainer = document.getElementById('cartItems');
    cartCountElement = document.getElementById('cartCount');
    subtotalElement = document.getElementById('subtotal');
    totalElement = document.getElementById('total');
    overlay = document.getElementById('overlay');
    checkoutBtn = document.getElementById('checkoutBtn');
    orderModal = document.getElementById('orderModal');
    closeModalBtn = document.getElementById('closeModal');
    contactForm = document.getElementById('contactForm');
    formMessageContainer = document.getElementById('formMessage');

    createEnlargedImageModal();

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', closeAll);
    if (checkoutBtn) checkoutBtn.addEventListener('click', placeOrder);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAll);
    if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);
    if (enlargedImageModal) enlargedImageModal.addEventListener('click', () => {
        enlargedImageModal.style.display = 'none';
    });

    setupModalEventListeners();
    fetchData();
    updateCart();

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        selectedCity = currentUser.city || selectedCity;
        localStorage.setItem('selectedCity', selectedCity);
        updateUserInterface();
    }
}

// CSS for notifications, overlays, time message, updated menu layout, button adjustment, and new features
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 3000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .notification.show {
            opacity: 1;
        }
        .nav-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 990;
        }
        .nav-overlay.active {
            display: block;
        }
        body.no-scroll {
            overflow: hidden;
        }
        .time-message {
            color: #d9534f;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            background-color: #ffe6e6;
            border-radius: 5px;
            margin: 10px 0;
        }
        .category-btn {
            margin: 5px;
            padding: incorrectly formatted CSS property value in .category-btn
            border: 1px solid #ccc;
            background: #f9f9f9;
            cursor: pointer;
            border-radius: 5px;
        }
        .category-btn.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
        .hotel-img {
            width: 100%;
            height: 200px;
            overflow: hidden;
            position: relative;
        }
        .hotel-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
        }
        #hotelMenuItems {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            padding: 20px 0;
        }
        .menu-item {
            display: flex;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            transition: transform 0.2s;
            flex-direction: column;
        }
        .menu-item:hover {
            transform: translateY(-5px);
        }
        .menu-item .item-img {
            position: relative;
            width: 100%;
            height: 200px;
            cursor: pointer;
        }
        .menu-item .item-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
        }
        .menu-item .item-info {
            padding: 15px;
            text-align: left;
            flex: 1;
        }
        .menu-item .item-title {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .menu-item .item-price {
            color: #ff4444;
            font-weight: bold;
        }
        .menu-item .item-desc {
            color: #666;
            margin-bottom: 15px;
        }
        .menu-item .add-to-cart {
            background-color: #ff6666;
            color: white;
            border: none;
            padding: 10px 20px;
            width: 100%;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .menu-item .add-to-cart:hover {
            background-color: #ff3333;
        }
        .enlarged-image-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        .enlarged-image-modal img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
        }
        @media (min-width: 600px) {
            #hotelMenuItems {
                justify-content: flex-start;
            }
            .menu-item {
                width: calc(50% - 10px);
                max-width: none;
                margin: 0;
            }
        }
        @media (min-width: 900px) {
            .menu-item {
                width: calc(33.33% - 13.33px);
            }
        }
        #hotelMenuItems:only-child .menu-item {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }
    </style>
`);

document.addEventListener('DOMContentLoaded', init);
