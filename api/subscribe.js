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

    // Send welcome email via Resend using the beautiful striped HTML template
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      // The email template (with placeholders)
      const welcomeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    /* Minor responsive tweaks for mobile preview */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .padded-section { padding: 40px 20px !important; }
      .hero-text { font-size: 26px !important; }
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
              <h2 style="margin: 0; color:#4A373C; font-size: 16px; font-weight: 400; letter-spacing: 1px;">Welcome to the family.</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 30px;">
               <h1 class="brand-title" style="margin: 0; font-family:'Cormorant Garamond', serif; font-size: 48px; color: #D56989; font-weight: 600; letter-spacing: -1px; line-height: 1;">Satin & Stem</h1>
            </td>
          </tr>
        </table>

        <!-- Main Content Wrapper with Pink Stripes -->
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius:12px; overflow: hidden; box-shadow: 0 10px 30px rgba(213, 105, 137, 0.05); background-image: repeating-linear-gradient(45deg, rgba(244, 223, 230, 0.2) 0px, rgba(244, 223, 230, 0.2) 2px, transparent 2px, transparent 12px);">
          
          <!-- Text Section -->
          <tr>
            <td class="padded-section" style="padding: 60px 40px; text-align:center;">
              <h1 class="hero-text" style="color:#D56989; font-family:'Cormorant Garamond', serif; font-size:30px; font-weight: 400; margin:0 0 16px; letter-spacing: -0.5px;">Welcome to the world of Satin & Stem.</h1>
              
              <!-- The email placeholder will be replaced dynamically -->
              <p style="color:#4A373C; font-size:16px; line-height:1.6; font-weight: 300;">You're now on the list with <strong>{{email}}</strong>.</p>
              
              <p style="color:#8A7A7E; font-size:15px; line-height:1.6; margin:20px 0 40px 0; font-weight: 300;">Expect mindful updates on new collections, exclusive early access, and a little daily inspiration straight to your inbox.</p>
              
              <!-- Upgraded Button CTA -->
              <div>
                <a href="https://satinandstem.shop" style="display: inline-block; background-color: transparent; border: 1px solid #4A373C; color:#4A373C; text-decoration:none; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 40px; border-radius: 30px;">Explore the Collection</a>
              </div>

              <hr style="border:0; border-top:1px solid #FDF5F7; margin:50px 0 30px 0;">
              
              <p style="color:#C4B6B9; font-size:12px; font-weight: 300;">Changed your mind? You can <a href="#" style="color:#8A7A7E; text-decoration: underline;">unsubscribe</a> at any time.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Replace the placeholder with the actual subscriber email
      const personalizedHtml = welcomeHtml.replace('{{email}}', email);

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Satin & Stem <hello@satinandstem.shop>',
          to: email,
          subject: 'Welcome to Satin & Stem',
          html: personalizedHtml,
        }),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}