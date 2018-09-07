require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const _ = require('lodash');

const createRouter = require('./routes/create-router');
const crm = require('./services/crm.service');

crm.startSyncAllFromCrmCron(); // cron job

const app = express();
app.use(cors({
  origin: [
    'https://d4zf5uuuwbptn.cloudfront.net',
    'https://settlements-staging.beyondfinance.com',
    'https://d8fu4fo802zow.cloudfront.net',
    'https://settlements.beyondfinance.com',
    /http:\/\/localhost:/,
  ],
  credentials: true,
}));

const config = require('./config/config');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api') ||
    req.originalUrl.startsWith('/api/beyond/sync_from_crm') ||
    req.originalUrl.startsWith('/api/beyond/oauth/authenticate') ||
    req.originalUrl.startsWith('/api/beyond/oauth/callback') ||
    req.originalUrl.startsWith('/api/beyond/oauth/user_info')) {
    next();

    return;
  }

  const cookie = req.cookies.PASSPORT;

  if (cookie) {
    console.log('Found cookie... ', cookie);

    const protocol = config.getConfig('salesforceAuthProtocol');
    const requestUrl = `${protocol}://${process.env.BASE_API_URL}/api/beyond/oauth/user_info?${cookie}`;
    console.log('fetch user_info from url:', requestUrl);

    request(requestUrl, (error, response, body) => {
      console.log('user_info response body: ', body);

      if (error || response.statusCode !== 200) {
        console.log('ERROR on fetching user_info', error);
        console.log(`url error: ${requestUrl}`);

        return res.status(401).json({
          error: {
            msg: 'Failed to authenticate token!',
          },
        });
      }

      if (typeof body === 'string') {
        console.log('try to parse user_info response body as it is a string');
        try {
          req.userProfile = _.pick(JSON.parse(body), ['user_id', 'first_name', 'last_name', 'display_name']);
        } catch (err) {
          console.error('ERROR on parsing user profile from SalesForce', err);
        }
      } else if (typeof body === 'object') {
        console.log('user_info response body is an object');
        req.userProfile = _.pick(body, ['user_id', 'first_name', 'last_name', 'display_name']);
      }

      return next();
    });
  } else {
    console.log('No cookie');

    res.status(401).json({
      error: {
        msg: 'No authentication token provided!',
      },
    });
  }
});

app.use('/api/beyond', createRouter([
  'routes/api/**/*.router.js',
  'routes/api/**/router.js',
]));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
