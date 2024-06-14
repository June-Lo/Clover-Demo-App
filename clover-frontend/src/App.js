import { useEffect } from 'react';
import './App.css';

function App() {
  let queryParams = new URLSearchParams(window.location.search)
  let clientID = queryParams.get('client_id');
  let merchantID = queryParams.get('merchant_id');
  let authCode = queryParams.get('auth_code');
  let accessToken;
  let cardToken;

  const merchantSID = process.env.JUNEMERC_ID;
  const ecommAPIPublicKey = process.env.CLOVER_ECOMMAPIPUBLIC;
  const ecommercePrivateAPIKey = process.env.CLOVER_ECOMMAPIPRIVATE;

  useEffect(() => {
    //Redirect user to Clover login page if any of the parameters are empty
    if (accessToken === null) {
      window.location.href = 'http://localhost:3000/';
    }

    // Parse the query parameters from the URL
    queryParams = new URLSearchParams(window.location.search);
    authCode = queryParams.get('auth_code');
    merchantID = queryParams.get('merchant_id');
    // Correctly create a new instance of URLSearchParams to parse the hash fragment
    accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
    clientID = queryParams.get('client_id');
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const creditCardNumber = event.target.creditCardNumber.value;
    const expiryDate = event.target.expiryDate.value;
    const cvv = event.target.cvv.value;

    const cardData = {
      card: {
        brand: 'VISA',
        number: creditCardNumber,
        exp_month: expiryDate.split('/')[0],
        exp_year: expiryDate.split('/')[1],
        cvv: cvv,
        last4: creditCardNumber.slice(-4),
        first6: creditCardNumber.slice(0, 6)
      }
    }

    fetch('http://localhost:3000/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Credit Card Number:
          <input type="text" name="creditCardNumber" />
        </label>
        <br />
        <label>
          Expiry Date:
          <input type="text" name="expiryDate" />
        </label>
        <br />
        <label>
          CVV:
          <input type="text" name="cvv" />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
