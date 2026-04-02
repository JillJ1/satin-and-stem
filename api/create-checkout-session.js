import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderNumber, total, customerName, customerEmail } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Satin & Stem Order',
              description: `Order #${orderNumber}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
      cancel_url: `${req.headers.origin}/cart?canceled=true`,
      customer_email: customerEmail,
      metadata: { orderNumber, customerName },
    });

    // Store the session ID in the orders table (requires column)
    // We'll do this after you add the column – you can also skip for now.
    // await supabase.from('orders').update({ stripe_session_id: session.id }).eq('order_number', orderNumber);

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}