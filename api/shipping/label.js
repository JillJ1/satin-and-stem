export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order } = req.body;

  const shipment = {
    address_from: {
      name: 'Satin & Stem',
      street1: 'Your Street2636 Misson Rd',   // Replace with your actual address
      city: 'Tallahassee',
      state: 'FL',
      zip: '32304',
      country: 'US',
      phone: '555-555-5555',
    },
    address_to: {
      name: order.customer_name,
      street1: order.shipping_address?.street,
      street2: order.shipping_address?.street2,
      city: order.shipping_address?.city,
      state: order.shipping_address?.state,
      zip: order.shipping_address?.zip,
      country: 'US',
      email: order.customer_email,
    },
    parcels: [{
      length: 5,
      width: 5,
      height: 5,
      distance_unit: 'in',
      weight: 0.5,
      mass_unit: 'lb',
    }],
    async: false,
  };

  try {
    const response = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipment),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Shippo shipment error:', data);
      return res.status(500).json({ error: data.detail || 'Shipment creation failed' });
    }

    const rate = data.rates[0];
    if (!rate) {
      return res.status(400).json({ error: 'No shipping rates available for this address.' });
    }

    const transactionRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate: rate.object_id, async: false }),
    });

    const labelData = await transactionRes.json();
    if (!transactionRes.ok) {
      console.error('Shippo transaction error:', labelData);
      return res.status(500).json({ error: labelData.detail || 'Label purchase failed' });
    }

    res.status(200).json({ label_url: labelData.label_url });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
}