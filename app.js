require('dotenv').config();

const express = require('express');
// const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const splunkBunyan = require('splunk-bunyan-logger');
const jwt = require('jsonwebtoken');

const api = require('./routes/api');

const app = express();

const config = {
  token: process.env.SPLUNK_TOKEN,
  url: process.env.SPLUNK_URL,
  jwt_secret: process.env.JWT_SECRET,
};


/// catch 403 and forward to error handler
// app.use((req, res, next) => {
//     // if (!req.headers.authorization || req.headers.authorization !== 'Bearer ' + config.apiToken || req.headers.authorization !== 'Bearer ' + config.apiToken2) {
//     //     return res.status(403).json({ error: 'No credentials sent!' });
//     // }
//     next();
// });

app.use((req, res, next) => {
    /*
     * Check if authorization header is set
     */
    if (req.originalUrl === '/api/beyond/login') {
        next();
        return;
    }

    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
        console.log(req.headers['authorization']);
        try{
            /*
             * Try to decode & verify the JWT token
             * The token contains user's id ( it can contain more information )
             * and this is saved in req.user object
             */
            req.user = jwt.verify(req.headers['authorization'], config.jwt_secret);
            next();
        }catch(err){
            /*
             * If the authorization header is corrupted, it throws exception
             * So return 401 status code with JSON error message
             */
            return res.status(401).json({
                error: {
                    msg: 'Failed to authenticate token!'
                }
            });
        }
    }else{
        /*
         * If there is no autorization header, return 401 status code with JSON
         * error message
         */
        return res.status(401).json({
            error: {
                msg: 'No token!'
            }
        });
    }
});

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
if (process.env.NODE_ENV === 'production') {
  const splunkStream = splunkBunyan.createStream(config);
  app.use(require('express-bunyan-logger')({
    name: 'logger',
    streams: [splunkStream],
  }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

/// api
app.use('/api', api);
app.use('/', express.static('ui/dist'));
app.use('/assets', express.static('ui/dist/assets'));

/// catch 404 and forward to error handler
app.use((req, res, next) => {
    console.log('ttt');
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handler
/// no stacktraces leaked to user unless in development environment
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
