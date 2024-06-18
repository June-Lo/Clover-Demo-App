import { useEffect, useState, useMemo } from 'react';

import './App.css';

function App() {

  const [clientID, setClientID] = useState('');
  const [merchantID, setMerchantID] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [PAKMSKey, setPAKMSKey] = useState('');
  // let cardToken;

  const merchantSID = process.env.REACT_APP_JUNEMERC_ID;
  const ecommAPIPublicKey = process.env.REACT_APP_CLOVER_ECOMMAPIPUBLIC;
  const ecommercePrivateAPIKey = process.env.REACT_APP_CLOVER_ECOMMAPIPRIVATE;
  const clientSecret = process.env.REACT_APP_APP_SECRET;

  useMemo(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setAuthCode(queryParams.get('code'));
    setClientID(queryParams.get('client_id'));
    setMerchantID(queryParams.get('merchant_id'));
  }, [authCode]);

  useEffect(() => {
    if (!authCode) {
      window.location.href = 'http://localhost:3000/';
    }

    if (!accessToken && authCode) {
      fetchToken();
    }

    if (accessToken && !PAKMSKey) {
      fetchPAKMSKey();
    }

  }, [accessToken, accessToken, PAKMSKey])

  const fetchToken = async () => {
    console.log(authCode, clientID, clientSecret);
    try {
      const response = await fetch('http://localhost:3000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'client_id': clientID,
          'client_secret': clientSecret,
          'code': authCode,
        }),
      });
      const data = await response.json();
      setAccessToken(data.access_token);
    }
    catch (error) {
      console.error('Error:', error);
    }
  }

  // Using OAuth Auth Code, do not need to get PAKMSKey as it will be Ecommerce Public API Key
  // useEffect(() => {

  //   console.log(PAKMSKey);
  // }, [PAKMSKey]);

  const fetchPAKMSKey = async () => {
    try {
      const response = await fetch('http://localhost:3000/generatePAKMSKey', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        }
      });
      const data = await response.json();
      setPAKMSKey(data.apiAccessKey);

    }
    catch (error) {
      console.error('Error:', error);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const creditCardNumber = event.target.creditCardNumber.value;
    const expiryDate = event.target.expiryDate.value;
    const cvv = event.target.cvv.value;
    const [expMonth, expYear] = expiryDate.split('/');

    const body = {
      card: {
        brand: 'VISA',
        number: creditCardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvv,
        last4: creditCardNumber.slice(-4),
        first6: creditCardNumber.slice(0, 6),
      },
      accessToken,
      authCode,
      PAKMSKey
    };

    try {
      const response = await fetch('http://localhost:3000/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('Success:', data);
    }
    catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Credit Card Number:
          <input type="text" name="creditCardNumber" required />
        </label>
        <br />
        <label>
          Expiry Date:
          <input type="text" name="expiryDate" required pattern="\d{2}/\d{2}" placeholder="MM/YY" />
        </label>
        <br />
        <label>
          CVV:
          <input type="text" name="cvv" required pattern="\d{3,4}" />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
