const models = require('../../../models');
const express = require('express');
const creditorCalculationsLogic = require('../../../logic/calculations/creditorCalculations');
const accountCalculationsLogic = require('../../../logic/calculations/accountCalculations');
const scorecardCalculationsLogic = require('../../../logic/calculations/scorecardCalculations');

const router = express.Router();

router.get('/creditor/set', (req, res) => {
  creditorCalculationsLogic.setData().then((data) => {
    res.status(200).json(data);
  });
});

router.get('/account/set', (req, res) => {
  accountCalculationsLogic.setData().then((data) => {
    res.status(200).json(data);
  });
});

router.get('/scorecard/set', (req, res) => {
  scorecardCalculationsLogic.setData().then((data) => {
    res.status(200).json(data);
  });
});

router.get('/test', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
