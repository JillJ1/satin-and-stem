import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  console.log('🔔 Webhook received. Method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Event constructed:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNumber = session.metadata.orderNumber;
    console.log(`💰 Checkout completed for order: ${orderNumber}`);

    // Fetch the order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      console.error('❌ Order not found:', error);
      return res.status(500).json({ error: 'Order not found' });
    }
    console.log('📦 Order found:', order.id);

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Paid - In Production', stripe_payment_status: 'paid' })
      .eq('order_number', orderNumber);
    if (updateError) {
      console.error('❌ Update error:', updateError);
    } else {
      console.log('✅ Order status updated');
    }

    // Prepare email content
    const cartHtml = order.items.map(item => `<li>${item.name} - ${item.price}</li>`).join('');
    const address = order.shipping_address || {};

    // 1. Customer email
    const customerHtml = `
      <h2>Thank you for your order, ${order.customer_name}!</h2>
      <p><strong>Order #${orderNumber}</strong></p>
      <p>Your order has been received and is now in production. We'll notify you when it ships.</p>
      <h3>Order details:</h3>
      <ul>${cartHtml}</ul>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Shipping address:</strong><br/>
      ${address.street || ''}<br/>
      ${address.street2 ? address.street2 + '<br/>' : ''}
      ${address.city || ''}, ${address.state || ''} ${address.zip || ''}</p>
      <p>Thank you for supporting Satin & Stem!</p>
    `;

    // 2. Admin email
    const adminHtml = `
      <h2>New Order #${orderNumber}</h2>
      <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Items:</strong></p>
      <ul>${cartHtml}</ul>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Shipping address:</strong><br/>
      ${address.street || ''}<br/>
      ${address.street2 ? address.street2 + '<br/>' : ''}
      ${address.city || ''}, ${address.state || ''} ${address.zip || ''}</p>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY is missing');
    } else {
      // Send customer email
      try {
        const customerRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Satin & Stem <onboarding@resend.dev>',
            to: order.customer_email,
            subject: `Your Satin & Stem order #${orderNumber}`,
            html: customerHtml,
          }),
        });
        if (!customerRes.ok) {
          const errorText = await customerRes.text();
          console.error('❌ Customer email failed:', errorText);
        } else {
          console.log('✅ Customer email sent to', order.customer_email);
        }
      } catch (err) {
        console.error('❌ Error sending customer email:', err);
      }

      // Send admin email
      try {
        const adminRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Satin & Stem <onboarding@resend.dev>',
            to: 'satinandstem@protonmail.com',
            subject: `New Order #${orderNumber}`,
            html: adminHtml,
          }),
        });
        if (!adminRes.ok) {
          const errorText = await adminRes.text();
          console.error('❌ Admin email failed:', errorText);
        } else {
          console.log('✅ Admin email sent');
        }
      } catch (err) {
        console.error('❌ Error sending admin email:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}