require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Setup CORS - allow only trusted frontend origins
const allowedOrigins = ['http://127.0.0.1:5500', 'https://avantiguestlodge.netlify.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Supabase client using service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Middleware to parse JSON, except for Stripe webhook (needs raw)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // skip body parsing for webhook
  } else {
    express.json()(req, res, next);
  }
});

// ✅ Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { room, start, end, nights, rate, total, userID } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'zar',
          product_data: {
            name: `Booking: ${room}`,
          },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://avantiguestlodge.netlify.app/profile/profile',
      cancel_url: 'https://avantiguestlodge.netlify.app/booking/booking',
      metadata: {
        room,
        start,
        end,
        nights: nights.toString(),
        rate: rate.toString(),
        total: total.toString(),
        userID: userID || 'unknown',
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Stripe webhook to insert booking
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata.userID || metadata.userID === 'unknown') {
      console.error('❌ Invalid or missing userID — booking not saved.');
      return res.sendStatus(200);
    }

    try {
      const { data: roomRows, error: roomError } = await supabase
        .from('RoomTable')
        .select('RoomID')
        .eq('RoomName', metadata.room)
        .limit(1);

      if (roomError || !roomRows || roomRows.length === 0) {
        throw new Error(roomError?.message || 'Room not found.');
      }

      const roomID = roomRows[0].RoomID;

      const insertRes = await supabase
        .from('BookingTable')
        .insert({
          UserID: metadata.userID,
          RoomID: roomID,
          BookingStartDate: metadata.start,
          BookingEndDate: metadata.end,
          BookingTotalNights: parseInt(metadata.nights),
          BookingTotalPrice: parseFloat(metadata.total),
          created_at: new Date().toISOString()
        });

      if (insertRes.error) throw new Error(insertRes.error.message);

      console.log('✅ Booking successfully inserted into Supabase');
    } catch (err) {
      console.error('❌ Error inserting booking:', err.message);
    }
  }

  res.sendStatus(200);
});

// Health check
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
