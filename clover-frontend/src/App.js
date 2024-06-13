import './App.css';

function App() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const creditCardNumber = event.target.creditCardNumber.value;
    const expiryDate = event.target.expiryDate.value;
    const cvv = event.target.cvv.value;
    

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
