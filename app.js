require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const _ = require('lodash');


const api = require('./routes/api');
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

app.get('/status', (req, res) => {
  res.status(200).json('true');
});

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

app.use('/api', api);

app.get('/api/beyond/me', async (req, res) => {
  if (!req.userProfile) {
    return res.status(404).json({
      error: {
        msg: 'No profile found',
      },
    });
  }

  const data = await crm.pullRolesTree().catch((error) => {
    console.error('ERROR: could not load roles_tree from CRM', error);

    return res.status(500).json({
      error: {
        msg: 'Could not load permissions',
        error,
      },
    });
  });
  const userData = data.users[req.userProfile.user_id];

  // add the third object here to override `permission` if you want to test
  // app under different user roles
  // Example: { permissions: ['SETTLEMENTS'] }
  return res.status(200).json(Object.assign({}, userData));
});

app.get('/api/beyond/roles_tree', async (req, res) => {
  const data = await crm.pullRolesTree();
  // const data = await crm.syncTradelineNameToCrm(['TL-00037395', 'TL-00006075']);
  // const data = await crm.syncTradelineNameFromCrm(['TL-00037395', 'TL-00006075']);
  res.json({ ...data });
});

app.get('/api/beyond/sync_from_crm', async (req, res) => {
  crm.syncAllFromCrm();
  res.json({ data: 'ok' });
});

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
