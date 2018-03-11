const models = require('../../../models');
const express = require('express');
const dataImportLogic = require('../../../logic/sourceData/dataImport');

const router = express.Router();

router.get('/get', (req, res) => {
  dataImportLogic.importData().then((data) => {
    res.status(200).json(data);
  })
});

router.get('/get', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
