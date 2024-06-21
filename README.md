# UFTClover Prototype

## Setting up the environment
Download Node.js  
https://nodejs.org/en/download/prebuilt-installer  

After downloading Node.js, we now need to download all the packages necessary  
Head to ./UFTCLOVER/clover-frontend  
Run `npm install`  

We also need to download packages for the backend  
Head to ./UFTCLOVER/clover-server  
Run `npm install`  

To start the front-end  
Head to ./UFTCLOVER/clover-frontend  
Run `npm start`  

To start the back-end  
Head to ./UFTCLOVER/clover-server  
Run `node index.js`  

## Setting up
Create a Clover Dev Sandbox account  
https://sandbox.dev.clover.com/developer-home/create-account  
Note down the (client_id)App ID and (client_secret)App Secret  

After creating, create a test merchant account, make sure to set up Ecommerce Online Payments  
https://docs.clover.com/docs/merchant-id-and-api-token-for-development  
https://docs.clover.com/docs/creating-a-sandbox-app  

After making a merchant account, you need to note down the merchant_id and create a Ecommerce API Token, this is found in settings Ecommerce tab  

You should now have client_id, client_secret, merchant_id, ecommerce_public_key, ecommerce_private_key

A thing to keep note is that whenever checking the Ecommerce API Tokens, the private key will be changed

## Getting Authorization (Not needed to process payments)
First, user is redirected to, client_id must be passed as a query, merchant_id can be passed if you have a specific one to skip the merchant picking process  
https://sandbox.dev.clover.com/oauth/authorize?client_id={APP_ID}&redirect_uri={REDIRECT_URI}   
https://sandbox.dev.clover.com/oauth/authorize?client_id={APP_ID}&merchant_id={MERCHANT_ID}&redirect_uri={REDIRECT_URI}  
  
After the merchant has logged into the Clover merchant account, they're now authorized. Clover will redirect to the URI sent with  
https://www.example.com/oauth_callback?merchant_id={MERCHANT_ID}&client_id={APP_ID}&code={AUTHORIZATION_CODE}  

Relevant Documentation:  
https://docs.clover.com/docs/merchant-dashboard-left-navigation-oauth-flow  

## Getting the API Access Token (Not needed to process payments)
The user must send their client_id(App ID), client_secret(App Secret), and code(AUTHORIZATION_CODE) to Clover Oauth2 Token endpoint  
https://sandbox.dev.clover.com/oauth/token?client_id={APP_ID}&client_secret={APP_SECRET}&code=${AUTHORIZATION_CODE}  
OR
Instead of sending client_id, client_secret, and code as query params, Clover also accepts them as JSON body

This will return a JSON file with your access_token

Relevant Documentation:  
https://docs.clover.com/docs/oauth-intro  
https://docs.clover.com/docs/high-trust-app-auth-flow  

## Payment
### PAKMS Key (Not needed since using Ecommerce API Tokens)
**Since we are doing through the Ecommerce API Side, we can skip PAKMS Key and instead pass the Ecommerce API Public Key for card tokenization**  
To get a PAKMS Key to do online payments, you need the access_token  
```
--request GET \
    --url https://scl-sandbox.dev.clover.com/pakms/apikey \
    --header 'accept: application/json' \
    --header 'authorization: Bearer <access_token>'  
```  
This will return a PAKMS Key which can be used to create a card token for payments, one-time use  

Relevant Documentation:  
https://docs.clover.com/docs/ecommerce-integration-types  
https://docs.clover.com/reference/createcharge  

### Card Tokenization
This is a few test cards for development  
https://docs.clover.com/docs/test-card-numbers  

Creating a card tokenization, we need the PAKMS Key or the Ecommerce API Public Key, and data for the card
```  
curl --request POST   
     --url https://token-sandbox.dev.clover.com/v1/tokens   
     --header 'accept: application/json'   
     --header 'apikey: <PAKMS_Key/Ecommerce_Public_Key>'   
     --header 'content-type: application/json'   
     --data '
{  
  "card": {  
    "brand": "VISA",  
    "number": "4242424242424242",  
    "exp_month": "03",  
    "exp_year": "2027",  
    "cvv": "123",  
    "last4": "4242",  
    "first6": "424242"  
  }  
}  
```  

This will return a card_token of the card that can only be **one-time use**

Relevant Documentation:  
https://docs.clover.com/docs/ecommerce-generating-a-card-token  

### Make a charge
You need your ecommerce_private_key and the card_token
```
curl --request POST \
     --url https://scl-sandbox.dev.clover.com/v1/charges \
     --header 'accept: application/json' \
     --header 'authorization: Bearer <ecommerce_private_key>' \
     --header 'content-type: application/json' \
     --data '
{
  "ecomind": "ecom",
  "metadata": {
    "existingDebtIndicator": false
  },
  "amount": 1358,
  "currency": "usd",
  "source": "<card_token>"
}
```

Relevant Documentation:  
https://docs.clover.com/reference/createcharge  

### Other Links
https://docs.clover.com/reference/api-reference-overview  
https://docs.clover.com/docs/app-settings#add-web-app-settings  
https://docs.clover.com/reference/create-card-token  
https://docs.clover.com/reference/getapikey  