const express = require('express');
const v1 = require('./v1');
const beyond = require('./beyond');

// create router for the api
const api = express.Router();
// assign version 1
api.use('/v1', v1);
api.use('/beyond', beyond);

module.exports = api;
