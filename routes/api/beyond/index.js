const express = require('express');

const router = express.Router();
const users = require('./users');
const sourceData = require('./sourceData');
const calculations = require('./calculations');

router.get('/', (req, res) => {
  res.json('Test OK');
});

router.use('/users', users);
router.use('/source/data', sourceData);
router.use('/calculations', calculations);

module.exports = router;
