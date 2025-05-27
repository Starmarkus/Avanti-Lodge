require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase init
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(express.json());

// Preserve raw body for webhook verification
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const metadata = session.metadata;
    if (!metadata) {
      console.error('❌ No metadata found in session.');
      return res.status(400).send('No metadata in session.');
    }

    const { roomID, userID, startDate, endDate, total, nights } = metadata;

    const { error } = await supabase
      .from('BookingTable')
      .insert([{
        RoomID: roomID,
        UserID: userID,
        BookingStartDate: startDate,
        BookingEndDate: endDate,
        BookingTotalPrice: parseFloat(total),
        BookingTotalNights: parseInt(nights),
      }]);

    if (error) {
      console.error('❌ Failed to insert booking:', error.message);
      return res.status(500).send('Database insertion failed');
    }

    console.log('✅ Booking successfully added!');
  }

  res.status(200).send();
});

// Checkout session creation
app.post('/create-checkout-session', async (req, res) => {
  const { room, start, end, nights, rate, total, roomID, userID } = req.body;

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
      metadata: {
        roomID,
        userID,
        startDate: start,
        endDate: end,
        total,
        nights,
      },
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
