// My Reservations Page

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in, if so load their reservations
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        loadUserReservations();
        setupReservationDetails();
    }
});

function loadUserReservations() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reservationsList = document.getElementById('reservations-list');
    const noReservationsMessage = document.getElementById('no-reservations');
    
    if (!currentUser || !reservationsList) return;
    
    // Get all reservations
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Filter reservations for the current user
    const userReservations = reservations.filter(res => res.userId === currentUser.id);
    
    // Sort by date (newest first)
    userReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Display message if no reservations
    if (userReservations.length === 0) {
        if (noReservationsMessage) noReservationsMessage.style.display = 'block';
        return;
    }
    
    // Hide no reservations message
    if (noReservationsMessage) noReservationsMessage.style.display = 'none';
    
    // Display the reservations
    reservationsList.innerHTML = '';
    
    userReservations.forEach(reservation => {
        const statusClass = getStatusClass(reservation.status);
        const statusText = getStatusText(reservation.status);
        
        const reservationCard = document.createElement('div');
        reservationCard.className = `card mb-3 reservation-card ${statusClass}`;
        reservationCard.dataset.id = reservation.id;
        
        reservationCard.innerHTML = `
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Reservation #${reservation.id.substring(0, 8)}</h5>
                <span class="badge ${getStatusBadgeClass(reservation.status)}">${statusText}</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
                        <p><strong>Time:</strong> ${reservation.time}</p>
                        <p><strong>Cottage:</strong> ${reservation.cottageType}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Guests:</strong> ${reservation.numberOfGuests}</p>
                        <p><strong>Price:</strong> ₱${reservation.price.toLocaleString()}</p>
                        <p><strong>Created:</strong> ${formatDateTime(reservation.createdAt)}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary view-details-btn" data-id="${reservation.id}" data-bs-toggle="modal" data-bs-target="#reservation-details-modal">
                        View Details
                    </button>
                    ${reservation.status === 'pending' ? `
                        <button class="btn btn-danger cancel-btn" data-id="${reservation.id}">
                            Cancel Reservation
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        reservationsList.appendChild(reservationCard);
    });
    
    // Add event listeners for the cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reservationId = this.dataset.id;
            if (confirm('Are you sure you want to cancel this reservation?')) {
                cancelReservation(reservationId);
            }
        });
    });
    
    // Add event listeners for the view details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reservationId = this.dataset.id;
            loadReservationDetails(reservationId);
        });
    });
}

function setupReservationDetails() {
    // Setup the cancel button in the details modal
    const cancelReservationBtn = document.getElementById('cancel-reservation-btn');
    
    if (cancelReservationBtn) {
        cancelReservationBtn.addEventListener('click', function() {
            const reservationId = this.dataset.id;
            if (confirm('Are you sure you want to cancel this reservation?')) {
                cancelReservation(reservationId);
                bootstrap.Modal.getInstance(document.getElementById('reservation-details-modal')).hide();
            }
        });
    }
}

function loadReservationDetails(reservationId) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations.find(res => res.id === reservationId);
    
    if (!reservation) return;
    
    const detailsContent = document.getElementById('reservation-details-content');
    const cancelBtn = document.getElementById('cancel-reservation-btn');
    
    // Set the reservation ID on the cancel button
    if (cancelBtn) {
        cancelBtn.dataset.id = reservationId;
        
        // Only show cancel button for pending reservations
        if (reservation.status === 'pending') {
            cancelBtn.style.display = 'block';
        } else {
            cancelBtn.style.display = 'none';
        }
    }
    
    const statusClass = getStatusBadgeClass(reservation.status);
    const statusText = getStatusText(reservation.status);
    
    detailsContent.innerHTML = `
        <div class="card mb-3">
            <div class="card-header bg-white">
                <h5 class="card-title">Reservation Details</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Reservation Information</h6>
                        <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                        <p><strong>Status:</strong> <span class="badge ${statusClass}">${statusText}</span></p>
                        <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
                        <p><strong>Time:</strong> ${reservation.time}</p>
                        <p><strong>Created On:</strong> ${formatDateTime(reservation.createdAt)}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Cottage Information</h6>
                        <p><strong>Cottage Type:</strong> ${reservation.cottageType}</p>
                        <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
                        <p><strong>Price:</strong> ₱${reservation.price.toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <h6>Special Requests</h6>
                        <p>${reservation.specialRequests || 'None'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function cancelReservation(reservationId) {
    // Get all reservations
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Find the reservation
    const index = reservations.findIndex(res => res.id === reservationId);
    
    if (index !== -1) {
        // Update the status to cancelled
        reservations[index].status = 'cancelled';
        
        // Save back to localStorage
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Reload the reservations list
        loadUserReservations();
        
        alert('Reservation has been cancelled.');
    }
}

// Helper Functions
function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'pending';
        case 'confirmed': return 'confirmed';
        case 'cancelled': return 'cancelled';
        default: return '';
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'pending': return 'bg-warning text-dark';
        case 'confirmed': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'cancelled': return 'Cancelled';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
}