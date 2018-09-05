module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.changeColumn('ScorecardRecords', 'tradeLineId', {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  }),

  down: () => {},
};
