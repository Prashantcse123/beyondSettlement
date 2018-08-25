'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ScorecardRecords', 'lastWorkedOn', {
      type: Sequelize.STRING,
    })
  },

  down: (queryInterface, Sequelize) => { }
};
