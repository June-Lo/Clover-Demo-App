const express = require('express');
const { redirect } = require('react-router-dom');
cors = require('cors');
const crypto = require('crypto');
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
// let TA_PUBLIC_KEY_DEV;
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
    // accessToken = req.query.access_token;
    const data = {
        authCode,
        employeeID,
        merchantID,
        // accessToken
    };
    res.redirect(`http://localhost:3001/?auth_code=${authCode}&employee_id=${employeeID}&merchant_id=${merchantID}`);
});

// Using OAuth Auth Code, do not need to get PAKMSKey as it will be Ecommerce Public API Key
// app.get('/generatePAKMSKey', (req, res) => {
//     const headersReq = req.headers;
//     const headers = { Accept: headersReq.accept, Authorization: headersReq.authorization }
//     console.log(headers);
//     fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
//         headers
//     }).then((response) => {
//         return response.json();
//     }).then((data) => {
//         res.json(data);
//     }).catch((error) => {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     });
// })

app.post('/charge', (req, res) => {
    const { brand, number, exp_month, exp_year, cvv, last4, first6 } = req.body.card;
    // const apiAccessKey = req.body.PAKMSKey;
    // const accessToken = req.body.accessToken;
    // console.log(req.body.PAKMSKey)
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
        console.log(cardToken);
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