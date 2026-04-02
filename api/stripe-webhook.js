import Stripe from 'stripe';
import { supabase } from '../../src/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNumber = session.metadata.orderNumber;

    // Update order status in Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Paid - In Production', stripe_payment_status: 'paid' })
      .eq('order_number', orderNumber);

    if (error) console.error('Error updating order:', error);
  }

  res.status(200).json({ received: true });
}