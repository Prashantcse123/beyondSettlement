module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.changeColumn('ScorecardRecords', 'metrics_creditorScore', {
    type: Sequelize.FLOAT,
  }),

  down: () => {},
};
