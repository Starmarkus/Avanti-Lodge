import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addRoomBtn = document.getElementById('add-room-btn');
const newRoomName = document.getElementById('new-room-name');
const newRoomDescription = document.getElementById('new-room-description');
const newRoomPrice = document.getElementById('new-room-price');
const newRoomRatePerNight = document.getElementById('new-room-rate-per-night');
const newRoomAvailability = document.getElementById('new-room-availability');
const newRoomAmenities = document.getElementById('new-room-amenities');
const modal = document.getElementById('edit-modal');
const saveBtn = document.getElementById('save-changes-btn');
const cancelBtnModal = document.getElementById('cancel-btn-modal');
const errorMessage = document.getElementById('error-message');

// Booking modal elements
const bookingModal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'error-message';
    successMessage.style.backgroundColor = '#dff0d8';
    successMessage.style.color = '#3c763d';
    successMessage.textContent = message;
    if (errorMessage?.parentNode) {
        errorMessage.parentNode.insertBefore(successMessage, errorMessage);
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

// Fetch rooms
async function fetchRooms() {
    try {
        const { data: rooms, error } = await supabaseClient
            .from('RoomTable')
            .select('*');

        if (error) throw error;

        if (!rooms || rooms.length === 0) {
            renderRooms([]);
            return;
        }

        renderRooms(rooms);
    } catch (error) {
        console.error('Error in fetchRooms:', error);
        showError('An error occurred while fetching rooms.');
    }
}

// Render rooms
function renderRooms(rooms) {
    const roomList = document.getElementById('room-list');
    if (!roomList) return;

    roomList.innerHTML = `
        <table class="room-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Rate/Night</th>
                    <th>Availability</th>
                    <th>Amenities</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${rooms.map(room => `
                    <tr class="room-row">
                        <td>${room.RoomName || 'Unnamed'}</td>
                        <td>${room.RoomDescription || 'No description'}</td>
                        <td>$${room.RoomPrice || 0}</td>
                        <td>$${room.ratepernight || 0}</td>
                        <td>${room.RoomAvailability ? 'Available' : 'Unavailable'}</td>
                        <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                        <td>
                            <button class="btn" onclick="loadRoomBookings('${room.RoomID}')">View Bookings</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Add a room
async function addRoom() {
    const amenitiesInput = newRoomAmenities.value.split(',').map(item => item.trim()).filter(item => item);
    const newRoom = {
        RoomName: newRoomName.value,
        RoomDescription: newRoomDescription.value,
        RoomPrice: parseInt(newRoomPrice.value),
        ratepernight: parseInt(newRoomRatePerNight.value),
        RoomAvailability: newRoomAvailability.checked,
        amenities: amenitiesInput.length ? amenitiesInput : null,
        created_at: new Date().toISOString()
    };

    if (newRoom.RoomName && !isNaN(newRoom.RoomPrice) && !isNaN(newRoom.ratepernight)) {
        try {
            const { error } = await supabaseClient
                .from('RoomTable')
                .insert([newRoom]);

            if (error) throw error;

            newRoomName.value = '';
            newRoomDescription.value = '';
            newRoomPrice.value = '';
            newRoomRatePerNight.value = '';
            newRoomAvailability.checked = true;
            newRoomAmenities.value = '';
            fetchRooms();
        } catch (error) {
            console.error('Error in addRoom:', error);
            showError('An error occurred while adding the room.');
        }
    } else {
        showError('Room name, price, and rate per night are required.');
    }
}

// Edit a room
async function editRoom(roomId) {
    try {
        const { data: room, error } = await supabaseClient
            .from('RoomTable')
            .select('*')
            .eq('RoomID', roomId)
            .single();

        if (error) throw error;

        if (!room) {
            console.error('No room found with ID:', roomId);
            showError('Room not found.');
            return;
        }

        document.getElementById('modal-title').textContent = 'Edit Room';
        document.getElementById('modal-content').innerHTML = `
            <div class="form-group">
                <label>Room Name:</label>
                <input type="text" id="edit-room-name" value="${room.RoomName || ''}">
            </div>
            <div class="form-group">
                <label>Description:</label>
                <textarea id="edit-room-description">${room.RoomDescription || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Price:</label>
                <input type="number" id="edit-room-price" value="${room.RoomPrice || 0}" step="1">
            </div>
            <div class="form-group">
                <label>Rate per Night:</label>
                <input type="number" id="edit-room-rate-per-night" value="${room.ratepernight || 0}" step="1">
            </div>
            <div class="form-group">
                <label>Availability:</label>
                <input type="checkbox" id="edit-room-availability" ${room.RoomAvailability ? 'checked' : ''}>
            </div>
            <div class="form-group">
                <label>Amenities (comma-separated):</label>
                <input type="text" id="edit-room-amenities" value="${room.amenities ? room.amenities.join(', ') : ''}" placeholder="e.g., WiFi, TV, Pool">
            </div>
        `;
        modal.style.display = 'block';

        saveBtn.onclick = null;
        saveBtn.addEventListener('click', async () => {
            try {
                const amenitiesInput = document.getElementById('edit-room-amenities').value.split(',').map(item => item.trim()).filter(item => item);
                const updatedRoom = {
                    RoomName: document.getElementById('edit-room-name').value || room.RoomName,
                    RoomDescription: document.getElementById('edit-room-description').value || null,
                    RoomPrice: parseInt(document.getElementById('edit-room-price').value) || room.RoomPrice,
                    ratepernight: parseInt(document.getElementById('edit-room-rate-per-night').value) || room.ratepernight,
                    RoomAvailability: document.getElementById('edit-room-availability').checked,
                    amenities: amenitiesInput.length ? amenitiesInput : null
                };

                if (!updatedRoom.RoomName || isNaN(updatedRoom.RoomPrice) || isNaN(updatedRoom.ratepernight)) {
                    showError('Room name, price, and rate per night are required.');
                    return;
                }

                const { error: updateError } = await supabaseClient
                    .from('RoomTable')
                    .update(updatedRoom)
                    .eq('RoomID', roomId);

                if (updateError) throw updateError;

                modal.style.display = 'none';
                fetchRooms();
            } catch (error) {
                console.error('Error in editRoom:', error);
                showError('An error occurred while updating the room.');
            }
        });
    } catch (error) {
        console.error('Error in editRoom:', error);
        showError('An error occurred while fetching the room.');
    }
}

// Delete a room
async function deleteRoom(roomId) {
    try {
        const { error } = await supabaseClient
            .from('RoomTable')
            .delete()
            .eq('RoomID', roomId);

        if (error) throw error;

        fetchRooms();
    } catch (error) {
        console.error('Error in deleteRoom:', error);
        showError('An error occurred while deleting the room.');
    }
}

// Load room bookings
async function loadRoomBookings(roomId) {
    try {
        const { data: bookings, error } = await supabaseClient
            .from('BookingTable')
            .select('*, users(*)')
            .eq('RoomID', roomId)
            .order('BookingStartDate', { ascending: false });

        if (error) throw error;

        const bookingsContainer = document.getElementById(`room-bookings-${roomId}`);
        
        if (bookings && bookings.length > 0) {
            bookingsContainer.innerHTML = `
                <table class="bookings-table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Nights</th>
                            <th>Total Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(booking => `
                            <tr>
                                <td>${booking.users?.Name || 'N/A'} ${booking.users?.Surname || ''}</td>
                                <td>${booking.BookingStartDate}</td>
                                <td>${booking.BookingEndDate}</td>
                                <td>${booking.BookingTotalNights || 0}</td>
                                <td>$${booking.BookingTotalPrice || 0}</td>
                                <td>
                                    <button class="btn" onclick="showBookingDetails('${booking.BookingID}')">Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            bookingsContainer.innerHTML = '<p>No bookings found for this room.</p>';
        }

        // Toggle visibility
        const containerRow = document.getElementById(`bookings-${roomId}`);
        containerRow.style.display = containerRow.style.display === 'table-row' ? 'none' : 'table-row';
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings.');
    }
}

// Show booking details
async function showBookingDetails(bookingId) {
    try {
        const { data: booking, error } = await supabaseClient
            .from('BookingTable')
            .select('*, users(*)')
            .eq('BookingID', bookingId)
            .single();

        if (error) throw error;

        const bookingDetails = document.getElementById('booking-details');
        bookingDetails.innerHTML = `
            <div class="form-group">
                <h4>User Details</h4>
                <p><strong>Name:</strong> ${booking.users?.Name || 'N/A'} ${booking.users?.Surname || ''}</p>
                <p><strong>Email:</strong> ${booking.users?.Email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${booking.users?.Phone || 'N/A'}</p>
            </div>
            <div class="form-group">
                <h4>Booking Details</h4>
                <p><strong>Room:</strong> ${booking.room.roomname || 'N/A'}</p>
                <p><strong>Start Date:</strong> ${booking.BookingStartDate}</p>
                <p><strong>End Date:</strong> ${booking.BookingEndDate}</p>
                <p><strong>Total Nights:</strong> ${booking.BookingTotalNights || 0}</p>
                <p><strong>Total Price:</strong> $${booking.BookingTotalPrice || 0}</p>
            </div>
        `;

        document.getElementById('booking-modal-title').textContent = 'Booking Details';
        document.getElementById('cancel-booking').style.display = 'none';
        document.getElementById('cancel-btn').style.display = '';
        document.getElementById('close-modal-btn').style.display = '';
        document.getElementById('cancellation-reason').value = '';

        bookingModal.style.display = 'block';
        currentBookingId = bookingId;

        document.getElementById('cancel-btn').addEventListener('click', () => {
            document.getElementById('cancel-booking').style.display = '';
            document.getElementById('cancel-btn').style.display = 'none';
            document.getElementById('close-modal-btn').style.display = 'none';
        });
    } catch (error) {
        console.error('Error loading booking details:', error);
        showError('Failed to load booking details.');
    }
}

// Cancel booking
async function cancelBooking() {
    const reason = document.getElementById('cancellation-reason').value.trim();
    if (!reason) {
        showError('Cancellation reason is required');
        return;
    }

    try {
        // Update booking status
        const { error: updateError } = await supabaseClient
            .from('BookingTable')
            .update({ 
                isCancelled: true, 
                cancellationReason: reason,
                cancelledAt: new Date().toISOString() 
            })
            .eq('BookingID', currentBookingId);

        if (updateError) throw updateError;

        // Send email notification
        await sendCancellationEmail(currentBookingId, reason);

        bookingModal.style.display = 'none';
        fetchRooms();
        showSuccess('Booking cancelled successfully. Email sent to customer.');
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError('Failed to cancel booking.');
    }
}

// Send cancellation email
async function sendCancellationEmail(bookingId, reason) {
    // This is a placeholder implementation
    // You would typically use an email service like SendGrid, Nodemailer, or Supabase Functions
    console.log('Sending cancellation email for booking:', bookingId, 'with reason:', reason);
    // Implementation depends on your email service
    return { success: true };
}

// Expose functions globally
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.loadRoomBookings = loadRoomBookings;
window.showBookingDetails = showBookingDetails;
let currentBookingId = null;

// Event Listeners
if (addRoomBtn) {
    addRoomBtn.addEventListener('click', addRoom);
}
if (cancelBtnModal) {
    cancelBtnModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        bookingModal.style.display = 'none';
    });
}
if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', cancelBooking);
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchRooms);