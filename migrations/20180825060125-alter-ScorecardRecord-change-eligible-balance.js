'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ScorecardRecords', 'balance', {
      type: Sequelize.FLOAT,
    })
  },

  down: (queryInterface, Sequelize) => { }
};
