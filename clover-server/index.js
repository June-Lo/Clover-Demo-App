const express = require('express');
const { redirect } = require('react-router-dom');

require('dotenv').config({path: '../.env'});

const app = express();
const port = 3000;

const clientID = process.env.APP_ID;
const clientSecret = process.env.APP_SECRET;

app.get('/', (req, res) => {
    res.redirect(`https://${process.env.CLOVER_SERVER}/oauth/authorize?client_id=${clientID}&redirect_uri=http://localhost:${port}/callback`);
});

app.get('/callback', (req, res) => {
    const authCode = req.query.code;
    const employeeID = req.query.employee_id;
    const merchantID = req.query.merchant_id;
    const data = {
        authCode,
        employeeID,
        merchantID
    };
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});