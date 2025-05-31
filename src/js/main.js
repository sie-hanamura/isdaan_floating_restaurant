// Main JavaScript for the Isdaan Homepage

document.addEventListener('DOMContentLoaded', function() {
    // Update the homepage to use Bootstrap
    convertToBootstrap();
    
    // Initialize tooltips and popovers
    initializeBootstrapComponents();
});

// Convert the homepage to use Bootstrap components
function convertToBootstrap() {
    // Update the navigation bar
    const header = document.querySelector('header');
    if (header) {
        header.className = 'mb-4';
        header.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="index.html">Isdaan Floating Restaurant</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link active" href="index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="reservation.html">Make Reservation</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="my-reservations.html">My Reservations</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="#" id="login-btn" class="btn btn-outline-light me-2">Login</a>
                            <a href="#" id="register-btn" class="btn btn-light">Register</a>
                            <a href="#" id="logout-btn" class="btn btn-outline-light" style="display: none;">Logout</a>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    // Update hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.className = 'hero py-5 mb-5 text-center text-white rounded';
        hero.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1536489885071-87983c3e2859?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")';
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
        
        // Update hero content
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.className = 'container py-5';
            
            // Update button
            const heroBtn = heroContent.querySelector('.btn');
            if (heroBtn) {
                heroBtn.className = 'btn btn-primary btn-lg';
            }
        }
    }

    // Update features section
    const features = document.querySelector('.features');
    if (features) {
        features.className = 'row mb-5';
        
        // Update feature boxes
        const featureBoxes = features.querySelectorAll('.feature-box');
        featureBoxes.forEach(box => {
            box.className = 'col-md-4 mb-4';
            box.innerHTML = `
                <div class="card h-100 text-center shadow-sm">
                    <div class="card-body">
                        ${box.innerHTML}
                    </div>
                </div>
            `;
            
            // Update icons
            const icon = box.querySelector('i');
            if (icon) {
                icon.className = icon.className + ' mb-3 text-primary fa-3x';
            }
        });
    }

    // Update cottage cards
    const cottageContainer = document.querySelector('.cottage-container');
    if (cottageContainer) {
        cottageContainer.className = 'row';
        
        // Update each cottage card
        const cottageCards = cottageContainer.querySelectorAll('.cottage-card');
        cottageCards.forEach(card => {
            card.className = 'col-md-4 mb-4';
            
            const img = card.querySelector('img');
            const h3 = card.querySelector('h3');
            const paragraphs = card.querySelectorAll('p');
            
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    ${img ? img.outerHTML : ''}
                    <div class="card-body">
                        ${h3 ? `<h5 class="card-title">${h3.textContent}</h5>` : ''}
                        ${paragraphs[0] ? `<p class="card-text">${paragraphs[0].textContent}</p>` : ''}
                        ${paragraphs[1] ? `<p class="card-text fw-bold text-primary">${paragraphs[1].textContent}</p>` : ''}
                    </div>
                </div>
            `;
        });
    }

    // Update footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.className = 'bg-dark text-white py-4 mt-5';
        
        // Update footer content
        const footerContent = footer.querySelector('.footer-content');
        if (footerContent) {
            footerContent.className = 'row';
            
            // Update footer sections
            const footerSections = footerContent.querySelectorAll('.footer-section');
            footerSections.forEach(section => {
                section.className = 'col-md-4 mb-3';
                
                // Update social icons
                const socialIcons = section.querySelector('.social-icons');
                if (socialIcons) {
                    const icons = socialIcons.querySelectorAll('a');
                    icons.forEach(icon => {
                        icon.className = 'text-white me-2';
                        
                        const i = icon.querySelector('i');
                        if (i) {
                            i.className = i.className + ' fa-lg';
                        }
                    });
                }
            });
        }
        
        // Update footer bottom
        const footerBottom = footer.querySelector('.footer-bottom');
        if (footerBottom) {
            footerBottom.className = 'text-center mt-3 pt-3 border-top';
        }
    }

    // Update login and register modals
    updateModals();
}

// Update login and register modals to Bootstrap 5
function updateModals() {
    // Update login modal
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.className = 'modal fade';
        loginModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Login</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="login-form">
                            <div class="mb-3">
                                <label for="login-email" class="form-label">Email:</label>
                                <input type="email" class="form-control" id="login-email" required>
                            </div>
                            <div class="mb-3">
                                <label for="login-password" class="form-label">Password:</label>
                                <input type="password" class="form-control" id="login-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                            <p class="mt-3">Don't have an account? <a href="#" id="switch-to-register">Register here</a></p>
                            <p><a href="admin-login.html">Admin Login</a></p>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Update register modal
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.className = 'modal fade';
        registerModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Register</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="register-form">
                            <div class="mb-3">
                                <label for="register-name" class="form-label">Full Name:</label>
                                <input type="text" class="form-control" id="register-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-email" class="form-label">Email:</label>
                                <input type="email" class="form-control" id="register-email" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-phone" class="form-label">Phone Number:</label>
                                <input type="tel" class="form-control" id="register-phone" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-password" class="form-label">Password:</label>
                                <input type="password" class="form-control" id="register-password" required>
                            </div>
                            <div class="mb-3">
                                <label for="register-confirm-password" class="form-label">Confirm Password:</label>
                                <input type="password" class="form-control" id="register-confirm-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Register</button>
                            <p class="mt-3">Already have an account? <a href="#" id="switch-to-login">Login here</a></p>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Add Bootstrap scripts if not already added
    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
        document.body.appendChild(bootstrapScript);
    }
    
    // Add Bootstrap CSS if not already added
    if (!document.querySelector('link[href*="bootstrap.min.css"]')) {
        const bootstrapCSS = document.createElement('link');
        bootstrapCSS.rel = 'stylesheet';
        bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrapCSS);
    }
}

// Preload cottage images
function preloadImages() {
    const cottageImages = [
        'images/small-cottage.jpg',
        'images/medium-cottage.jpg',
        'images/large-cottage.jpg'
    ];
    
    cottageImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}