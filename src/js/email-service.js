// Email Service for Isdaan Reservation System
// This file handles all email operations using SendGrid

// SendGrid API Key
const SENDGRID_API_KEY = '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';

// Restaurant details for emails
const RESTAURANT_NAME = 'Isdaan Floating Restaurant';
const RESTAURANT_EMAIL = 'noreply@isdaanrestaurant.com'; // Replace with your actual domain if available

// Email verification storage
// This would be stored in a database in a production environment
// For this demo, we'll use localStorage
function getVerificationStorage() {
    return JSON.parse(localStorage.getItem('emailVerifications')) || {};
}

function saveVerificationStorage(storage) {
    localStorage.setItem('emailVerifications', JSON.stringify(storage));
}

// Generate a verification token
function generateVerificationToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Store a verification token for a user
function storeVerificationToken(userId, email) {
    const verifications = getVerificationStorage();
    const token = generateVerificationToken();
    
    verifications[userId] = {
        email: email,
        token: token,
        timestamp: new Date().toISOString()
    };
    
    saveVerificationStorage(verifications);
    return token;
}

// Verify a user's email with the token
function verifyEmail(userId, token) {
    const verifications = getVerificationStorage();
    
    if (verifications[userId] && verifications[userId].token === token) {
        // Mark user as verified
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].emailVerified = true;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Clean up the verification entry
            delete verifications[userId];
            saveVerificationStorage(verifications);
            
            return true;
        }
    }
    
    return false;
}

// Check if a user's email is verified
function isEmailVerified(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    return user && user.emailVerified === true;
}

