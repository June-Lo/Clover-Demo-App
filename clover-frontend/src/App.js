import { useEffect } from 'react';
import './App.css';

function App() {
  let queryParams = new URLSearchParams(window.location.search)
  let clientID = queryParams.get('client_id');
  let merchantID = queryParams.get('merchant_id');
  let authCode = queryParams.get('auth_code');

  useEffect(() => {
    console.log("Client ID:", clientID);
    //Redirect user to Clover login page if any of the parameters are empty
    if (authCode === null) {
      window.location.href = 'http://localhost:3000/';
    }


    queryParams = new URLSearchParams(window.location.search)
    authCode = queryParams.get('auth_code');

    console.log(clientID)
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const creditCardNumber = event.target.creditCardNumber.value;
    const expiryDate = event.target.expiryDate.value;
    const cvv = event.target.cvv.value;

    // Generate PAKMS key by making GET request to https://scl-sandbox.dev.clover.com/pakms/apikey with Headers: Authorization
    // Add Access-Control-Allow-Origin header to allow cross-origin requests
    const headers = { accept: 'application/json', Authorization: `Bearer ${authCode}`, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' };
    fetch('https://scl-sandbox.dev.clover.com/pakms/apikey', {
      headers
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
    });

    console.log("Credit Card Number:", creditCardNumber);
    console.log("Expiry Date:", expiryDate);
    console.log("CVV:", cvv);
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
