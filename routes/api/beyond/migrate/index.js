const express = require('express');
const router = express.Router();
const states = require('./states');

router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@gmail.com',
    }, {
      id: 2,
      firstName: 'Tammy',
      lastName: 'Norton',
      email: 'tnorton@yahoo.com',
    }, {
      id: 3,
      firstName: 'Tina',
      lastName: 'Lee',
      email: 'lee.tina@hotmail.com, ',
    },
  ]);
});

router.use('/states', states);

module.exports = router;
