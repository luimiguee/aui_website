// Checkout System - Complete & Professional

let currentStep = 1;
let cart = [];
let selectedAddress = null;
let selectedShipping = 'standard';
let selectedPayment = 'card';
let shippingCost = 0;
let promoDiscount = 0;
let appliedPromoCode = '';

// Promo codes
const promoCodes = {
    'WELCOME10': { discount: 0.10, type: 'percentage' },
    'SAVE20': { discount: 0.20, type: 'percentage' },
    'FRETE': { discount: 0, type: 'free-shipping' },
    'PROMO50': { discount: 50, type: 'fixed' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadSavedAddresses();
    setupEventListeners();
    updateSummary();
    setupPaymentMethodSwitch();
    setupShippingMethodSwitch();
    setupCardFormatting();
});

// Load cart from localStorage
function loadCart() {
    const cartData = localStorage.getItem('cart');
    cart = cartData ? JSON.parse(cartData) : [];
    
    if (cart.length === 0) {
        showNotification('O seu carrinho está vazio', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    displayCartItems();
}

// Display cart items
function displayCartItems() {
    const cartReview = document.getElementById('cartReview');
    const summaryItems = document.getElementById('summaryItems');
    const confirmItems = document.getElementById('confirmItems');
    
    if (!cartReview) return;
    
    let reviewHTML = '';
    let summaryHTML = '';
    
    cart.forEach(item => {
        // Cart review
        reviewHTML += `
            <div class="cart-review-item">
                <img src="${item.imageUrl || '/assets/images/placeholder.jpg'}" 
                     alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantidade: ${item.quantity}</div>
                </div>
                <div class="item-price">${(item.price * item.quantity).toFixed(2)}€</div>
            </div>
        `;
        
        // Summary items
        summaryHTML += `
            <div class="summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}€</span>
            </div>
        `;
    });
    
    cartReview.innerHTML = reviewHTML;
    summaryItems.innerHTML = summaryHTML;
    if (confirmItems) confirmItems.innerHTML = reviewHTML;
}

// Load saved addresses
async function loadSavedAddresses() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/users/addresses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const addresses = await response.json();
            displaySavedAddresses(addresses);
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

// Display saved addresses
function displaySavedAddresses(addresses) {
    const container = document.getElementById('savedAddresses');
    if (!container) return;
    
    let html = `
        <div class="address-card address-card-new" onclick="showAddressForm()">
            <i class="fas fa-plus"></i>
            <span>Adicionar Nova Morada</span>
        </div>
    `;
    
    addresses.forEach((addr, index) => {
        html += `
            <div class="address-card ${index === 0 ? 'selected' : ''}" 
                 onclick="selectAddress(${index}, this)">
                <strong>${addr.name}</strong>
                <p>${addr.street}</p>
                <p>${addr.postalCode} ${addr.city}</p>
                <p>${addr.country}</p>
                <p>Tel: ${addr.phone}</p>
            </div>
        `;
        
        if (index === 0) {
            selectedAddress = addr;
        }
    });
    
    container.innerHTML = html;
}

// Select address
function selectAddress(index, element) {
    // Remove previous selection
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection
    element.classList.add('selected');
    
    // Store selection (in real app, load from data)
    selectedAddress = {
        name: element.querySelector('strong').textContent,
        street: element.querySelectorAll('p')[0].textContent,
        city: element.querySelectorAll('p')[1].textContent.split(' ')[1],
        postalCode: element.querySelectorAll('p')[1].textContent.split(' ')[0],
        phone: element.querySelectorAll('p')[3].textContent.replace('Tel: ', '')
    };
}

// Show address form
function showAddressForm() {
    const form = document.getElementById('addressForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
}

// Setup payment method switch
function setupPaymentMethodSwitch() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedPayment = e.target.value;
            
            // Remove active class from all
            document.querySelectorAll('.payment-method-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active to selected
            e.target.closest('.payment-method-card').classList.add('active');
            
            // Show appropriate form
            document.querySelectorAll('.payment-form').forEach(form => {
                form.style.display = 'none';
            });
            
            const formMap = {
                'card': 'cardPaymentForm',
                'mbway': 'mbwayPaymentForm',
                'multibanco': 'multibancoPaymentForm'
            };
            
            if (formMap[selectedPayment]) {
                document.getElementById(formMap[selectedPayment]).style.display = 'block';
            }
        });
    });
}

