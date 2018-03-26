const staticData = require('../staticData/averageAcceptedSettlementData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AvgAcceptedSettlements', null, {});
    return queryInterface.bulkInsert('AvgAcceptedSettlements', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
