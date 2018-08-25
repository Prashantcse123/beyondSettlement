'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ScorecardRecords', 'creditorTerms', {
      type: Sequelize.STRING,
    })
  },

  down: (queryInterface, Sequelize) => { }
};
