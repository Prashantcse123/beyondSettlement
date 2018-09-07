const dataImportLogic = require('../../../logic/sourceData/dataImport');

const getSourceData = (req, res) => {
  dataImportLogic.importData();
  res.status(200).json('Success!');
};

const testSourceData = (req, res) => {
  res.status(200).json('Test Success! :)');
};

module.exports = {
  getSourceData,
  testSourceData,
};
