import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const products = {
  "geoserra-3.4": {
    name: "Serra Geodetica 3.4m – 8mq",
    basePrice: 59000,
    options: {}
  },
  "mini-cupola": {
    name: "Mini Cupola 2m",
    basePrice: 39000,
    options: {}
  },
  "ecosfera-7": {
    name: "Cupola Geodetica 3V – 40mq",
    basePrice: 139000,
    options: {}
  },
  "glamp-dome-7": {
    name: "Cupola Glamping 7m – 40mq",
    basePrice: 139000,
    options: {
      colore: ["blu", "giallo", "verde", "grigio", "trasparente"],
      struttura: ["legno", "metallo"]
    },
    priceModifiers: {} // puoi estendere in futuro
  },
  "cupola-recinto": {
    name: "Cupola Recinto",
    basePrice: 69000,
    options: {
      dimensione: ["3.4m", "6.7m"],
      rete: ["maglia 25x25 per cani", "maglia 13x13 per voliera"]
    },
    priceModifiers: {} // anche qui puoi aggiungere modificatori futuri
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, quantity, options } = req.body;
  const product = products[productId];

  if (!product) {
    return res.status(400).json({ error: 'Prodotto non valido' });
  }

  // Calcola il prezzo base
  let finalPrice = product.basePrice;

  // (Se servono modificatori in futuro, qui puoi calcolarli)
  // Esempio: if (options?.rete === 'rinforzata') finalPrice += 2500;

  // Costruisci il nome finale (includi opzioni nel titolo del prodotto)
  let optionText = '';
  if (options && typeof options === 'object') {
    optionText = Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');
  }

  const fullName = optionText ? `${product.name} (${optionText})` : product.name;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: fullName,
          },
          unit_amount: finalPrice,
        },
        quantity: quantity || 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/grazie.html`,
      cancel_url: `${req.headers.origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
