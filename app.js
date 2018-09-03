require('dotenv').config();

const express = require('express');
// const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const splunkBunyan = require('splunk-bunyan-logger');
const jwt = require('jsonwebtoken');
const request = require('request');
const cors = require('cors');


const api = require('./routes/api');
const crm = require('./services/crm.service');
crm.startSyncAllFromCrmCron();

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

const config = {
  token: process.env.SPLUNK_TOKEN,
  url: process.env.SPLUNK_URL,
  jwt_secret: process.env.JWT_SECRET,
};


// / catch 403 and forward to error handler
// app.use((req, res, next) => {
//     /*
//      * Check if authorization header is set
//      */
//     if (!req.originalUrl.startsWith('/api') || req.originalUrl === '/api/beyond/oauth/authenticate' || req.originalUrl === '/api/beyond/oauth/refresh') {
//         next();
//         return;
//     }
//
//     if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
//         console.log('auth', req.headers['authorization']);
//         try{
//             /*
//              * Try to decode & verify the JWT token
//              * The token contains user's id ( it can contain more information )
//              * and this is saved in req.user object
//              */
//             let header = req.headers['authorization'].split('|||');
//             let token = header[0];
//             let id = header[1];
//             let protocol = req.protocol;
//             let hostname = req.headers.host;
//
//             request(protocol + '://' + hostname + '/api/beyond/oauth/user_info?id=' + id + '&token=' + token, function(error, response, body) {
//                 if (error) {
//                     return res.status(401).json({
//                         error: {
//                             msg: 'Failed to authenticate token!'
//                         }
//                     });
//                 }else{
//                     next();
//                 }
//             });
//         }catch(err){
//             /*
//              * If the authorization header is corrupted, it throws exception
//              * So return 401 status code with JSON error message
//              */
//             return res.status(401).json({
//                 error: {
//                     msg: 'Failed to authenticate token!'
//                 }
//             });
//         }
//     }else{
//         /*
//          * If there is no autorization header, return 401 status code with JSON
//          * error message
//          */
//         return res.status(401).json({
//             error: {
//                 msg: 'No token!'
//             }
//         });
//     }
// });

// app.use((req, res, next) => {
//     /*
//      * Check if authorization header is set
//      */
//     if (!req.originalUrl.startsWith('/api') || req.originalUrl === '/api/beyond/login') {
//         next();
//         return;
//     }
//
//     if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
//         console.log(req.headers['authorization']);
//         try{
//             /*
//              * Try to decode & verify the JWT token
//              * The token contains user's id ( it can contain more information )
//              * and this is saved in req.user object
//              */
//             req.user = jwt.verify(req.headers['authorization'], config.jwt_secret);
//             next();
//         }catch(err){
//             /*
//              * If the authorization header is corrupted, it throws exception
//              * So return 401 status code with JSON error message
//              */
//             return res.status(401).json({
//                 error: {
//                     msg: 'Failed to authenticate token!'
//                 }
//             });
//         }
//     }else{
//         /*
//          * If there is no autorization header, return 401 status code with JSON
//          * error message
//          */
//         return res.status(401).json({
//             error: {
//                 msg: 'No token!'
//             }
//         });
//     }
// });

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
// if (process.env.NODE_ENV === 'production') {
//   const splunkStream = splunkBunyan.createStream(config);
//   app.use(require('express-bunyan-logger')({
//     name: 'logger',
//     streams: [splunkStream],
//   }));
// }

app.get('/status', (req, res) => {
//   var failed = 0;
//   var checks = [process.env.RDS_DB_HOSTNAME +":"+ process.env.RDS_DB_PORT,
//                 process.env.REDSHIFT_HOST +":"+ process.env.REDSHIFT_PORT];

// const asyncForEach = async (array, callback) => {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array)
//   }
// }

// const start = async () => {
//   await asyncForEach(checks, async (item) => {
//     await isReachable(item).then(reachable => {
//       console.log(item + ": " + reachable);
//       if (!reachable) {
//         failed++;
//         console.log(item + ": " + reachable);
//       }
//     });
//   })
//   if (failed > 0) {
//     res.status(500).json("false");
//   } else {
  res.status(200).json('true');
  // }
},

// start()

// }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/api/beyond/oauth/authenticate') || req.originalUrl.startsWith('/api/beyond/oauth/callback') || req.originalUrl.startsWith('/api/beyond/oauth/user_info')) {
    next();
    return;
  }

  const cookie = req.cookies.PASSPORT;

  if (cookie) {
    console.log('Found cookie... ', cookie);

    const protocol = req.protocol;
    const requestUrl = `${protocol}://${process.env.BASE_URL}/api/beyond/oauth/user_info?${cookie}`;

    request(requestUrl, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        console.log('error... ', error);
        console.log(`url error: ${requestUrl}`);
        return res.status(401).json({
          error: {
            msg: 'Failed to authenticate token!',
          },
        });
      }
      next();
    });
  } else {
    console.log('No cookie');
    return res.status(401).json({
      error: {
        msg: 'No authentication token provided!',
      },
    });
  }
});

// / api
app.use('/api', api);

app.get('/api/beyond/roles_tree', async (req, res) => {
  const data = await crm.pullRolesTree();
  // const data = await crm.syncTradelineNameToCrm(['TL-00037395', 'TL-00006075']);
  // const data = await crm.syncTradelineNameFromCrm(['TL-00037395', 'TL-00006075']);
  res.json({ ...data });
});


// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// / error handler
// / no stacktraces leaked to user unless in development environment
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