// Setup shipping method switch
function setupShippingMethodSwitch() {
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedShipping = e.target.value;
            
            // Remove active class from all
            document.querySelectorAll('.shipping-method-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active to selected
            e.target.closest('.shipping-method-card').classList.add('active');
            
            // Update shipping cost
            const costs = {
                'standard': 0,
                'express': 9.99,
                'next-day': 19.99
            };
            
            shippingCost = costs[selectedShipping];
            updateSummary();
        });
    });
}

// Setup card formatting
function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVV = document.getElementById('cardCVV');
    const cardBrand = document.getElementById('cardBrand');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
            
            // Detect card brand
            detectCardBrand(value, cardBrand);
        });
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cardCVV) {
        cardCVV.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Detect card brand
function detectCardBrand(number, brandElement) {
    if (!brandElement) return;
    
    const patterns = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/
    };
    
    let brand = '';
    let icon = '';
    
    for (let [key, pattern] of Object.entries(patterns)) {
        if (pattern.test(number)) {
            brand = key;
            break;
        }
    }
    
    const icons = {
        visa: '<i class="fab fa-cc-visa" style="color: #1434CB;"></i>',
        mastercard: '<i class="fab fa-cc-mastercard" style="color: #EB001B;"></i>',
        amex: '<i class="fab fa-cc-amex" style="color: #006FCF;"></i>',
        discover: '<i class="fab fa-cc-discover" style="color: #FF6000;"></i>'
    };
    
    brandElement.innerHTML = icons[brand] || '';
}

