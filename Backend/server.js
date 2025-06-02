require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS
const allowedOrigins = ['http://127.0.0.1:5500', 'https://avantiguestlodge.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// ✅ JSON parser (skip for webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// ✅ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { roomID, roomName, start, end, nights, rate, total, userID } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'zar',
          product_data: {
            name: `Booking: ${roomName}`,
          },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://avantiguestlodge.netlify.app/profile/profile',
      cancel_url: 'https://avantiguestlodge.netlify.app/booking/booking',
      metadata: {
        roomID,
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
    console.error('❌ Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Webhook
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    console.log('📡 Webhook received:', event.type);
    console.log('📦 Metadata:', metadata);

    if (!metadata.userID || metadata.userID === 'unknown') {
      console.error('❌ Missing userID — booking not saved.');
      return res.sendStatus(200);
    }

    try {
      const insertRes = await supabase
        .from('BookingTable')
        .insert({
          UserID: metadata.userID,
          RoomID: metadata.roomID,
          BookingStartDate: metadata.start,
          BookingEndDate: metadata.end,
          BookingTotalNights: parseInt(metadata.nights),
          BookingTotalPrice: parseFloat(metadata.total),
          created_at: new Date().toISOString()
        });

      if (insertRes.error) throw new Error(insertRes.error.message);

      console.log('✅ Booking inserted into Supabase');
    } catch (err) {
      console.error('❌ Error inserting booking:', err.message);
    }
  }

  res.sendStatus(200);
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
