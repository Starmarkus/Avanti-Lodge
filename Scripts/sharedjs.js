// Initialize Supabase client
const supabaseClient = window.supabase.createClient(
  'https://ukmvpjomlojbimwpcbbl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM'
);

document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      } else {
        alert('Logged out successfully.');
        window.location.href = '/Login/login.html'; // Redirect after logout
      }
    });
  }
});

  document.addEventListener("DOMContentLoaded", function() {
    const burgerButton = document.querySelector('.burger-button');
    const burgerDropdown = document.querySelector('.burger-dropdown');

    // Toggle dropdown on button click
    burgerButton.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent click from bubbling up
      const isVisible = burgerDropdown.style.display === 'flex';
      burgerDropdown.style.display = isVisible ? 'none' : 'flex';
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', function(event) {
      if (!burgerDropdown.contains(event.target) && !burgerButton.contains(event.target)) {
        burgerDropdown.style.display = 'none';
      }
    });
  });
