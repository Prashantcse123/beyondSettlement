const staticData = require('../staticData/avgAcceptedSettlementPointsDefData');

module.exports = {
  up: function (queryInterface, Sequelize) {

    let date = new Date();

    staticData.forEach(sd => {
      sd.createdAt = date;
      sd.updatedAt = date;
    });

    queryInterface.bulkDelete('AvgAcceptedSettlementPointsDefs', null, {});
    return queryInterface.bulkInsert('AvgAcceptedSettlementPointsDefs', staticData, {});
  },

  down: function (queryInterface, Sequelize) {
      // return queryInterface.bulkDelete('Person', null, {});
  }
};
