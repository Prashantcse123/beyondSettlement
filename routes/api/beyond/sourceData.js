const express = require('express');
const models = require('../../../models');
const dataImportLogic = require('../../../logic/sourceData/dataImport');

const router = express.Router();

router.get('/get', (req, res) => {
  dataImportLogic.importData();
  res.status(200).json('Success!');
});

router.get('/test', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
