    // Admin Dashboard Management
    
    document.addEventListener('DOMContentLoaded', function() {
        // Check if admin is logged in before proceeding
        const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
        if (!currentAdmin) return;
        
        // Initialize the dashboard
        setupSidebar();
        loadDashboardData();
        setupTabs();
        setupSettingsForms();
        
        // By default, show the dashboard page
        showPage('dashboard');
    });
    
    // Setup sidebar navigation
    function setupSidebar() {
        // Toggle sidebar
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('wrapper').classList.toggle('toggled');
            });
        }
        
        // Sidebar navigation links
        const sidebarLinks = {
            'dashboard-tab': 'dashboard',
            'reservations-tab': 'reservations',
            'users-tab': 'users',
            'settings-tab': 'settings'
        };
        
        // Add click event listeners to sidebar links
        Object.keys(sidebarLinks).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Show the corresponding page
                    showPage(sidebarLinks[id]);
                });
            }
        });
        
        // Additional navigation links
        const additionalLinks = {
            'reservations-link': 'reservations',
            'confirmed-link': 'reservations',
            'pending-link': 'reservations',
            'users-link': 'users',
            'view-all-reservations': 'reservations'
        };
        
        Object.keys(additionalLinks).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all sidebar links
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to corresponding sidebar link
                    const sidebarLink = document.getElementById(additionalLinks[id] + '-tab');
                    if (sidebarLink) {
                        sidebarLink.classList.add('active');
                    }
                    
                    // Show the corresponding page
                    showPage(additionalLinks[id]);
                });
            }
        });
    }
    
    // Show a specific page and hide others
    function showPage(pageId) {
        const pages = ['dashboard', 'reservations', 'users', 'settings'];
        
        pages.forEach(page => {
            const pageElement = document.getElementById(page + '-page');
            if (pageElement) {
                if (page === pageId) {
                    pageElement.style.display = 'block';
                } else {
                    pageElement.style.display = 'none';
                }
            }
        });
        
        // Load page-specific data
        if (pageId === 'dashboard') {
            loadDashboardData();
        } else if (pageId === 'reservations') {
            loadAllReservations();
        } else if (pageId === 'users') {
            loadAllUsers();
        }
    }
    
    // Load dashboard data
    function loadDashboardData() {
        // Get all reservations and users
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Update counts
        document.getElementById('total-reservations').textContent = reservations.length;
        document.getElementById('confirmed-reservations').textContent = reservations.filter(r => r.status === 'confirmed').length;
        document.getElementById('pending-reservations').textContent = reservations.filter(r => r.status === 'pending').length;
        document.getElementById('total-users').textContent = users.length;
        
        // Load recent reservations
        loadRecentReservations(reservations);
        
        // Load today's reservations
        loadTodaysReservations(reservations);
    }
    
    // Load recent reservations for the dashboard
    function loadRecentReservations(reservations) {
        const recentReservationsTable = document.getElementById('recent-reservations-table');
        if (!recentReservationsTable) return;
        
        // Sort by creation date (newest first)
        const sortedReservations = [...reservations].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Take only the 5 most recent
        const recentReservations = sortedReservations.slice(0, 5);
        
        // Clear the table
        recentReservationsTable.innerHTML = '';
        
        // Add reservations to table
        if (recentReservations.length === 0) {
            recentReservationsTable.innerHTML = '<tr><td colspan="6" class="text-center">No reservations found</td></tr>';
        } else {
            recentReservations.forEach(reservation => {
                const row = document.createElement('tr');
                
                const statusClass = getStatusBadgeClass(reservation.status);
                const statusText = getStatusText(reservation.status);
                
                row.innerHTML = `
                    <td>${reservation.id.substring(0, 8)}</td>
                    <td>${reservation.customerName}</td>
                    <td>${formatDate(reservation.date)}</td>
                    <td>${reservation.cottageType}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary view-reservation" data-id="${reservation.id}">
                            View
                        </button>
                    </td>
                `;
                
                recentReservationsTable.appendChild(row);
            });
            
            // Add event listeners to the view buttons
            document.querySelectorAll('.view-reservation').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    showReservationDetails(id);
                });
            });
        }
    }
    
    // Load today's reservations for the dashboard
    function loadTodaysReservations(reservations) {
        const todayReservationsList = document.getElementById('today-reservations-list');
        const noReservationsToday = document.getElementById('no-reservations-today');
        
        if (!todayReservationsList || !noReservationsToday) return;
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Filter reservations for today
        const todaysReservations = reservations.filter(res => res.date === today);
        
        // Sort by time
        todaysReservations.sort((a, b) => {
            const timeA = convertTimeToMinutes(a.time);
            const timeB = convertTimeToMinutes(b.time);
            return timeA - timeB;
        });
        
        // Check if there are reservations today
        if (todaysReservations.length === 0) {
            noReservationsToday.style.display = 'block';
            todayReservationsList.innerHTML = '';
        } else {
            noReservationsToday.style.display = 'none';
            todayReservationsList.innerHTML = '';
            
            // Add reservations to the list
            todaysReservations.forEach(reservation => {
                const statusClass = reservation.status === 'confirmed' ? 'confirmed' : 'pending';
                
                const item = document.createElement('div');
                item.className = `reservation-item ${statusClass}`;
                
                item.innerHTML = `
                    <h5>${reservation.time} - ${reservation.customerName}</h5>
                    <p><strong>Cottage:</strong> ${reservation.cottageType}</p>
                    <p><strong>Guests:</strong> ${reservation.numberOfGuests}</p>
                    <p><strong>Status:</strong> ${getStatusText(reservation.status)}</p>
                    <button class="btn btn-sm btn-primary view-today-reservation" data-id="${reservation.id}">
                        View Details
                    </button>
                `;
                
                todayReservationsList.appendChild(item);
            });
            
            // Add event listeners to the view buttons
            document.querySelectorAll('.view-today-reservation').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    showReservationDetails(id);
                });
            });
        }
    }
    
    // Load all reservations for the reservations page
    function loadAllReservations() {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        // Sort by creation date (newest first)
        const sortedReservations = [...reservations].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Clear all tables
        document.getElementById('all-reservations-table').innerHTML = '';
        document.getElementById('pending-reservations-table').innerHTML = '';
        document.getElementById('confirmed-reservations-table').innerHTML = '';
        document.getElementById('cancelled-reservations-table').innerHTML = '';
        
        // Check if there are any reservations
        if (sortedReservations.length === 0) {
            const noReservationsMessage = '<tr><td colspan="8" class="text-center">No reservations found</td></tr>';
            document.getElementById('all-reservations-table').innerHTML = noReservationsMessage;
            document.getElementById('pending-reservations-table').innerHTML = noReservationsMessage;
            document.getElementById('confirmed-reservations-table').innerHTML = noReservationsMessage;
            document.getElementById('cancelled-reservations-table').innerHTML = noReservationsMessage;
            return;
        }
        
        // Create filtered lists
        const pendingReservations = sortedReservations.filter(r => r.status === 'pending');
        const confirmedReservations = sortedReservations.filter(r => r.status === 'confirmed');
        const cancelledReservations = sortedReservations.filter(r => r.status === 'cancelled');
        
        // Add reservations to tables
        addReservationsToTable(sortedReservations, 'all-reservations-table', true);
        addReservationsToTable(pendingReservations, 'pending-reservations-table', false);
        addReservationsToTable(confirmedReservations, 'confirmed-reservations-table', false);
        addReservationsToTable(cancelledReservations, 'cancelled-reservations-table', false);
        
        // Add search functionality
        setupReservationSearch();
    }
    
    // Add reservations to a table
    function addReservationsToTable(reservations, tableId, includeStatus) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        // Check if there are any reservations to display
        if (reservations.length === 0) {
            table.innerHTML = '<tr><td colspan="8" class="text-center">No reservations found</td></tr>';
            return;
        }
        
        // Add each reservation to the table
        reservations.forEach(reservation => {
            const row = document.createElement('tr');
            
            let html = `
                <td>${reservation.id.substring(0, 8)}</td>
                <td>${reservation.customerName}</td>
                <td>${reservation.customerPhone}</td>
                <td>${formatDate(reservation.date)} ${reservation.time}</td>
                <td>${reservation.cottageType}</td>
                <td>${reservation.numberOfGuests}</td>
            `;
            
            if (includeStatus) {
                const statusClass = getStatusBadgeClass(reservation.status);
                const statusText = getStatusText(reservation.status);
                
                html += `<td><span class="badge ${statusClass}">${statusText}</span></td>`;
            }
            
            html += `
                <td>
                    <button class="btn btn-sm btn-primary view-reservation" data-id="${reservation.id}">
                        <i class="fas fa-eye"></i>
                    </button>
            `;
            
            if (reservation.status === 'pending') {
                html += `
                    <button class="btn btn-sm btn-success approve-reservation" data-id="${reservation.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger reject-reservation" data-id="${reservation.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            html += `</td>`;
            
            row.innerHTML = html;
            table.appendChild(row);
        });
        
        // Add event listeners to buttons
        table.querySelectorAll('.view-reservation').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                showReservationDetails(id);
            });
        });
        
        table.querySelectorAll('.approve-reservation').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (confirm('Are you sure you want to approve this reservation?')) {
                    updateReservationStatus(id, 'confirmed');
                }
            });
        });
        
        table.querySelectorAll('.reject-reservation').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (confirm('Are you sure you want to reject this reservation?')) {
                    updateReservationStatus(id, 'cancelled');
                }
            });
        });
    }
    
    // Setup reservation search functionality
    function setupReservationSearch() {
        const searchInput = document.getElementById('reservation-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            
            if (searchTerm.trim() === '') {
                // If search is empty, show all reservations
                loadAllReservations();
                return;
            }
            
            // Filter reservations by search term
            const filteredReservations = reservations.filter(res => 
                res.id.toLowerCase().includes(searchTerm) ||
                res.customerName.toLowerCase().includes(searchTerm) ||
                res.customerEmail.toLowerCase().includes(searchTerm) ||
                res.customerPhone.toLowerCase().includes(searchTerm) ||
                res.cottageType.toLowerCase().includes(searchTerm) ||
                res.date.includes(searchTerm)
            );
            
            // Sort by creation date (newest first)
            filteredReservations.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Clear all tables
            document.getElementById('all-reservations-table').innerHTML = '';
            
            // Add filtered reservations to the "All" tab table
            addReservationsToTable(filteredReservations, 'all-reservations-table', true);
        });
    }
    
    // Load all users for the users page
    function loadAllUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        // Sort by creation date (newest first)
        const sortedUsers = [...users].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const usersTable = document.getElementById('users-table');
        if (!usersTable) return;
        
        // Clear the table
        usersTable.innerHTML = '';
        
        // Check if there are any users
        if (sortedUsers.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            return;
        }
        
        // Add users to the table
        sortedUsers.forEach(user => {
            // Count user's reservations
            const userReservations = reservations.filter(res => res.userId === user.id);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id.substring(0, 8)}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${formatDateTime(user.createdAt)}</td>
                <td>${userReservations.length}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-user" data-id="${user.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
        
        // Add event listeners to view buttons
        usersTable.querySelectorAll('.view-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                showUserDetails(id);
            });
        });
        
        // Setup user search
        setupUserSearch();
    }
    
    // Setup user search functionality
    function setupUserSearch() {
        const searchInput = document.getElementById('user-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            if (searchTerm.trim() === '') {
                // If search is empty, show all users
                loadAllUsers();
                return;
            }
            
            // Filter users by search term
            const filteredUsers = users.filter(user => 
                user.id.toLowerCase().includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.phone.toLowerCase().includes(searchTerm)
            );
            
            // Update users table with filtered results
            const usersTable = document.getElementById('users-table');
            if (!usersTable) return;
            
            // Clear the table
            usersTable.innerHTML = '';
            
            // Check if there are any filtered users
            if (filteredUsers.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="7" class="text-center">No users found matching your search</td></tr>';
                return;
            }
            
            // Get reservations for reference
            const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            
            // Add filtered users to the table
            filteredUsers.forEach(user => {
                // Count user's reservations
                const userReservations = reservations.filter(res => res.userId === user.id);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id.substring(0, 8)}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${formatDateTime(user.createdAt)}</td>
                    <td>${userReservations.length}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-user" data-id="${user.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                usersTable.appendChild(row);
            });
            
            // Add event listeners to view buttons
            usersTable.querySelectorAll('.view-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    showUserDetails(id);
                });
            });
        });
    }
    
    // Show reservation details in a modal
    function showReservationDetails(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const reservation = reservations.find(res => res.id === reservationId);
        
        if (!reservation) return;
        
        const modal = document.getElementById('reservation-details-modal');
        const detailsContent = document.getElementById('reservation-details-content');
        const approveBtn = document.getElementById('approve-reservation-btn');
        const rejectBtn = document.getElementById('reject-reservation-btn');
        
        // Update modal buttons based on reservation status
        if (reservation.status === 'pending') {
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'block';
            
            approveBtn.dataset.id = reservationId;
            rejectBtn.dataset.id = reservationId;
            
            // Add event listeners to buttons
            approveBtn.onclick = function() {
                if (confirm('Are you sure you want to approve this reservation?')) {
                    updateReservationStatus(reservationId, 'confirmed');
                    bootstrap.Modal.getInstance(modal).hide();
                }
            };
            
            rejectBtn.onclick = function() {
                if (confirm('Are you sure you want to reject this reservation?')) {
                    updateReservationStatus(reservationId, 'cancelled');
                    bootstrap.Modal.getInstance(modal).hide();
                }
            };
        } else {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }
        
        // Update modal content
        const statusClass = getStatusBadgeClass(reservation.status);
        const statusText = getStatusText(reservation.status);
        
        detailsContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Reservation Information</h5>
                    <div class="mb-2"><strong>ID:</strong> ${reservation.id}</div>
                    <div class="mb-2"><strong>Status:</strong> <span class="badge ${statusClass}">${statusText}</span></div>
                    <div class="mb-2"><strong>Created:</strong> ${formatDateTime(reservation.createdAt)}</div>
                </div>
                <div class="col-md-6">
                    <h5>Customer Information</h5>
                    <div class="mb-2"><strong>Name:</strong> ${reservation.customerName}</div>
                    <div class="mb-2"><strong>Email:</strong> ${reservation.customerEmail}</div>
                    <div class="mb-2"><strong>Phone:</strong> ${reservation.customerPhone}</div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>Booking Details</h5>
                    <div class="mb-2"><strong>Date:</strong> ${formatDate(reservation.date)}</div>
                    <div class="mb-2"><strong>Time:</strong> ${reservation.time}</div>
                    <div class="mb-2"><strong>Cottage Type:</strong> ${reservation.cottageType}</div>
                    <div class="mb-2"><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</div>
                    <div class="mb-2"><strong>Price:</strong> ₱${reservation.price.toLocaleString()}</div>
                </div>
                <div class="col-md-6">
                    <h5>Special Requests</h5>
                    <div class="p-3 bg-light rounded">
                        ${reservation.specialRequests || 'No special requests.'}
                    </div>
                </div>
            </div>
        `;
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // Show user details in a modal
    function showUserDetails(userId) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        // Filter reservations for this user
        const userReservations = reservations.filter(res => res.userId === userId);
        
        // Sort by date (newest first)
        userReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const modal = document.getElementById('user-details-modal');
        const detailsContent = document.getElementById('user-details-content');
        
        // Build reservation history HTML
        let reservationHistoryHtml = '<div class="list-group">';
        
        if (userReservations.length === 0) {
            reservationHistoryHtml += '<div class="list-group-item">No reservation history found</div>';
        } else {
            userReservations.forEach(res => {
                const statusClass = getStatusBadgeClass(res.status);
                const statusText = getStatusText(res.status);
                
                reservationHistoryHtml += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${formatDate(res.date)} ${res.time}</h6>
                            <span class="badge ${statusClass}">${statusText}</span>
                        </div>
                        <p class="mb-1">${res.cottageType} - ${res.numberOfGuests} guests</p>
                        <small>Booking ID: ${res.id.substring(0, 8)}</small>
                    </div>
                `;
            });
        }
        
        reservationHistoryHtml += '</div>';
        
        // Build user details HTML
        detailsContent.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">User Profile</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <div class="user-avatar mx-auto">
                                    <i class="fas fa-user"></i>
                                </div>
                                <h5>${user.name}</h5>
                                <p class="text-muted mb-0">Member since ${formatDate(user.createdAt)}</p>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">User ID:</label>
                                <input type="text" class="form-control" value="${user.id}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email:</label>
                                <input type="text" class="form-control" value="${user.email}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Phone:</label>
                                <input type="text" class="form-control" value="${user.phone}" readonly>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Reservation History</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6>Total Reservations: ${userReservations.length}</h6>
                                    </div>
                                    <div>
                                        <span class="badge bg-success">${userReservations.filter(r => r.status === 'confirmed').length} Confirmed</span>
                                        <span class="badge bg-warning text-dark">${userReservations.filter(r => r.status === 'pending').length} Pending</span>
                                        <span class="badge bg-danger">${userReservations.filter(r => r.status === 'cancelled').length} Cancelled</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="reservation-history">
                                ${reservationHistoryHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // Setup settings forms
    function setupSettingsForms() {
        setupCottageSettingsForm();
        setupAdminSettingsForm();
    }
    
    // Setup cottage settings form
    function setupCottageSettingsForm() {
        const cottageSettingsForm = document.getElementById('cottage-settings-form');
        if (!cottageSettingsForm) return;
        
        // Load existing prices if available
        const cottagePrices = JSON.parse(localStorage.getItem('cottagePrices'));
        if (cottagePrices) {
            document.getElementById('small-cottage-price').value = cottagePrices.small;
            document.getElementById('medium-cottage-price').value = cottagePrices.medium;
            document.getElementById('large-cottage-price').value = cottagePrices.large;
        }
        
        // Form submission
        cottageSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const smallPrice = parseInt(document.getElementById('small-cottage-price').value);
            const mediumPrice = parseInt(document.getElementById('medium-cottage-price').value);
            const largePrice = parseInt(document.getElementById('large-cottage-price').value);
            
            // Validate inputs
            if (smallPrice <= 0 || mediumPrice <= 0 || largePrice <= 0) {
                alert('Prices must be greater than zero.');
                return;
            }
            
            // Save prices
            const prices = {
                small: smallPrice,
                medium: mediumPrice,
                large: largePrice
            };
            
            localStorage.setItem('cottagePrices', JSON.stringify(prices));
            
            alert('Cottage prices have been updated successfully.');
        });
    }
    
    // Setup admin settings form
    function setupAdminSettingsForm() {
        const adminSettingsForm = document.getElementById('admin-settings-form');
        if (!adminSettingsForm) return;
        
        // Load current admin username
        const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
        if (adminCredentials) {
            document.getElementById('admin-username-setting').value = adminCredentials.username;
        }
        
        // Form submission
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('admin-username-setting').value;
            const password = document.getElementById('admin-password-setting').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;
            
            // Validate username
            if (!username) {
                alert('Username cannot be empty.');
                return;
            }
            
            // Check if password fields match if a new password is being set
            if (password && password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            
            // Update admin credentials
            if (updateAdminCredentials(username, password)) {
                alert('Admin account has been updated successfully.');
                
                // Clear password fields
                document.getElementById('admin-password-setting').value = '';
                document.getElementById('admin-confirm-password').value = '';
                
                // Update admin name in the UI
                document.querySelectorAll('#admin-name').forEach(element => {
                    element.textContent = username;
                });
            } else {
                alert('Failed to update admin account.');
            }
        });
    }
    
    // Update reservation status
    function updateReservationStatus(reservationId, newStatus) {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        // Find the reservation
        const index = reservations.findIndex(res => res.id === reservationId);
        
        if (index === -1) {
            alert('Reservation not found.');
            return false;
        }
        
        // Update the status
        reservations[index].status = newStatus;
        
        // Save back to localStorage
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Reload all reservations data
        loadAllReservations();
        
        // Also refresh dashboard data if we're on the dashboard
        if (document.getElementById('dashboard-page').style.display !== 'none') {
            loadDashboardData();
        }
        
        return true;
    }
    
    // Setup tabs for reservations
    function setupTabs() {
        // Add click event listeners to reservation tab buttons
        document.querySelectorAll('#reservationTabs button').forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all tab buttons
                document.querySelectorAll('#reservationTabs button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
            });
        });
    }
    
    // Helper Functions
    
    // Format date as a string
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Format date and time as a string
    function formatDateTime(dateTimeString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeString).toLocaleString(undefined, options);
    }
    
    // Convert time string (e.g., "1:00 PM") to minutes for sorting
    function convertTimeToMinutes(timeString) {
        const [time, period] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return hours * 60 + minutes;
    }
    
    // Get status badge class
    function getStatusBadgeClass(status) {
        switch(status) {
            case 'pending': return 'bg-warning text-dark';
            case 'confirmed': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
    
    // Get status text
    function getStatusText(status) {
        switch(status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'cancelled': return 'Cancelled';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }