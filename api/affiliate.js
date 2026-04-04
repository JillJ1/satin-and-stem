import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, social, followers, tier, why, example_post } = req.body;

  // Basic validation
  if (!name || !email || !social || !tier || !why) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert into Supabase
  const { error: insertError } = await supabase
    .from('affiliate_applications')
    .insert({
      name,
      email,
      social_handle: social,
      follower_count: followers,
      preferred_tier: tier,
      why,
      example_post: example_post || null,
    });

  if (insertError) {
    console.error('Insert error:', insertError);
    return res.status(500).json({ error: 'Failed to submit application' });
  }

  // Send email to admin (you)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const adminHtml = `
      <h2>New Affiliate Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Social handle:</strong> ${social}</p>
      <p><strong>Follower count:</strong> ${followers}</p>
      <p><strong>Preferred tier:</strong> ${tier}</p>
      <p><strong>Why they'd be great:</strong> ${why}</p>
      ${example_post ? `<p><strong>Example post:</strong> <a href="${example_post}">${example_post}</a></p>` : ''}
    `;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Satin & Stem <hello@satinandstem.shop>',
        to: 'satinandstem@protonmail.com',
        subject: `New Stem Collective Application from ${name}`,
        html: adminHtml,
      }),
    });
  }

  // Send confirmation email to applicant
  if (resendApiKey && email) {
    const confirmHtml = `
      <h2>Thank you for applying to The Stem Collective, ${name}!</h2>
      <p>We’ve received your application and will review it within 5–7 days. You’ll hear from us soon.</p>
      <p>In the meantime, follow us on Instagram <a href="https://instagram.com/satinandstemshop">@satinandstemshop</a> for updates.</p>
      <p>Warmly,<br>The Satin & Stem Team</p>
    `;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Satin & Stem <hello@satinandstem.shop>',
        to: email,
        subject: 'We received your Stem Collective application',
        html: confirmHtml,
      }),
    });
  }

  res.status(200).json({ success: true });
}