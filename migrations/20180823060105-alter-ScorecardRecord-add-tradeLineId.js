'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ScorecardRecords', 'tradeLineId', {
      type: Sequelize.INTEGER,
      after: 'tradeLineName',
    })
  },

  down: (queryInterface, Sequelize) => { }
};