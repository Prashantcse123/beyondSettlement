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

const app = express();

const config = {
  token: process.env.SPLUNK_TOKEN,
  url: process.env.SPLUNK_URL,
};


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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// api
app.use('/api', api);
app.use('/', express.static('ui/dist'));
app.use('/assets', express.static('ui/dist/assets'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
