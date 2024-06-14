const express = require('express');
const { redirect } = require('react-router-dom');
cors = require('cors');
import('node-fetch');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(express.json());
const port = 3000;
const portProxy = 3001;
app.use(cors());

const clientID = process.env.APP_ID;
const clientSecret = process.env.APP_SECRET;
const merchantID = process.env.JUNE_MID;
const merchantSID = process.env.JUNEMERC_ID;
const ecommAPIPublicKey = process.env.CLOVER_ECOMMAPIPUBLIC;
const ecommercePrivateAPIKey = process.env.CLOVER_ECOMMAPIPRIVATE;
let authCode;
let employeeID;
let accessToken;
let cardToken;


app.get('/', (req, res) => {
    res.redirect(`https://${process.env.CLOVER_SERVER}/oauth/authorize?client_id=${clientID}&merchant_id=${merchantID}&redirect_uri=http://localhost:${port}/callback`);
});

app.get('/callback', (req, res) => {
    authCode = req.query.code;
    employeeID = req.query.employee_id;
    accessToken = req.query.access_token;
    const data = {
        authCode,
        employeeID,
        merchantID,
        accessToken
    };
    // res.json(data);
    console.log(data)
    res.redirect(`http://localhost:3001/?auth_code=${authCode}&employee_id=${employeeID}&merchant_id=${merchantID}`);
});

// app.get('/generatePAKMSKey', (req, res) => {
//     const headers = { accept: 'application/json', Authorization: `Bearer ${authCode}` }
//     fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
//         headers
//     }).then((response) => {
//         return response.json();
//     }).then((data) => {
//         res.json(data);
//     });
// })

app.post('/charge', (req, res) => {
    const { brand, number, exp_month, exp_year, cvv, last4, first6 } = req.body.card;
    const cardData = {
        card: {
            brand,
            number,
            exp_month,
            exp_year,
            cvv,
            last4,
            first6
        }
    };
    console.log(cardData)
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
                "tip_amount" : 200,
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