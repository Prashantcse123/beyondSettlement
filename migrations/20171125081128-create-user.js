// const csv = require('csv');

// const statesFile = require('./csv/state.csv');


module.exports = {
  up: (queryInterface, Sequelize) => {
    csv.read(statesFile);
    console.log('aaaa');
  },
    // queryInterface.createTable('Users', {
    //   id: {
    //     allowNull: false,
    //     autoIncrement: true,
    //     primaryKey: true,
    //     type: Sequelize.INTEGER,
    //   },
    //   username: {
    //     type: Sequelize.STRING,
    //   },
    //   createdAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //   },
    //   updatedAt: {
    //     allowNull: false,
    //     type: Sequelize.DATE,
    //   },
    // }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Users'),
};
