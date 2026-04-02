export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order } = req.body;
  console.log('📦 Generating label for order:', order.order_number);
  console.log('Shipping address:', order.shipping_address);

  // Validate address
  if (!order.shipping_address?.street || !order.shipping_address?.city || !order.shipping_address?.state || !order.shipping_address?.zip) {
    console.error('❌ Missing shipping address fields');
    return res.status(400).json({ error: 'Incomplete shipping address' });
  }

  const shipment = {
    address_from: {
      name: 'Satin & Stem',
      street1: '2636 Mission Rd',
      city: 'Tallahassee',
      state: 'FL',
      zip: '32304',
      country: 'US',
      phone: '850-305-1504',
    },
    address_to: {
      name: order.customer_name,
      street1: order.shipping_address.street,
      street2: order.shipping_address.street2 || '',
      city: order.shipping_address.city,
      state: order.shipping_address.state,
      zip: order.shipping_address.zip,
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

  console.log('🚚 Sending to Shippo:', JSON.stringify(shipment, null, 2));

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
    console.log('📡 Shippo shipment response status:', response.status);

    if (!response.ok) {
      console.error('❌ Shippo error:', data);
      return res.status(500).json({ error: data.detail || 'Shipment creation failed' });
    }

    // Find the first available rate (USPS First Class or Priority)
    const rate = data.rates?.find(r => r.servicelevel?.token === 'usps_priority' || r.servicelevel?.token === 'usps_first');
    if (!rate) {
      console.error('❌ No suitable rate found. Rates available:', data.rates?.map(r => r.servicelevel?.token));
      return res.status(400).json({ error: 'No shipping rates available for this address.' });
    }

    console.log('✅ Using rate:', rate.servicelevel.token, rate.amount, rate.currency);

    const transactionRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate: rate.object_id, async: false }),
    });

    const labelData = await transactionRes.json();
    console.log('📄 Full transaction response:', JSON.stringify(labelData, null, 2));

    if (!transactionRes.ok) {
      console.error('❌ Transaction error:', labelData);
      return res.status(500).json({ error: labelData.detail || 'Label purchase failed' });
    }

    // Try multiple possible locations for the label URL
    let labelUrl = null;
    if (labelData.label_url) {
      labelUrl = labelData.label_url;
    } else if (labelData.object_results && labelData.object_results.label_url) {
      labelUrl = labelData.object_results.label_url;
    } else if (labelData.rates && labelData.rates[0] && labelData.rates[0].label_url) {
      labelUrl = labelData.rates[0].label_url;
    } else if (labelData.transaction && labelData.transaction.label_url) {
      labelUrl = labelData.transaction.label_url;
    } else if (labelData.url) {
      labelUrl = labelData.url;
    }

    if (!labelUrl) {
      console.error('❌ No label URL found in response. Full response:', JSON.stringify(labelData, null, 2));
      return res.status(500).json({ error: 'Label not ready. Response: ' + JSON.stringify(labelData) });
    }

    console.log('✅ Label URL:', labelUrl);
    res.status(200).json({ label_url: labelUrl });
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
}