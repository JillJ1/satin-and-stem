import { supabase } from '../../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Insert into subscribers table
  const { error } = await supabase.from('subscribers').insert({ email });
  if (error && error.code !== '23505') { // ignore duplicate email
    return res.status(500).json({ error: error.message });
  }

  // Send a welcome email via Resend
  const html = `<h2>Welcome to Satin & Stem!</h2><p>You're now subscribed to our newsletter. You'll receive updates about new collections and special offers.</p>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Satin & Stem <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Satin & Stem',
      html,
    }),
  });

  res.status(200).json({ success: true });
}