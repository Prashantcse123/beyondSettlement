'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ScorecardRecords', 'isDone');
  },

  down: (queryInterface, Sequelize) => { }
};