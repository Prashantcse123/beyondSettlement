const models = require('../models');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

module.exports.makeChildProcess = async (logFile, processFile, timeOut) => {
  models.Progress.findAll({
    where: {
      type: 'Progress'
    }
  }).then(rows => {
    if (rows.length && (rows[0].value >= 0 && rows[0].value < 1)) {
      console.log('Process already running');
      return;
    }

    /* making a child process */
    const out = fs.openSync(`./logs/${logFile}.log`, 'a');
    const child = spawn('node', [path.resolve(`./logic/childProcess/${processFile}.js`)], {
      detached: true,
      stdio: ['ignore', out],
    });
    child.unref();

    /* Setting timeout for the child process whatever is set in config */
    setTimeout(() => {
      child.kill();
    }, timeOut || 1800000);

    child.stderr.on('data', (data) => {
      models.Progress.destroy({
        truncate: true
      });
      console.log(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      models.Progress.destroy({
        truncate: true
      });
      console.log(`child process exited with code ${code}`);
    });
  });
}
