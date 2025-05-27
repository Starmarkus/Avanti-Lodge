// backend/server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe(process.env.sk_test_51RTHpDR19TEC9QUuWd7Bpbj74gOCLS4qCSNEGGVzN5iwEsn0NblLjh5kRGHTB3gVvDEsDkGMNR8dAEzquUJC4vEG00rYUDrAbp);

app.use(cors()); // allow frontend to access backend
app.use(express.json()); // parse JSON body

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
          unit_amount: Math.round(total * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      success_url: 'https://yourdomain.com/success.html',
      cancel_url: 'https://yourdomain.com/cancel.html',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});
