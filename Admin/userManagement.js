import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Supabase credentials
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const addUserBtn = document.getElementById('add-user-btn');
const newUserName = document.getElementById('new-user-name');
const newUserEmail = document.getElementById('new-user-email');
const newUserRole = document.getElementById('new-user-role');
const newUserActive = document.getElementById('new-user-active');
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

// Fetch users
async function fetchUsers() {
    try {
        const { data: users, error } = await supabaseClient
            .from('UserTable')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            showError('Failed to fetch users.');
            throw error;
        }

        if (!users || users.length === 0) {
            console.log('No users found.');
            renderUsers([]);
            return;
        }

        renderUsers(users);
    } catch (error) {
        console.error('Error in fetchUsers:', error);
        showError('An error occurred while fetching users.');
    }
}

// Render users
function renderUsers(users) {
    const userList = document.getElementById('user-list');
    if (!userList) {
        console.error('Element with ID "user-list" not found.');
        return;
    }

    userList.innerHTML = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr class="${user.IsActive ? 'active-user' : 'inactive-user'}">
                        <td>${user.UserName || 'Unnamed'}</td>
                        <td>${user.Email || 'N/A'}</td>
                        <td>${user.Role || 'N/A'}</td>
                        <td>${user.IsActive ? 'Active' : 'Inactive'}</td>
                        <td>
                            <button class="btn" onclick="editUser('${user.UserID}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteUser('${user.UserID}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Add a user
async function addUser() {
    const newUser = {
        UserName: newUserName.value,
        Email: newUserEmail.value,
        Role: newUserRole.value,
        IsActive: newUserActive.checked,
        created_at: new Date().toISOString()
    };

    if (newUser.UserName && newUser.Email && newUser.Role) {
        try {
            const { error } = await supabaseClient
                .from('UserTable')
                .insert([newUser]);

            if (error) {
                console.error('Error adding user:', error);
                showError('Failed to add user.');
                throw error;
            }

            newUserName.value = '';
            newUserEmail.value = '';
            newUserRole.value = '';
            newUserActive.checked = true;
            fetchUsers();
        } catch (error) {
            console.error('Error in addUser:', error);
            showError('An error occurred while adding the user.');
        }
    } else {
        showError('User name, email, and role are required.');
    }
}

// Edit a user
async function editUser(userId) {
    try {
        const { data: user, error } = await supabaseClient
            .from('UserTable')
            .select('*')
            .eq('UserID', userId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            showError('Failed to fetch user details.');
            throw error;
        }

        if (!user) {
            console.error('No user found with ID:', userId);
            showError('User not found.');
            return;
        }

        document.getElementById('modal-title').textContent = 'Edit User';
        document.getElementById('modal-content').innerHTML = `
            <div class="form-group">
                <label>User Name:</label>
                <input type="text" id="edit-user-name" value="${user.UserName || ''}">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="edit-user-email" value="${user.Email || ''}">
            </div>
            <div class="form-group">
                <label>Role:</label>
                <select id="edit-user-role">
                    <option value="Admin" ${user.Role === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="User" ${user.Role === 'User' ? 'selected' : ''}>User</option>
                </select>
            </div>
            <div class="form-group">
                <label>Active:</label>
                <input type="checkbox" id="edit-user-active" ${user.IsActive ? 'checked' : ''}>
            </div>
        `;
        modal.style.display = 'block';

        saveBtn.onclick = null;
        saveBtn.addEventListener('click', async () => {
            try {
                const updatedUser = {
                    UserName: document.getElementById('edit-user-name').value || user.UserName,
                    Email: document.getElementById('edit-user-email').value || user.Email,
                    Role: document.getElementById('edit-user-role').value || user.Role,
                    IsActive: document.getElementById('edit-user-active').checked
                };

                if (!updatedUser.UserName || !updatedUser.Email || !updatedUser.Role) {
                    showError('User name, email, and role are required.');
                    return;
                }

                const { error: updateError } = await supabaseClient
                    .from('UserTable')
                    .update(updatedUser)
                    .eq('UserID', userId);

                if (updateError) {
                    console.error('Error updating user:', updateError);
                    showError('Failed to update user.');
                    throw updateError;
                }

                modal.style.display = 'none';
                fetchUsers();
            } catch (error) {
                console.error('Error in editUser:', error);
                showError('An error occurred while updating the user.');
            }
        });
    } catch (error) {
        console.error('Error in editUser:', error);
        showError('An error occurred while fetching the user.');
    }
}

// Delete a user
async function deleteUser(userId) {
    try {
        const { error } = await supabaseClient
            .from('UserTable')
            .delete()
            .eq('UserID', userId);

        if (error) {
            console.error('Error deleting user:', error);
            showError('Failed to delete user.');
            throw error;
        }

        fetchUsers();
    } catch (error) {
        console.error('Error in deleteUser:', error);
        showError('An error occurred while deleting the user.');
    }
}

// Expose editUser and deleteUser globally for table button onclick
window.editUser = editUser;
window.deleteUser = deleteUser;

// Event Listeners
if (addUserBtn) {
    addUserBtn.addEventListener('click', addUser);
}
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Initialize
fetchUsers();