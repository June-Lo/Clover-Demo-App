const express = require('express');
const { redirect } = require('react-router-dom');
cors = require('cors');

require('dotenv').config({path: '../.env'});

const app = express();
const port = 3000;
const portProxy = 3001;

app.use(cors());

const clientID = process.env.APP_ID;
const clientSecret = process.env.APP_SECRET;
const merchantID = process.env.JUNE_MID;
let authCode;

app.get('/', (req, res) => {
    res.redirect(`https://${process.env.CLOVER_SERVER}/oauth/authorize?client_id=${clientID}&merchant_id=${merchantID}&redirect_uri=http://localhost:${port}/callback`);
});

// app.get('/callback', (req, res) => {
//     authCode = req.query.code;
//     const employeeID = req.query.employee_id;
//     const merchantID = req.query.merchant_id;
//     const data = {
//         authCode,
//         employeeID,
//         merchantID
//     };
//     // res.json(data);
//     res.redirect(`http://localhost:3001/?auth_code=${authCode}&employee_id=${employeeID}&merchant_id=${merchantID}`);
// });

//Testing
app.get('/callback', (req, res) => {
    authCode = req.query.code;
    const employeeID = req.query.employee_id;
    const merchantID = req.query.merchant_id;
    const data = {
        authCode,
        employeeID,
        merchantID
    };
    res.json(data);
});

// Generate PAKMS key by making GET request to https://scl-sandbox.dev.clover.com/pakms/apikey with Headers: Authorization
    // Add Access-Control-Allow-Origin header to allow cross-origin requests
    // const headers = { accept: 'application/json', Authorization: `Bearer ${authCode}`, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' };
    // fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
    //   headers
    // }).then((response) => {
    //   return response.json();
    // }).then((data) => {
    //   console.log(data);
    // });


app.get('/generatePAKMSKey', (req, res) => {
    const authCode = req.query.auth_code;
    const headers = { accept: 'application/json', Authorization: `Bearer ${authCode}`}
    fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
        headers
    }).then((response) => {
        return response.json();
    }).then((data) => {
        res.json(data);
    });
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});