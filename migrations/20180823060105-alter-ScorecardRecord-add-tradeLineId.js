module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('ScorecardRecords', 'tradeLineId', {
    type: Sequelize.INTEGER,
    after: 'tradeLineName',
  }),

  down: () => {},
};
