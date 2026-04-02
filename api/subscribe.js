import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables (available in Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Insert into subscribers (ignore duplicate)
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ email });
    
    if (insertError && insertError.code !== '23505') {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send welcome email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Satin & Stem <onboarding@resend.dev>',
          to: email,
          subject: 'Welcome to Satin & Stem',
          html: '<h2>Welcome to Satin & Stem!</h2><p>Thank you for subscribing. You’ll receive updates on new collections and special offers.</p>',
        }),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}