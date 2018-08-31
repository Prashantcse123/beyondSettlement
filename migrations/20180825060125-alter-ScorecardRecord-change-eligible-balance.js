
const models = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('ScorecardRecords', 'balance', {
    type: Sequelize.FLOAT,
  }),

  down: (queryInterface, Sequelize) => { },
};