// Send an email using SendGrid API
async function sendEmail(to, subject, htmlContent, textContent) {
    // In a real-world application, this would use the SendGrid API directly
    // For this demo, we'll simulate sending emails
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: to }]
                    }
                ],
                from: { email: RESTAURANT_EMAIL, name: RESTAURANT_NAME },
                subject: subject,
                content: [
                    {
                        type: 'text/plain',
                        value: textContent
                    },
                    {
                        type: 'text/html',
                        value: htmlContent
                    }
                ]
            })
        });
        
        if (response.ok) {
            console.log('Email sent successfully');
            return true;
        } else {
            console.error('Failed to send email:', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Send a verification email to a newly registered user
async function sendVerificationEmail(user) {
    const token = storeVerificationToken(user.id, user.email);
    const verificationUrl = `${window.location.origin}/isdaan-system/verify-email.html?userId=${user.id}&token=${token}`;
    
    const subject = 'Verify Your Email - Isdaan Floating Restaurant';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
                <h1>${RESTAURANT_NAME}</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2>Welcome, ${user.name}!</h2>
                <p>Thank you for registering with Isdaan Floating Restaurant. Please verify your email address to complete your registration.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.</p>
                <p>123 Lake View, Taal, Batangas</p>
            </div>
        </div>
    `;
    
    const textContent = `
        Welcome to ${RESTAURANT_NAME}, ${user.name}!
        
        Thank you for registering with Isdaan Floating Restaurant. Please verify your email address to complete your registration.
        
        Verify your email by visiting this link: ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.
        123 Lake View, Taal, Batangas
    `;
    
    return await sendEmail(user.email, subject, htmlContent, textContent);
}

// Send a reservation confirmation email
async function sendReservationConfirmationEmail(reservation, user) {
    const subject = 'Reservation Confirmation - Isdaan Floating Restaurant';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
                <h1>${RESTAURANT_NAME}</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2>Reservation Submitted Successfully</h2>
                <p>Dear ${user.name},</p>
                <p>Your reservation request has been submitted successfully. Our team will review it shortly.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #0d6efd; padding: 15px; margin: 20px 0;">
                    <h3>Reservation Details:</h3>
                    <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                    <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
                    <p><strong>Time:</strong> ${reservation.time}</p>
                    <p><strong>Cottage Type:</strong> ${reservation.cottageType}</p>
                    <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
                    <p><strong>Status:</strong> Pending Approval</p>
                </div>
                
                <p>You will receive another email once your reservation is confirmed.</p>
                <p>You can also check the status of your reservation in your account.</p>
                
                <p>If you have any questions or need to make changes, please contact us at:</p>
                <p>Phone: (123) 456-7890<br>Email: info@isdaanrestaurant.com</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.</p>
                <p>123 Lake View, Taal, Batangas</p>
            </div>
        </div>
    `;
    
    const textContent = `
        Reservation Submitted Successfully
        
        Dear ${user.name},
        
        Your reservation request has been submitted successfully. Our team will review it shortly.
        
        Reservation Details:
        - Reservation ID: ${reservation.id}
        - Date: ${formatDate(reservation.date)}
        - Time: ${reservation.time}
        - Cottage Type: ${reservation.cottageType}
        - Number of Guests: ${reservation.numberOfGuests}
        - Status: Pending Approval
        
        You will receive another email once your reservation is confirmed.
        You can also check the status of your reservation in your account.
        
        If you have any questions or need to make changes, please contact us at:
        Phone: (123) 456-7890
        Email: info@isdaanrestaurant.com
        
        © ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.
        123 Lake View, Taal, Batangas
    `;
    
    return await sendEmail(user.email, subject, htmlContent, textContent);
}

// Send a reservation status update email
async function sendReservationStatusEmail(reservation, user) {
    const statusText = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
    const subject = `Reservation ${statusText} - Isdaan Floating Restaurant`;
    
    let statusMessage = '';
    let statusColor = '#0d6efd';
    
    if (reservation.status === 'confirmed') {
        statusMessage = 'We\'re pleased to inform you that your reservation has been confirmed.';
        statusColor = '#28a745'; // Green
    } else if (reservation.status === 'cancelled') {
        statusMessage = 'We regret to inform you that your reservation request could not be accommodated at this time.';
        statusColor = '#dc3545'; // Red
    }
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                <h1>${RESTAURANT_NAME}</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2>Reservation ${statusText}</h2>
                <p>Dear ${user.name},</p>
                <p>${statusMessage}</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0;">
                    <h3>Reservation Details:</h3>
                    <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                    <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
                    <p><strong>Time:</strong> ${reservation.time}</p>
                    <p><strong>Cottage Type:</strong> ${reservation.cottageType}</p>
                    <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
                    <p><strong>Status:</strong> ${statusText}</p>
                </div>
                
                ${reservation.status === 'confirmed' ? `
                <div style="text-align: center; margin: 30px 0;">
                    <p>We look forward to welcoming you to Isdaan Floating Restaurant!</p>
                </div>
                ` : ''}
                
                <p>If you have any questions or need assistance, please contact us at:</p>
                <p>Phone: (123) 456-7890<br>Email: info@isdaanrestaurant.com</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.</p>
                <p>123 Lake View, Taal, Batangas</p>
            </div>
        </div>
    `;
    
    const textContent = `
        Reservation ${statusText}
        
        Dear ${user.name},
        
        ${statusMessage}
        
        Reservation Details:
        - Reservation ID: ${reservation.id}
        - Date: ${formatDate(reservation.date)}
        - Time: ${reservation.time}
        - Cottage Type: ${reservation.cottageType}
        - Number of Guests: ${reservation.numberOfGuests}
        - Status: ${statusText}
        
        ${reservation.status === 'confirmed' ? 'We look forward to welcoming you to Isdaan Floating Restaurant!' : ''}
        
        If you have any questions or need assistance, please contact us at:
        Phone: (123) 456-7890
        Email: info@isdaanrestaurant.com
        
        © ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.
        123 Lake View, Taal, Batangas
    `;
    
    return await sendEmail(user.email, subject, htmlContent, textContent);
}

// Send a reminder email for upcoming reservations
async function sendReservationReminderEmail(reservation, user) {
    const subject = 'Reservation Reminder - Isdaan Floating Restaurant';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
                <h1>${RESTAURANT_NAME}</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                <h2>Reservation Reminder</h2>
                <p>Dear ${user.name},</p>
                <p>This is a friendly reminder about your upcoming reservation at Isdaan Floating Restaurant.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #0d6efd; padding: 15px; margin: 20px 0;">
                    <h3>Reservation Details:</h3>
                    <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                    <p><strong>Date:</strong> ${formatDate(reservation.date)}</p>
                    <p><strong>Time:</strong> ${reservation.time}</p>
                    <p><strong>Cottage Type:</strong> ${reservation.cottageType}</p>
                    <p><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p>We look forward to welcoming you to Isdaan Floating Restaurant!</p>
                </div>
                
                <p>If you need to cancel or modify your reservation, please contact us as soon as possible:</p>
                <p>Phone: (123) 456-7890<br>Email: info@isdaanrestaurant.com</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>&copy; ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.</p>
                <p>123 Lake View, Taal, Batangas</p>
            </div>
        </div>
    `;
    
    const textContent = `
        Reservation Reminder
        
        Dear ${user.name},
        
        This is a friendly reminder about your upcoming reservation at Isdaan Floating Restaurant.
        
        Reservation Details:
        - Reservation ID: ${reservation.id}
        - Date: ${formatDate(reservation.date)}
        - Time: ${reservation.time}
        - Cottage Type: ${reservation.cottageType}
        - Number of Guests: ${reservation.numberOfGuests}
        
        We look forward to welcoming you to Isdaan Floating Restaurant!
        
        If you need to cancel or modify your reservation, please contact us as soon as possible:
        Phone: (123) 456-7890
        Email: info@isdaanrestaurant.com
        
        © ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.
        123 Lake View, Taal, Batangas
    `;
    
    return await sendEmail(user.email, subject, htmlContent, textContent);
}

// Helper function to format date for emails
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export the functions
window.EmailService = {
    sendVerificationEmail,
    verifyEmail,
    isEmailVerified,
    sendReservationConfirmationEmail,
    sendReservationStatusEmail,
    sendReservationReminderEmail
};