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

    // Fetch the order from Supabase to get all details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: 'Order not found' });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Paid - In Production', stripe_payment_status: 'paid' })
      .eq('order_number', orderNumber);

    if (updateError) {
      console.error('Error updating order:', updateError);
    } else {
      // Send confirmation email
      const cartHtml = order.items.map(item => `<li>${item.name} - ${item.price}</li>`).join('');
      const shippingAddress = order.shipping_address;
      const html = `
        <h2>Order Confirmation – Satin & Stem</h2>
        <p><strong>Order #${orderNumber}</strong></p>
        <p><strong>Name:</strong> ${order.customer_name}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Shipping Address:</strong><br/>
        ${shippingAddress?.street}<br/>
        ${shippingAddress?.street2 ? shippingAddress.street2 + '<br/>' : ''}
        ${shippingAddress?.city}, ${shippingAddress?.state} ${shippingAddress?.zip}</p>
        <h3>Items:</h3>
        <ul>${cartHtml}</ul>
        <p><strong>Total:</strong> ${order.total}</p>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Satin & Stem <onboarding@resend.dev>',
          to: 'satinandstem@protonmail.com',
          subject: `New Order #${orderNumber}`,
          html,
        }),
      });
    }
  }

  res.status(200).json({ received: true });
}