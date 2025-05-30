// roomBooking.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const bookingsRoomList = document.getElementById('bookings-room-list');
const bookingModal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const cancellationReason = document.getElementById('cancellation-reason');
const cancellationEmail = document.getElementById('cancellation-email');
const emailContent = document.getElementById('email-content');
const emailModal = document.getElementById('email-modal');
const emailBody = document.getElementById('email-body');
const sendEmailBtn = document.getElementById('send-email-btn');
const closeEmailModalBtn = document.getElementById('close-email-modal-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Load rooms with bookings
async function loadRooms() {
    try {
        const { data: rooms, error } = await supabaseClient
            .from('RoomTable')
            .select('*');

        if (error) throw error;

        if (!rooms || rooms.length === 0) {
            bookingsRoomList.innerHTML = '<p>No rooms found.</p>';
            return;
        }

        renderRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Render rooms with bookings
function renderRooms(rooms) {
    bookingsRoomList.innerHTML = '';
    
    rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.className = 'room-booking-item';
        roomElement.dataset.roomId = room.RoomID;

        roomElement.innerHTML = `
            <div class="room-header">
                <h3>${room.RoomName}</h3>
                <span class="toggle-arrow">▼</span>
            </div>
            <div class="booking-details">
                <ul class="booking-list" id="booking-list-${room.RoomID}"></ul>
            </div>
        `;

        // Load bookings for the room
        loadRoomBookings(room.RoomID, roomElement);

        // Add toggle functionality
        const header = roomElement.querySelector('.room-header');
        const toggleArrow = roomElement.querySelector('.toggle-arrow');
        const details = roomElement.querySelector('.booking-details');

        header.addEventListener('click', () => {
            details.classList.toggle('open');
            toggleArrow.classList.toggle('open');
        });

        bookingsRoomList.appendChild(roomElement);
    });
}

// Load bookings for a specific room
async function loadRoomBookings(roomId, roomElement) {
    const bookingList = roomElement.querySelector(`.booking-list`);
    
    try {
        const { data: bookings, error } = await supabaseClient
            .from('BookingTable')
            .select(`*, UserTable(*)`)
            .eq('RoomID', roomId)
            .order('BookingStartDate', { ascending: false });

        if (error) throw error;

        if (bookings && bookings.length > 0) {
            bookingList.innerHTML = bookings.map(booking => `
                <li class="booking-item">
                    <div>
                        <strong>${booking.UserTable ? booking.UserTable.UserFirstname || 'N/A' : 'N/A'} ${booking.UserTable ? booking.UserTable.UserLastname || '' : ''}</strong>
                        <span class="booking-date">${booking.BookingStartDate} - ${booking.BookingEndDate}</span>
                    </div>
                    <div>
                        <span class="booking-price">R${booking.BookingTotalPrice || 0}</span>
                        <button class="btn btn-sm" onclick="showBookingDetails('${booking.BookingID}')">Details</button>
                    </div>
                </li>
            `).join('');
        } else {
            bookingList.innerHTML = '<li class="booking-item">No bookings for this room</li>';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingList.innerHTML = '<li class="booking-item">Failed to load bookings</li>';
    }
}

// Show booking details
window.showBookingDetails = function(bookingId) {
    // Fetch booking details
    supabaseClient.from('BookingTable')
        .select(`*, UserTable(*), RoomTable(*)`)
        .eq('BookingID', bookingId)
        .single()
        .then(async ({ data: booking, error }) => {
            if (error) {
                console.error('Error fetching booking details:', error);
                return;
            }

            if (!booking) {
                console.error('Booking not found');
                return;
            }

            // Populate booking details modal
            const bookingDetails = document.getElementById('booking-details');
            bookingDetails.innerHTML = `
                <div class="form-group">
                    <h4>User Details</h4>
                    <p><strong>Name:</strong> ${booking.UserTable.UserFirstname} ${booking.UserTable.UserLastname}</p>
                    <p><strong>Email:</strong> ${booking.UserTable.UserEmail}</p>
                    <p><strong>Phone:</strong> ${booking.UserTable.UserPhonenumber || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <h4>Booking Details</h4>
                    <p><strong>Room:</strong> ${booking.RoomTable.RoomName}</p>
                    <p><strong>Start Date:</strong> ${booking.BookingStartDate}</p>
                    <p><strong>End Date:</strong> ${booking.BookingEndDate}</p>
                    <p><strong>Total Nights:</strong> ${booking.BookingTotalNights}</p>
                    <p><strong>Total Price:</strong> R${booking.BookingTotalPrice}</p>
                </div>
                <div class="form-group">
                    <button class="btn" onclick="emailUser('${booking.UserTable.UserEmail}', '${booking.UserTable.UserFirstname}')">Email User</button>
                    <button class="btn btn-danger" id="cancel-booking-btn">Cancel Booking</button>
                </div>
            `;

            // Show modal
            bookingModal.style.display = 'block';

            // Close modal event
            closeModalBtn.onclick = function() {
                bookingModal.style.display = 'none';
            };

            // Close modal via X button
            modalCloseBtn.onclick = function() {
                bookingModal.style.display = 'none';
            };

            // Cancel booking button
            document.getElementById('cancel-booking-btn').onclick = function() {
                document.getElementById('booking-modal-title').textContent = 'Cancel Booking';
                document.getElementById('cancel-booking').style.display = 'block';
                document.getElementById('close-modal-btn').style.display = 'none';
                document.getElementById('cancel-btn').style.display = '';

                // Cancellation reason selection
                cancellationReason.onchange = function() {
                    if (this.value) {
                        cancellationEmail.style.display = 'block';
                        const reason = this.value;
                        let emailBody = '';

                        switch(reason) {
                            case 'maintenance':
                                emailBody = `Dear ${booking.UserTable.UserFirstname},\n\nWe regret to inform you that your booking has been canceled due to maintenance issues. We apologize for the inconvenience. We will refund you the money.\n\nBest regards,\nHotel Management`;
                                break;
                            case 'emergency':
                                emailBody = `Dear ${booking.UserTable.UserFirstname},\n\nWe regret to inform you that your booking has been canceled due to an emergency. We apologize for the inconvenience. We will refund you the money.\n\nBest regards,\nHotel Management`;
                                break;
                            case 'overbooking':
                                emailBody = `Dear ${booking.UserTable.UserFirstname},\n\nWe regret to inform you that your booking has been canceled due to overbooking. We apologize for the inconvenience and will ensure this does not happen again. We will refund you the money.\n\nBest regards,\nHotel Management`;
                                break;
                            case 'other':
                                emailBody = `Dear ${booking.UserTable.UserFirstname},\n\nWe regret to inform you that your booking has been canceled. We apologize for the inconvenience. We will refund you the money.\n\nBest regards,\nHotel Management`;
                                break;
                        }

                        emailContent.innerHTML = `<textarea id="email-body-content" class="form-control" rows="5">${emailBody}</textarea>`;
                    } else {
                        cancellationEmail.style.display = 'none';
                    }
                };

                confirmCancelBtn.onclick = function() {
                    const reason = cancellationReason.value;
                    const emailBody = document.getElementById('email-body-content').value;

                    if (!reason) {
                        alert('Please select a cancellation reason');
                        return;
                    }

                    // Update booking status
                    supabaseClient.from('BookingTable')
                        .update({ iscancelled: true, cancellationreason: reason, cancelledat: new Date().toISOString() })
                        .eq('BookingID', bookingId)
                        .then(({ error }) => {
                            if (error) {
                                console.error('Error canceling booking:', error);
                                alert('Failed to cancel booking');
                                return;
                            }

                            // Send email
                            window.location.href = `mailto:${booking.UserTable.UserEmail}?subject=Booking Cancellation&body=${encodeURIComponent(emailBody)}`;

                            // Close modal and reload bookings
                            bookingModal.style.display = 'none';
                            loadRooms();
                        });
                };
            };
        });
}

// Email user
window.emailUser = function(email, name) {
    const subject = 'Booking Confirmation';
    const body = `Dear ${name},\n\nYour booking has been confirmed. We look forward to your stay.\n\nBest regards,\nHotel Management`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Close booking modal
    bookingModal.style.display = 'none';
};

// Initialize
document.addEventListener('DOMContentLoaded', loadRooms);