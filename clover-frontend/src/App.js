import { useEffect, useState, useMemo } from 'react';

import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const [clientID, setClientID] = useState(queryParams.get('client_id'));
  const [merchantID, setMerchantID] = useState(queryParams.get('merchant_id'));
  const [authCode, setAuthCode] = useState(queryParams.get('code'));
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  // Doing card tokenization through Ecommerce API
  // const [PAKMSKey, setPAKMSKey] = useState('');
  
  const clientSecret = process.env.REACT_APP_APP_SECRET;

  useMemo(() => {
    if (!authCode) {
      window.location.href = 'http://localhost:3000/';
    }
  }, [authCode]);

  useEffect(() => {
    if (authCode && accessToken === 'undefined') {
      fetchToken();
    }

    // Doing card tokenization through Ecommerce API
    // if (accessToken) {
    //   fetchPAKMSKey();
    // }
  }, [])

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
      localStorage.setItem('accessToken', data.access_token);
    }
    catch (error) {
      console.error('Error:', error);
    }
  }

  // Doing card tokenization through Ecommerce API
  // const fetchPAKMSKey = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3000/generatePAKMSKey', {
  //       headers: {
  //         Accept: 'application/json',
  //       },
  //       body: {
  //         Accept: 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //       }
  //     });
  //     const data = await response.json();
  //     setPAKMSKey(data.apiAccessKey);
  //   }
  //   catch (error) {
  //     console.error('Error:', error);
  //   }
  // }

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
      // Doing card tokenization through Ecommerce API
      // PAKMSKey
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
