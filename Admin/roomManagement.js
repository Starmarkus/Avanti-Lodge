import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const errorMessage = document.getElementById('error-message');
const modal = document.getElementById('edit-modal');
const saveBtn = document.getElementById('save-changes-btn');
const cancelBtnModal = document.getElementById('cancel-btn-modal');

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
                        <td>R${room.ratepernight || 0}</td>
                        <td>${room.RoomAvailability ? 'Available' : 'Unavailable'}</td>
                        <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                        <td>
                            <button class="btn" onclick="editRoom('${room.RoomID}')">Edit Room</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
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

        // Calculate appropriate rows for description based on content
        const descRows = Math.max(3, Math.ceil((room.RoomDescription || '').split('\n').length));

        document.getElementById('modal-title').textContent = 'Edit Room';
        document.getElementById('modal-content').innerHTML = `
            <div class="form-group">
                <label>Room Name:</label>
                <input type="text" id="edit-room-name" value="${room.RoomName || ''}">
            </div>
            <div class="form-group">
                <label>Description:</label>
                <textarea id="edit-room-description" rows="${descRows}">${room.RoomDescription || ''}</textarea>
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

        // Add event listener to cancel button
        cancelBtnModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        saveBtn.onclick = null;
        saveBtn.addEventListener('click', async () => {
            try {
                const name = document.getElementById('edit-room-name').value || room.RoomName;
                const description = document.getElementById('edit-room-description').value || room.RoomDescription;
                const ratepernight = document.getElementById('edit-room-rate-per-night').value ? parseInt(document.getElementById('edit-room-rate-per-night').value) : room.ratepernight;
                const availability = document.getElementById('edit-room-availability').checked;
                const amenitiesInput = document.getElementById('edit-room-amenities').value.split(',').map(item => item.trim()).filter(item => item);
                const amenities = amenitiesInput.length ? amenitiesInput : (room.amenities ? room.amenities : null);

                const updatedRoom = {
                    RoomName: name,
                    RoomDescription: description,
                    ratepernight: ratepernight,
                    RoomAvailability: availability,
                    amenities: amenities
                };

                const { error: updateError } = await supabaseClient
                    .from('RoomTable')
                    .update(updatedRoom)
                    .eq('RoomID', roomId);

                if (updateError) throw updateError;

                modal.style.display = 'none';
                fetchRooms();
                showSuccess('Room updated successfully.');
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

// Expose functions globally
window.editRoom = editRoom;

// Initialize
document.addEventListener('DOMContentLoaded', fetchRooms);