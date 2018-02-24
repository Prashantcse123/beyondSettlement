const express = require('express');

const router = express.Router();
const users = require('./users');
const migrate = require('./migrate');

router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@gmail.com',
    },
    {
      id: 2,
      firstName: 'Tammy',
      lastName: 'Norton',
      email: 'tnorton@yahoo.com',
    },
    {
      id: 3,
      firstName: 'Tina',
      lastName: 'Lee',
      email: 'lee.tina@hotmail.com, ',
    },
  ]);
});

router.use('/users', users);
router.use('/migrate', migrate);

module.exports = router;
