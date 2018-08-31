
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TradelinesStates', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    isDone: {
      type: Sequelize.BOOLEAN,
    },
    tradeLineId: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('TradelinesStates'),
};
