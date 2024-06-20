const express = require('express');
const { redirect } = require('react-router-dom');
cors = require('cors');
const crypto = require('crypto');
import('node-fetch');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;
const portProxy = 3001;
const clientID = process.env.APP_ID;
const merchantID = process.env.JUNE_MID;
const ecommAPIPublicKey = process.env.CLOVER_ECOMMAPIPUBLIC;
const ecommercePrivateAPIKey = process.env.CLOVER_ECOMMAPIPRIVATE;

let cardToken;

app.get('/', (req, res) => {
    res.redirect(`https://${process.env.CLOVER_SERVER}/oauth/authorize?client_id=${clientID}&merchant_id=${merchantID}&redirect_uri=http://localhost:${port}/callback`);
});

app.get('/callback', (req, res) => {
    const code = req.query.code;
    const clientID = req.query.client_id;
    const merchantID = req.query.merchant_id;
    res.redirect(`http://localhost:${portProxy}/?code=${code}&client_id=${clientID}&merchant_id=${merchantID}`);
});


app.post('/token', (req, res) => {
    fetch(`https://${process.env.CLOVER_SERVER}/oauth/token?client_id=${req.body.client_id}&client_secret=${req.body.client_secret}&code=${req.body.code}`, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((error) => {
            res.status(500).json({ error: 'An error occurred' });
        });
});

// Doing card tokenization through Ecommerce API
// app.get('/generatePAKMSKey', (req, res) => {
//     fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
//         headers: {
//             'Accept': 'application/json',
//             'Authorization': req.body.Authorization
//         }
//     }).then((response) => {
//         return response.json();
//     }).then((data) => {
//         console.log(data);
//         res.json(data);
//     }).catch((error) => {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     });
// })

app.post('/charge', (req, res) => {
    const { brand, number, exp_month, exp_year, cvv, last4, first6 } = req.body.card;
    // Doing card tokenization through Ecommerce API
    // const apiAccessKey = req.body.PAKMSKey;
    const cardData = {
        card: {
            number,
            brand,
            exp_month,
            exp_year,
            cvv,
            last4,
            first6
        }
    };
    fetch('https://token-sandbox.dev.clover.com/v1/tokens', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'apikey': ecommAPIPublicKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify(cardData)
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            cardToken = data.id;
            fetch('https://scl-sandbox.dev.clover.com/v1/charges', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${ecommercePrivateAPIKey}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    "ecomind": "ecom",
                    "metadata": {
                        "existingDebtIndicator": false
                    },
                    "amount": 1358,
                    "tip_amount": 200,
                    "currency": "usd",
                    "source": cardToken
                })
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ error: 'An error occurred' });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred' });
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});