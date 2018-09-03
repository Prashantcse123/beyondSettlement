module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn('TradelinesStates', 'status', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('TradelinesStates', 'teamLeadId', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('TradelinesStates', 'agentId', {
        type: Sequelize.STRING,
      }),
    ]
  },

  down: (queryInterface) => {
    return [
      queryInterface.removeColumn('TradelinesStates', 'status'),
      queryInterface.removeColumn('TradelinesStates', 'teamLeadId'),
      queryInterface.removeColumn('TradelinesStates', 'agentId'),
    ]
  }
};
