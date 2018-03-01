const models = require('../../../models');
const express = require('express');
const dataImportLogic = require('../../../logic/dataImportLogic');

const router = express.Router();

router.get('/get', (req, res) => {
  dataImportLogic.importData().then((data) => {
    res.status(200).json(data);
  })
});

router.get('/get', (req, res) => {
  res.status(200).json('Success');
});

module.exports = router;
