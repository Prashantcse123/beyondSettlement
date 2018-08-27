'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('ScorecardRecords', 'metrics_creditorScore', {
      type: Sequelize.FLOAT,
    })
  },

  down: (queryInterface, Sequelize) => { }
};
