const models = require('../../../models');

module.exports = (req, res) => {
  const type = 'Progress';

  models.Progress.findAll({
    where: { type },
    order: [
      ['value', 'DESC'],
    ],
  }).then((rows) => {
    const row = rows[0];

    if (row && row.value > 0 && row.value < 1 && row.value <= 99.99) {
      res.status(200).json({
        // abortable: true,
        busy: true,
        progress: row.value,
        task: row.task,
      });
    } else {
      res.status(200).json({ busy: false });
    }
  });
};
