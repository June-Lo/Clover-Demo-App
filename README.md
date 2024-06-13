# UFTClover

### Getting Authorization
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

### Setting up the Oauth2
The user must send their APP_ID(Client id), APP_SECRET(Client Secret), and AUTHORIZATION CODE to Clover Oauth2 Token endpoint
https://docs.clover.com/docs/oauth-intro
https://docs.clover.com/docs/high-trust-app-auth-flow

A merchant who wants access to your app, but has not logged in to their Clover merchant account is an unauthorized merchant. Your app redirects the merchant to log in to their merchant account with the URL https://sandbox.dev.clover.com/oauth/authorize?client_id={APP_ID}.

When a merchant logs in to their Clover merchant account, they become an authorized merchant. The Clover server redirects this merchant to your app with the URL https://www.example.com/oauth_callback?merchant_id={MERCHANT_ID}&client_id={APP_ID}&code={AUTHORIZATION_CODE}.


https://docs.clover.com/reference/api-reference-overview
https://docs.clover.com/docs/app-settings#add-web-app-settings