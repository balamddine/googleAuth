const express = require('express');
const axios = require('axios');
const router = express.Router();
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = require("../credentials.json");
const scopes = ['https://www.googleapis.com/auth/drive'];
const { google } = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the authentication URL
const authUrl = oAuth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
});

// Get the authentication URL
router.get('/auth/google', (req, res) => {
    res.redirect(authUrl);
});


// Handle the callback from the authentication flow
router.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;

    try {
        // Exchange the authorization code for access and refresh tokens
        const { tokens } = await oAuth2Client.getToken(code);
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;
        const expiry_date = tokens.expiry_date;

        oAuth2Client.setCredentials({ refresh_token: refreshToken, access_token: accessToken });
        const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const returnData = {
            access_token: accessToken,
            refresh_Token: refreshToken,
            expiry_date: expiry_date,
            name: profile.name,
            email: profile.email,
            picture: profile.picture
        };
        //  return res.status(200).send({ returnData });
       const filesData = await axios.get('https://www.googleapis.com/drive/v3/files', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        res.status(200).send(filesData.data.files);
    
        // Save the tokens in a database or session for future use

        // Redirect the user to a success page or perform other actions
        // res.send('Authentication successful!');
    } catch (error) {
        console.error('Error authenticating:', error);
        res.status(500).send('Authentication failed.');
    }
});

module.exports = router;
