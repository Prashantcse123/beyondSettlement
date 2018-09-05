const models = require('../models');

module.exports = {
  up: async () => {
    const rows = await models.ScorecardRecord.findAll({
      attributes: ['tradeLineName', 'isDone', 'createdAt', 'updatedAt', 'tradeLineId'],
    });

    for (let i = 0; i < rows.length; i += 1) {
      const score = rows[i];
      const tradeLineId = parseInt(score.tradeLineName.replace(/[^\d.]/g, ''), 10);
      // eslint-disable-next-line no-await-in-loop
      await models.ScorecardRecord.update({
        tradeLineId,
      }, { where: { tradeLineName: score.tradeLineName } });

      // eslint-disable-next-line no-await-in-loop
      await models.TradelinesState.create({
        isDone: score.isDone,
        tradeLineId,
      });
    }
  },

  down: () => {},
};
