// Sample data
let promotions = ['Summer Special', 'Weekend Discount', 'New Year Deal'];
let rooms = [
    {id: 1, name: 'Standard Room 1', status: 'available'},
    {id: 2, name: 'Standard Room 2', status: 'taken'},
    {id: 3, name: 'Premium Room 1', status: 'available'}
];
let prices = {basic: 100, premium: 200};
let users = [
    {id: 1, name: 'John Doe', role: 'admin'},
    {id: 2, name: 'Jane Smith', role: 'superadmin'}
];

// Role management
const currentUser = {id: 1, name: 'John Doe', role: 'admin'}; // Change to 'superadmin' to test

// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const userManagementBtn = document.getElementById('user-management');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const modal = document.getElementById('edit-modal');
const saveBtn = document.getElementById('save-changes-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Show/hide user management based on role
userManagementBtn.style.display = currentUser.role === 'superadmin' ? 'block' : 'none';

// Initialize UI
function initUI() {
    renderPromotions();
    renderRooms();
    renderUsers();
}

// Menu Navigation
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        contentSections.forEach(c => c.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.dataset.target).classList.add('active');
    });
});


// Promotion Management
function renderPromotions() {
    const promoList = document.getElementById('promotion-list');
    promoList.innerHTML = promotions.map(promo => `
        <div class="promotion-item">
            ${promo}
            <button onclick="editPromotion('${promo}')">Edit</button>
            <button class="btn btn-danger" onclick="deletePromotion('${promo}')">Delete</button>
        </div>
    `).join('');
}

// Room Management
function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = rooms.map(room => `
        <tr>
            <td>${room.name}</td>
            <td class="${room.status}">${room.status}</td>
            <td>
                <button onclick="toggleRoomStatus(${room.id})">
                    ${room.status === 'available' ? 'Mark as Taken' : 'Mark as Available'}
                </button>
            </td>
        </tr>
    `).join('');
}

// User Management
function renderUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td>
                <button onclick="editUser(${user.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

// Functions
function editPromotion(promotion) {
    document.getElementById('modal-title').textContent = 'Edit Promotion';
    document.getElementById('modal-content').innerHTML = `
        <input type="text" id="edit-promo-input" value="${promotion}">
    `;
    modal.style.display = 'block';
    saveBtn.onclick = () => {
        const index = promotions.indexOf(promotion);
        if (index > -1) {
            promotions[index] = document.getElementById('edit-promo-input').value;
            renderPromotions();
        }
        modal.style.display = 'none';
    };
}

function deletePromotion(promotion) {
    const index = promotions.indexOf(promotion);
    if (index > -1) {
        promotions.splice(index, 1);
        renderPromotions();
    }
}

function toggleRoomStatus(id) {
    const room = rooms.find(room => room.id === id);
    room.status = room.status === 'available' ? 'taken' : 'available';
    renderRooms();
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    document.getElementById('modal-title').textContent = 'Edit User';
    document.getElementById('modal-content').innerHTML = `
        <input type="text" id="edit-user-name" value="${user.name}">
        <select id="edit-user-role">
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="superadmin" ${user.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
        </select>
    `;
    modal.style.display = 'block';
    saveBtn.onclick = () => {
        user.name = document.getElementById('edit-user-name').value;
        user.role = document.getElementById('edit-user-role').value;
        renderUsers();
        modal.style.display = 'none';
    };
}

// Event Listeners
document.getElementById('add-promo-btn').addEventListener('click', () => {
    const newPromo = document.getElementById('new-promotion').value;
    if (newPromo) {
        promotions.push(newPromo);
        document.getElementById('new-promotion').value = '';
        renderPromotions();
    }
});

document.getElementById('update-pricing-btn').addEventListener('click', () => {
    prices.basic = parseInt(document.getElementById('basic-price').value) || prices.basic;
    prices.premium = parseInt(document.getElementById('premium-price').value) || prices.premium;
    alert('Prices updated!');
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    modal.style.display = 'none';
});

logoutBtn.addEventListener('click', () => {
    // In real app: clear authentication token and redirect
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Initialize application
initUI();