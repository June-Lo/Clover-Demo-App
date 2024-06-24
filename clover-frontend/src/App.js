import { useEffect, useState, useMemo } from 'react';
import './App.css';

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const [authData, setAuthData] = useState({
    clientID: queryParams.get('client_id'),
    merchantID: queryParams.get('merchant_id'),
    authCode: queryParams.get('code'),
    accessToken: localStorage.getItem('accessToken')
  });
  const [cardData, setCardData] = useState({
    brand: '',
    BIN: 0
  });

  // Merchant Authorization, payment processing does not need OAuth Bearer and API Token
  // const clientSecret = process.env.REACT_APP_APP_SECRET;
  // useMemo(() => {
  //   if (!authData.authCode) {
  //     window.location.href = 'http://localhost:3000/';
  //   }
  // }, [authData.authCode]);
  // 
  // useEffect(() => {
  //   if (authData.authCode && authData.accessToken === 'undefined') {
  //     fetchToken();
  //   }
  // }, [authData.authCode, authData.accessToken]);
  // 
  // const fetchToken = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3000/token', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         client_id: authData.clientID,
  //         client_secret: clientSecret,
  //         code: authData.authCode,
  //       }),
  //     });
  //     const data = await response.json();
  //     localStorage.setItem('accessToken', data.access_token);
  //     setAuthData({ ...authData, accessToken: data.access_token });
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const inputChange = (event) => {
    // Amex cards always start with the number 34 or 37
    // Visa cards start with 4
    // Mastercard cards start with 5
    // Discover cards start with 6011
    const visaPattern = /^4\d*$/;
    const mastPattern = /^5\d*$/;
    const amexPattern = /^3[47]\d*$/;
    const discPattern = /^6\d*$/;

    const isVisa = visaPattern.test(event.target.value.replace(/\D/g, '')) === true;
    const isMast = mastPattern.test(event.target.value.replace(/\D/g, '')) === true;
    const isAmex = amexPattern.test(event.target.value.replace(/\D/g, '')) === true;
    const isDisc = discPattern.test(event.target.value.replace(/\D/g, '')) === true;

    if (isVisa) {
      setCardData({ brand: 'VISA', BIN: 4 });
    } else if (isMast) {
      setCardData({ brand: 'MASTERCARD', BIN: 5 });
    } else if (isAmex) {
      setCardData({ brand: 'AMEX', BIN: 3 });
    } else if (isDisc) {
      setCardData({ brand: 'DISCOVER', BIN: 6 });
    } else {
      setCardData({ brand: 'UNKNOWN', BIN: 0 });
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const creditCardNumber = event.target.creditCardNumber.value.replace(/\D/g, '');
    const expiryDate = event.target.expiryDate.value;
    const cvv = event.target.cvv.value;
    const [expMonth, expYear] = expiryDate.split('/');

    const body = {
      card: {
        brand: cardData.BIN,
        number: creditCardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvv,
        last4: creditCardNumber.slice(-4),
        first6: creditCardNumber.slice(0, 6),
      },
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
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h1>Card {cardData.brand}</h1>
        <label>
          Credit Card Number:
          <input onChange={(event) => inputChange(event)} type="text" name="creditCardNumber" required />
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
