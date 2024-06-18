# UFTClover

# Getting Authorization
https://docs.clover.com/docs/merchant-dashboard-left-navigation-oauth-flow  
First redirect to OAuth at clover  
https://sandbox.dev.clover.com/oauth/authorize?client_id={APP_ID}  
If the merchant_id is passed, skip the merchant picker  
redirect to Clover Backend then redirect to site_url with legacy auth code  

OR  

PKCE  
Generate code_verifier and code_challenge  
Redirect to OAuth  
If the merchant_id is passed, skip the merchant picker  
redirect to Clover Backend then redirect to site_url with v2 auth code  

## Setting up the Oauth2
The user must send their APP_ID(Client id), APP_SECRET(Client Secret), and AUTHORIZATION CODE to Clover Oauth2 Token endpoint  
https://docs.clover.com/docs/oauth-intro  
https://docs.clover.com/docs/high-trust-app-auth-flow  

A merchant who wants access to your app, but has not logged in to their Clover merchant account is an unauthorized merchant. Your app redirects the merchant to log in to their  merchant account with the URL  
https://sandbox.dev.clover.com/oauth/authorize?client_id={APP_ID}.  

When a merchant logs in to their Clover merchant account, they become an authorized merchant. The Clover server redirects this merchant to your app with the URL  
https://www.example.com/oauth_callback?merchant_id={MERCHANT_ID}&client_id={APP_ID}&code={AUTHORIZATION_CODE}.  

## Payment
### PAKMS Key
**Default OAuth Response CODE**  
To create a charge, an Ecommerce API Token is needed.  
After doing the OAuth, send ecommerce private key  
```
--request GET \
    --url https://scl-sandbox.dev.clover.com/pakms/apikey \
    --header 'accept: application/json' \
    --header 'authorization: Bearer <ecommerce_private_key>'  
```
Which will return the ecommerce public key. Or skip sending the ecommerce private key and use public key as PAKMS for Card Tokenization  

OR  

**Default OAuth Response Token**  
After doing the OAuth, send access_token received to  
```
--request GET \
    --url https://scl-sandbox.dev.clover.com/pakms/apikey \
    --header 'accept: application/json' \
    --header 'authorization: Bearer <access_token>'  
```
Which will send a response with "apiAccessKey", this is PAKMS Key for Card Tokenization  
https://docs.clover.com/docs/ecommerce-integration-types  
https://docs.clover.com/docs/ecommerce-generating-a-card-token  
https://docs.clover.com/reference/createcharge  

### Card Tokenization
https://docs.clover.com/docs/test-card-numbers  

Create a card token which is done at
```  
curl --request POST   
     --url https://token-sandbox.dev.clover.com/v1/tokens   
     --header 'accept: application/json'   
     --header 'apikey: <PAKMS_Key>'   
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

### Make a charge
https://docs.clover.com/reference/createcharge  
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
  "source": "<card_tokenization>"
}
```


### Other Important Links
https://docs.clover.com/reference/api-reference-overview  
https://docs.clover.com/docs/app-settings#add-web-app-settings  
https://docs.clover.com/reference/create-card-token  
https://docs.clover.com/reference/getapikey  

### Bad documentation
https://community.clover.com/questions/46643/401-attempting-to-generate-a-pakms-key.html  
https://docs.clover.com/docs/401-unauthorized#:~:text=401%20Unauthorized%20indicates%20the%20request,credentials%20for%20the%20target%20resource  