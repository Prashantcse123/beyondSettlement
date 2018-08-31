'use strict';
var models = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('ScorecardRecords', 'endOfCurrentMonthFundAccumulation', {
    type: Sequelize.FLOAT,
  }),

  down: (queryInterface, Sequelize) => { }
};
