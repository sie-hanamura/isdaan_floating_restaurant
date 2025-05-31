// Reservation form handling

document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        setupReservationForm();
        setupDateValidation();
    }
});

function setupReservationForm() {
    const reservationForm = document.getElementById('reservation-form');
    const cottageType = document.getElementById('cottage-type');
    const guestsNumber = document.getElementById('guests-number');
    
    // Set minimum date to today
    const reservationDate = document.getElementById('reservation-date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    reservationDate.min = formattedDate;

    // Validate guest number based on cottage type
    cottageType.addEventListener('change', function() {
        updateGuestLimits();
    });

    // Handle form submission
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to make a reservation');
            return;
        }
        
        // Get form data
        const date = document.getElementById('reservation-date').value;
        const time = document.getElementById('reservation-time').value;
        const cottage = cottageType.value;
        const guests = guestsNumber.value;
        const specialRequests = document.getElementById('special-requests').value;
        
        // Create reservation
        createReservation(currentUser, date, time, cottage, guests, specialRequests);
    });
}

function updateGuestLimits() {
    const cottageType = document.getElementById('cottage-type');
    const guestsNumber = document.getElementById('guests-number');
    
    if (cottageType.value === "Small Cottage") {
        guestsNumber.min = 1;
        guestsNumber.max = 4;
        if (guestsNumber.value > 4) guestsNumber.value = 4;
    } else if (cottageType.value === "Medium Cottage") {
        guestsNumber.min = 5;
        guestsNumber.max = 8;
        if (guestsNumber.value < 5) guestsNumber.value = 5;
        if (guestsNumber.value > 8) guestsNumber.value = 8;
    } else if (cottageType.value === "Large Cottage") {
        guestsNumber.min = 9;
        guestsNumber.max = 15;
        if (guestsNumber.value < 9) guestsNumber.value = 9;
    } else {
        guestsNumber.min = 1;
        guestsNumber.max = 15;
    }
}

function setupDateValidation() {
    // Add date validation to prevent reservations on past dates
    const reservationDate = document.getElementById('reservation-date');
    
    reservationDate.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            alert('Cannot make reservations for past dates');
            this.value = '';
        }
    });
}

async function createReservation(user, date, time, cottage, guests, specialRequests) {
    // Check if email is verified if EmailService is available
    if (window.EmailService && !user.emailVerified) {
        const confirmed = confirm('Your email address has not been verified yet. Verifying your email ensures you receive important notifications about your reservation. Would you like to continue anyway?');
        if (!confirmed) {
            return;
        }
    }
    
    // Check if there are available cottages of this type on the selected date and time
    if (!isCottageAvailable(date, time, cottage)) {
        alert('Sorry, all cottages of this type are already booked for the selected date and time.');
        return;
    }
    
    // Get existing reservations
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Calculate price based on cottage type
    let price = 0;
    if (cottage === "Small Cottage") {
        price = 1000;
    } else if (cottage === "Medium Cottage") {
        price = 2000;
    } else if (cottage === "Large Cottage") {
        price = 3500;
    }
    
    // Create new reservation
    const newReservation = {
        id: generateId(),
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        date: date,
        time: time,
        cottageType: cottage,
        numberOfGuests: parseInt(guests),
        specialRequests: specialRequests,
        price: price,
        status: 'pending', // Initial status is pending (requires admin approval)
        createdAt: new Date().toISOString()
    };
    
    // Add to reservations array
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Send confirmation email if EmailService is available
    if (window.EmailService) {
        try {
            await window.EmailService.sendReservationConfirmationEmail(newReservation, user);
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
        }
    }
    
    // Show success message and redirect
    alert('Reservation request submitted successfully! Please wait for admin approval.' + 
          (window.EmailService ? ' A confirmation email has been sent to your email address.' : ''));
    
    window.location.href = 'my-reservations.html';
}

function isCottageAvailable(date, time, cottageType) {
    // Get existing reservations
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    // Count how many cottages of this type are already booked on the selected date and time
    const bookedCottages = reservations.filter(res => 
        res.date === date && 
        res.time === time && 
        res.cottageType === cottageType &&
        (res.status === 'confirmed' || res.status === 'pending')
    ).length;
    
    // Define maximum number of cottages per type
    const maxCottages = {
        "Small Cottage": 5,  // Assuming 5 small cottages are available
        "Medium Cottage": 3, // Assuming 3 medium cottages are available
        "Large Cottage": 2   // Assuming 2 large cottages are available
    };
    
    // Check if there are still cottages available of this type
    return bookedCottages < maxCottages[cottageType];
}

// Helper function to generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}