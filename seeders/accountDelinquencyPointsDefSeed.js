const staticData = require('../staticData/accountDelinquencyPointsDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AccountDelinquencyPointsDefs', null, {});
    return queryInterface.bulkInsert('AccountDelinquencyPointsDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
