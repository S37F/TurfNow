import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PAYMENTS TEMPORARILY DISABLED
// Configure RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
// and STRIPE_SECRET_KEY env vars to enable.
// ============================================

const PAYMENTS_ENABLED = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpay = null;
let stripe = null;

if (PAYMENTS_ENABLED) {
  try {
    const Razorpay = (await import('razorpay')).default;
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  } catch (error) {
    console.error('Razorpay initialization error:', error.message);
  }
}

if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    console.log('✅ Stripe initialized');
  } catch (error) {
    console.error('Stripe initialization error:', error.message);
  }
}

// Middleware: check if payments are enabled
const requirePayments = (req, res, next) => {
  if (!PAYMENTS_ENABLED || !razorpay) {
    return res.status(503).json({ 
      success: false, 
      error: 'Online payments are currently unavailable. Please use pay-at-venue option.' 
    });
  }
  next();
};

// Create Razorpay order
router.post('/razorpay/create-order', verifyToken, requirePayments, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(numAmount * 100), // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ 
      success: true, 
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify', verifyToken, requirePayments, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const crypto = (await import('crypto')).default;

    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature === signature) {
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// Stripe create intent
router.post('/stripe/create-intent', verifyToken, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured' });
  }

  try {
    const { amount, currency = 'usd' } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numAmount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ 
      success: true, 
      data: {
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });
  } catch (error) {
    console.error('Error creating Stripe intent:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment intent' });
  }
});

// Payment status endpoint
router.get('/status', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      razorpay: PAYMENTS_ENABLED,
      stripe: !!stripe,
      cashAtVenue: true 
    } 
  });
});

export default router;
