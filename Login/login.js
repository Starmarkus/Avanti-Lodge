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

      // Validate input fields
      if (!email || !password) {
        message.textContent = 'Please fill in both email and password.';
        return;
      }

      try {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error("Login error:", error);
            message.textContent = `Login failed: ${error.message}`;
            return;
        }

        console.log("User logged in successfully:", data);
        console.log("User token:", data.session.access_token);

        // Get user ID from Supabase
        const userId = data.user.id;

        // Check user role from UserTable
        const { data: userData, error: userError } = await supabase
            .from("UserTable")
            .select("Role")
            .eq("UserEmail", email)
            .single();

        if (userError) {
            console.error("User role check error:", userError);
            message.textContent = "Error checking user role.";
            return;
        }

        if (userData.Role === 'Admin' || userData.Role === 'admin') {
            // Redirect admin to admin dashboard
            console.log("Admin detected, redirecting...");
            window.location.href = "/Admin/adminDashboard.html";
        } else {
            // Redirect regular user to user dashboard
            console.log("User detected, redirecting...");
            window.location.href = "/index.html";
        }

      } catch (error) {
        message.textContent = "Login failed: " + error.message;
        console.error("Login error details:", error);
      }
    });
});