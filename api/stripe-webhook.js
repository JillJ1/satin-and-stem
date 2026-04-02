import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import getRawBody from 'raw-body';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing
  },
};

export default async function handler(req, res) {
  console.log('🔔 Webhook received. Method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the raw request body as a string
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
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

    // Duplicate prevention: if already paid, skip processing
    if (order.status === 'Paid - In Production') {
      console.log('⏭️ Order already paid – skipping duplicate email.');
      return res.status(200).json({ received: true });
    }

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

    // Prepare email content using the stored items (which include name, price, quantity)
    const address = order.shipping_address || {};
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Build the items rows for the email table
    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding-bottom: 10px;"><strong>${item.name}</strong> (x${item.quantity})</td>
        <td align="right" style="padding-bottom: 10px;">${item.price}</td>
      </tr>
    `).join('');

    const shippingAddressStr = `${address.street || ''}<br>${address.street2 ? address.street2 + '<br>' : ''}${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.trim();

    // ---------- Beautiful striped customer email ----------
    const customerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .padded-section { padding: 40px 20px !important; }
      .brand-title { font-size: 38px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#FFF5F7; font-family: 'Jost', sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFF5F7;">
    <tr>
      <td align="center" style="padding: 50px 20px;">
        
        <!-- Top Logo / Header -->
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h2 style="margin: 0; color:#4A373C; font-size: 16px; font-weight: 400; letter-spacing: 1px;">Thank you for your order.</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 30px;">
               <h1 class="brand-title" style="margin: 0; font-family:'Cormorant Garamond', serif; font-size: 48px; color: #D56989; font-weight: 600; letter-spacing: -1px; line-height: 1;">Satin & Stem</h1>
            </td>
          </tr>
        </table>

        <!-- Main Order Card with Pink Stripes -->
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius:12px; overflow: hidden; box-shadow: 0 10px 30px rgba(213, 105, 137, 0.05); background-image: repeating-linear-gradient(45deg, rgba(244, 223, 230, 0.2) 0px, rgba(244, 223, 230, 0.2) 2px, transparent 2px, transparent 12px);">
          
          <!-- Details Section -->
          <tr>
            <td class="padded-section" style="padding: 50px 40px; text-align:center;">
              
              <p style="color:#8A7A7E; font-size:16px; font-weight: 300; margin: 0 0 40px 0;">We'll let you know as soon as your order ships out.<br>Here are the details, ${order.customer_name}:</p>
              
              <p style="color:#4A373C; font-size:14px; font-weight: 600; letter-spacing: 1px; margin: 0 0 10px 0; text-transform: uppercase;">Order No. #${orderNumber}</p>
              <p style="color:#8A7A7E; font-size:14px; margin: 0 0 40px 0;">${orderDate}</p>

              <!-- Button linking to shop (optional) -->
              <div>
                <a href="https://satinandstem.shop" style="display: inline-block; background-color: transparent; border: 1px solid #4A373C; color:#4A373C; text-decoration:none; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 40px; border-radius: 30px;">Visit Our Shop</a>
              </div>
              
              <hr style="border:0; border-top:1px solid #FDF5F7; margin:40px 0;">
              
              <!-- Receipt details (dynamic items) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="text-align: left; font-size: 14px; color: #4A373C; font-weight: 300;">
                ${itemsRows}
                <tr>
                  <td style="padding-top: 15px;"><strong>Total:</strong></td>
                  <td align="right" style="padding-top: 15px;"><strong>${order.total}</strong></td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 30px; color: #8A7A7E;">
                    <strong>Shipping to:</strong><br>
                    <span style="line-height: 1.6;">${shippingAddressStr}</span>
                   </td>
                </tr>
               </table>

             </td>
           </tr>
         </table>

       </td>
     </tr>
   </table>
</body>
</html>`;

    // Admin email (simple but informative)
    const adminHtml = `
      <h2>New Order #${orderNumber}</h2>
      <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Items:</strong></p>
      <ul>${order.items.map(item => `<li>${item.name} (x${item.quantity}) - ${item.price}</li>`).join('')}</ul>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Shipping address:</strong><br/>
      ${shippingAddressStr.replace(/<br>/g, '\n')}</p>
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
            from: 'Satin & Stem <hello@satinandstem.shop>',
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
            from: 'Satin & Stem <hello@satinandstem.shop>',
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