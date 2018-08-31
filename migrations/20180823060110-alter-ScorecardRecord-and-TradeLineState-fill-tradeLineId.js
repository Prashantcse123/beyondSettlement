
const models = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const rows = await models.ScorecardRecord.findAll({
      attributes: ['tradeLineName', 'isDone', 'createdAt', 'updatedAt', 'tradeLineId'],
    });

    for (let i = 0; i < rows.length; i++) {
      const score = rows[i];
      const tradeLineId = parseInt(score.tradeLineName.replace(/[^\d.]/g, ''));
      await models.ScorecardRecord.update({
        tradeLineId,
      }, { where: { tradeLineName: score.tradeLineName } });

      await models.TradelinesState.create({
        isDone: score.isDone,
        tradeLineId,
      });
    }
  },

  down: (queryInterface, Sequelize) => { },
};
