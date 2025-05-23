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
const cancelBtn = document.getElementById('cancel-btn');
const errorMessage = document.getElementById('error-message');

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

// Fetch rooms
async function fetchRooms() {
    try {
        const { data: rooms, error } = await supabaseClient
            .from('RoomTable')
            .select('*');

        if (error) {
            console.error('Error fetching rooms:', error);
            showError('Failed to fetch rooms.');
            throw error;
        }

        if (!rooms || rooms.length === 0) {
            console.log('No rooms found.');
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
    if (!roomList) {
        console.error('Element with ID "room-list" not found.');
        return;
    }

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
                    <tr class="${room.RoomAvailability ? 'available' : 'taken'}">
                        <td>${room.RoomName || 'Unnamed'}</td>
                        <td>${room.RoomDescription || 'No description'}</td>
                        <td>$${room.RoomPrice || 0}</td>
                        <td>$${room.ratepernight || 0}</td>
                        <td>${room.RoomAvailability ? 'Available' : 'Unavailable'}</td>
                        <td>${room.amenities ? room.amenities.join(', ') : 'None'}</td>
                        <td>
                            <button class="btn" onclick="editRoom('${room.RoomID}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteRoom('${room.RoomID}')">Delete</button>
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

            if (error) {
                console.error('Error adding room:', error);
                showError('Failed to add room.');
                throw error;
            }

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

        if (error) {
            console.error('Error fetching room:', error);
            showError('Failed to fetch room details.');
            throw error;
        }

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

                if (updateError) {
                    console.error('Error updating room:', updateError);
                    showError('Failed to update room.');
                    throw updateError;
                }

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

        if (error) {
            console.error('Error deleting room:', error);
            showError('Failed to delete room.');
            throw error;
        }

        fetchRooms();
    } catch (error) {
        console.error('Error in deleteRoom:', error);
        showError('An error occurred while deleting the room.');
    }
}

// Expose editRoom and deleteRoom globally for table button onclick
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;

// Event Listeners
if (addRoomBtn) {
    addRoomBtn.addEventListener('click', addRoom);
}
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Initialize
fetchRooms();