const models = require('../../../../models');
const express = require('express');
const router = express.Router();
// const csv = require('csv');

// const statesFile = require('../../../../migrations/csv/state.csv');

router.get('/', (req, res) => {
  models.State.findAll().then((states) => {
    res.json({
      title: 'States Data',
      states,
    });
  });
});

router.get('/csv', (req, res) => {
  csv.read(statesFile);
    res.json([1,2,3,4]);

});

module.exports = router;
