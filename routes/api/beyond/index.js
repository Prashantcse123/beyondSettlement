const express = require('express');
const router = express.Router();
// const users = require('./users');
const jwt = require('jsonwebtoken');
const path = require('path');
const sourceData = require('./sourceData');
const calculations = require('./calculations');
const bcrypt = require('bcrypt-nodejs');
const models = require('../../../models');


const config = {
    token: process.env.SPLUNK_TOKEN,
    url: process.env.SPLUNK_URL,
    jwt_secret: process.env.JWT_SECRET,
};


router.use('/source/data', sourceData);
router.use('/calculations', calculations);

router.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let error = {message: 'Wrong username or password!'};

    if(req.body.username && req.body.password) {
        models.User.findAll({where: {username: {$iLike: username.toLowerCase()}}}).then(rows => {
            let row = rows[0];

            if (row && validPassword(password, row.password)) {
                res.status(200).json({
                    username: row.username,
                    token: jwt.sign({username: row.username}, config.jwt_secret, {expiresIn: 60 * 60 * 24})
                });
            }else{
                res.status(401).json({error});
            }
        });
    }else{
        res.status(401).json({error});
    }
});

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function validPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

/// (salesforce-oauth2) -------------------------------------------------------------------------------------------

let request = require("request");
let oauth2 = require('salesforce-oauth2');

let consumerKey = process.env.SF_CUSTOMER_KEY,
    consumerSecret = process.env.SF_CUSTOMER_SECRET,
    callbackUrl = process.env.SF_CALLBACK_URL,
    baseUrl = process.env.SF_BASE_URL;

router.get('/oauth/authenticate', function(req, res) {
    let uri = oauth2.getAuthorizationUrl({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        scope: 'id refresh_token', // 'id api web refresh_token',
        grant_type: 'authorization_code',
        // You can change loginUrl to connect to sandbox or prerelease env.
        base_url: baseUrl
    });
    return res.redirect(uri);
});

router.get('/oauth/refresh', function(req, res) {
    let refreshToken = req.param('refresh_token');

    let uri = oauth2.getAuthorizationUrl({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        scope: 'id refresh_token', // 'id api web refresh_token',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        // You can change loginUrl to connect to sandbox or prerelease env.
        base_url: baseUrl
    });
    return res.redirect(uri);
});

router.get('/oauth/callback', function(req, res) {
    let authorizationCode = req.param('code');

    oauth2.authenticate({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        client_secret: consumerSecret,
        code: authorizationCode,
        // You can change loginUrl to connect to sandbox or prerelease env.
        base_url: 'https://cs96.lightning.force.com'
    }, function(error, payload) {
        if (error) {
            res.status(401).send(error.toString());
        }else{
            let protocol = req.protocol;
            let hostname = req.headers.host;
            let passInfo = 'id=' + payload.id + '&token=' + payload.access_token;

            request(protocol + '://' + hostname + '/api/beyond/oauth/user_info?' + passInfo, function(error, response, body) {
                if (error) {
                    res.status(401).send(error.toString());
                }else{
                    res.cookie('PASSPORT', passInfo, { maxAge: 900000, httpOnly: true });
                    res.sendFile(path.join(__dirname + '/auth_finish.html'));
                    // res.status(200).json({payload, userInfo: JSON.parse(body)});
                }
            });
        }
        /*

        The payload should contain the following fields:

        id 				A URL, representing the authenticated user,
                        which can be used to access the Identity Service.

        issued_at		The time of token issue, represented as the
                        number of seconds since the Unix epoch
                        (00:00:00 UTC on 1 January 1970).

        refresh_token	A long-lived token that may be used to obtain
                        a fresh access token on expiry of the access
                        token in this response.

        instance_url	Identifies the Salesforce instance to which API
                        calls should be sent.

        access_token	The short-lived access token.


        The signature field will be verified automatically and can be ignored.

        At this point, the client application can use the access token to authorize requests
        against the resource server (the Force.com instance specified by the instance URL)
        via the REST APIs, providing the access token as an HTTP header in
        each request:

        Authorization: OAuth 00D50000000IZ3Z!AQ0AQDpEDKYsn7ioKug2aSmgCjgrPjG...
        */
    });
});

router.get('/oauth/user_info', function(req, res) {
    let id = req.param('id');
    let token = req.param('token');

    request(id + '?format=json&oauth_token=' + token, function(error, response, body) {
        if (error) {
            res.status(500).send(error.toString());
        }else{
            if (body === 'Bad_OAuth_Token') {
                res.status(500).send(body);
                return;
            }
            res.status(200).json(JSON.parse(body));
        }
    });
});

module.exports = router;
