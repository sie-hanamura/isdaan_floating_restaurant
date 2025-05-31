// Admin Authentication System

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLoginStatus();
    setupAdminLoginForm();
});

// Check if admin is logged in
function checkAdminLoginStatus() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    
    // If we're on the admin dashboard page
    if (window.location.pathname.includes('admin-dashboard')) {
        if (!currentAdmin) {
            // If not logged in, redirect to the login page
            window.location.href = 'admin-login.html';
        } else {
            // Update admin name in the UI
            updateAdminUI(currentAdmin);
            
            // Setup logout functionality
            setupAdminLogout();
        }
    }
}

// Setup admin login form
function setupAdminLoginForm() {
    const adminLoginForm = document.getElementById('admin-login-form');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            adminLogin(username, password);
        });
    }
}

// Handle admin login
function adminLogin(username, password) {
    // Initialize admin account if it doesn't exist
    initializeAdmin();
    
    // Get admin credentials from localStorage
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    
    // Check if credentials match
    if (adminCredentials && adminCredentials.username === username && adminCredentials.password === password) {
        // Create admin session
        const admin = {
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        // Show error message
        const loginError = document.getElementById('login-error');
        if (loginError) {
            loginError.style.display = 'block';
        } else {
            alert('Invalid username or password.');
        }
    }
}

// Create default admin account if none exists
function initializeAdmin() {
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    
    if (!adminCredentials) {
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123',  // In a real app, this would be hashed
            role: 'admin'
        };
        
        localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
    }
}

// Update admin UI elements
function updateAdminUI(admin) {
    const adminNameElements = document.querySelectorAll('#admin-name');
    
    adminNameElements.forEach(element => {
        element.textContent = admin.username;
    });
}

// Setup admin logout
function setupAdminLogout() {
    const logoutButtons = document.querySelectorAll('#admin-logout, #admin-logout-dropdown');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            adminLogout();
        });
    });
}

// Admin logout function
function adminLogout() {
    localStorage.removeItem('currentAdmin');
    window.location.href = 'admin-login.html';
}

// Function to update admin credentials
function updateAdminCredentials(username, password) {
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    
    if (adminCredentials) {
        adminCredentials.username = username;
        if (password) {
            adminCredentials.password = password;
        }
        
        localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
        return true;
    }
    
    return false;
}