// Update summary
function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let total = subtotal + shippingCost;
    
    // Apply discount
    if (promoDiscount > 0) {
        total -= promoDiscount;
    }
    
    // Update display
    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}€`;
    document.getElementById('shipping').textContent = shippingCost === 0 ? 'Grátis' : `${shippingCost.toFixed(2)}€`;
    document.getElementById('total').textContent = `${total.toFixed(2)}€`;
    
    if (promoDiscount > 0) {
        document.getElementById('discount').textContent = `-${promoDiscount.toFixed(2)}€`;
        document.getElementById('appliedPromo').textContent = `(${appliedPromoCode})`;
        document.getElementById('promoLine').style.display = 'flex';
    }
}

// Apply promo code
function applyPromoCode() {
    const code = document.getElementById('promoCode').value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Por favor insira um código', 'warning');
        return;
    }
    
    const promo = promoCodes[code];
    
    if (!promo) {
        showNotification('Código inválido', 'error');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (promo.type === 'percentage') {
        promoDiscount = subtotal * promo.discount;
    } else if (promo.type === 'fixed') {
        promoDiscount = promo.discount;
    } else if (promo.type === 'free-shipping') {
        shippingCost = 0;
        document.getElementById('shipping').textContent = 'Grátis';
        showNotification('Envio grátis aplicado! 🎉', 'success');
        return;
    }
    
    appliedPromoCode = code;
    updateSummary();
    showNotification('Código aplicado com sucesso! 🎉', 'success');
}

// Setup event listeners
function setupEventListeners() {
    // Payment method cards
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

// Navigate steps
function nextStep() {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    if (currentStep < 4) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function goToStep(step) {
    // Hide current step
    document.getElementById(`step-${currentStep}`)?.classList.remove('active');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((s, index) => {
        if (index + 1 < step) {
            s.classList.add('completed');
            s.classList.remove('active');
        } else if (index + 1 === step) {
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
    
    // Show new step
    currentStep = step;
    document.getElementById(`step-${currentStep}`)?.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Special actions for step 4
    if (step === 4) {
        displayConfirmation();
    }
}

// Validate step
function validateStep(step) {
    if (step === 1) {
        if (cart.length === 0) {
            showNotification('O carrinho está vazio', 'error');
            return false;
        }
        return true;
    }
    
    if (step === 2) {
        // Check if address is selected or form is filled
        const form = document.getElementById('addressForm');
        
        if (!selectedAddress && form.style.display !== 'none') {
            // Validate form fields
            const name = document.getElementById('shipName').value;
            const phone = document.getElementById('shipPhone').value;
            const street = document.getElementById('shipStreet').value;
            const city = document.getElementById('shipCity').value;
            const postal = document.getElementById('shipPostal').value;
            
            if (!name || !phone || !street || !city || !postal) {
                showNotification('Por favor preencha todos os campos obrigatórios', 'error');
                return false;
            }
            
            selectedAddress = { name, phone, street, city, postalCode: postal };
        }
        
        if (!selectedAddress) {
            showNotification('Por favor selecione uma morada de entrega', 'error');
            return false;
        }
        
        return true;
    }
    
    if (step === 3) {
        // Validate payment method
        if (selectedPayment === 'card') {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCVV = document.getElementById('cardCVV').value;
            const cardName = document.getElementById('cardName').value;
            
            if (!cardNumber || cardNumber.length < 13) {
                showNotification('Número de cartão inválido', 'error');
                return false;
            }
            
            if (!cardExpiry || cardExpiry.length !== 5) {
                showNotification('Data de validade inválida', 'error');
                return false;
            }
            
            if (!cardCVV || cardCVV.length < 3) {
                showNotification('CVV inválido', 'error');
                return false;
            }
            
            if (!cardName) {
                showNotification('Nome no cartão é obrigatório', 'error');
                return false;
            }
        } else if (selectedPayment === 'mbway') {
            const phone = document.getElementById('mbwayPhone').value;
            if (!phone) {
                showNotification('Número de telemóvel é obrigatório', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    return true;
}

// Display confirmation
function displayConfirmation() {
    // Shipping info
    const confirmShipping = document.getElementById('confirmShipping');
    if (confirmShipping && selectedAddress) {
        const shippingNames = {
            'standard': 'Envio Standard (3-5 dias)',
            'express': 'Envio Expresso (1-2 dias)',
            'next-day': 'Entrega no Dia Seguinte'
        };
        
        confirmShipping.innerHTML = `
            <p><strong>${selectedAddress.name}</strong></p>
            <p>${selectedAddress.street}</p>
            <p>${selectedAddress.postalCode} ${selectedAddress.city}</p>
            <p>Tel: ${selectedAddress.phone}</p>
            <p class="mt-3"><strong>Método:</strong> ${shippingNames[selectedShipping]}</p>
        `;
    }
    
    // Payment info
    const confirmPayment = document.getElementById('confirmPayment');
    if (confirmPayment) {
        let paymentInfo = '';
        
        if (selectedPayment === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const lastFour = cardNumber.slice(-4);
            paymentInfo = `<p>Cartão terminado em •••• ${lastFour}</p>`;
        } else if (selectedPayment === 'mbway') {
            paymentInfo = '<p>MB WAY</p>';
        } else if (selectedPayment === 'paypal') {
            paymentInfo = '<p>PayPal</p>';
        } else if (selectedPayment === 'multibanco') {
            paymentInfo = '<p>Multibanco (Referência será enviada por email)</p>';
        } else if (selectedPayment === 'transfer') {
            paymentInfo = '<p>Transferência Bancária</p>';
        }
        
        confirmPayment.innerHTML = paymentInfo;
    }
}

// Finalize order
async function finalizeOrder() {
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!acceptTerms) {
        showNotification('Por favor aceite os termos e condições', 'error');
        return;
    }
    
    const finalizeBtn = document.getElementById('finalizeBtn');
    finalizeBtn.disabled = true;
    finalizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    
    try {
        const token = localStorage.getItem('token');
        
        // Prepare order data
        const orderData = {
            products: cart.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: selectedAddress,
            shippingMethod: selectedShipping,
            paymentMethod: selectedPayment,
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shippingCost: shippingCost,
            discount: promoDiscount,
            promoCode: appliedPromoCode,
            totalAmount: parseFloat(document.getElementById('total').textContent)
        };
        
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao processar pedido');
        }
        
        const order = await response.json();
        
        // Clear cart
        localStorage.removeItem('cart');
        cart = [];
        
        // Show success
        document.getElementById('orderNumber').textContent = `#${order.orderNumber || order._id}`;
        document.querySelectorAll('.checkout-step-content').forEach(step => {
            step.style.display = 'none';
        });
        document.getElementById('step-success').style.display = 'block';
        
        // Confetti animation
        showConfetti();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Erro ao processar pedido. Tente novamente.', 'error');
        finalizeBtn.disabled = false;
        finalizeBtn.innerHTML = '<i class="fas fa-check"></i> Finalizar Pedido';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show confetti
function showConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Create confetti particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${['#667eea', '#764ba2', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)]};
                top: ${randomInRange(0, 100)}%;
                left: ${randomInRange(0, 100)}%;
                opacity: ${randomInRange(0.5, 1)};
                transform: rotate(${randomInRange(0, 360)}deg);
                animation: confettiFall ${randomInRange(2, 4)}s linear;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 4000);
        }
    }, 250);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);





