const staticData = require('../staticData/weightDefData');

module.exports = {
  up(queryInterface, Sequelize) {
    const date = new Date();

    staticData.forEach((sd) => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('WeightDefs', null, {});
    return queryInterface.bulkInsert('WeightDefs', staticData, {});
  },

  down(queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Person', null, {});
  },
};
