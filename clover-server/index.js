const { redirect } = require('react-router-dom')

require('dotenv').config()

const clientID = process.env.APP_ID
const clientSecret = process.env.APP_SECRET

redirect("https://"+process.env.CLOVER_SERVER+"/oauth/authorize?client_id="+clientID+"&redirect_uri=http://localhost:3000")