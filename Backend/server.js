// server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { room, start, end, nights, rate, total } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'zar',
          product_data: {
            name: `Booking: ${room}`,
            description: `From ${start} to ${end} (${nights} nights at R${rate}/night)`,
          },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }],
      success_url: 'http://127.0.0.1:5500/Profile/profile.html',
      cancel_url: 'http://127.0.0.1:5500/Booking/booking.html',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
