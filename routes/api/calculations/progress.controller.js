const models = require('../../../models');

module.exports = (req, res) => {
  const type = 'Progress';

  models.Progress.findAll({ where: { type } }).then((rows) => {
    const row = rows[0];

    if (row) {
      res.status(200).json(row);
    } else {
      res.status(200).json(0);
    }
  });
};
