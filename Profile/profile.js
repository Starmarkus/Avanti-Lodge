// Supabase config
const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';             
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elements
const form = document.getElementById('profileForm');
const inputs = {
  firstName: document.getElementById('firstName'),
  lastName: document.getElementById('lastName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
};
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');

// Load profile data
async function loadProfile() {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.user) {
    alert("User not logged in");
    return;
  }

  const { data, error } = await supabase
    .from('UserTable')
    .select('*')
    .eq('UserID', user.user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }

  inputs.firstName.value = data.UserFirstname || '';
  inputs.lastName.value = data.UserLastname || '';
  inputs.email.value = data.UserEmail || '';
  inputs.phone.value = data.UserPhonenumber || '';
}

// Save profile data
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    alert("User not logged in");
    return;
  }

  const updates = {
    UserID: user.user.id,
    UserFirstname: inputs.firstName.value.trim(),
    UserLastname: inputs.lastName.value.trim(),
    UserEmail: inputs.email.value.trim(),
    UserPhonenumber: inputs.phone.value.trim()
  };

  const { error } = await supabase
    .from('UserTable')
    .update(updates)
    .eq('UserID', user.user.id);

  if (error) {
    console.error('Error updating profile:', error);
    alert("Failed to save changes.");
  } else {
    document.getElementById('formMessage').textContent = 'Profile updated successfully!';
  }

  Object.values(inputs).forEach(input => input.disabled = true);
  editBtn.style.display = 'inline';
  saveBtn.style.display = 'none';
});

// Edit button logic
editBtn.addEventListener('click', () => {
  Object.values(inputs).forEach(input => input.disabled = false);
  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline';
});

// Tab switching
function showTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  event.target.classList.add('active');
}

// Load profile on page load
loadProfile();
