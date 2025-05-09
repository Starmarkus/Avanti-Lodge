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
    
        const email       = document.getElementById('email').value.trim();
        const firstName   = document.getElementById('first-name').value.trim();
        const lastName    = document.getElementById('last-name').value.trim();
        const phoneNumber = document.getElementById('phone-number').value.trim();
        const password    = document.getElementById('password').value;
        const confirm     = document.getElementById('confirm-password').value;
    
        if (password !== confirm) {
          message.textContent = 'Passwords do not match.';
          return;
        }
    
        // 1) Sign up with Supabase Auth
        const { data: signUpData, error: signupError } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { first_name: firstName, last_name: lastName, phone_number: phoneNumber }
          }
        });
        console.log('signUpData →', signUpData, 'signupError →', signupError);
    
        if (signupError) {
          message.textContent = `Signup error: ${signupError.message}`;
          return;
        }
    
        // Make sure data.user exists
        const user = signUpData?.user;
        if (!user || !user.id) {
          console.error('No user returned from signUp:', signUpData);
          message.textContent = 'Unexpected error: no user ID.';
          return;
        }
    
        // 2) Insert into UserTable
        try {
          const { data: insertData, error: dbError } = await supabase
            .from('UserTable')
            .insert([{
              UserID: user.id,
              UserEmail: email,
              UserFirstname: firstName,
              UserLastname: lastName,
              UserPhonenumber: phoneNumber
            }]);
          console.log('insertData →', insertData, 'dbError →', dbError);
    
          if (dbError) {
            message.textContent = `Database error: ${dbError.message}`;
          } else if (insertData?.length) {
            message.textContent = 'Signup successful! Please check your email for confirmation.';
            setTimeout(() => window.location.href = '../Login/login.html', 2000);
          } else {
            // No error but also no data?
            console.warn('Insert returned no rows and no error:', insertData);
            message.textContent = 'Signup seemed to work, but no record was created.';
          }
    
        } catch (err) {
          console.error('Unexpected exception during insert:', err);
          message.textContent = 'An unexpected error occurred.';
        }
      });
    });
    