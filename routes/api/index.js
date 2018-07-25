const express = require('express');
const beyond = require('./beyond');

const api = express.Router();

api.use('/beyond', beyond);

module.exports = api;
