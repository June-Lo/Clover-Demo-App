const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;
const portProxy = 3001;
const { APP_ID: clientID, JUNE_MID: merchantID, CLOVER_ECOMMAPIPUBLIC: ecommAPIPublicKey, CLOVER_ECOMMAPIPRIVATE: ecommercePrivateAPIKey, CLOVER_SERVER: cloverServer } = process.env;

app.get('/', (req, res) => {
  res.redirect(`https://${cloverServer}/oauth/authorize?client_id=${clientID}&merchant_id=${merchantID}&redirect_uri=http://localhost:${port}/callback`);
});

app.get('/callback', (req, res) => {
  const { code, client_id, merchant_id } = req.query;
  res.redirect(`http://localhost:${portProxy}/?code=${code}&client_id=${client_id}&merchant_id=${merchant_id}`);
});

// This is the API access token that will be received and used for other Clover API calls
app.post('/token', async (req, res) => {
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(`https://${cloverServer}/oauth/token?client_id=${req.body.client_id}&client_secret=${req.body.client_secret}&code=${req.body.code}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/charge', async (req, res) => {
  try {
    const fetch = await import('node-fetch');
    const { brand, number, exp_month, exp_year, cvv, last4, first6 } = req.body.card;
    const cardData = {
      card: {
        number,
        brand,
        exp_month,
        exp_year,
        cvv,
        last4,
        first6,
      },
    };
    const tokenResponse = await fetch.default('https://token-sandbox.dev.clover.com/v1/tokens', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'apikey': ecommAPIPublicKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });
    const tokenData = await tokenResponse.json();
    const chargeResponse = await fetch.default('https://scl-sandbox.dev.clover.com/v1/charges', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${ecommercePrivateAPIKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ecomind: 'ecom',
        metadata: {
          existingDebtIndicator: false,
        },
        amount: 1358, // Item cost in cents
        tip_amount: 200, // Tip amount in cents
        tax_amount: 100, // Tax amount in cents
        currency: 'usd',
        source: tokenData.id,
        description: 'Test Item'
      }),
    });
    const chargeData = await chargeResponse.json();
    res.json(chargeData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
