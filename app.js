require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

const config = {
  token: process.env.SPLUNK_TOKEN,
  url: process.env.SPLUNK_URL,
};

const splunkStream = splunkBunyan.createStream(config);

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(require('express-bunyan-logger')({
  name: 'logger',
  streams: [splunkStream],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);
app.use('/users', users);

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
