'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* TODO change tradeline id columns to make relations */
    // await queryInterface.removeColumn('ScorecardRecords', 'isDone');
  },

  down: (queryInterface, Sequelize) => { }
};