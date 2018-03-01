const express = require('express');

const router = express.Router();
const users = require('./users');
const sourceData = require('./sourceData');

router.get('/', (req, res) => {
  res.json('Test OK');
});

router.use('/users', users);
router.use('/source/data', sourceData);

module.exports = router;
