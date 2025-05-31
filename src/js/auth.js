// User Authentication & Registration System

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupLoginRegisterForms();
    setupModalSwitchers();
    setupAlertButtons();
});

// Check if user is already logged in
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const notLoggedInAlert = document.getElementById('not-logged-in');
    const reservationFormContainer = document.getElementById('reservation-form-container');
    const myReservationsContainer = document.getElementById('my-reservations-container');
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', logout);
        }
        
        // Show reservation form or my reservations if on those pages
        if (notLoggedInAlert) notLoggedInAlert.style.display = 'none';
        if (reservationFormContainer) reservationFormContainer.style.display = 'block';
        if (myReservationsContainer) myReservationsContainer.style.display = 'block';
        
        // If we're on the my-reservations page, load user's reservations
        if (window.location.pathname.includes('my-reservations')) {
            loadUserReservations();
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Show login required message if on reservation or my reservations page
        if (notLoggedInAlert) notLoggedInAlert.style.display = 'block';
        if (reservationFormContainer) reservationFormContainer.style.display = 'none';
        if (myReservationsContainer) myReservationsContainer.style.display = 'none';
    }
}

// Setup login and register forms
function setupLoginRegisterForms() {
    // Login modal setup
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const bsModal = new bootstrap.Modal(loginModal);
            bsModal.show();
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            login(email, password);
        });
    }
    
    // Register modal setup
    const registerBtn = document.getElementById('register-btn');
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const bsModal = new bootstrap.Modal(registerModal);
            bsModal.show();
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            register(name, email, phone, password);
        });
    }
}

// Setup modal switchers (between login and register)
function setupModalSwitchers() {
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    
    if (switchToRegister && loginModal && registerModal) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            bootstrap.Modal.getInstance(loginModal).hide();
            setTimeout(() => {
                const registerBsModal = new bootstrap.Modal(registerModal);
                registerBsModal.show();
            }, 500);
        });
    }
    
    if (switchToLogin && loginModal && registerModal) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            bootstrap.Modal.getInstance(registerModal).hide();
            setTimeout(() => {
                const loginBsModal = new bootstrap.Modal(loginModal);
                loginBsModal.show();
            }, 500);
        });
    }
}

// Setup alert login/register buttons
function setupAlertButtons() {
    const loginAlertBtn = document.getElementById('login-alert-btn');
    const registerAlertBtn = document.getElementById('register-alert-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    
    if (loginAlertBtn && loginModal) {
        loginAlertBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const bsModal = new bootstrap.Modal(loginModal);
            bsModal.show();
        });
    }
    
    if (registerAlertBtn && registerModal) {
        registerAlertBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const bsModal = new bootstrap.Modal(registerModal);
            bsModal.show();
        });
    }
}

// User Login Function
function login(email, password) {
    // In a real app, you would validate with a server
    // For this demo, we'll check against localStorage
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Create session
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            emailVerified: user.emailVerified || false
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Close modal if it exists
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            bootstrap.Modal.getInstance(loginModal).hide();
        }
        
        // Check if email is verified
        if (window.EmailService && !user.emailVerified) {
            alert('Login successful! Please verify your email to access all features.');
        } else {
            // Show success message
            alert('Login successful!');
        }
        
        window.location.reload();
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

// User Registration Function
async function register(name, email, phone, password) {
    // In a real app, this would be sent to a server
    // For this demo, we'll store in localStorage
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('An account with this email already exists.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name: name,
        email: email,
        phone: phone,
        password: password, // In a real app, NEVER store plain text passwords
        emailVerified: false, // New field to track email verification
        createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log the user in
    const currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        emailVerified: false
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Close modal if it exists
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        bootstrap.Modal.getInstance(registerModal).hide();
    }
    
    // Send verification email
    try {
        if (window.EmailService) {
            await window.EmailService.sendVerificationEmail(newUser);
            
            // Show success message
            alert('Registration successful! A verification email has been sent to your email address. Please verify your email to use all features.');
        } else {
            alert('Registration successful! You are now logged in.');
        }
    } catch (error) {
        console.error('Failed to send verification email:', error);
        alert('Registration successful! You are now logged in, but we could not send a verification email at this time.');
    }
    
    window.location.reload();
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Helper function to generate a unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}