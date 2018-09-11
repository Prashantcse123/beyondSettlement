module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('ScorecardRecords', 'lastWorkedOn', {
    type: Sequelize.STRING,
  }),

  down: () => { },
};
