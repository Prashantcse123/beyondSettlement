const models = require('../../../models');
const express = require('express');
const creditorCalculationsLogic = require('../../../logic/calculations/creditorCalculations');

const router = express.Router();

router.get('/creditors/set', (req, res) => {
  creditorCalculationsLogic.setData().then((data) => {
    res.status(200).json(data);
  })
});

router.get('/get', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
