import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addPromoBtn = document.getElementById('add-promo-btn');
const newPromotion = document.getElementById('new-promotion');
const newPromotionDescription = document.getElementById('new-promotion-description');
const newPromotionPrice = document.getElementById('new-promotion-price');
const newPromotionStartDate = document.getElementById('new-promotion-start-date');
const newPromotionEndDate = document.getElementById('new-promotion-end-date');
const newPromotionActive = document.getElementById('new-promotion-active');
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
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const errorMessage = document.getElementById('error-message');

// Function to test Supabase connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('PromotionTable')
            .select('PromoID');

        if (error) {
            console.error('Error testing Supabase connection:', error);
            showError('Failed to connect to the database. Please try again.');
            return false;
        }

        console.log('Supabase connection successful:', data);
        return true;
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
        showError('An unexpected error occurred. Please try again.');
        return false;
    }
}

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

// Sidebar navigation
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        contentSections.forEach(section => section.classList.remove('active'));
        const target = document.getElementById(item.dataset.target);
        if (target) {
            target.classList.add('active');
        }

        if (item.dataset.target === 'promotions') {
            fetchPromotions();
        } else if (item.dataset.target === 'rooms') {
            fetchRooms();
        }
    });
});

// --- Promotion Management ---

// Fetch promotions
async function fetchPromotions() {
    try {
        const { data: promotions, error } = await supabaseClient
            .from('PromotionTable')
            .select('*');

        if (error) {
            console.error('Error fetching promotions:', error);
            showError('Failed to fetch promotions.');
            throw error;
        }

        if (!promotions || promotions.length === 0) {
            console.log('No promotions found.');
            renderPromotions([]);
            return;
        }

        renderPromotions(promotions);
    } catch (error) {
        console.error('Error in fetchPromotions:', error);
        showError('An error occurred while fetching promotions.');
    }
}

// Render promotions
function renderPromotions(promotions) {
    const promoList = document.getElementById('promotion-list');
    if (!promoList) {
        console.error('Element with ID "promotion-list" not found.');
        return;
    }

    promoList.innerHTML = '';

    promotions.forEach(promo => {
        const promoItem = document.createElement('div');
        promoItem.className = 'promotion-item';
        promoItem.innerHTML = `
            <h4>${promo.PromoName || 'Unnamed'}</h4>
            <p>${promo.PromoDescription || 'No description'}</p>
            <p>Price: $${(promo.PromoPrice || 0).toFixed(0)}</p>
            <p>Start Date: ${promo.PromoStartDate || 'N/A'}</p>
            <p>End Date: ${promo.PromoEndDate || 'N/A'}</p>
            <p>Status: ${promo.PromoIsActive ? 'Active' : 'Inactive'}</p>
        `;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editPromotion(promo.PromoID));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger';
        deleteButton.addEventListener('click', () => deletePromotion(promo.PromoID));

        promoItem.appendChild(editButton);
        promoItem.appendChild(deleteButton);
        promoList.appendChild(promoItem);
    });
}

// Add a promotion
async function addPromotion() {
    const newPromo = {
        PromoName: newPromotion.value,
        PromoDescription: newPromotionDescription.value,
        PromoPrice: parseInt(newPromotionPrice.value),
        PromoStartDate: newPromotionStartDate.value || null,
        PromoEndDate: newPromotionEndDate.value || null,
        PromoIsActive: newPromotionActive.checked,
        created_at: new Date().toISOString()
    };

    if (newPromo.PromoName && !isNaN(newPromo.PromoPrice)) {
        try {
            const { error } = await supabaseClient
                .from('PromotionTable')
                .insert([newPromo]);

            if (error) {
                console.error('Error adding promotion:', error);
                showError('Failed to add promotion.');
                throw error;
            }

            newPromotion.value = '';
            newPromotionDescription.value = '';
            newPromotionPrice.value = '';
            newPromotionStartDate.value = '';
            newPromotionEndDate.value = '';
            newPromotionActive.checked = true;
            fetchPromotions();
        } catch (error) {
            console.error('Error in addPromotion:', error);
            showError('An error occurred while adding the promotion.');
        }
    } else {
        showError('Promotion name and price are required.');
    }
}

