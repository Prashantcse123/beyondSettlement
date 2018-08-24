'use strict';
var models = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE "public"."TradelinesStates" ADD CONSTRAINT "TradelinesStates_tradeLineId_fkey" FOREIGN KEY ("tradeLineId") REFERENCES "public"."ScorecardRecords"("tradeLineId");')
    /* return queryInterface.addConstraint('TradelinesStates', ['tradeLineId'], {
      type: 'FOREIGN KEY',
      references: {
        name: 'TradelinesStates_tradeLineId_fkey',
        table: 'ScorecardRecords',
        field: 'tradeLineId'
      }      
    }); */
  },

  down: (queryInterface, Sequelize) => { }
};