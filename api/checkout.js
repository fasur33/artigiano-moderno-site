const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, quantity } = req.body;

  const products = {
    "cupola-serra": {
      name: "Cupola Serra",
      price: 59000
    }
  };

  const product = products[productId];

  if (!product) {
    return res.status(400).json({ error: "Prodotto non valido" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price,
        },
        quantity: quantity || 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/grazie.html`,
      cancel_url: `${req.headers.origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
