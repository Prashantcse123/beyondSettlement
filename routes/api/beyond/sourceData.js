const express = require('express');
const router = express.Router();
const childprocess = require('../../../services/childprocess.service');

router.get('/get', (req, res) => {
  childprocess.makeChildProcess('import', 'import', config.child_process_timeout || 1800000)
  res.status(200).json('Success!');
});

router.get('/test', (req, res) => {
  res.status(200).json('Test Success! :)');
});

module.exports = router;