// Edit a promotion
async function editPromotion(promoId) {
    try {
        const { data: promo, error } = await supabaseClient
            .from('PromotionTable')
            .select('*')
            .eq('PromoID', promoId)
            .single();

        if (error) {
            console.error('Error fetching promotion:', error);
            showError('Failed to fetch promotion details.');
            throw error;
        }

        if (!promo) {
            console.error('No promotion found with ID:', promoId);
            showError('Promotion not found.');
            return;
        }

        document.getElementById('modal-title').textContent = 'Edit Promotion';
        document.getElementById('modal-content').innerHTML = `
            <input type="text" id="edit-promo-name" value="${promo.PromoName || ''}">
            <textarea id="edit-promo-description">${promo.PromoDescription || ''}</textarea>
            <input type="number" id="edit-promo-price" value="${promo.PromoPrice || 0}" step="1">
            <input type="date" id="edit-promo-start-date" value="${promo.PromoStartDate || ''}">
            <input type="date" id="edit-promo-end-date" value="${promo.PromoEndDate || ''}">
            <input type="checkbox" id="edit-promo-active" ${promo.PromoIsActive ? 'checked' : ''}>
        `;
        modal.style.display = 'block';

        saveBtn.onclick = null;
        saveBtn.addEventListener('click', async () => {
            try {
                const updatedPromo = {
                    PromoName: document.getElementById('edit-promo-name').value || promo.PromoName,
                    PromoDescription: document.getElementById('edit-promo-description').value || null,
                    PromoPrice: parseInt(document.getElementById('edit-promo-price').value) || promo.PromoPrice,
                    PromoStartDate: document.getElementById('edit-promo-start-date').value || null,
                    PromoEndDate: document.getElementById('edit-promo-end-date').value || null,
                    PromoIsActive: document.getElementById('edit-promo-active').checked
                };

                if (!updatedPromo.PromoName || isNaN(updatedPromo.PromoPrice)) {
                    showError('Promotion name and price are required.');
                    return;
                }

                const { error: updateError } = await supabaseClient
                    .from('PromotionTable')
                    .update(updatedPromo)
                    .eq('PromoID', promoId);

                if (updateError) {
                    console.error('Error updating promotion:', updateError);
                    showError('Failed to update promotion.');
                    throw updateError;
                }

                modal.style.display = 'none';
                fetchPromotions();
            } catch (error) {
                console.error('Error in editPromotion:', error);
                showError('An error occurred while updating the promotion.');
            }
        });
    } catch (error) {
        console.error('Error in editPromotion:', error);
        showError('An error occurred while fetching the promotion.');
    }
}

// Delete a promotion
async function deletePromotion(promoId) {
    try {
        const { error } = await supabaseClient
            .from('PromotionTable')
            .delete()
            .eq('PromoID', promoId);

        if (error) {
            console.error('Error deleting promotion:', error);
            showError('Failed to delete promotion.');
            throw error;
        }

        fetchPromotions();
    } catch (error) {
        console.error('Error in deletePromotion:', error);
        showError('An error occurred while deleting the promotion.');
    }
}

// --- Room Management ---

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

    roomList.innerHTML = '';

    rooms.forEach(room => {
        const roomItem = document.createElement('div');
        roomItem.className = 'room-item';
        roomItem.innerHTML = `
            <h4>${room.RoomName || 'Unnamed'}</h4>
            <p>${room.RoomDescription || 'No description'}</p>
            <p>Price: $${(room.RoomPrice || 0).toFixed(0)}</p>
            <p>Rate per Night: $${(room.ratepernight || 0).toFixed(0)}</p>
            <p>Availability: ${room.RoomAvailability ? 'Available' : 'Unavailable'}</p>
            <p>Amenities: ${room.amenities ? room.amenities.join(', ') : 'None'}</p>
        `;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editRoom(room.RoomID));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger';
        deleteButton.addEventListener('click', () => deleteRoom(room.RoomID));

        roomItem.appendChild(editButton);
        roomItem.appendChild(deleteButton);
        roomList.appendChild(roomItem);
    });
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
            <input type="text" id="edit-room-name" value="${room.RoomName || ''}">
            <textarea id="edit-room-description">${room.RoomDescription || ''}</textarea>
            <input type="number" id="edit-room-price" value="${room.RoomPrice || 0}" step="1">
            <input type="number" id="edit-room-rate-per-night" value="${room.ratepernight || 0}" step="1">
            <input type="checkbox" id="edit-room-availability" ${room.RoomAvailability ? 'checked' : ''}>
            <input type="text" id="edit-room-amenities" value="${room.amenities ? room.amenities.join(', ') : ''}" placeholder="e.g., WiFi, TV, Pool">
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

// Event Listeners
addPromoBtn.addEventListener('click', addPromotion);
if (addRoomBtn) {
    addRoomBtn.addEventListener('click', addRoom);
}
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Initialize application
testSupabaseConnection().then(connectionSuccess => {
    if (connectionSuccess) {
        fetchPromotions();
    } else {
        console.error('Failed to connect to Supabase.');
    }
});