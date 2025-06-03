# Avanti-Lodge

Run backend server: https://avantiguest-backend.onrender.com

SupaBase URL: Check .env file in Backend folder
SupaBase Key: Same here ^

Payment test details: 
Email: test@email.com
Card Number: 4242 4242 4242 4242
Expiry Date: 12/25
CVC: 123
Name: Any

Colours: Yellow #EDB52C
         Green #3F5A38
         Khaki #C2BAA5
         Dark Green #1A2619

TESTING COMMANDS
In cmd from Stripe root: stripe listen --forward-to localhost:3000/webhook
In terminal in Backend root: node server.js

PAYMENT TESTING INSTRUCTIONS
1. Start your local server
Make sure your Express server (server.js) is running on http://localhost:3000:
node server.js

2. Listen for Stripe webhook events
In a separate terminal window, start Stripe CLI listening to your webhook endpoint:
stripe listen --forward-to localhost:3000/webhook
This will listen to Stripe events and forward them to your /webhook endpoint.

3. Create a test checkout session
(Start new terminal here. You shouold have 2 running)
You can create a test checkout session by sending a POST request from terminal

Invoke-RestMethod -Uri http://localhost:3000/create-checkout-session `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "room": "Room 1",
    "start": "2025-06-01",
    "end": "2025-06-05",
    "nights": 4,
    "rate": 500,
    "total": 2000
  }'

4. Open the checkout URL
Copy the URL from the response and open it in your browser.

Use Stripe test card details (like 4242 4242 4242 4242) and any valid future expiry date, CVC, and ZIP to complete the payment.

5. Watch your terminal logs
The webhook listener terminal should show the event received.

Your server terminal should log “✅ Booking successfully added!” if insertion into Supabase worked.

6. Verify the booking in your Supabase dashboard
After the webhook runs, check your Supabase BookingTable to see if the booking got inserted.

