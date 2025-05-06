document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://ukmvpjomlojbimwpcbbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  
    const form = document.getElementById('login-form');
    const message = document.getElementById('message');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
  
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
  
      if (error) {
        message.textContent = `Login failed: ${error.message}`;
      } else {
        message.textContent = 'Login successful!';
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 1500);
      }
    });
  });
  