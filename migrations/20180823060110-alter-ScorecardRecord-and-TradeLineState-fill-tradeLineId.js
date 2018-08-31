'use strict';
let models = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let rows = await models.ScorecardRecord.findAll({
      attributes: ['tradeLineName', 'isDone', 'createdAt', 'updatedAt', 'tradeLineId']
    });

    for (let i = 0; i < rows.length; i++) {
      let score = rows[i];
      let tradeLineId = parseInt(score.tradeLineName.replace(/[^\d.]/g, ''));
      await models.ScorecardRecord.update({
        tradeLineId: tradeLineId
      }, { where: { tradeLineName: score.tradeLineName }});
      
      await models.TradelinesState.create({
        isDone: score.isDone,
        tradeLineId: tradeLineId
      });

    }
  },

  down: (queryInterface, Sequelize) => { }
};