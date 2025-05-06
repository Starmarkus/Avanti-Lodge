document.addEventListener('DOMContentLoaded', () => {

    const supabase = window.supabase.createClient(
        'https://ukmvpjomlojbimwpcbbl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbXZwam9tbG9qYmltd3BjYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDc3NDEsImV4cCI6MjA2MjAyMzc0MX0.fETub5iGTDmfG1kz1tZMv9YQMdE4amLuKojTrdykhcM'
    );
    console.log(supabase);

    const form = document.getElementById('signup-form');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if the passwords match
    if (password !== confirmPassword) {
        message.textContent = 'Passwords do not match.';
        return;
    }

    // Sign up with Supabase auth
    const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
        data: {
            first_name: firstName,
            last_name: lastName
        }
        }
    });

    // Handle signup error
    if (signupError) {
        message.textContent = `Signup error: ${signupError.message}`;
        return;
    }

    // Insert user data into your custom table (optional)
    const { error: dbError } = await supabase
        .from('UserTable')
        .insert([{
        UserEmail: email,
        UserFirstname: firstName,
        UserLastname: lastName
        }]);

    // Handle database error
    if (dbError) {
        message.textContent = `Database error: ${dbError.message}`;
    } else {
        // Success message
        message.textContent = 'Signup successful! Please check your email for confirmation.';
        
        // Redirect to the login page after signup
        setTimeout(() => {
        window.location.href = '../Login/login.html';  // Redirect to your login page
        }, 2000); // Wait for 2 seconds before redirecting
    }
    });
});
  