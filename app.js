require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const splunkBunyan = require('splunk-bunyan-logger');

const serveStatic = require('serve-static');

const api = require('./routes/api');
// const ui = require('./routes/ui');
const isReachable = require('is-reachable');

const app = express();

const config = {
  token: process.env.SPLUNK_TOKEN,
  url: process.env.SPLUNK_URL,
  apiToken: process.env.API_TOKEN,
  apiToken2: process.env.API_TOKEN2,
};


/// catch 403 and forward to error handler
// app.use((req, res, next) => {
//     if (!req.headers.authorization || req.headers.authorization !== 'Bearer ' + config.apiToken || req.headers.authorization !== 'Bearer ' + config.apiToken2) {
//         return res.status(403).json({ error: 'No credentials sent!' });
//     }
//     next();
// });

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

app.get('/status', function(req, res) {

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
    res.status(200).json("true");
  //}
}

//start()
 
//}
)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
