'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // return queryInterface.addColumn('ScorecardRecords', 'tradeLineId', {
    //   type: Sequelize.INTEGER,
    //   /* allowNull: false,
    //   unique: true,
    //   primaryKey: true, */
    //   after: 'tradeLineName',
    // })
  },

  down: (queryInterface, Sequelize) => { }
};